import React from 'react'

export default function SkeletonLoader({ count = 3 }){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="h-48 bg-gradient-to-br from-white/5 to-white/0" />
          
          {/* Content skeleton */}
          <div className="p-5 space-y-3">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-full" />
            <div className="h-3 bg-white/10 rounded w-5/6" />
            
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="h-3 bg-white/10 rounded w-1/4" />
              <div className="h-3 bg-white/10 rounded w-1/4" />
              <div className="h-3 bg-white/10 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
