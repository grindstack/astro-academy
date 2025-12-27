import React from 'react'

export default function ProgressWidget({ courses }){
  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
      {courses && courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map(course => (
            <div key={course.id} className="border-b border-gray-800/40 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{course.title || `Course ${course.id}`}</h3>
                <span className="text-sm text-accent-cyan">{course.percent || 0}%</span>
              </div>
              <div className="w-full bg-gray-800/40 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-accent-cyan to-nebula-2 h-2 rounded-full"
                  style={{ width: `${course.percent || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-starlight/60">No courses enrolled yet.</p>
        </div>
      )}
    </div>
  )
}
