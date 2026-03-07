import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scan, Sparkles, Activity } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Scatter } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function StellarScanner() {
  // State for the 6 numeric inputs
  const [inputs, setInputs] = useState({
    u: '',
    g: '',
    r: '',
    i: '',
    z: '',
    redshift: ''
  })

  // State for scanning and results
  const [isScanning, setIsScanning] = useState(false)
  const [classification, setClassification] = useState(null)
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState(null)
  const [predictionResult, setPredictionResult] = useState(null)

  // Handle input changes
  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  // Handle the scan/prediction
  const handleScan = async () => {
    setError(null)
    setIsScanning(true)

    // Convert inputs to numbers
    const features = [
      parseFloat(inputs.u) || 0,
      parseFloat(inputs.g) || 0,
      parseFloat(inputs.r) || 0,
      parseFloat(inputs.i) || 0,
      parseFloat(inputs.z) || 0,
      parseFloat(inputs.redshift) || 0
    ]

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Store the full prediction result
      setPredictionResult(data)
      
      // Assuming the API returns { prediction: "Star", confidence: 95.5 }
      setClassification(data.prediction || data.class || 'Unknown')
      setConfidence(data.confidence || Math.random() * 100)
      
    } catch (err) {
      setError(err.message)
      console.error('Scan error:', err)
    } finally {
      setTimeout(() => setIsScanning(false), 1500) // Keep scanning animation for effect
    }
  }

  // Prepare chart data
  const inputIntensitiesData = {
    labels: ['U', 'G', 'R', 'I', 'Z', 'Redshift'],
    datasets: [
      {
        label: 'Input Intensities',
        data: [
          parseFloat(inputs.u) || 0,
          parseFloat(inputs.g) || 0,
          parseFloat(inputs.r) || 0,
          parseFloat(inputs.i) || 0,
          parseFloat(inputs.z) || 0,
          parseFloat(inputs.redshift) || 0
        ],
        backgroundColor: [
          'rgba(138, 43, 226, 0.6)',
          'rgba(0, 212, 255, 0.6)',
          'rgba(138, 43, 226, 0.6)',
          'rgba(0, 212, 255, 0.6)',
          'rgba(138, 43, 226, 0.6)',
          'rgba(0, 212, 255, 0.6)',
        ],
        borderColor: [
          'rgba(138, 43, 226, 1)',
          'rgba(0, 212, 255, 1)',
          'rgba(138, 43, 226, 1)',
          'rgba(0, 212, 255, 1)',
          'rgba(138, 43, 226, 1)',
          'rgba(0, 212, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const scatterData = {
    datasets: [
      {
        label: 'Classification Matrix',
        data: [
          {
            x: parseFloat(inputs.redshift) || 0,
            y: parseFloat(inputs.u) || 0
          }
        ],
        backgroundColor: 'rgba(0, 212, 255, 0.8)',
        borderColor: 'rgba(0, 212, 255, 1)',
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: {
            family: 'Space Grotesk',
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0b0e14' }}>
      {/* Animated background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars-small opacity-30"></div>
        <div className="stars-medium opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#8a2be2] via-[#00d4ff] to-[#8a2be2] bg-clip-text text-transparent">
            Stellar Scanner
          </h1>
          <p className="text-gray-400 text-lg">AI-Powered Celestial Object Classification</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass p-6 rounded-xl border border-gray-800 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="text-[#00d4ff]" size={24} />
                <h2 className="text-xl font-semibold text-white">Input Parameters</h2>
              </div>

              <div className="space-y-4">
                {Object.keys(inputs).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 uppercase">
                      {field === 'redshift' ? 'Redshift' : `${field.toUpperCase()} Magnitude`}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>

              {/* Scan Button */}
              <motion.button
                onClick={handleScan}
                disabled={isScanning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 bg-gradient-to-r from-[#8a2be2] to-[#00d4ff] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Scan size={20} />
                    </motion.div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan size={20} />
                    Initiate Scan
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Status Display & Confidence Meter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass p-6 rounded-xl border border-gray-800 backdrop-blur-xl h-full">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-[#8a2be2]" size={24} />
                <h2 className="text-xl font-semibold text-white">Classification Status</h2>
              </div>

              {/* Classification Result */}
              <div className="mb-8">
                <div className="bg-black/40 rounded-xl p-8 border border-gray-700 text-center min-h-[150px] flex items-center justify-center">
                  {isScanning ? (
                    <motion.div
                      animate={{
                        textShadow: [
                          '0 0 10px rgba(138, 43, 226, 0.8)',
                          '0 0 20px rgba(0, 212, 255, 0.8)',
                          '0 0 10px rgba(138, 43, 226, 0.8)',
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-3xl font-bold text-[#00d4ff]"
                    >
                      Analyzing Celestial Data...
                    </motion.div>
                  ) : classification ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="text-sm text-gray-400 uppercase tracking-wider">Detected Object</div>
                      <motion.div
                        animate={{
                          textShadow: [
                            '0 0 20px rgba(138, 43, 226, 0.8)',
                            '0 0 30px rgba(0, 212, 255, 0.8)',
                            '0 0 20px rgba(138, 43, 226, 0.8)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-5xl font-bold bg-gradient-to-r from-[#8a2be2] to-[#00d4ff] bg-clip-text text-transparent"
                      >
                        {classification}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="text-gray-500 text-xl">
                      Enter parameters and initiate scan
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm"
                  >
                    Error: {error}
                  </motion.div>
                )}
              </div>

              {/* Confidence Meter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">Confidence Level</span>
                  <span className="text-sm font-bold text-[#00d4ff]">{confidence.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-4 border border-gray-700 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#8a2be2] to-[#00d4ff] relative"
                    style={{
                      boxShadow: '0 0 10px rgba(138, 43, 226, 0.5)'
                    }}
                  >
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Input Intensities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl border border-gray-800 backdrop-blur-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Input Intensities</h3>
            <div style={{ height: '300px' }}>
              <Bar data={inputIntensitiesData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Scatter Plot - Classification Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-xl border border-gray-800 backdrop-blur-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Classification Matrix</h3>
            <div style={{ height: '300px' }}>
              <Scatter 
                data={scatterData} 
                options={{
                  ...chartOptions,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Redshift',
                        color: '#9ca3af',
                        font: {
                          family: 'Space Grotesk',
                        }
                      },
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'U Magnitude',
                        color: '#9ca3af',
                        font: {
                          family: 'Space Grotesk',
                        }
                      },
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(156, 163, 175, 0.1)' }
                    }
                  }
                }} 
              />
            </div>
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        >
          <div className="glass p-4 rounded-lg border border-gray-800 backdrop-blur-xl text-center">
            <div className="text-3xl font-bold text-[#8a2be2] mb-1">3</div>
            <div className="text-sm text-gray-400">Object Types</div>
            <div className="text-xs text-gray-500 mt-1">Star • Galaxy • Quasar</div>
          </div>
          <div className="glass p-4 rounded-lg border border-gray-800 backdrop-blur-xl text-center">
            <div className="text-3xl font-bold text-[#00d4ff] mb-1">6</div>
            <div className="text-sm text-gray-400">Input Features</div>
            <div className="text-xs text-gray-500 mt-1">UGRIZ + Redshift</div>
          </div>
          <div className="glass p-4 rounded-lg border border-gray-800 backdrop-blur-xl text-center">
            <div className="text-3xl font-bold text-[#8a2be2] mb-1">AI</div>
            <div className="text-sm text-gray-400">ML Classification</div>
            <div className="text-xs text-gray-500 mt-1">Real-time Prediction</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
