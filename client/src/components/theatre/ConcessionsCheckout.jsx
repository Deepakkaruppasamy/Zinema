import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

function CheckoutInner({ clientSecret, onClose, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')
    const { error: err } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required'
    })
    setLoading(false)
    if (err) {
      setError(err.message || 'Payment failed')
    } else {
      onSuccess?.()
      onClose?.()
    }
  }

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900 rounded-2xl w-full max-w-md p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-white'>Pay for Concessions</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>×</button>
        </div>
        <form onSubmit={submit}>
          <PaymentElement />
          {error && <div className='text-red-400 text-sm mt-2'>{error}</div>}
          <button disabled={!stripe || loading} className='w-full mt-4 py-3 bg-primary rounded text-white'>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ConcessionsCheckout({ clientSecret, onClose, onSuccess }) {
  if (!clientSecret) return null
  return (
    <Elements options={{ clientSecret }} stripe={stripePromise}>
      <CheckoutInner clientSecret={clientSecret} onClose={onClose} onSuccess={onSuccess} />
    </Elements>
  )
}


