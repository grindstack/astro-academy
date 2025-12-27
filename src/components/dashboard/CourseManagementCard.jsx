import React from 'react'

export default function CourseManagementCard({ courses, onEdit }){
  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Your Courses</h2>
      {courses && courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map(courseId => (
            <div
              key={courseId}
              className="p-4 rounded-lg bg-white/5 flex items-center justify-between hover:bg-white/8 transition-colors"
            >
              <div>
                <p className="font-semibold">Course {courseId}</p>
                <p className="text-sm text-starlight/70">4.7★ • 1200+ students</p>
              </div>
              <button
                onClick={() => onEdit && onEdit(courseId)}
                className="px-4 py-2 rounded-lg text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/10 transition-colors"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-starlight/60">No courses created yet.</p>
        </div>
      )}
    </div>
  )
}
