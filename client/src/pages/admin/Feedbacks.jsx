import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'

const Feedbacks = () => {
  const { api, getToken } = useAppContext()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(false)

  const fetchPage = async (p = 1) => {
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await api.get(`/api/feedback?page=${p}&limit=${limit}`, { headers: { Authorization: `Bearer ${token}` } })
      if (data?.success) {
        setItems(data.items || [])
        setTotal(data.total || 0)
        setPage(data.page || p)
      }
    } catch (e) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPage(1) }, [])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Feedbacks</h2>
        <div className='text-sm text-gray-500'>Total: {total}</div>
      </div>

      <div className='overflow-x-auto rounded border border-gray-200 dark:border-gray-800'>
        <table className='min-w-full text-sm'>
          <thead className='bg-gray-50 dark:bg-gray-800'>
            <tr>
              <th className='px-3 py-2 text-left'>When</th>
              <th className='px-3 py-2 text-left'>User</th>
              <th className='px-3 py-2 text-left'>Subject</th>
              <th className='px-3 py-2 text-left'>Rating</th>
              <th className='px-3 py-2 text-left'>Message</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className='px-3 py-4' colSpan={5}>Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className='px-3 py-4' colSpan={5}>No feedback yet.</td></tr>
            ) : (
              items.map((f) => (
                <tr key={f._id} className='border-t border-gray-100 dark:border-gray-800'>
                  <td className='px-3 py-2'>{new Date(f.createdAt).toLocaleString()}</td>
                  <td className='px-3 py-2'>
                    <div className='leading-tight'>
                      <div className='font-medium'>{f.name || 'Guest'}</div>
                      <div className='text-xs text-gray-500'>{f.email || ''}</div>
                    </div>
                  </td>
                  <td className='px-3 py-2'>{f.subject}</td>
                  <td className='px-3 py-2'>{f.rating || 0}/5</td>
                  <td className='px-3 py-2 whitespace-pre-wrap max-w-[520px]'>{f.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className='flex items-center justify-end gap-2'>
        <button disabled={page<=1} onClick={()=>fetchPage(page-1)} className='rounded border px-3 py-1.5 text-sm disabled:opacity-50'>Prev</button>
        <span className='text-sm'>Page {page} / {totalPages}</span>
        <button disabled={page>=totalPages} onClick={()=>fetchPage(page+1)} className='rounded border px-3 py-1.5 text-sm disabled:opacity-50'>Next</button>
      </div>
    </div>
  )
}

export default Feedbacks


