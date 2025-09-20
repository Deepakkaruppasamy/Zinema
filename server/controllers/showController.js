import axios from "axios"
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

// Helper function to make API calls with retry
const makeApiCallWithRetry = async (url, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                headers: { 
                    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
                    'User-Agent': 'Zinema-App/1.0',
                    'Accept': 'application/json'
                },
                timeout: 30000, // 30 second timeout
                maxRedirects: 5,
                validateStatus: function (status) {
                    return status >= 200 && status < 300; // default
                }
            });
            console.log(`✅ Successfully fetched: ${url}`);
            return response;
        } catch (error) {
            const isRetryableError = 
                error.code === 'ECONNRESET' ||
                error.code === 'ENOTFOUND' ||
                error.code === 'ECONNREFUSED' ||
                error.code === 'ETIMEDOUT' ||
                error.code === 'ECONNABORTED' ||
                (error.response && error.response.status >= 500);

            console.log(`❌ Attempt ${i + 1}/${retries} failed for ${url}:`, {
                code: error.code,
                message: error.message,
                status: error.response?.status,
                isRetryable: isRetryableError
            });

            if (i === retries - 1 || !isRetryableError) {
                throw error;
            }

            // Exponential backoff with jitter
            const backoffDelay = delay * Math.pow(2, i) + Math.random() * 1000;
            console.log(`⏳ Waiting ${Math.round(backoffDelay)}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }
};

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res)=>{
    try {
        const response = await makeApiCallWithRetry('https://api.themoviedb.org/3/movie/now_playing');
        const movies = response.data.results;
        res.json({success: true, movies: movies})
    } catch (error) {
        console.error('Failed to fetch movies after retries:', error.message);
        res.json({success: false, message: 'Failed to fetch movies from TMDB API'})
    }
}

// API to add a new show to the database
export const addShow = async (req, res) =>{
    try {
        const {movieId, showsInput, showPrice} = req.body

        let movie = await Movie.findById(movieId)

        if(!movie) {
            // Fetch movie details and credits from TMDB API with retry logic
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                makeApiCallWithRetry(`https://api.themoviedb.org/3/movie/${movieId}`),
                makeApiCallWithRetry(`https://api.themoviedb.org/3/movie/${movieId}/credits`)
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

             const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
             }

             // Add movie to the database
             movie = await Movie.create(movieDetails);
        }

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time)=>{
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });

        if(showsToCreate.length > 0){
            await Show.insertMany(showsToCreate);
        }

         //  Trigger Inngest event (with fallback)
         try {
            // Check if Inngest is properly configured
            if (!process.env.INNGEST_EVENT_KEY && !process.env.INNGEST_DEV) {
                throw new Error('Inngest not configured - using fallback');
            }
            
            await inngest.send({
                name: "app/show.added",
                data: {movieTitle: movie.title, movie: movie}
            });
            console.log('✅ Inngest event sent successfully');
        } catch (error) {
            console.log('⚠️ Inngest event failed, using fallback notification system:', error.message);
            
            // Fallback: Send notifications directly if Inngest fails
            try {
                const User = (await import('../models/User.js')).default;
                const sendEmail = (await import('../configs/nodeMailer.js')).default;
                
                const users = await User.find({});
                console.log(`📧 Sending notifications to ${users.length} users directly...`);
                
                for (const user of users) {
                    try {
                        await sendEmail({
                            to: user.email,
                            subject: `🎬 New Show Added: ${movie.title}`,
                            body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                                    <h2>Hi ${user.name},</h2>
                                    <p>We've just added a new show to our library:</p>
                                    <h3 style="color: #F84565;">"${movie.title}"</h3>
                                    <p>Visit our website to book your tickets!</p>
                                    <br/>
                                    <p>Thanks,<br/>Zinema by Dstudio</p>
                                </div>`
                        });
                        console.log(`✅ Notification sent to ${user.email}`);
                    } catch (emailError) {
                        console.log(`❌ Failed to send notification to ${user.email}:`, emailError.message);
                    }
                }
            } catch (fallbackError) {
                console.log('❌ Fallback notification system also failed:', fallbackError.message);
            }
        }

        res.json({success: true, message: 'Show Added successfully.'})
    } catch (error) {
        console.error('Error adding show:', error);
        res.status(500).json({success: false, message: error.message})
    }
}

// API to get all shows from the database
export const getShows = async (req, res) =>{
    try {
        // First try to get future shows
        let shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({ showDateTime: 1 });

        // If no future shows, get all shows
        if (shows.length === 0) {
            shows = await Show.find({}).populate('movie').sort({ showDateTime: -1 });
        }

        // If still no shows, get all movies as fallback
        if (shows.length === 0) {
            const movies = await Movie.find({}).limit(20);
            return res.json({success: true, shows: movies});
        }

        // filter unique shows
        const uniqueShows = new Set(shows.map(show => show.movie).filter(movie => movie !== null));

        res.json({success: true, shows: Array.from(uniqueShows)})
    } catch (error) {
        console.error('Error fetching shows:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to get a single show from the database
export const getShow = async (req, res) =>{
    try {
        const {movieId} = req.params;
        // get all upcoming shows for the movie
        const shows = await Show.find({movie: movieId, showDateTime: { $gte: new Date() }})

        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if(!dateTime[date]){
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })

        res.json({success: true, movie, dateTime})
    } catch (error) {
        console.error('Error fetching show:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}