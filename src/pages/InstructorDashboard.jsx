import { useEffect, useState } from 'react'
import * as api from '../services/api'
import * as stateManager from '../utils/stateManager'
import StatCard from '../components/dashboard/StatCard'
import AnalyticsCard from '../components/dashboard/AnalyticsCard'
import CourseManagementCard from '../components/dashboard/CourseManagementCard'

export default function InstructorDashboard(){
  // Safe state initialization with default values to prevent crashes
  const [data, setData] = useState({
    user: { name: 'Instructor', email: '' },
    coursesTaught: 0,
    totalStudents: 0,
    avgCourseRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [createdCourses, setCreatedCourses] = useState([])
  const [activityStats, setActivityStats] = useState({ total: 0, coursesCreated: 0 })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Astronomy',
    description: '',
    duration: 0,
    date: '',
    lessons: []
  })
  const [currentLesson, setCurrentLesson] = useState({
    title: '',
    videoFile: null,
    videoFileName: '',
    videoUrl: '',
    duration: 0
  })

  const loadDashboard = async () => {
    // Safe localStorage retrieval with fallback
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'instructor-1', role: 'instructor' }
    const uid = parsed?.id || 'instructor-1'

    try {
      // Initialize state manager (ensures localStorage structure exists)
      stateManager.initializeState()
      
      // Fetch instructor data with safe defaults
      const instructorData = await api.getInstructorStats(uid)
      
      // Get created courses - guaranteed to return array
      const courses = stateManager.getCreatedCourses(uid)
      setCreatedCourses(Array.isArray(courses) ? courses : [])
      
      // Calculate total students dynamically from created courses
      const totalStudents = stateManager.getTotalStudentsForInstructor(uid)
      
      // Update data state with dynamically calculated values
      setData({
        user: instructorData?.user || { name: 'Instructor', email: '' },
        coursesTaught: courses.length,
        totalStudents: totalStudents,
        avgCourseRating: instructorData?.avgCourseRating || 0
      })
      
      // Get activity stats - guaranteed to return object
      const stats = stateManager.getActivityStats(uid, 'instructor')
      setActivityStats(stats || { total: 0, coursesCreated: 0 })
    } catch (err) {
      console.error('Failed to load instructor stats:', err)
      // Set safe defaults on error
      setData({
        user: { name: 'Instructor', email: '' },
        coursesTaught: 0,
        totalStudents: 0,
        avgCourseRating: 0
      })
      setCreatedCourses([])
      setActivityStats({ total: 0, coursesCreated: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    
    // Listen for real-time activity updates
    const handleActivityUpdate = () => {
      loadDashboard()
    }
    window.addEventListener('activityUpdate', handleActivityUpdate)
    
    return () => window.removeEventListener('activityUpdate', handleActivityUpdate)
  }, [])

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'instructor-1', role: 'instructor' }
    const uid = parsed?.id || 'instructor-1'
    
    if (editingCourse) {
      // Update existing course
      const updatedCourse = stateManager.updateCourse(uid, editingCourse.id, {
        title: newCourse.title,
        category: newCourse.category,
        description: newCourse.description,
        duration: parseInt(newCourse.duration) || 0,
        date: newCourse.date,
        lessons: newCourse.lessons
      })
      
      // IMMEDIATE STATE UPDATE - update React state without reload
      if (updatedCourse) {
        setCreatedCourses(prev => 
          prev.map(c => c.id === updatedCourse.id ? updatedCourse : c)
        )
        // Trigger activity update for real-time stats
        handleActivity('course_updated', updatedCourse.id)
      }
      setEditingCourse(null)
    } else {
      // Create new course
      const createdCourse = stateManager.createCourse(uid, {
        title: newCourse.title,
        category: newCourse.category,
        description: newCourse.description,
        duration: parseInt(newCourse.duration) || 0,
        date: newCourse.date,
        lessons: newCourse.lessons,
        rating: 0,
        studentsEnrolled: 0
      })
      
      // Reload dashboard to show new course (prevents duplication)
      if (createdCourse) {
        loadDashboard()
        handleActivity('course_created', createdCourse.id)
      }
    }
    
    // Reset form and close
    setNewCourse({ title: '', category: 'Astronomy', description: '', duration: 0, date: '', lessons: [] })
    setCurrentLesson({ title: '', videoFile: null, videoFileName: '', videoUrl: '', duration: 0 })
    setShowCreateForm(false)
  }

  const handleChange = (e) => {
    setNewCourse(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setNewCourse({
      title: course.title,
      category: course.category,
      description: course.description,
      duration: course.duration,
      date: course.date,
      lessons: course.lessons || []
    })
    setShowCreateForm(true)
  }

  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const stored = localStorage.getItem('astro_user')
      const parsed = stored ? JSON.parse(stored) : { id: 'instructor-1', role: 'instructor' }
      const uid = parsed?.id || 'instructor-1'
      
      // Delete from localStorage
      const success = stateManager.deleteCourse(uid, courseId)
      
      if (success) {
        // IMMEDIATE STATE UPDATE - remove from React state instantly
        setCreatedCourses(prev => prev.filter(c => c.id !== courseId))
        // Update stats immediately
        setActivityStats(prev => ({
          total: Math.max(0, prev.total - 1),
          coursesCreated: Math.max(0, prev.coursesCreated - 1)
        }))
        // Trigger activity update
        handleActivity('course_deleted', courseId)
      }
    }
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'audio/mpeg', 'audio/mp3']
      if (!validTypes.includes(file.type) && !file.name.endsWith('.mp3')) {
        alert('Please upload a valid video (mp4, webm, ogg) or audio (mp3) file')
        return
      }
      
      // Create object URL for preview
      const videoUrl = URL.createObjectURL(file)
      setCurrentLesson(prev => ({
        ...prev,
        videoFile: file,
        videoFileName: file.name,
        videoUrl: videoUrl
      }))
    }
  }

  const handleAddLesson = () => {
    if (!currentLesson.title || !currentLesson.videoFileName) {
      alert('Please provide lesson title and upload a video')
      return
    }

    const lesson = {
      id: `lesson-${Date.now()}`,
      title: currentLesson.title,
      videoFileName: currentLesson.videoFileName,
      videoUrl: currentLesson.videoUrl,
      duration: parseInt(currentLesson.duration) || 0,
      type: 'video'
    }

    setNewCourse(prev => ({
      ...prev,
      lessons: [...prev.lessons, lesson]
    }))

    // Reset lesson form
    setCurrentLesson({
      title: '',
      videoFile: null,
      videoFileName: '',
      videoUrl: '',
      duration: 0
    })
  }

  const handleRemoveLesson = (lessonId) => {
    setNewCourse(prev => ({
      ...prev,
      lessons: prev.lessons.filter(l => l.id !== lessonId)
    }))
  }

  // Activity tracking function - updates stats immediately
  const handleActivity = (type, courseId) => {
    const stored = localStorage.getItem('astro_user')
    const parsed = stored ? JSON.parse(stored) : { id: 'instructor-1', role: 'instructor' }
    const uid = parsed?.id || 'instructor-1'
    
    // Log activity
    stateManager.logActivity(uid, 'instructor', type, courseId)
    
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent('activityUpdate', {
      detail: { userId: uid, role: 'instructor', type, courseId }
    }))
  }

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass p-8 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Command Center</h1>
            <p className="text-starlight/70">Welcome, {data?.user?.name || 'Instructor'}! Manage your courses and track student progress.</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 rounded-lg bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors"
          >
            {showCreateForm ? 'Cancel' : '+ Create Course'}
          </button>
        </div>
      </div>

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="glass p-6 rounded-xl border-2 border-accent-cyan/30">
          <h2 className="text-2xl font-semibold mb-4">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Course Name</label>
                <input
                  name="title"
                  value={newCourse.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Advanced Rocket Propulsion"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  name="category"
                  value={newCourse.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                >
                  <option value="Astronomy">Astronomy</option>
                  <option value="Rocket Science">Rocket Science</option>
                  <option value="Astrobiology">Astrobiology</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Duration (hours)</label>
                <input
                  name="duration"
                  type="number"
                  value={newCourse.duration}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g., 12"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                <input
                  name="date"
                  type="date"
                  value={newCourse.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Course Lessons</h3>
              
              {/* Lesson Builder */}
              <div className="space-y-3 mb-4 p-4 rounded-lg bg-white/5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Lesson Title</label>
                  <input
                    type="text"
                    value={currentLesson.title}
                    onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to Astronomy"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Video File</label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,audio/mpeg,audio/mp3,.mp3"
                      onChange={handleVideoUpload}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-cyan file:text-deep-space file:font-semibold hover:file:bg-cyan-400 file:cursor-pointer"
                    />
                    {currentLesson.videoFileName && (
                      <p className="mt-2 text-xs text-accent-cyan flex items-center gap-2">
                        ✓ {currentLesson.videoFileName}
                        {currentLesson.videoUrl && (
                          <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">Preview</a>
                        )}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={currentLesson.duration}
                      onChange={(e) => setCurrentLesson(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 15"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddLesson}
                  className="w-full py-2 rounded-lg bg-white/10 text-white border border-accent-cyan/50 hover:bg-accent-cyan/20 transition-colors"
                >
                  + Add Lesson
                </button>
              </div>
              
              {/* Added Lessons List */}
              {(newCourse.lessons && newCourse.lessons.length > 0) && (
                <div className="space-y-2">
                  <p className="text-sm text-starlight/70 mb-2">{newCourse.lessons.length} lesson(s) added:</p>
                  {newCourse.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-1">
                        <p className="text-white font-medium">{index + 1}. {lesson.title}</p>
                        <div className="flex gap-3 text-xs text-starlight/60 mt-1">
                          <span>{lesson.videoFileName}</span>
                          <span>⏱️ {lesson.duration}min</span>
                          {lesson.videoUrl && (
                            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">View Video</a>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(lesson.id)}
                        className="px-3 py-1 rounded text-xs bg-red-900/20 text-red-400 border border-red-500/50 hover:bg-red-900/30 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Description</label>
              <textarea
                name="description"
                value={newCourse.description}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Describe what students will learn..."
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan resize-none"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors"
            >
              {editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Courses Created" value={createdCourses.length} icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>} />
        <StatCard label="Total Students" value={data.totalStudents || 0} icon={<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>} />
        <StatCard label="Total Activity" value={activityStats.total} icon="⚡" />
      </div>

      {/* My Courses Section */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-2xl font-semibold mb-6">My Courses</h2>
        {(createdCourses && createdCourses.length > 0) ? (
          <div className="space-y-3">
            {createdCourses.map(course => {
              // Get real-time enrollment count from global state
              const enrollmentCount = stateManager.getCourseEnrollmentCount(course.id)
              return (
              <div
                key={course.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{course.title}</h3>
                    <p className="text-sm text-starlight/70 mb-2">{course.description}</p>
                    <div className="flex gap-4 text-xs text-starlight/50">
                      <span>{course.date}</span>
                      <span>{course.level}</span>
                      <span>{course.category}</span>
                      <span>{enrollmentCount} enrolled</span>
                      <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(course)}
                      className="px-3 py-1 rounded text-xs bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="px-3 py-1 rounded text-xs bg-red-900/20 text-red-400 border border-red-500/50 hover:bg-red-900/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-starlight/60 mb-4">No courses created yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 rounded-lg bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors"
            >
              Create Your First Course
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
