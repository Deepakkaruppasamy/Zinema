import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
import { buildICS } from "../utils/ics.js";
import PaymentLink from "../models/PaymentLink.js";
import { set } from "mongoose";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    { event: 'clerk/user.created' },
    async ({ event })=>{
        const {id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData)
    }
)

// Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    { event: 'clerk/user.deleted' },
    async ({ event })=>{
        
       const {id} = event.data
       await User.findByIdAndDelete(id)
    }
)

// Inngest Function to update user data in database 
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    { event: 'clerk/user.updated' },
    async ({ event })=>{
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData)
    }
)

// Inngest Function to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id: 'release-seats-delete-booking'},
    {event: "app/checkpayment"},
    async ({ event, step })=>{
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

        await step.run('check-payment-status', async ()=>{
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            // If payment is not made, release seats and delete booking
            if(!booking.isPaid){
                const show = await Show.findById(booking.show);
                booking.bookedSeats.forEach((seat)=>{
                    delete show.occupiedSeats[seat]
                });
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)

// Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {id: "send-booking-confirmation-email"},
    {event: "app/show.booked"},
    async ({ event, step })=>{
        console.log("📧 Email function triggered for booking:", event.data);
        const { bookingId } = event.data;

        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: {path: "movie", model: "Movie"}
        }).populate('user');
        
        if (!booking) {
            console.error("❌ Booking not found:", bookingId);
            return;
        }
        
        console.log("✅ Booking found:", booking._id, "User:", booking.user?.email);

        const start = new Date(booking.show.showDateTime);
        const ics = buildICS({
            title: booking.show.movie.title,
            description: `Your movie booking at Zinema by Dstudio. Seats: ${booking.bookedSeats.join(", ")}`,
            start,
            // 2 hours default duration
            end: new Date(start.getTime() + 2 * 60 * 60 * 1000),
            location: "Cinema",
            organizer: process.env.SENDER_EMAIL,
        });

        try {
            console.log("📤 Sending email to:", booking.user.email);
            const emailResult = await sendEmail({
                to: booking.user.email,
                subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
                body: ` <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                            <h2>Hi ${booking.user.name},</h2>
                            <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> is confirmed.</p>
                            <p>
                                <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
                                <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
                            </p>
                            <p>Enjoy the show! 🍿</p>
                            <p>Thanks for booking with us!<br/>— Zinema by Dstudio</p>
                        </div>`,
                attachments: [
                    { filename: "ticket.ics", content: ics, contentType: "text/calendar; charset=utf-8; method=PUBLISH" }
                ]
            });
            console.log("✅ Email sent successfully:", emailResult);
        } catch (error) {
            console.error("❌ Email sending failed:", error.message);
            throw error;
        }
    }
)


// Inngest Function to send reminders
const sendShowReminders = inngest.createFunction(
    {id: "send-show-reminders"},
    { cron: "0 */8 * * *" }, // Every 8 hours
    async ({ step })=>{
        console.log("⏰ Show reminder function triggered");
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

        // Prepare reminder tasks
        const reminderTasks =  await step.run("prepare-reminder-tasks", async ()=>{
            const shows = await Show.find({
                showDateTime: { $gte: windowStart, $lte: in8Hours },
            }).populate('movie');

            const tasks = [];

            for(const show of shows){
                if(!show.movie || !show.occupiedSeats) continue;

                const userIds = [...new Set(Object.values(show.occupiedSeats))];
                if(userIds.length === 0) continue;

                const users = await User.find({
                    _id: { $in: userIds },
                    "preferences.remindersEnabled": { $ne: false }
                }).select("name email");

                for(const user of users){
                    tasks.push({
                        userEmail: user.email,
                        userName: user.name,
                        movieTitle: show.movie.title,
                        showTime: show.showDateTime,
                    })
                }
            }
            return tasks;
        })

        if(reminderTasks.length === 0){
            return {sent: 0, message: "No reminders to send."}
        }

         // Send reminder emails
         const results = await step.run('send-all-reminders', async ()=>{
            return await Promise.allSettled(
                reminderTasks.map(task => sendEmail({
                    to: task.userEmail,
                    subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
                     body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hello ${task.userName},</h2>
                            <p>This is a quick reminder that your movie:</p>
                            <h3 style="color: #F84565;">"${task.movieTitle}"</h3>
                            <p>
                                is scheduled for <strong>${new Date(task.showTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</strong> at 
                                <strong>${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</strong>.
                            </p>
                            <p>It starts in approximately <strong>8 hours</strong> - make sure you're ready!</p>
                            <br/>
                            <p>Enjoy the show!<br/>Zinema by Dstudio</p>
                        </div>`
                }))
            )
         })

         const sent = results.filter(r => r.status === "fulfilled").length;
         const failed = results.length - sent;

         return {
            sent,
            failed,
            message: `Sent ${sent} reminder(s), ${failed} failed.`
         }
    }
)

// Dynamic Notification System
class DynamicNotificationEngine {
  constructor() {
    this.notificationTypes = {
      newShow: { priority: 'high', channels: ['email', 'push'] },
      priceDrop: { priority: 'medium', channels: ['email'] },
      reminder: { priority: 'low', channels: ['email', 'sms'] },
      recommendation: { priority: 'low', channels: ['email'] }
    };
  }

  // Send dynamic notifications based on user preferences
  async sendDynamicNotifications(eventType, data) {
    try {
      const users = await User.find({});
      const results = { sent: 0, failed: 0, skipped: 0 };

      for (const user of users) {
        try {
          const shouldSend = await this.shouldSendNotification(user, eventType, data);
          
          if (shouldSend) {
            await this.sendPersonalizedNotification(user, eventType, data);
            results.sent++;
          } else {
            results.skipped++;
          }
        } catch (error) {
          console.error(`Failed to send notification to ${user.email}:`, error);
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      console.error('Error in dynamic notifications:', error);
      throw error;
    }
  }

  // Determine if notification should be sent to user
  async shouldSendNotification(user, eventType, data) {
    // Get user preferences
    const preferences = await UserPreferences.findOne({ userId: user._id });
    
    // Check notification frequency limits
    const recentNotifications = await this.getRecentNotifications(user._id, 24); // Last 24 hours
    if (recentNotifications.length >= 3) return false; // Max 3 notifications per day

    // Check user's notification preferences
    if (preferences && preferences.notificationSettings) {
      const settings = preferences.notificationSettings;
      
      switch (eventType) {
        case 'newShow':
          return settings.newShows !== false;
        case 'priceDrop':
          return settings.priceAlerts !== false;
        case 'reminder':
          return settings.reminders !== false;
        case 'recommendation':
          return settings.recommendations !== false;
        default:
          return true;
      }
    }

    // Check user engagement level
    const engagementLevel = await this.calculateEngagementLevel(user._id);
    if (engagementLevel === 'low' && eventType === 'recommendation') return false;

    return true;
  }

  // Send personalized notification
  async sendPersonalizedNotification(user, eventType, data) {
    const notification = await this.createPersonalizedNotification(user, eventType, data);
    
    // Send via email (primary channel)
    await sendEmail({
      to: user.email,
      subject: notification.subject,
      body: notification.body
    });

    // Log notification
    await this.logNotification(user._id, eventType, notification);
  }

  // Create personalized notification content
  async createPersonalizedNotification(user, eventType, data) {
    const userProfile = await this.createUserProfile(user._id);
    
    switch (eventType) {
      case 'newShow':
        return this.createNewShowNotification(user, data, userProfile);
      case 'priceDrop':
        return this.createPriceDropNotification(user, data, userProfile);
      case 'reminder':
        return this.createReminderNotification(user, data, userProfile);
      case 'recommendation':
        return this.createRecommendationNotification(user, data, userProfile);
      default:
        return this.createGenericNotification(user, data);
    }
  }

  // Create new show notification
  createNewShowNotification(user, data, userProfile) {
    const { movieTitle, movie } = data;
    
    // Personalize based on user's genre preferences
    const genreMatch = this.checkGenreMatch(movie, userProfile);
    const personalizedMessage = genreMatch 
      ? `We've added "${movieTitle}" - a ${movie.genres?.[0]?.name || 'great'} movie that matches your taste!`
      : `We've just added "${movieTitle}" to our library!`;

    return {
      subject: `🎬 New Show Added: ${movieTitle}`,
      body: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #F84565; margin: 0;">Zinema</h1>
                    <p style="color: #666; margin: 5px 0;">Your Cinema Experience</p>
                </div>
                
                <h2 style="color: #333;">Hi ${user.name},</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #555;">
                    ${personalizedMessage}
                </p>
                
                ${movie ? `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #F84565; margin-top: 0;">${movieTitle}</h3>
                    <p style="color: #666; margin: 10px 0;">${movie.overview || 'A great movie experience awaits!'}</p>
                    ${movie.vote_average ? `<p style="color: #333;"><strong>Rating:</strong> ⭐ ${movie.vote_average}/10</p>` : ''}
                    ${movie.genres ? `<p style="color: #333;"><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>` : ''}
                </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/movies" 
                       style="background: #F84565; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Book Your Tickets Now
                    </a>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
                    <p>Thanks for being a valued member!<br/>— Zinema by Dstudio</p>
                    <p style="font-size: 12px;">
                        <a href="#" style="color: #666;">Unsubscribe</a> | 
                        <a href="#" style="color: #666;">Manage Preferences</a>
                    </p>
                </div>
            </div>`
    };
  }

  // Create price drop notification
  createPriceDropNotification(user, data, userProfile) {
    const { movieTitle, oldPrice, newPrice, discount } = data;
    
    return {
      subject: `💰 Price Drop Alert: ${movieTitle}`,
      body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${user.name},</h2>
                <p>Great news! The price for "${movieTitle}" has dropped!</p>
                <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Old Price:</strong> ₹${oldPrice}</p>
                    <p><strong>New Price:</strong> ₹${newPrice}</p>
                    <p><strong>You Save:</strong> ₹${discount} (${Math.round((discount/oldPrice)*100)}%)</p>
                </div>
                <p>Book now before prices go back up!</p>
                <p>Thanks,<br/>Zinema by Dstudio</p>
            </div>`
    };
  }

  // Create reminder notification
  createReminderNotification(user, data, userProfile) {
    const { movieTitle, showTime, seats } = data;
    
    return {
      subject: `⏰ Reminder: ${movieTitle} starts soon!`,
      body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${user.name},</h2>
                <p>Don't forget! Your movie "${movieTitle}" starts at ${new Date(showTime).toLocaleString()}.</p>
                <p><strong>Your seats:</strong> ${seats.join(', ')}</p>
                <p>We recommend arriving 15 minutes early.</p>
                <p>Enjoy the show! 🍿</p>
                <p>Thanks,<br/>Zinema by Dstudio</p>
            </div>`
    };
  }

  // Create recommendation notification
  createRecommendationNotification(user, data, userProfile) {
    const { movies } = data;
    
    return {
      subject: `🎯 Personalized Recommendations for You`,
      body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${user.name},</h2>
                <p>Based on your preferences, we think you'll love these movies:</p>
                ${movies.map(movie => `
                    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                        <h3>${movie.title}</h3>
                        <p>${movie.overview}</p>
                        <p><strong>Rating:</strong> ⭐ ${movie.vote_average}/10</p>
                    </div>
                `).join('')}
                <p>Thanks,<br/>Zinema by Dstudio</p>
            </div>`
    };
  }

  // Helper methods
  async createUserProfile(userId) {
    const bookings = await Booking.find({ userId, isPaid: true })
      .populate('show')
      .limit(20);
    
    const favoriteGenres = {};
    bookings.forEach(booking => {
      booking.show.movie.genres?.forEach(genre => {
        favoriteGenres[genre.name] = (favoriteGenres[genre.name] || 0) + 1;
      });
    });
    
    return { favoriteGenres };
  }

  checkGenreMatch(movie, userProfile) {
    if (!movie.genres || !userProfile.favoriteGenres) return false;
    
    return movie.genres.some(genre => 
      userProfile.favoriteGenres[genre.name] > 0
    );
  }

  async getRecentNotifications(userId, hours) {
    // This would query a notifications log table
    // For now, return empty array
    return [];
  }

  async calculateEngagementLevel(userId) {
    const recentBookings = await Booking.find({
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).countDocuments();
    
    if (recentBookings >= 3) return 'high';
    if (recentBookings >= 1) return 'medium';
    return 'low';
  }

  async logNotification(userId, eventType, notification) {
    // This would log to a notifications table
    console.log(`Notification sent to user ${userId}: ${eventType}`);
  }
}

const notificationEngine = new DynamicNotificationEngine();

// Inngest Function to send dynamic notifications when a new show is added
const sendNewShowNotifications = inngest.createFunction(
    {id: "send-new-show-notifications"},
    { event: "app/show.added" },
    async ({ event })=>{
        console.log("🎬 New show notification triggered:", event.data);
        const { movieTitle, movie } = event.data;
        
        const results = await notificationEngine.sendDynamicNotifications('newShow', {
            movieTitle,
            movie
        });

        return {
            message: "Dynamic notifications sent",
            results
        };
    }
)

// Inngest Function to expire payment links and release seats
const expirePaymentLinks = inngest.createFunction(
  { id: "expire-payment-links" },
  { cron: "*/2 * * * *" }, // every 2 minutes
  async () => {
    try {
      const now = new Date();
      console.log('Running expire-payment-links function at:', now);
      
      // Find links that are active and expired
      const links = await PaymentLink.find({ status: "active", expiresAt: { $lte: now } });
      if (!links.length) {
        console.log('No expired payment links found');
        return { expired: 0 };
      }

      console.log(`Found ${links.length} expired payment links`);
      let expiredCount = 0;
      
      for (const link of links) {
        try {
          const show = await Show.findById(link.show);
          if (show && show.occupiedSeats) {
            for (const s of link.seats) {
              if (show.occupiedSeats[s] === `link:${link._id.toString()}`) {
                delete show.occupiedSeats[s];
              }
            }
            show.markModified("occupiedSeats");
            await show.save();
          }
          link.status = "expired";
          await link.save();
          expiredCount++;
          console.log(`Expired payment link: ${link._id}`);
        } catch (linkError) {
          console.error(`Error processing link ${link._id}:`, linkError);
        }
      }
      
      console.log(`Successfully expired ${expiredCount} payment links`);
      return { expired: expiredCount };
    } catch (error) {
      console.error('Error in expire-payment-links function:', error);
      throw error;
    }
  }
);

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail,
    sendShowReminders,
    sendNewShowNotifications,
    expirePaymentLinks
];