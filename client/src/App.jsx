import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import Trending from './pages/admin/Trending'
import AdminSupportTickets from './pages/admin/AdminSupportTickets'
import { useAppContext } from './context/AppContext'
import { SignIn } from '@clerk/clerk-react'
import Loading from './components/Loading'
import ZineBot from './components/ZineBot';
import SupportBot from './components/SupportBot';
import Theatre from './pages/Theatre'
// ThemeToggle moved into Navbar
import PWAInstallPrompt from './components/PWAInstallPrompt'
import ThreeDView from './pages/ThreeDView'
import Ticket from './pages/Ticket'

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  const { user } = useAppContext()

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/movies' element={<Movies/>} />
        <Route path='/movies/:id' element={<MovieDetails/>} />
        <Route path='/movies/:id/:date' element={<SeatLayout/>} />
        <Route path='/my-bookings' element={<MyBookings/>} />
        <Route path='/loading/:nextUrl' element={<Loading/>} />
        <Route path='/favorite' element={<Favorite/>} />
        <Route path='/theatre' element={<Theatre/>} />
        <Route path='/3d-view' element={<ThreeDView/>} />
        <Route path='/ticket/:id' element={<Ticket/>} />
        <Route path='/admin/*' element={user ? <Layout/> : (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'} />
          </div>
        )}>
          <Route index element={<Dashboard/>}/>
          <Route path="add-shows" element={<AddShows/>}/>
          <Route path="list-shows" element={<ListShows/>}/>
          <Route path="list-bookings" element={<ListBookings/>}/>
          <Route path="trending" element={<Trending/>}/>
          <Route path="support-tickets" element={<AdminSupportTickets/>}/>
        </Route>
      </Routes>
       {!isAdminRoute && <Footer />}
       {!isAdminRoute && <ZineBot />}
       {!isAdminRoute && <SupportBot />}
       {/** Theme toggle now in Navbar */}
       {!isAdminRoute && <PWAInstallPrompt />}
    </>
  )
}

export default App
