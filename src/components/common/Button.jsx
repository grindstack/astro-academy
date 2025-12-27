import React from 'react'

export default function Button({ children, variant = 'primary', ...props }){
  const baseClass = "px-4 py-2 rounded-md font-medium transition-all"
  const variants = {
    primary: "btn-accent hover:brightness-110",
    secondary: "glass border border-gray-600 hover:border-gray-400",
    ghost: "hover:bg-white/5"
  }
  return <button className={`${baseClass} ${variants[variant]}`} {...props}>{children}</button>
}
