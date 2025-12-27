import React from 'react'

export default function ProgressBar({ percent = 0, label = "" }){
  return (
    <div>
      {label && <p className="text-sm mb-1">{label}</p>}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-cyan to-nebula-2" style={{width: `${percent}%`}}/>
      </div>
      <p className="text-xs text-starlight/60 mt-1">{percent}%</p>
    </div>
  )
}
