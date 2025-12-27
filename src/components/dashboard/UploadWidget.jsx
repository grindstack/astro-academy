import React from 'react'

export default function UploadWidget(){
  const [dragActive, setDragActive] = React.useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file drop logic here
  }

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Upload New Content</h2>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-accent-cyan bg-accent-cyan/5'
            : 'border-accent-cyan/40 hover:border-accent-cyan/60'
        }`}
      >
        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
        <p className="text-starlight/70">Drag & drop course files here, or click to select</p>
        <button className="mt-4 px-6 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/20 transition-colors">
          Choose Files
        </button>
      </div>
    </div>
  )
}
