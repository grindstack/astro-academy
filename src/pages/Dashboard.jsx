import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import StudentDashboard from './StudentDashboard'
import InstructorDashboard from './InstructorDashboard'

/**
 * Unified Dashboard Component with Role-Based Access Control
 * 
 * GUARD CLAUSE: This component checks the user's role immediately
 * and renders the appropriate dashboard. This prevents role "glitches"
 * where a student might access instructor features.
 */
export default function Dashboard() {
  const { user } = useAuth()

  // Guard Clause: Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Guard Clause: Strict role-based rendering
  // This check runs IMMEDIATELY upon mounting to prevent wrong UI from ever rendering
  if (user.role === 'student') {
    return <StudentDashboard />
  }

  if (user.role === 'instructor') {
    return <InstructorDashboard />
  }

  // Fallback for unknown roles
  return (
    <div className="glass p-8 rounded-xl text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Invalid Role</h2>
      <p className="text-starlight/70">
        Your account role ({user.role}) is not recognized. Please contact support.
      </p>
    </div>
  )
}
