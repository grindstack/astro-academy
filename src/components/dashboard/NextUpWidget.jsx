import React from 'react'

export default function NextUpWidget({ tasks }){
  const [completed, setCompleted] = React.useState(new Set())

  const toggleTask = (i) => {
    const newCompleted = new Set(completed)
    if (newCompleted.has(i)) {
      newCompleted.delete(i)
    } else {
      newCompleted.add(i)
    }
    setCompleted(newCompleted)
  }

  return (
    <div className="glass p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Next Up</h2>
      <div className="space-y-3">
        {tasks && tasks.length > 0 ? (
          tasks.map((task, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-white/5 flex items-center gap-3 hover:bg-white/8 transition-colors"
            >
              <input
                type="checkbox"
                checked={completed.has(i)}
                onChange={() => toggleTask(i)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className={completed.has(i) ? 'line-through text-starlight/50' : ''}>
                {task}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-starlight/60">No tasks scheduled. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
