import React, { useEffect, useMemo, useState } from 'react'
import API_CONFIG from '../../config/api'

const API_EVENTS = `${API_CONFIG.API_URL}/events`
const API_REGS = `${API_CONFIG.API_URL}/event-registrations`

const emptyEvent = { title: '', type: 'standup', description: '', venue: '', city: '', dateTime: '', price: 0, imageUrl: '' }

export default function EventsAdmin() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyEvent)
  const [regs, setRegs] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [loadingRegs, setLoadingRegs] = useState(false)

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_EVENTS}/all`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed to load events')
      setEvents(data.events)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadRegs(eventId) {
    setSelectedEvent(eventId)
    if (!eventId) return setRegs([])
    setLoadingRegs(true)
    try {
      console.log('Loading registrations for event:', eventId)
      const res = await fetch(`${API_REGS}/all?event=${eventId}`)
      console.log('Registration API response:', res)
      const data = await res.json()
      console.log('Registration data:', data)
      if (!data.success) throw new Error(data.message || 'Failed to load registrations')
      setRegs(data.registrations)
      console.log('Registrations loaded:', data.registrations)
    } catch (e) {
      console.error('Error loading registrations:', e)
      setError('Failed to load registrations: ' + e.message)
    } finally {
      setLoadingRegs(false)
    }
  }

  function startCreate() {
    setEditing(null)
    setForm(emptyEvent)
  }

  function startEdit(ev) {
    setEditing(ev._id)
    setForm({ ...ev, dateTime: ev.dateTime ? new Date(ev.dateTime).toISOString().slice(0,16) : '' })
  }

  async function save(e) {
    e.preventDefault()
    const body = { ...form, dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : '' }
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `${API_EVENTS}/${editing}` : `${API_EVENTS}`
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (!data.success) return alert(data.message || 'Save failed')
    setForm(emptyEvent)
    setEditing(null)
    await loadEvents()
  }

  async function remove(evId) {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`${API_EVENTS}/${evId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!data.success) return alert(data.message || 'Delete failed')
    await loadEvents()
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold text-white mb-4'>Manage Events</h1>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-semibold text-white'>Events</h2>
              <button onClick={startCreate} className='px-3 py-1.5 bg-primary rounded'>New Event</button>
            </div>
            {loading && <div className='text-gray-400'>Loading...</div>}
            {error && <div className='text-red-400'>{error}</div>}
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead className='text-gray-400'>
                  <tr>
                    <th className='py-2'>Title</th>
                    <th className='py-2'>Type</th>
                    <th className='py-2'>When</th>
                    <th className='py-2'>City</th>
                    <th className='py-2'>Price</th>
                    <th className='py-2'></th>
                  </tr>
                </thead>
                <tbody className='text-gray-200'>
                  {events.map(ev => (
                    <tr key={ev._id} className='border-t border-gray-800'>
                      <td className='py-2'>{ev.title}</td>
                      <td className='py-2'>{ev.type}</td>
                      <td className='py-2'>{ev.dateTime ? new Date(ev.dateTime).toLocaleString() : ''}</td>
                      <td className='py-2'>{ev.city}</td>
                      <td className='py-2'>₹{ev.price}</td>
                      <td className='py-2 flex gap-2'>
                        <button onClick={() => startEdit(ev)} className='px-2 py-1 bg-white/10 rounded'>Edit</button>
                        <button onClick={() => remove(ev._id)} className='px-2 py-1 bg-red-600/80 rounded'>Delete</button>
                        <button onClick={() => loadRegs(ev._id)} className='px-2 py-1 bg-white/10 rounded'>Registrations</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-4'>
            <h2 className='text-lg font-semibold text-white mb-2'>{editing ? 'Edit Event' : 'Create Event'}</h2>
            <form onSubmit={save} className='space-y-2'>
              <input className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' placeholder='Title' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <select className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value='standup'>Stand-up</option>
                <option value='sports'>Sports</option>
                <option value='concert'>Concert</option>
                <option value='screening'>Screening</option>
                <option value='other'>Other</option>
              </select>
              <textarea className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' rows='3' placeholder='Description' value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <input className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' placeholder='Venue' value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required />
              <input className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' placeholder='City' value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
              <input type='datetime-local' className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' value={form.dateTime} onChange={e => setForm({ ...form, dateTime: e.target.value })} required />
              <input type='number' min='0' className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' placeholder='Price' value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
              <input className='w-full bg-white/10 border border-gray-700 rounded px-3 py-2' placeholder='Image URL' value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              <button className='w-full py-2 bg-primary rounded'>{editing ? 'Save Changes' : 'Create Event'}</button>
            </form>
          </div>

          <div className='bg-gray-900/70 border border-gray-800 rounded-xl p-4 mt-6'>
            <h2 className='text-lg font-semibold text-white mb-2'>Registrations</h2>
            {!selectedEvent && <div className='text-gray-400'>Click "Registrations" button on an event to view registrations</div>}
            {selectedEvent && (
              <div>
                {loadingRegs && <div className='text-gray-400 mb-4'>Loading registrations...</div>}
                {!loadingRegs && (
                  <div className='overflow-x-auto'>
                    <div className='text-gray-300 text-sm mb-2'>Event ID: {selectedEvent}</div>
                    <table className='w-full text-left text-sm'>
                      <thead className='text-gray-400'>
                        <tr>
                          <th className='py-2'>Name</th>
                          <th className='py-2'>Email</th>
                          <th className='py-2'>Tickets</th>
                          <th className='py-2'>Amount</th>
                          <th className='py-2'>Status</th>
                        </tr>
                      </thead>
                      <tbody className='text-gray-200'>
                        {regs.map(r => (
                          <tr key={r._id} className='border-t border-gray-800'>
                            <td className='py-2'>{r.name}</td>
                            <td className='py-2'>{r.email}</td>
                            <td className='py-2'>{r.tickets}</td>
                            <td className='py-2'>₹{r.amountPaid}</td>
                            <td className='py-2'>{r.status}</td>
                          </tr>
                        ))}
                        {regs.length === 0 && <tr><td className='py-2 text-gray-400' colSpan='5'>No registrations found for this event</td></tr>}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


