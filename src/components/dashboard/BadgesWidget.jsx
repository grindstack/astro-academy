import React from 'react'

export default function BadgesWidget({ badges }){
  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Badges Earned</h2>
      {badges && badges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div key={badge} className="text-center hover:transform hover:scale-105 transition-transform">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-nebula-1 to-nebula-2 flex items-center justify-center mb-2 shadow-glow-sm">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-xs text-starlight/70 capitalize">{badge.replace(/-/g, ' ')}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-starlight/60">No badges earned yet. Keep learning!</p>
        </div>
      )}
    </div>
  )
}
