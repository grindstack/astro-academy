/**
 * State Management Utility for Activity Tracking
 * Handles localStorage operations for user data, courses, and activity
 */

// Initialize default state structure
export const initializeState = () => {
  if (!localStorage.getItem('astro_user_courses')) {
    localStorage.setItem('astro_user_courses', JSON.stringify({
      enrolled: {}, // { userId: [courseIds] }
      created: {}   // { instructorId: [courseObjects] }
    }))
  }
  if (!localStorage.getItem('astro_activity_log')) {
    localStorage.setItem('astro_activity_log', JSON.stringify({
      students: {}, // { userId: [{ type, courseId, timestamp }] }
      instructors: {} // { instructorId: [{ type, courseId, timestamp }] }
    }))
  }
  // Initialize global enrollment counts for ALL courses (bundled + instructor-created)
  if (!localStorage.getItem('astro_global_enrollments')) {
    localStorage.setItem('astro_global_enrollments', JSON.stringify({}))
    // Format: { courseId: enrollmentCount }
  }
}

// Get user's enrolled courses
export const getEnrolledCourses = (userId) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  return data.enrolled[userId] || []
}

// Get instructor's created courses
export const getCreatedCourses = (instructorId) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  return data.created[instructorId] || []
}

// Get all instructor-created courses (for students to view)
export const getAllInstructorCourses = () => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  const allCourses = []
  const seenIds = new Set()
  
  Object.values(data.created).forEach(courses => {
    courses.forEach(course => {
      // Skip duplicates and testing courses
      if (!seenIds.has(course.id) && !course.title.toLowerCase().includes('testing')) {
        seenIds.add(course.id)
        allCourses.push(course)
      }
    })
  })
  
  return allCourses
}

// Enroll student in a course
export const enrollInCourse = (userId, courseId) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  if (!data.enrolled[userId]) data.enrolled[userId] = []
  
  // Check if already enrolled
  if (data.enrolled[userId].includes(courseId)) {
    return false
  }
  
  // Add to user's enrolled list
  data.enrolled[userId].push(courseId)
  localStorage.setItem('astro_user_courses', JSON.stringify(data))
  
  // ====== CRITICAL: Initialize user progress in astro_users ======
  const usersData = JSON.parse(localStorage.getItem('astro_users') || '[]')
  const userIndex = usersData.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    if (!usersData[userIndex].progress) {
      usersData[userIndex].progress = {}
    }
    if (!usersData[userIndex].progress[courseId]) {
      usersData[userIndex].progress[courseId] = {
        completedLessons: [],
        percent: 0
      }
    }
    localStorage.setItem('astro_users', JSON.stringify(usersData))
  }
  
  // ====== CRITICAL: Update Global Enrollment Count ======
  // This ensures ALL courses (bundled + instructor-created) track enrollments
  const globalEnrollments = JSON.parse(localStorage.getItem('astro_global_enrollments') || '{}')
  globalEnrollments[courseId] = (globalEnrollments[courseId] || 0) + 1
  localStorage.setItem('astro_global_enrollments', JSON.stringify(globalEnrollments))
  
  // Also update instructor-created course if applicable
  for (const instructorId in data.created) {
    const courseIndex = data.created[instructorId].findIndex(c => c.id === courseId)
    if (courseIndex !== -1) {
      data.created[instructorId][courseIndex].studentsEnrolled = globalEnrollments[courseId]
      localStorage.setItem('astro_user_courses', JSON.stringify(data))
      break
    }
  }
  
  // Log activity
  logActivity(userId, 'student', 'enrollment', courseId)
  return true
}

// Unenroll student from a course
export const unenrollFromCourse = (userId, courseId) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  
  if (!data.enrolled[userId] || !data.enrolled[userId].includes(courseId)) {
    return false
  }
  
  // Remove from user's enrolled list
  data.enrolled[userId] = data.enrolled[userId].filter(id => id !== courseId)
  localStorage.setItem('astro_user_courses', JSON.stringify(data))
  
  // Decrement global enrollment count
  const globalEnrollments = JSON.parse(localStorage.getItem('astro_global_enrollments') || '{}')
  if (globalEnrollments[courseId] > 0) {
    globalEnrollments[courseId] -= 1
  }
  localStorage.setItem('astro_global_enrollments', JSON.stringify(globalEnrollments))
  
  // Update instructor-created course if applicable
  for (const instructorId in data.created) {
    const courseIndex = data.created[instructorId].findIndex(c => c.id === courseId)
    if (courseIndex !== -1) {
      data.created[instructorId][courseIndex].studentsEnrolled = globalEnrollments[courseId]
      localStorage.setItem('astro_user_courses', JSON.stringify(data))
      break
    }
  }
  
  // Remove progress data for this course
  const sessionUsersRaw = localStorage.getItem('astro_users')
  if (sessionUsersRaw) {
    const sessionUsers = JSON.parse(sessionUsersRaw)
    const userIndex = sessionUsers.findIndex(u => u.id === userId)
    if (userIndex !== -1 && sessionUsers[userIndex].progress) {
      delete sessionUsers[userIndex].progress[courseId]
      localStorage.setItem('astro_users', JSON.stringify(sessionUsers))
    }
  }
  
  // Log activity
  logActivity(userId, 'student', 'unenrollment', courseId)
  return true
}

// Update course progress for a student
export const updateCourseProgress = (userId, courseId, percent, completedLessons = []) => {
  initializeState()
  
  // Update in astro_users
  const sessionUsersRaw = localStorage.getItem('astro_users')
  if (!sessionUsersRaw) return false
  
  const sessionUsers = JSON.parse(sessionUsersRaw)
  const userIndex = sessionUsers.findIndex(u => u.id === userId)
  
  if (userIndex === -1) return false
  
  if (!sessionUsers[userIndex].progress) {
    sessionUsers[userIndex].progress = {}
  }
  
  sessionUsers[userIndex].progress[courseId] = {
    completedLessons: completedLessons,
    percent: Math.min(100, Math.max(0, percent))
  }
  
  localStorage.setItem('astro_users', JSON.stringify(sessionUsers))
  
  // Log activity if completed
  if (percent >= 100) {
    logActivity(userId, 'student', 'course_completed', courseId)
  }
  
  return true
}

// Mark course as completed
export const markCourseAsCompleted = (userId, courseId) => {
  return updateCourseProgress(userId, courseId, 100, [])
}

// Create a new course (instructor)
export const createCourse = (instructorId, courseData) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  if (!data.created[instructorId]) data.created[instructorId] = []
  
  const newCourse = {
    id: `custom-${Date.now()}`,
    ...courseData,
    instructorId,
    createdAt: new Date().toISOString(),
    studentsEnrolled: 0,
    modules: [{
      id: 'm1',
      title: 'Course Content',
      lessons: courseData.lessons || []
    }]
  }
  
  data.created[instructorId].push(newCourse)
  localStorage.setItem('astro_user_courses', JSON.stringify(data))
  
  // Log activity
  logActivity(instructorId, 'instructor', 'course_created', newCourse.id)
  return newCourse
}

// Update an existing course (instructor)
export const updateCourse = (instructorId, courseId, updates) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  
  if (!data.created[instructorId]) return null
  
  const courseIndex = data.created[instructorId].findIndex(c => c.id === courseId)
  if (courseIndex === -1) return null
  
  // Update course with new data
  data.created[instructorId][courseIndex] = {
    ...data.created[instructorId][courseIndex],
    ...updates,
    modules: [{
      id: 'm1',
      title: 'Course Content',
      lessons: updates.lessons || data.created[instructorId][courseIndex].lessons || []
    }],
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem('astro_user_courses', JSON.stringify(data))
  
  // Log activity
  logActivity(instructorId, 'instructor', 'course_updated', courseId)
  
  return data.created[instructorId][courseIndex]
}

// Delete a course (instructor)
export const deleteCourse = (instructorId, courseId) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  
  if (!data.created[instructorId]) return false
  
  const originalLength = data.created[instructorId].length
  data.created[instructorId] = data.created[instructorId].filter(c => c.id !== courseId)
  
  if (data.created[instructorId].length < originalLength) {
    localStorage.setItem('astro_user_courses', JSON.stringify(data))
    
    // Unenroll all students from this course
    for (const userId in data.enrolled) {
      if (data.enrolled[userId].includes(courseId)) {
        data.enrolled[userId] = data.enrolled[userId].filter(id => id !== courseId)
      }
    }
    localStorage.setItem('astro_user_courses', JSON.stringify(data))
    
    // Remove global enrollment count
    const globalEnrollments = JSON.parse(localStorage.getItem('astro_global_enrollments') || '{}')
    delete globalEnrollments[courseId]
    localStorage.setItem('astro_global_enrollments', JSON.stringify(globalEnrollments))
    
    // Remove progress data for all users
    const sessionUsersRaw = localStorage.getItem('astro_users')
    if (sessionUsersRaw) {
      const sessionUsers = JSON.parse(sessionUsersRaw)
      sessionUsers.forEach(user => {
        if (user.progress && user.progress[courseId]) {
          delete user.progress[courseId]
        }
      })
      localStorage.setItem('astro_users', JSON.stringify(sessionUsers))
    }
    
    // Log activity
    logActivity(instructorId, 'instructor', 'course_deleted', courseId)
    return true
  }
  
  return false
}

// Log user activity
export const logActivity = (userId, role, type, courseId = null) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_activity_log'))
  const key = role === 'student' ? 'students' : 'instructors'
  
  if (!data[key][userId]) data[key][userId] = []
  
  data[key][userId].push({
    type,
    courseId,
    timestamp: new Date().toISOString()
  })
  
  localStorage.setItem('astro_activity_log', JSON.stringify(data))
  
  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('activityUpdate', { 
    detail: { userId, role, type, courseId } 
  }))
}

// Get user activity log
export const getActivityLog = (userId, role) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_activity_log'))
  const key = role === 'student' ? 'students' : 'instructors'
  return data[key][userId] || []
}

// Get activity stats
export const getActivityStats = (userId, role) => {
  const activities = getActivityLog(userId, role)
  return {
    total: activities.length,
    enrollments: activities.filter(a => a.type === 'enrollment').length,
    coursesCreated: activities.filter(a => a.type === 'course_created').length,
    recentActivity: activities.slice(-5).reverse()
  }
}

// Check if student is enrolled in course
export const isEnrolledInCourse = (userId, courseId) => {
  const enrolled = getEnrolledCourses(userId)
  return enrolled.includes(courseId)
}

// Calculate total students enrolled in instructor's courses
export const getTotalStudentsForInstructor = (instructorId) => {
  initializeState()
  const data = JSON.parse(localStorage.getItem('astro_user_courses'))
  
  if (!data.created[instructorId]) return 0
  
  // Get global enrollment counts
  const globalEnrollments = JSON.parse(localStorage.getItem('astro_global_enrollments') || '{}')
  
  // Sum enrollments for all instructor's courses
  return data.created[instructorId].reduce((total, course) => {
    return total + (globalEnrollments[course.id] || 0)
  }, 0)
}

// Get enrollment count for a specific course (works for any course)
export const getCourseEnrollmentCount = (courseId) => {
  initializeState()
  const globalEnrollments = JSON.parse(localStorage.getItem('astro_global_enrollments') || '{}')
  return globalEnrollments[courseId] || 0
}

export default {
  initializeState,
  getEnrolledCourses,
  getCreatedCourses,
  getAllInstructorCourses,
  enrollInCourse,
  unenrollFromCourse,
  updateCourseProgress,
  markCourseAsCompleted,
  createCourse,
  updateCourse,
  deleteCourse,
  logActivity,
  getActivityLog,
  getActivityStats,
  isEnrolledInCourse,
  getTotalStudentsForInstructor,
  getCourseEnrollmentCount
}
