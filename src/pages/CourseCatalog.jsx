import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../services/api'
import * as stateManager from '../utils/stateManager'
import SkeletonLoader from '../components/common/SkeletonLoader'

export default function CourseCatalog(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['Earth & Space', 'Space Missions', 'Astrophysics']

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getCourses()
        
        // Get instructor-created courses from localStorage
        const storedData = localStorage.getItem('astro_user_courses')
        let instructorCourses = []
        if (storedData) {
          const parsedData = JSON.parse(storedData)
          if (parsedData.created) {
            // Flatten all instructor-created courses
            instructorCourses = Object.values(parsedData.created).flat()
          }
        }
        
        // Combine bundled courses with instructor-created courses
        const allCourses = [...data, ...instructorCourses]
        setCourses(allCourses)
      } catch (err) {
        console.error('Failed to load courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Filter logic
  const filtered = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) return <SkeletonLoader count={6} />

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold mb-3">Course Catalog</h1>
        <p className="text-starlight/70 text-lg">
          Explore {courses.length} professional courses in space & aerospace education.
        </p>
      </div>

      {/* Search Bar - Data Terminal Style */}
      <div className="glass p-4 rounded-lg border border-accent-cyan/30">
        <div className="flex items-center gap-3">
          <span className="text-accent-cyan font-mono text-sm">{'>'}</span>
          <input
            type="text"
            placeholder="QUERY_COURSES ['title', 'description']..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-starlight placeholder-starlight/40 focus:outline-none font-mono text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-accent-cyan hover:text-cyan-400 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Filter */}
        <div className="glass p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-accent-cyan mb-4 font-mono">FILTER_CATEGORY</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${
                selectedCategory === 'all'
                  ? 'bg-accent-cyan/20 border border-accent-cyan text-accent-cyan'
                  : 'hover:bg-white/5 text-starlight/80'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${
                  selectedCategory === cat
                    ? 'bg-accent-cyan/20 border border-accent-cyan text-accent-cyan'
                    : 'hover:bg-white/5 text-starlight/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-starlight/70 font-mono">
        <span className="text-accent-cyan">[{filtered.length}]</span> results found
      </div>

      {/* Courses Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => {
            // Get real-time enrollment count from global state
            const enrollmentCount = stateManager.getCourseEnrollmentCount(course.id)
            return (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group glass p-6 rounded-xl border border-white/10 hover:border-accent-cyan/50 transition-all hover:shadow-glow-sm"
            >
              {/* Course Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className="text-xs font-mono text-starlight/60">{course.duration}h</span>
                </div>
                <h3 className="font-semibold text-lg group-hover:text-accent-cyan transition-colors line-clamp-2">
                  {course.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-starlight/70 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Meta Footer */}
              <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="text-starlight/80">{course.rating}</span>
                </div>
                <span className="text-starlight/60">{enrollmentCount || course.studentsEnrolled || 0} students</span>
                <span className="text-accent-cyan group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )})}
        </div>
      ) : (
        <div className="glass p-12 rounded-xl text-center border border-white/10">
          <p className="text-starlight/60 text-lg">
            No courses match your filters. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  )
}
