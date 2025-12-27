import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../services/api'
import * as stateManager from '../utils/stateManager'
import StatCard from '../components/dashboard/StatCard'
import ProgressWidget from '../components/dashboard/ProgressWidget'

export default function StudentDashboard(){
  // Safe state initialization with default values to prevent crashes
  const [data, setData] = useState({
    user: { name: 'Student', email: '' },
    enrolledCourses: [],
    totalHours: 0,
    upcomingLessons: [],
    overallProgress: 0
  })
  const [loading, setLoading] = useState(true)
  const [availableCourses, setAvailableCourses] = useState([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([])
  const [activityStats, setActivityStats] = useState({ total: 0, enrollments: 0 })
  const [carouselIndex, setCarouselIndex] = useState(0)

  const loadDashboard = async () => {
    // Safe localStorage retrieval with fallback
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'student-1', role: 'student' }
    const uid = parsed?.id || 'student-1'

    try {
      // Initialize state manager (ensures localStorage structure exists)
      stateManager.initializeState()
      
      // Fetch student data with safe defaults
      const studentData = await api.getStudentData(uid)
      setData(studentData || {
        user: { name: 'Student', email: '' },
        enrolledCourses: [],
        totalHours: 0,
        upcomingLessons: [],
        overallProgress: 0
      })
      
      // Get enrolled courses - guaranteed to return array
      const enrolled = stateManager.getEnrolledCourses(uid)
      setEnrolledCourseIds(Array.isArray(enrolled) ? enrolled : [])
      
      // Get ALL available courses (bundled + instructor-created)
      const allCourses = await api.getCourses()
      setAvailableCourses(Array.isArray(allCourses) ? allCourses : [])
      
      // Get activity stats - guaranteed to return object
      const stats = stateManager.getActivityStats(uid, 'student')
      setActivityStats(stats || { total: 0, enrollments: 0 })
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      // Set safe defaults on error
      setData({
        user: { name: 'Student', email: '' },
        enrolledCourses: [],
        totalHours: 0,
        upcomingLessons: [],
        overallProgress: 0
      })
      setAvailableCourses([])
      setEnrolledCourseIds([])
      setActivityStats({ total: 0, enrollments: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Clean up testing courses and duplicates from localStorage
    const cleanupTestingCourses = async () => {
      const data = JSON.parse(localStorage.getItem('astro_user_courses') || '{"enrolled":{},"created":{}}')
      let hasChanges = false
      
      // Build a set of valid course IDs after cleanup (include bundled courses!)
      const validCourseIds = new Set()
      
      // Add bundled course IDs from courses.json
      const bundledCourses = await api.getCourses()
      bundledCourses.forEach(course => validCourseIds.add(course.id))
      
      // Remove testing courses from all instructors
      for (const instructorId in data.created) {
        const originalLength = data.created[instructorId].length
        data.created[instructorId] = data.created[instructorId].filter(course => 
          !course.title.toLowerCase().includes('testing')
        )
        
        // Remove duplicates by ID
        const seenIds = new Set()
        data.created[instructorId] = data.created[instructorId].filter(course => {
          if (seenIds.has(course.id)) return false
          seenIds.add(course.id)
          return true
        })
        
        // Collect instructor-created course IDs
        data.created[instructorId].forEach(course => validCourseIds.add(course.id))
        
        if (data.created[instructorId].length !== originalLength) {
          hasChanges = true
        }
      }
      
      // Clean up enrolled courses - remove references to deleted/testing courses
      for (const userId in data.enrolled) {
        const originalLength = data.enrolled[userId].length
        data.enrolled[userId] = data.enrolled[userId].filter(courseId => validCourseIds.has(courseId))
        
        if (data.enrolled[userId].length !== originalLength) {
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        localStorage.setItem('astro_user_courses', JSON.stringify(data))
      }
    }
    
    cleanupTestingCourses().then(() => loadDashboard())
    
    // Listen for real-time activity updates
    const handleActivityUpdate = () => {
      loadDashboard()
    }
    window.addEventListener('activityUpdate', handleActivityUpdate)
    
    return () => window.removeEventListener('activityUpdate', handleActivityUpdate)
  }, [])

  const handleEnroll = (courseId) => {
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'student-1', role: 'student' }
    const uid = parsed?.id || 'student-1'
    
    const success = stateManager.enrollInCourse(uid, courseId)
    if (success) {
      // Reload dashboard to get fresh data with updated enrollments
      loadDashboard()
      
      // Trigger activity update for real-time sync
      handleActivity('enrollment', courseId)
    }
  }

  const handleUnenroll = (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return
    }
    
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'student-1', role: 'student' }
    const uid = parsed?.id || 'student-1'
    
    const success = stateManager.unenrollFromCourse(uid, courseId)
    if (success) {
      // IMMEDIATE STATE UPDATE
      setEnrolledCourseIds(prev => prev.filter(id => id !== courseId))
      
      // Update stats immediately
      setActivityStats(prev => ({
        total: Math.max(0, prev.total - 1),
        enrollments: Math.max(0, prev.enrollments - 1)
      }))
      
      // Refresh dashboard to update enrolled courses list
      loadDashboard()
      
      // Trigger activity update
      handleActivity('unenrollment', courseId)
    }
  }

  const handleMarkComplete = (courseId) => {
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'student-1', role: 'student' }
    const uid = parsed?.id || 'student-1'
    
    const success = stateManager.markCourseAsCompleted(uid, courseId)
    if (success) {
      // Refresh dashboard to show updated progress
      loadDashboard()
      
      // Trigger activity update
      handleActivity('course_completed', courseId)
      
      alert('Congratulations! Course marked as completed!')
    }
  }

  // Activity tracking function - updates stats immediately
  const handleActivity = (type, courseId) => {
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'student-1', role: 'student' }
    const uid = parsed?.id || 'student-1'
    
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent('activityUpdate', {
      detail: { userId: uid, role: 'student', type, courseId }
    }))
  }

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass p-8 rounded-xl">
        <h1 className="text-4xl font-bold mb-2">Mission Control</h1>
        <p className="text-starlight/70">Welcome back, {data?.user?.name || 'Student'}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Courses Enrolled" value={data?.enrolledCourses?.length || 0} icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>} />
        <StatCard label="Total Hours Learned" value={`${data?.totalHours || 0}h`} icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>} />
        <StatCard label="Completion Rate" value={`${Math.round(data?.overallProgress || 0)}%`} icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>} />
      </div>

      {/* Available Courses Carousel */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Courses</h2>
          {availableCourses.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                disabled={carouselIndex === 0}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <button
                onClick={() => setCarouselIndex(prev => Math.min(availableCourses.length - 4, prev + 1))}
                disabled={carouselIndex >= availableCourses.length - 4}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </div>
        {(availableCourses && availableCourses.length > 0) ? (
          <div className="relative overflow-hidden">
            <div 
              className="flex gap-4 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${carouselIndex * 25}%)` }}
            >
              {availableCourses.map(course => {
                const isEnrolled = enrolledCourseIds.includes(course.id)
                const enrolledCourse = data.enrolledCourses.find(c => c.id === course.id)
                const isCompleted = enrolledCourse?.percent >= 100
                
                return (
                  <div key={course.id} className="min-w-[calc(25%-12px)] p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm flex-1 line-clamp-1">{course.title}</h3>
                      {isCompleted && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/50 whitespace-nowrap ml-2">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-starlight/70 mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-starlight/50">{course.duration || 0}h</span>
                      {isEnrolled ? (
                        <div className="flex gap-1">
                          <Link
                            to={`/course/${course.id}`}
                            className="px-2 py-1 rounded text-xs bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleUnenroll(course.id)}
                            className="px-2 py-1 rounded text-xs bg-red-900/20 text-red-400 border border-red-500/50 hover:bg-red-900/30 transition-colors"
                          >
                            Unenroll
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          className="px-2 py-1 rounded text-xs bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors whitespace-nowrap"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-starlight/60">No courses available yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <ProgressWidget courses={data.enrolledCourses} />
    </div>
  )
}
