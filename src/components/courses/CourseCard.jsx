import React from 'react'
import { Link } from 'react-router-dom'

export default function CourseCard({ course }){
  return (
    <Link
      to={`/course/${course.id}`}
      className="group glass rounded-xl overflow-hidden hover:shadow-glow-sm transition-all hover:border-accent-cyan/50 border border-white/10 flex flex-col h-full"
    >
      {/* Course Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-nebula-1 to-nebula-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-accent-cyan/90 text-deep-space text-xs font-semibold">
          {course.category}
        </div>
      </div>

      {/* Course Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-base mb-2 group-hover:text-accent-cyan transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-xs text-starlight/70 mb-4 line-clamp-2 flex-1">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-starlight/60 border-t border-white/10 pt-3">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{course.rating}</span>
          </div>
          <span>{course.duration}h</span>
          <span>{course.studentsEnrolled} students</span>
        </div>
      </div>
    </Link>
  )
}
