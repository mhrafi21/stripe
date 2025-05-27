import React from 'react'
import PaymentStripe from '../components/PaymentStripe'

const Home = () => {
  return (
    <div>
        <h1 className='text-center my-6 text-2xl font-semibold'>Stripe Payment</h1>
        <PaymentStripe />
    </div>
  )
}

export default Home