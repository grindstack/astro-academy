import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import * as api from '../services/api'
import * as stateManager from '../utils/stateManager'
import { useAuth } from '../context/AuthContext'

export default function CourseDetails(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [activeTab, setActiveTab] = useState('brief')
  const [completedLessons, setCompletedLessons] = useState(new Set())
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [courseProgress, setCourseProgress] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        let data = await api.getCourseById(id)
        
        // If not found in bundled courses, check instructor-created courses
        if (!data) {
          const storedData = localStorage.getItem('astro_user_courses')
          if (storedData) {
            const parsedData = JSON.parse(storedData)
            if (parsedData.created) {
              // Search all instructor courses
              for (const instructorId in parsedData.created) {
                const found = parsedData.created[instructorId].find(c => c.id === id)
                if (found) {
                  data = found
                  break
                }
              }
            }
          }
        }
        
        setCourse(data)
        
        // Redirect if course not found (deleted)
        if (!data) {
          navigate('/dashboard')
          return
        }
        
        // Check enrollment status
        if (user && user.role === 'student') {
          const enrolled = stateManager.isEnrolledInCourse(user.id, id)
          setIsEnrolled(enrolled)
          
          // Load user progress
          const sessionUsersRaw = localStorage.getItem('astro_users')
          if (sessionUsersRaw) {
            const sessionUsers = JSON.parse(sessionUsersRaw)
            const userData = sessionUsers.find(u => u.id === user.id)
            if (userData?.progress?.[id]) {
              const progress = userData.progress[id]
              setCourseProgress(progress.percent || 0)
              setCompletedLessons(new Set(progress.completedLessons || []))
            }
          }
        }
        
        if (data?.modules?.length) {
          setActiveModuleId(data.modules[0].id)
          if (data.modules[0].lessons?.length) {
            setActiveLessonId(data.modules[0].lessons[0].id)
            setVideoLoaded(false)
          }
        }
      } catch (err) {
        console.error('Failed to load course:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  const toggleLessonComplete = (lessonId) => {
    if (!user || user.role !== 'student' || !isEnrolled) return
    
    const updated = new Set(completedLessons)
    if (updated.has(lessonId)) {
      updated.delete(lessonId)
    } else {
      updated.add(lessonId)
    }
    setCompletedLessons(updated)
    
    // Calculate progress percentage
    const totalLessons = course?.modules?.reduce((total, module) => {
      return total + (module.lessons?.length || 0)
    }, 0) || 0
    
    const percent = totalLessons > 0 ? Math.round((updated.size / totalLessons) * 100) : 0
    setCourseProgress(percent)
    
    // Save progress
    stateManager.updateCourseProgress(user.id, id, percent, Array.from(updated))
  }
  
  const handleMarkComplete = () => {
    if (!user || user.role !== 'student') return
    
    if (window.confirm('Mark this course as 100% complete?')) {
      stateManager.markCourseAsCompleted(user.id, id)
      setCourseProgress(100)
      alert('Congratulations! Course completed!')
      navigate('/dashboard')
    }
  }
  
  const handleEnroll = () => {
    if (!user) {
      navigate('/login?signup=true')
      return
    }
    if (user.role !== 'student') return
    
    const success = stateManager.enrollInCourse(user.id, id)
    if (success) {
      setIsEnrolled(true)
      alert('Successfully enrolled in course!')
    }
  }

  const activeLesson = course?.modules
    ?.find(m => m.id === activeModuleId)
    ?.lessons?.find(l => l.id === activeLessonId)
  
  // Normalize video URL - check both 'url' and 'videoUrl' properties
  if (activeLesson && !activeLesson.url && activeLesson.videoUrl) {
    activeLesson.url = activeLesson.videoUrl
  }

  // Convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    // Handle youtu.be format
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Handle youtube.com/watch format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  // Helper function to check if URL is a video file (MP4, WebM, etc.)
  const isVideoFile = (url) => {
    if (!url) return false
    // Check for blob URLs (uploaded files)
    if (url.startsWith('blob:')) return true
    // Check for direct video file extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
    return videoExtensions.some(ext => url.toLowerCase().includes(ext))
  }

  if (loading) {
    return (
      <div className="glass p-8 rounded-xl text-center">
        <div className="text-starlight/70 font-mono mb-4">▶ Establishing Link to Satellite...</div>
        <div className="animate-pulse text-accent-cyan">⚡ Synchronizing Data...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="glass p-8 rounded-xl text-center">
        <p className="text-starlight/70">Course not found.</p>
        <Link to="/catalog" className="text-accent-cyan hover:underline mt-4 inline-block">
          Return to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-starlight/70 font-mono">
        <Link to="/catalog" className="hover:text-accent-cyan">Catalog</Link>
        <span className="text-accent-cyan">/</span>
        <span>{course.title}</span>
      </div>

      {/* Course Header */}
      <div className="glass p-8 rounded-xl border border-white/10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-starlight/80 mb-6 font-mono">
              <span className="text-accent-cyan">[{course.category}]</span>
              <span>⭐ {course.rating}</span>
              <span>⏱ {course.duration}h</span>
              <span><svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>{course.studentsEnrolled}</span>
            </div>
            <p className="text-starlight/80 leading-relaxed mb-6">
              {course.description}
            </p>
            
            {/* Progress Bar for Enrolled Students */}
            {isEnrolled && user?.role === 'student' && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-starlight/70">Your Progress</span>
                  <span className="text-sm text-accent-cyan font-semibold">{courseProgress}%</span>
                </div>
                <div className="w-full bg-gray-800/40 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-accent-cyan to-green-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            {user?.role === 'student' && (
              <div className="flex gap-3">
                {!isEnrolled ? (
                  <button 
                    onClick={handleEnroll}
                    className="px-6 py-2 rounded-lg bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors"
                  >
                    Enroll Now
                  </button>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30 transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                    {courseProgress >= 100 && (
                      <div className="px-6 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50">
                        ✓ Completed
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {!user && (
              <Link
                to="/login"
                className="inline-block px-6 py-2 rounded-lg bg-accent-cyan text-deep-space font-semibold hover:bg-cyan-400 transition-colors"
              >
                Sign In to Enroll
              </Link>
            )}
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-40 h-40 rounded-lg bg-gradient-to-br from-nebula-1/50 to-nebula-2/50 border-2 border-accent-cyan/30 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                <div className="text-xs text-accent-cyan font-mono">
                  {isEnrolled ? `${courseProgress}% COMPLETE` : 'COURSE_STATUS'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Left Sidebar - Curriculum (Cockpit Controls) */}
        <aside className="md:col-span-1">
          <div className="glass p-6 rounded-xl border border-white/10 sticky top-20 max-h-[calc(100vh-140px)] overflow-y-auto">
            <h3 className="text-sm font-semibold text-accent-cyan mb-4 font-mono">CURRICULUM_MAP</h3>
            <div className="space-y-2">
              {course.modules?.map(module => (
                <div key={module.id}>
                  <button
                    onClick={() => {
                      setActiveModuleId(module.id)
                      if (module.lessons?.length) {
                        setActiveLessonId(module.lessons[0].id)
                        setVideoLoaded(false)
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      activeModuleId === module.id
                        ? 'bg-accent-cyan/20 border-l-2 border-accent-cyan text-accent-cyan'
                        : 'text-starlight/80 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-mono text-xs mb-1">{module.title}</div>
                  </button>

                  {/* Lessons */}
                  {activeModuleId === module.id && (
                    <div className="ml-3 mt-2 space-y-1 border-l border-accent-cyan/20 pl-3">
                      {module.lessons?.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setActiveLessonId(lesson.id)
                            setVideoLoaded(false)
                          }}
                          className={`w-full text-left px-2 py-2 rounded text-xs transition-all ${
                            activeLessonId === lesson.id
                              ? 'bg-accent-cyan/10 text-accent-cyan'
                              : 'text-starlight/70 hover:text-starlight'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {completedLessons.has(lesson.id) ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-starlight/40">○</span>
                            )}
                            <span className="line-clamp-1">{lesson.title}</span>
                          </div>
                          <div className="text-starlight/50 mt-1">{lesson.duration}m</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area - Video Player & Tabs */}
        <div className="md:col-span-3 space-y-6">
          {/* Video Player Section */}
          <div className="glass p-8 rounded-xl border border-white/10">
            <div className="relative bg-black/40 rounded-lg aspect-video mb-6 border border-accent-cyan/20">
              {activeLesson?.url ? (
                !isEnrolled ? (
                  <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-red-500/20 rounded-full border-2 border-red-500/50 mb-4">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-white text-lg font-medium mb-2">Enroll to Access Course Content</p>
                    <p className="text-gray-400 text-sm mb-4">You must enroll in this course to watch videos</p>
                    <button
                      onClick={handleEnroll}
                      className="px-6 py-2 bg-accent-cyan text-black font-medium rounded-lg hover:bg-accent-cyan/90 transition-colors"
                    >
                      Enroll Now
                    </button>
                  </div>
                ) : !videoLoaded ? (
                  <div 
                    className="absolute inset-0 bg-black flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => setVideoLoaded(true)}
                  >
                    <div className="w-20 h-20 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/30 group-hover:bg-white/20 group-hover:border-white/50 transition-all">
                      <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                    <p className="text-white mt-4 text-lg font-medium">{activeLesson.title}</p>
                    <p className="text-gray-400 text-sm mt-1">{activeLesson.duration}m</p>
                  </div>
                ) : isVideoFile(activeLesson.url || activeLesson.videoUrl) ? (
                  <video
                    key={activeLessonId}
                    className="w-full h-full rounded-lg"
                    src={activeLesson.videoUrl || activeLesson.url}
                    controls
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    key={activeLessonId}
                    className="w-full h-full rounded-lg"
                    src={`${getYouTubeEmbedUrl(activeLesson.url)}?autoplay=1`}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">▶</div>
                    <p className="text-starlight/70 font-mono text-sm">
                      {activeLesson?.title || 'Select a lesson'}
                    </p>
                    {activeLesson?.duration && (
                      <p className="text-starlight/50 font-mono text-xs mt-2">Duration: {activeLesson.duration}m</p>
                    )}
                    {activeLesson && !activeLesson.url && (
                      <p className="text-starlight/50 font-mono text-xs mt-2">(Video content not available)</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Title */}
            {activeLesson && (
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{activeLesson.title}</h2>
                <div className="flex items-center gap-4">
                  {isEnrolled && user?.role === 'student' && (
                    <button
                      onClick={() => toggleLessonComplete(activeLesson.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        completedLessons.has(activeLesson.id)
                          ? 'bg-green-500/20 text-green-400 border border-green-500'
                          : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan hover:bg-accent-cyan/30'
                      }`}
                    >
                      {completedLessons.has(activeLesson.id) ? '✓ Completed' : 'Mark as Complete'}
                    </button>
                  )}
                  <span className="text-sm text-starlight/60 font-mono">
                    {activeLesson.duration}min • {activeLesson.type}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tabs Section */}
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-white/10">
              {[
                { id: 'brief', label: 'Mission Brief' },
                { id: 'reviews', label: 'Crew Reviews' },
                { id: 'resources', label: 'Resources' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 font-medium text-sm transition-all text-center ${
                    activeTab === tab.id
                      ? 'text-accent-cyan border-b-2 border-accent-cyan'
                      : 'text-starlight/70 hover:text-starlight'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'brief' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Course Overview</h3>
                  <p className="text-starlight/80 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-sm text-starlight/60 font-mono">Modules</div>
                      <div className="text-2xl font-bold text-accent-cyan">{course.modules?.length || 0}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-sm text-starlight/60 font-mono">Total Lessons</div>
                      <div className="text-2xl font-bold text-accent-cyan">
                        {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Student Reviews</h3>
                  <div className="space-y-3">
                    {[
                      { author: 'Alex Chen', rating: 5, text: 'Excellent course! Highly recommended.' },
                      { author: 'Maya Patel', rating: 5, text: 'Clear explanations and great content.' }
                    ].map((review, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.author}</span>
                          <span className="text-accent-cyan">{'⭐'.repeat(review.rating)}</span>
                        </div>
                        <p className="text-sm text-starlight/80">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Course Materials</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Course Syllabus', type: 'PDF' },
                      { name: 'Lecture Notes', type: 'PDF' },
                      { name: 'Code Repository', type: 'GitHub' }
                    ].map((resource, i) => (
                      <a
                        key={i}
                        href="#"
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                      >
                        <span className="text-sm">{resource.name}</span>
                        <span className="text-xs text-accent-cyan/70 font-mono group-hover:text-accent-cyan">
                          {resource.type} →
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
