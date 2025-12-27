import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import CourseCatalog from './pages/CourseCatalog'
import CourseDetails from './pages/CourseDetails'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import { AuthProvider, ProtectedRoute } from './context/AuthContext'

export default function App(){
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes without Layout (auth pages) */}
        <Route path="/login" element={<Login/>} />

        {/* All other routes use the main Layout */}
        <Route path="/*" element={<Layout>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/catalog" element={<CourseCatalog/>} />
            <Route path="/course/:id" element={<CourseDetails/>} />
            {/* Unified dashboard with role-based guard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            {/* Legacy routes redirect to unified dashboard */}
            <Route path="/student-dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            <Route path="/instructor-dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          </Routes>
        </Layout>} />
      </Routes>
    </AuthProvider>
  )
}
