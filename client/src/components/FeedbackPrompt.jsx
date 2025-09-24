import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const TEN_MIN_MS = 10 * 60 * 1000
const THREE_MIN_MS = 3 * 60 * 1000

const getNow = () => Date.now()

const getLoginAt = () => {
  const raw = sessionStorage.getItem('loginAt')
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

const hasShown = () => sessionStorage.getItem('feedbackShown') === '1'
const markShown = () => sessionStorage.setItem('feedbackShown', '1')

const withinWindow = (now, loginAt) => {
  if (!loginAt) return false
  const elapsed = now - loginAt
  return elapsed >= TEN_MIN_MS && elapsed < (TEN_MIN_MS + THREE_MIN_MS)
}

const computeOpenDelay = (now, loginAt) => {
  if (!loginAt) return null
  const untilTen = TEN_MIN_MS - (now - loginAt)
  if (untilTen <= 0) return 0
  return untilTen
}

const computeAutoClose = (now, loginAt) => {
  const endAt = loginAt + TEN_MIN_MS + THREE_MIN_MS
  const remaining = Math.max(0, endAt - now)
  return Math.min(THREE_MIN_MS, remaining)
}

const FeedbackPrompt = () => {
  const { api, user } = useAppContext()

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('Quick Feedback')
  const [rating, setRating] = useState(0)

  const timers = useRef({ openTimer: null, closeTimer: null })

  const userName = useMemo(() => user?.fullName || user?.firstName || user?.username || '', [user])
  const userEmail = useMemo(() => user?.primaryEmailAddress?.emailAddress || '', [user])

  useEffect(() => {
    // Skip if already shown in this session
    if (hasShown()) return

    const loginAt = getLoginAt()
    if (!loginAt) return

    const now = getNow()

    // If already within window, open immediately
    if (withinWindow(now, loginAt)) {
      setOpen(true)
      const auto = computeAutoClose(now, loginAt)
      timers.current.closeTimer = setTimeout(() => {
        setOpen(false)
        markShown()
      }, auto)
      return () => {}
    }

    // If window already passed, do nothing
    if (now >= loginAt + TEN_MIN_MS + THREE_MIN_MS) return

    // Otherwise schedule open at the 10-min mark
    const delay = computeOpenDelay(now, loginAt)
    if (delay !== null && delay >= 0) {
      timers.current.openTimer = setTimeout(() => {
        if (!hasShown()) {
          setOpen(true)
          timers.current.closeTimer = setTimeout(() => {
            setOpen(false)
            markShown()
          }, THREE_MIN_MS)
        }
      }, delay)
    }

    return () => {
      if (timers.current.openTimer) clearTimeout(timers.current.openTimer)
      if (timers.current.closeTimer) clearTimeout(timers.current.closeTimer)
    }
  }, [])

  const close = () => {
    setOpen(false)
    markShown()
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Please add your feedback')
      return
    }
    try {
      setSubmitting(true)
      const payload = {
        name: userName || 'Guest',
        email: userEmail,
        subject: subject || 'Quick Feedback',
        message: rating ? `Rating: ${rating}/5\n\n${message}` : message,
        category: 'general',
        priority: 'low'
      }
      const { data } = await api.post('/api/support/ticket', payload)
      if (data?.success) {
        toast.success('Thanks for your feedback!')
        close()
      } else {
        toast.error(data?.message || 'Failed to send feedback')
      }
    } catch (err) {
      toast.error('Failed to send feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative z-10 w-[92%] max-w-md rounded-lg bg-white p-5 shadow-xl dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Share your feedback</h3>
          <button onClick={close} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Subject</label>
            <input
              className="w-full rounded border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Quick Feedback"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Rating (optional)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={(r <= rating ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200') + ' rounded px-2 py-1 text-sm'}
                >
                  {r}
                </button>
              ))}
              {rating > 0 && (
                <button type="button" onClick={() => setRating(0)} className="ml-1 text-xs text-gray-500 underline">Clear</button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm">Your feedback</label>
            <textarea
              className="h-28 w-full resize-none rounded border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What can we improve?"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={close} className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">Dismiss</button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackPrompt
