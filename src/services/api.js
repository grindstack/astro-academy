import coursesData from '../data/courses.json'
import usersData from '../data/users.json'
import instructorsData from '../data/instructors.json'
import statsData from '../data/stats.json'

/**
 * Simulate network delay to create realistic loading states
 */
const simulateDelay = (ms = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch all courses (from localStorage - instructor-created courses)
 */
export const getCourses = async () => {
  await simulateDelay()
  
  // Get all instructor-created courses from localStorage
  const userCoursesRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('astro_user_courses') : null
  const userCoursesData = userCoursesRaw ? JSON.parse(userCoursesRaw) : { enrolled: {}, created: {} }
  
  const instructorCourses = []
  for (const instructorId in userCoursesData.created) {
    instructorCourses.push(...userCoursesData.created[instructorId])
  }
  
  // Combine bundled courses with instructor-created courses and remove duplicates
  const allCourses = [...coursesData, ...instructorCourses]
  const uniqueCourses = []
  const seenIds = new Set()
  
  for (const course of allCourses) {
    if (!seenIds.has(course.id)) {
      seenIds.add(course.id)
      uniqueCourses.push(course)
    }
  }
  
  return uniqueCourses
}

/**
 * Fetch featured courses (first 3 from localStorage)
 */
export const getFeaturedCourses = async () => {
  await simulateDelay()
  const allCourses = await getCourses()
  return allCourses.slice(0, 3)
}

/**
 * Fetch a single course by ID (from localStorage)
 */
export const getCourseById = async (id) => {
  await simulateDelay(600)
  const allCourses = await getCourses()
  return allCourses.find(course => String(course.id) === String(id)) || null
}

/**
 * Fetch user profile by ID
 */
export const getUserProfile = async (id) => {
  await simulateDelay(500)
  return usersData.find(user => user.id === id) || null
}

/**
 * Fetch courses by category (from localStorage)
 */
export const getCoursesByCategory = async (category) => {
  await simulateDelay()
  const allCourses = await getCourses()
  if (category === 'all') return allCourses
  return allCourses.filter(course => course.category === category)
}

/**
 * Search courses by keyword (from localStorage)
 */
export const searchCourses = async (query) => {
  await simulateDelay()
  const allCourses = await getCourses()
  const lowercase = query.toLowerCase()
  return allCourses.filter(course =>
    course.title.toLowerCase().includes(lowercase) ||
    course.description.toLowerCase().includes(lowercase)
  )
}

/**
 * Get student-specific dashboard data
 */
export const getStudentData = async (userId) => {
  await simulateDelay(700)
  
  // Get student from session users (localStorage)
  const sessionUsersRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('astro_users') : null
  const sessionUsers = sessionUsersRaw ? JSON.parse(sessionUsersRaw) : []
  const user = sessionUsers.find(u => u.id === userId && u.role === 'student')
  
  // Return empty structure for new users
  if (!user) {
    return {
      user: { id: userId, name: 'Student', email: '', badges: [] },
      enrolledCourses: [],
      totalHours: 0,
      upcomingLessons: [],
      overallProgress: 0
    }
  }

  // Get enrolled courses from localStorage
  const userCoursesRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('astro_user_courses') : null
  const userCoursesData = userCoursesRaw ? JSON.parse(userCoursesRaw) : { enrolled: {}, created: {} }
  const enrolledIds = userCoursesData.enrolled[userId] || []
  
  // Get ALL courses (bundled + instructor-created)
  const allCourses = await getCourses()
  
  const enrolledCourses = enrolledIds.map(cid => {
    const course = allCourses.find(c => String(c.id) === String(cid))
    if (!course) return null
    const prog = (user.progress && user.progress[cid]) || { completedLessons: [], percent: 0 }
    return {
      id: course.id,
      title: course.title,
      percent: prog.percent || 0,
      completedLessons: prog.completedLessons || [],
      studentsEnrolled: course.studentsEnrolled || 0,
      duration: course.duration || 0
    }
  }).filter(Boolean)

  // Compute total hours from enrolled courses
  const totalHours = enrolledCourses.reduce((s, c) => s + (c.duration || 0), 0)

  // Upcoming lessons calculation (simplified)
  const upcoming = []
  
  return {
    user: { id: user.id, name: user.name, email: user.email, badges: user.badges || [] },
    enrolledCourses,
    totalHours,
    upcomingLessons: upcoming,
    overallProgress: Math.round((enrolledCourses.reduce((acc, c) => acc + (c.percent || 0), 0) / Math.max(enrolledCourses.length, 1)) * 10) / 10
  }
}

/**
 * Get instructor dashboard statistics
 */
export const getInstructorStats = async (instructorId) => {
  await simulateDelay(700)
  
  // Get instructor from session users (localStorage)
  const sessionUsersRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('astro_users') : null
  const sessionUsers = sessionUsersRaw ? JSON.parse(sessionUsersRaw) : []
  const instructor = sessionUsers.find(u => u.id === instructorId && u.role === 'instructor')
  
  // Return structure with instructor info from localStorage
  return {
    user: instructor ? { 
      id: instructor.id, 
      name: instructor.name, 
      email: instructor.email 
    } : { 
      id: instructorId, 
      name: 'Instructor', 
      email: '' 
    },
    coursesTaught: 0, // Will be calculated from localStorage in dashboard
    totalStudents: 0, // Will be calculated from localStorage in dashboard
    avgCourseRating: 0,
    globalStats: statsData || {}
  }
}

const apiService = {
  simulateDelay,
  getCourses,
  getFeaturedCourses,
  getCourseById,
  getUserProfile,
  getCoursesByCategory,
  searchCourses,
  getStudentData,
  getInstructorStats
}

export default apiService
