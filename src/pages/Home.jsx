import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut } from 'lucide-react'
import * as api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [openFAQ, setOpenFAQ] = useState(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const courses = await api.getFeaturedCourses()
        setFeaturedCourses(courses)
      } catch (err) {
        console.error('Failed to fetch featured courses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqData = [
    {
      question: "What courses does Astro Academy offer?",
      answer: "We offer courses in Astronomy, Rocket Science, Astrobiology, and Space Exploration. Each course is designed by industry experts and includes hands-on projects."
    },
    {
      question: "How long does it take to complete a course?",
      answer: "Course durations vary from 10 to 25 hours. You can learn at your own pace and access materials anytime, anywhere."
    },
    {
      question: "Do I get a certificate after completion?",
      answer: "Yes! Upon completing a course and passing the final assessment, you'll receive a verified certificate that you can share with employers."
    },
    {
      question: "Can I access courses on mobile devices?",
      answer: "Absolutely! Our platform is fully responsive and optimized for mobile, tablet, and desktop devices."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, you can access selected course previews for free. Sign up to explore sample lessons before committing."
    }
  ]

  const courseCategories = [
    {
      icon: "/icons/globe.png",
      title: "Earth & Space",
      description: "Explore our planet's relationship with the cosmos and understand orbital mechanics.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "/icons/meeting.png",
      title: "Space Missions",
      description: "Learn about historic and future space missions, from Apollo to Mars colonization.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "/icons/education.png",
      title: "Astrophysics",
      description: "Dive deep into the fundamental physics governing stars, galaxies, and the universe.",
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-5xl"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            <span className="gradient-text">Explore the Cosmos</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-starlight/80 mb-12 max-w-3xl mx-auto"
          >
            Embark on an extraordinary journey through space. Master aerospace, astronomy, and space technology with world-class instructors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {user ? (
              <button
                onClick={() => scrollToSection('about')}
                className="glow-button inline-block px-10 py-4 rounded-full bg-gradient-to-r from-accent-cyan to-purple-500 text-white font-semibold text-base hover:scale-105 transition-transform duration-300"
              >
                Get Started
              </button>
            ) : (
              <Link
                to="/login?signup=true"
                className="glow-button inline-block px-10 py-4 rounded-full bg-gradient-to-r from-accent-cyan to-purple-500 text-white font-semibold text-base hover:scale-105 transition-transform duration-300"
              >
                Get Started
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="text-accent-cyan w-8 h-8" />
        </motion.div>
      </section>

      {/* About Section - Floating Card */}
      <section id="about" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="floating-card glass-card rounded-3xl p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-purple-500/5 opacity-50"></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold mb-6 gradient-text"
                >
                  About Astro Academy
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-base md:text-lg text-starlight/80 mb-6 leading-relaxed"
                >
                  Astro Academy is built for curious minds who want to explore the mysteries of the universe. From planets and galaxies to deep-space phenomena like the Milky Way, learning here feels limitless.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-md text-starlight/70 leading-relaxed"
                >
                  We combine science, visuals, and imagination to inspire the next generation of space explorers.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative h-80 md:h-96 rounded-2xl overflow-hidden"
              >
                <img
                  src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80"
                  alt="Galaxy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-space/60 to-transparent"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Our Courses</h2>
            <p className="text-lg text-starlight/70">Discover the wonders of space and science</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courseCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="course-card glass-card rounded-2xl p-8 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500 flex justify-center">
                    <img src={category.icon} alt={category.title} className="w-16 h-16 object-contain opacity-80 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-accent-cyan transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-starlight/70 mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  <Link
                    to="/catalog"
                    className="inline-block px-6 py-3 rounded-full border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan hover:text-deep-space transition-all font-semibold"
                  >
                    Discover More →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actual Featured Courses */}
          {!loading && featuredCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-20"
            >
              <h3 className="text-3xl font-bold text-center mb-12 text-accent-cyan">Featured Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="glass-card rounded-xl p-6 hover:scale-105 transition-transform duration-300"
                  >
                    <h4 className="text-xl font-bold mb-2 text-white">{course.title}</h4>
                    <p className="text-starlight/70 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-sm text-starlight/60">
                      <span>⭐ {course.rating}</span>
                      <span>⏱ {course.duration}h</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">FAQ</h2>
            <p className="text-lg text-starlight/70">Frequently Asked Questions</p>
          </motion.div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-base font-semibold text-white">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-accent-cyan" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6 text-starlight/70 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card rounded-3xl p-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Ready to Launch Your Journey?</h2>
          <p className="text-lg text-starlight/70 mb-10">
            Join thousands of learners exploring the cosmos with expert guidance.
          </p>
          <Link
            to="/catalog"
            className="glow-button inline-block px-10 py-4 rounded-full bg-gradient-to-r from-accent-cyan to-purple-500 text-white font-semibold text-base hover:scale-105 transition-transform duration-300"
          >
            Start Learning Today
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
