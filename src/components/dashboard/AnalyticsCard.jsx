import React from 'react'

export default function AnalyticsCard({ metrics }){
  return (
    <div className="glass p-6 rounded-xl">
      <h3 className="font-semibold mb-4">Student Engagement</h3>
      <div className="space-y-4">
        {metrics && metrics.map((metric, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span>{metric.label}</span>
              <span className="text-accent-cyan">{metric.value}%</span>
            </div>
            <div className="w-full bg-gray-800/40 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent-cyan to-nebula-2 h-2 rounded-full"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
