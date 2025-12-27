import React from 'react'

export default function Footer(){
  return (
    <footer className="border-t border-gray-800/40 glass mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-3">Astro Academy</h3>
            <p className="text-sm text-starlight/70">Interstellar learning for the next generation of space explorers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Courses</h4>
            <ul className="space-y-1 text-sm text-starlight/70">
              <li><a href="#" className="hover:text-accent-cyan">All Courses</a></li>
              <li><a href="#" className="hover:text-accent-cyan">Astronomy</a></li>
              <li><a href="#" className="hover:text-accent-cyan">Rocket Science</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-1 text-sm text-starlight/70">
              <li><a href="#" className="hover:text-accent-cyan">Blog</a></li>
              <li><a href="#" className="hover:text-accent-cyan">Docs</a></li>
              <li><a href="#" className="hover:text-accent-cyan">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-1 text-sm text-starlight/70">
              <li><a href="#" className="hover:text-accent-cyan">Privacy</a></li>
              <li><a href="#" className="hover:text-accent-cyan">Terms</a></li>
              <li><a href="#" className="hover:text-accent-cyan">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800/40 pt-6 text-center text-sm text-starlight/60">
          <p>© 2025 Astro Academy. Exploring the cosmos, one lesson at a time.</p>
        </div>
      </div>
    </footer>
  )
}
