import React from 'react'

export default function ProgressCard({ courseId, percentage }){
  return (
    <div className="border-b border-gray-800/40 pb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Course {courseId}</h3>
        <span className="text-sm text-accent-cyan">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-800/40 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-accent-cyan to-nebula-2 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
