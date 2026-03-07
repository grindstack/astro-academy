import React, { useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function Navbar(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl bg-gradient-to-r from-accent-cyan to-nebula-2 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          Astro Academy
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('home')}
            className="nav-link-hover text-sm font-medium text-starlight/80 hover:text-accent-cyan transition-colors relative"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="nav-link-hover text-sm font-medium text-starlight/80 hover:text-accent-cyan transition-colors relative"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('courses')}
            className="nav-link-hover text-sm font-medium text-starlight/80 hover:text-accent-cyan transition-colors relative"
          >
            Discover
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="nav-link-hover text-sm font-medium text-starlight/80 hover:text-accent-cyan transition-colors relative"
          >
            FAQ
          </button>
          <NavLink
            to="/stellar-scanner"
            className={({ isActive }) =>
              `nav-link-hover text-sm font-medium transition-colors relative ${
                isActive ? 'text-accent-cyan' : 'text-starlight/80 hover:text-starlight'
              }`
            }
          >
            Stellar Scanner
          </NavLink>
          
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `nav-link-hover text-sm font-medium transition-colors relative ${
                    isActive ? 'text-accent-cyan' : 'text-starlight/80 hover:text-starlight'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="text-sm">
                  <p className="text-starlight font-medium">{user.name}</p>
                  <p className="text-starlight/50 text-xs capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-starlight hover:text-accent-cyan"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 rounded-full bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan hover:text-deep-space transition-all font-semibold text-sm"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/5">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </header>
  )
}