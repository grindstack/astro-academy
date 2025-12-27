import React from 'react'

export default function StatCard({ label, value, icon }){
  return (
    <div className="glass p-6 rounded-lg text-center">
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className="text-2xl font-bold text-accent-cyan">{value}</p>
      <p className="text-sm text-starlight/70 mt-2">{label}</p>
    </div>
  )
}
