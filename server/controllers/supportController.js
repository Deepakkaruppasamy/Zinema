import sendEmail from '../configs/nodeMailer.js';
import SupportTicket from '../models/SupportTicket.js';

// POST /api/support/ticket
// body: { name, email, subject, message }
export const createTicket = async (req, res) => {
  try {
    const { name = 'Guest', email = '', subject = 'Support Request', message = '', attachments = [], category = 'general', priority = 'medium' } = req.body || {};

    if (!message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const supportTo = process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL;
    if (!supportTo) {
      return res.status(500).json({ success: false, message: 'Support email not configured' });
    }

    // Persist ticket first
    const ticket = await SupportTicket.create({
      user: req.auth ? req.auth()?.userId : undefined,
      name,
      email,
      subject,
      message,
      category,
      priority,
      attachments: Array.isArray(attachments) ? attachments.slice(0, 5) : [],
    })

    const attachHtml = (ticket.attachments || []).length
      ? `<p><strong>Attachments:</strong></p><ul>${ticket.attachments.map(a => `<li><a href="${a.url}" target="_blank" rel="noreferrer">${a.name || a.url}</a></li>`).join('')}</ul>`
      : ''

    const html = `
      <div>
        <h2>New Support Ticket</h2>
        <p><strong>Ticket ID:</strong> ${ticket._id}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
        ${attachHtml}
      </div>
    `;

    await sendEmail({ to: supportTo, subject: `[Zinema Support] ${subject}`, body: html });

    // Acknowledgment to user
    if (email) {
      const ackHtml = `
        <div>
          <p>Hi ${name || 'there'},</p>
          <p>We have received your support request (Ref: <strong>#${String(ticket._id).slice(-6)}</strong>).</p>
          <p>Subject: ${subject}</p>
          <p>We usually reply within 1 business day. You can reply to this email with more details if needed.</p>
          <hr/>
          <p>— Zinema Support</p>
        </div>
      `
      try { await sendEmail({ to: email, subject: `We received your request (#${String(ticket._id).slice(-6)})`, body: ackHtml }) } catch {}
    }

    return res.json({ success: true, message: 'Support ticket submitted', ticketId: ticket._id });
  } catch (error) {
    console.error('createTicket error', error);
    return res.status(500).json({ success: false, message: 'Failed to submit support ticket' });
  }
};

// GET /api/support/faqs (public)
export const getFaqs = async (_req, res) => {
  const faqs = [
    { q: 'How do I cancel my booking?', a: 'Go to My Bookings > select booking > Cancel (if within policy window). Refunds go to original payment method.' },
    { q: 'I did not receive tickets email', a: 'Check spam. You can re-download from My Bookings. Contact support with booking ID if still missing.' },
    { q: 'Payment deducted but booking not shown', a: 'It may take a few minutes. If not visible, share payment reference and time with support.' },
  ]
  res.json({ success: true, faqs })
}

// GET /api/support/my (auth)
export const listMyTickets = async (req, res) => {
  try {
    const { userId } = req.auth()
    const items = await SupportTicket.find({ user: userId }).sort({ createdAt: -1 })
    res.json({ success: true, tickets: items })
  } catch (e) { res.json({ success: false, message: e.message }) }
}

// GET /api/support/:id (auth or admin)
export const getTicket = async (req, res) => {
  try {
    const { userId, sessionClaims } = req.auth()
    const t = await SupportTicket.findById(req.params.id)
    if (!t) return res.status(404).json({ success: false, message: 'Not found' })
    const isAdmin = sessionClaims?.metadata?.role === 'admin' || req.user?.role === 'admin'
    if (!isAdmin && t.user && t.user !== userId) return res.status(403).json({ success: false, message: 'Forbidden' })
    res.json({ success: true, ticket: t })
  } catch (e) { res.json({ success: false, message: e.message }) }
}

// PATCH /api/support/:id (admin)
export const adminUpdateTicket = async (req, res) => {
  try {
    const { status, adminNotes } = req.body
    const t = await SupportTicket.findByIdAndUpdate(req.params.id, { status, adminNotes }, { new: true })
    if (!t) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, ticket: t })
  } catch (e) { res.json({ success: false, message: e.message }) }
}

// GET /api/support (admin) - list all tickets with pagination
export const adminListTickets = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100)
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      SupportTicket.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SupportTicket.countDocuments({})
    ])
    res.json({ success: true, tickets: items, page, limit, total })
  } catch (e) { res.json({ success: false, message: e.message }) }
}
