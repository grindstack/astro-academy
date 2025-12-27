import { useState, useEffect } from 'react'
import { useNavigate, NavLink, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const navigate = useNavigate()
  const { login, signup } = useAuth()
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' })

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })

  useEffect(() => {
    // Check if signup=true in query params
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const validateEmail = (email) => {
    // Must contain only letters before @, and be a valid email domain
    const emailRegex = /^[a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return 'Email must be in format: letters@domain.com (only letters before @, no symbols)'
    }
    return ''
  }

  const validateName = (name) => {
    // Must contain at least one letter, cannot be only numbers
    if (/^\d+$/.test(name)) {
      return 'Name cannot be only numbers'
    }
    if (!/[a-zA-Z]/.test(name)) {
      return 'Name must contain at least one letter'
    }
    return ''
  }

  const validatePassword = (password) => {
    // Must be 4+ characters, only letters and numbers, no symbols
    if (password.length < 4) {
      return 'Password must be at least 4 characters long'
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return 'Password can only contain letters and numbers (no symbols)'
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    
    // Validate on change
    const errors = { ...fieldErrors }
    if (name === 'email') {
      errors.email = validateEmail(value)
    } else if (name === 'name') {
      errors.name = validateName(value)
    } else if (name === 'password') {
      errors.password = validatePassword(value)
    }
    setFieldErrors(errors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate all fields before submission
    const errors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      name: isSignUp ? validateName(form.name) : ''
    }
    
    setFieldErrors(errors)
    
    // Check if there are any errors
    if (errors.email || errors.password || (isSignUp && errors.name)) {
      return
    }
    
    setLoading(true)
    if (isSignUp) {
      const res = await signup(form)
      setLoading(false)
      if (!res.ok) return setError(res.message)
      return navigate(res.user.role === 'student' ? '/student-dashboard' : '/instructor-dashboard')
    } else {
      const res = await login(form.email, form.password)
      setLoading(false)
      if (!res.ok) return setError(res.message)
      return navigate(res.user.role === 'student' ? '/student-dashboard' : '/instructor-dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl bg-gradient-to-r from-accent-cyan to-nebula-2 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Astro Academy
          </Link>

          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-accent-cyan' : 'text-starlight/80 hover:text-starlight'
                }`
              }
            >
              Home
            </NavLink>
            <button
              onClick={() => { window.location.href = '/#mission' }}
              className="text-sm font-medium text-starlight/80 hover:text-starlight transition-colors"
            >
              Mission
            </button>
            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-accent-cyan' : 'text-starlight/80 hover:text-starlight'
                }`
              }
            >
              Courses
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="relative glass-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
              
              {/* Image Panel - Slides left/right */}
              <div className={`absolute md:relative inset-0 md:inset-auto transition-all duration-700 ease-in-out ${
                isSignUp ? 'md:order-2 md:translate-x-0' : 'md:order-1 md:translate-x-0'
              } ${isSignUp ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="relative h-full w-full">
                  <img src="/images/moon1.jpg" alt="moon" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-white text-center px-4">
                      {isSignUp ? 'Join the Crew' : 'Explore the Unknown'}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Form Panel - Login */}
              <div className={`p-8 md:p-12 flex flex-col justify-center transition-opacity duration-500 ${
                !isSignUp ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none'
              } ${!isSignUp ? 'md:order-2' : 'md:order-1'}`}>
                <div className="space-y-5">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                    <p className="text-sm text-gray-300">Enter your credentials to continue.</p>
                  </div>

                  {error && !isSignUp && <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-500/30">{error}</div>}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        type="email" 
                        required 
                        placeholder="ava@example.com"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                      />
                      {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Password</label>
                      <input 
                        name="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                      />
                      {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full py-3 rounded-lg bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setIsSignUp(true); setError(''); setFieldErrors({ name: '', email: '', password: '' }); setForm({ name: '', email: '', password: '', role: 'student' }) }}
                      className="text-accent-cyan hover:underline font-semibold"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </div>

              {/* Form Panel - Signup */}
              <div className={`p-8 md:p-12 flex flex-col justify-center transition-opacity duration-500 ${
                isSignUp ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none'
              } ${isSignUp ? 'md:order-1' : 'md:order-2'}`}>
                <div className="space-y-5">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-sm text-gray-300">Join the crew and start learning.</p>
                  </div>

                  {error && isSignUp && <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-500/30">{error}</div>}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                      <input 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                      />
                      {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email</label>
                      <input 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        type="email" 
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                      />
                      {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Password</label>
                      <input 
                        name="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        type="password" 
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                      />
                      {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Role</label>
                      <select 
                        name="role" 
                        value={form.role} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                      >
                        <option value="student" className="bg-deep-space">Student</option>
                        <option value="instructor" className="bg-deep-space">Instructor</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3 rounded-lg bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setIsSignUp(false); setError(''); setFieldErrors({ name: '', email: '', password: '' }); setForm({ name: '', email: '', password: '', role: 'student' }) }}
                      className="text-accent-cyan hover:underline font-semibold"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
