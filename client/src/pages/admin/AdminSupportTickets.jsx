import React, { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { useAuth } from '@clerk/clerk-react'
import { BadgeCheck, ClipboardList, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminSupportTickets() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fCategory, setFCategory] = useState('')
  const [fPriority, setFPriority] = useState('')
  const [notesDrafts, setNotesDrafts] = useState({})

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const fetchData = async (p = page) => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await api.get(`/api/support?page=${p}&limit=${limit}` , { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setItems(res.data?.tickets || [])
      setTotal(res.data?.total || 0)
      setPage(res.data?.page || p)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(1) }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let arr = items
    if (term) {
      arr = arr.filter(t => [t.subject, t.message, t.email, t.name, t.status, t.category, t.priority].filter(Boolean).some(v => String(v).toLowerCase().includes(term)))
    }
    if (fStatus) arr = arr.filter(t => t.status === fStatus)
    if (fCategory) arr = arr.filter(t => (t.category || 'general') === fCategory)
    if (fPriority) arr = arr.filter(t => (t.priority || 'medium') === fPriority)
    return arr
  }, [items, q, fStatus, fCategory, fPriority])

  const updateStatus = async (id, status) => {
    try {
      const token = await getToken()
      await api.patch(`/api/support/${id}`, { status }, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setItems(prev => prev.map(it => it._id === id ? { ...it, status } : it))
    } catch (e) { console.error(e) }
  }

  const saveNotes = async (id) => {
    const notes = notesDrafts[id] ?? ''
    try {
      const token = await getToken()
      await api.patch(`/api/support/${id}`, { adminNotes: notes }, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setItems(prev => prev.map(it => it._id === id ? { ...it, adminNotes: notes } : it))
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2"><ClipboardList size={20} /> Support Tickets</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-zinc-300/20 bg-zinc-900">
            <Search size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search subject, message, email..." className="bg-transparent outline-none text-sm" />
          </div>
          <select value={fStatus} onChange={e=>setFStatus(e.target.value)} className="px-2 py-2 rounded border border-zinc-700 bg-zinc-900 text-sm">
            <option value="">All Status</option>
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={fCategory} onChange={e=>setFCategory(e.target.value)} className="px-2 py-2 rounded border border-zinc-700 bg-zinc-900 text-sm">
            <option value="">All Categories</option>
            {['general','payment','booking','refund','technical'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={fPriority} onChange={e=>setFPriority(e.target.value)} className="px-2 py-2 rounded border border-zinc-700 bg-zinc-900 text-sm">
            <option value="">All Priorities</option>
            {['low','medium','high'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={() => fetchData(page)} className="px-3 py-2 rounded bg-primary text-white flex items-center gap-2 disabled:opacity-50" disabled={loading}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-zinc-300/20">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left p-2">Ref</th>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Subject</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Priority</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Attachments</th>
              <th className="text-left p-2">Notes</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                <td className="p-2">#{t._id.slice(-6)}</td>
                <td className="p-2 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-2">{t.name || '—'}</td>
                <td className="p-2">{t.email || '—'}</td>
                <td className="p-2 max-w-[280px] truncate" title={t.subject}>{t.subject}</td>
                <td className="p-2 capitalize">{t.category || 'general'}</td>
                <td className="p-2 capitalize">
                  <span className={`px-2 py-1 rounded text-xs border ${t.priority==='high'?'border-red-500 text-red-400':t.priority==='medium'?'border-yellow-500 text-yellow-400':'border-zinc-500 text-zinc-300'}`}>{t.priority || 'medium'}</span>
                </td>
                <td className="p-2">
                  <select value={t.status} onChange={e => updateStatus(t._id, e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1">
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  {(t.attachments || []).length ? (
                    <div className="space-y-1">
                      {t.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{a.name || a.url}</a>
                      ))}
                    </div>
                  ) : '—'}
                </td>
                <td className="p-2 align-top">
                  <textarea
                    value={notesDrafts[t._id] ?? (t.adminNotes || '')}
                    onChange={e => setNotesDrafts(prev => ({ ...prev, [t._id]: e.target.value }))}
                    placeholder="Add internal notes..."
                    className="w-56 h-16 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm"
                  />
                  <div className="mt-1 flex gap-2">
                    <button onClick={() => saveNotes(t._id)} className="px-2 py-1 rounded bg-primary text-white text-xs">Save</button>
                    <button onClick={() => setNotesDrafts(prev => ({ ...prev, [t._id]: t.adminNotes || '' }))} className="px-2 py-1 rounded border border-zinc-700 text-xs">Reset</button>
                  </div>
                </td>
                <td className="p-2 align-top">
                  <details>
                    <summary className="cursor-pointer text-primary">View</summary>
                    <div className="mt-2 p-2 bg-zinc-900 rounded border border-zinc-800 max-w-[520px] whitespace-pre-wrap">{t.message}</div>
                  </details>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td className="p-4 text-center text-zinc-400" colSpan={8}>No tickets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">Page {page} of {maxPage} • {total} total</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-50" disabled={page<=1} onClick={() => fetchData(page-1)}><ChevronLeft size={16} /></button>
          <button className="px-2 py-1 rounded border border-zinc-700 disabled:opacity-50" disabled={page>=maxPage} onClick={() => fetchData(page+1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <BadgeCheck size={14} /> Only admins can access this page. Changes are saved instantly.
      </div>
    </div>
  )
}
