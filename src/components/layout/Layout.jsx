import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }){
  return (
    <div className="min-h-screen flex flex-col bg-black text-starlight relative">
      {/* Animated Stars Background */}
      <div className="stars-container">
        <div className="stars stars-small"></div>
        <div className="stars stars-medium"></div>
        <div className="stars stars-large"></div>
      </div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
