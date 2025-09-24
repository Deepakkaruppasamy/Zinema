import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'

const empty = { name: '', description: '', imageUrl: '', basePrice: 0, category: 'other', isActive: true }

export default function Concessions() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/concessions/admin/items')
      setItems(data.items || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    if (editingId) {
      await api.put(`/api/concessions/admin/items/${editingId}`, form)
    } else {
      await api.post('/api/concessions/admin/items', form)
    }
    setForm(empty)
    setEditingId(null)
    await load()
  }

  const edit = (it) => {
    setEditingId(it._id)
    setForm({ name: it.name, description: it.description, imageUrl: it.imageUrl, basePrice: it.basePrice, category: it.category, isActive: it.isActive })
  }

  const remove = async (id) => {
    await api.delete(`/api/concessions/admin/items/${id}`)
    await load()
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Concessions</h1>
      <form onSubmit={save} className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <input className='bg-gray-800 p-3 rounded' placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        <input className='bg-gray-800 p-3 rounded' placeholder='Image URL' value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
        <input className='bg-gray-800 p-3 rounded' placeholder='Price' type='number' min='0' step='0.01' value={form.basePrice} onChange={e=>setForm({...form,basePrice:Number(e.target.value)})} required />
        <select className='bg-gray-800 p-3 rounded' value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          <option value='popcorn'>Popcorn</option>
          <option value='drink'>Drink</option>
          <option value='snack'>Snack</option>
          <option value='combo'>Combo</option>
          <option value='other'>Other</option>
        </select>
        <textarea className='bg-gray-800 p-3 rounded md:col-span-2' placeholder='Description' value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} />
          Active
        </label>
        <div className='md:col-span-2'>
          <button className='bg-primary px-4 py-2 rounded text-white'>
            {editingId ? 'Update Item' : 'Add Item'}
          </button>
          {editingId && (
            <button type='button' className='ml-3 px-4 py-2 rounded bg-gray-700' onClick={()=>{setEditingId(null);setForm(empty)}}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {items.map(it => (
            <div key={it._id} className='bg-gray-800 p-4 rounded'>
              {it.imageUrl && <img src={it.imageUrl} alt={it.name} className='h-32 w-full object-cover rounded mb-3' />}
              <div className='font-semibold'>{it.name}</div>
              <div className='text-sm text-gray-400 mb-2'>{it.description}</div>
              <div className='flex items-center justify-between'>
                <span>₹{it.basePrice}</span>
                <span className={`text-xs ${it.isActive?'text-green-400':'text-red-400'}`}>{it.isActive?'Active':'Inactive'}</span>
              </div>
              <div className='mt-3 flex gap-2'>
                <button className='px-3 py-1 bg-blue-600 rounded' onClick={()=>edit(it)}>Edit</button>
                <button className='px-3 py-1 bg-red-600 rounded' onClick={()=>remove(it._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


