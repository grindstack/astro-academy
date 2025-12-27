import { createContext, useContext, useState, useEffect } from 'react'
import usersData from '../data/users.json'
import { useNavigate, Navigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('astro_user')
      if (raw) setUser(JSON.parse(raw))
    } catch (e) {
      console.warn('Failed to parse stored user', e)
    } finally {
      setIsRestoring(false)
    }
  }, [])

  const login = async (email, password) => {
    // check in bundled users + any app-session users in localStorage
    const sessionUsersRaw = localStorage.getItem('astro_users')
    const sessionUsers = sessionUsersRaw ? JSON.parse(sessionUsersRaw) : []
    const allUsers = [...usersData, ...sessionUsers]

    const found = allUsers.find(u => u.email === email && u.password === password)
    if (!found) {
      return { ok: false, message: 'Invalid credentials. Please create an account.' }
    }

    const safe = { id: found.id, role: found.role, name: found.name, email: found.email }
    localStorage.setItem('astro_user', JSON.stringify(safe))
    setUser(safe)
    return { ok: true, user: safe }
  }

  const signup = async ({ name, email, password, role }) => {
    // do not persist to disk — keep in session-local storage list
    const sessionUsersRaw = localStorage.getItem('astro_users')
    const sessionUsers = sessionUsersRaw ? JSON.parse(sessionUsersRaw) : []
    if ([...usersData, ...sessionUsers].find(u => u.email === email)) {
      return { ok: false, message: 'An account with that email already exists.' }
    }

    const id = `${role}-${Date.now()}`
    const newUser = { id, role, name, email, password, enrolled: [], progress: {}, badges: [] }
    const updated = [...sessionUsers, newUser]
    localStorage.setItem('astro_users', JSON.stringify(updated))

    const safe = { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email }
    localStorage.setItem('astro_user', JSON.stringify(safe))
    setUser(safe)
    return { ok: true, user: safe }
  }

  const logout = () => {
    localStorage.removeItem('astro_user')
    setUser(null)
  }

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-starlight text-sm">Establishing link to satellite...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}

export function ProtectedRoute({ children }){
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default AuthContext
