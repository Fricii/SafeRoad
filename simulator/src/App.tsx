import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  // Initial positions in pixels relative to road start
  const INITIAL_POS_V1 = 80
  const INITIAL_POS_V2 = 680

  const [posV1, setPosV1] = useState(INITIAL_POS_V1)
  const [posV2, setPosV2] = useState(INITIAL_POS_V2)

  const roadWidthRef = useRef<HTMLDivElement>(null)

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setPosV1(INITIAL_POS_V1)
    setPosV2(INITIAL_POS_V2)
  }

  // Animation loop using requestAnimationFrame for smooth speed-based movement
  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning || isPaused) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      lastTimeRef.current = null
      return
    }

    const roadEl = roadWidthRef.current
    const roadWidth = roadEl ? roadEl.clientWidth - 80 : 800 // default max travel

    const updateAnimation = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const deltaTime = (time - lastTimeRef.current) / 1000 // seconds
      lastTimeRef.current = time

      // Speeds: V01 = 60 km/h, V02 = 40 km/h
      const scale = 40 // pixels per second for 40 km/h unit
      const speedV1 = 60 * (scale / 40) // 60 px/sec
      const speedV2 = 40 * (scale / 40) // 40 px/sec

      setPosV1((prev) => {
        const next = prev + speedV1 * deltaTime
        if (next >= roadWidth) {
          setIsRunning(false)
          return roadWidth
        }
        return next
      })

      setPosV2((prev) => {
        const next = prev - speedV2 * deltaTime
        const minPos = 40
        if (next <= minPos) {
          setIsRunning(false)
          return minPos
        }
        return next
      })

      if (isRunning && !isPaused) {
        animRef.current = requestAnimationFrame(updateAnimation)
      }
    }

    animRef.current = requestAnimationFrame(updateAnimation)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isRunning, isPaused])

  // TTC Calculation
  const scale = 40
  const speedV1Px = 60 * (scale / 40)
  const speedV2Px = 40 * (scale / 40)
  const closingSpeedPx = speedV1Px + speedV2Px

  const distancePx = Math.max(0, posV2 - posV1)
  const ttc = closingSpeedPx > 0 ? distancePx / closingSpeedPx : null

  let riskLevel = 'CLEAR'
  if (ttc !== null) {
    if (ttc <= 2.0) {
      riskLevel = 'CRITICAL'
    } else if (ttc <= 5.0) {
      riskLevel = 'WARNING'
    } else {
      riskLevel = 'CLEAR'
    }
  }

  // Warning banner text & styling mapping
  let warningMessage = 'No immediate collision threat detected.'
  if (riskLevel === 'CRITICAL') {
    warningMessage = 'DANGER — Imminent collision risk!'
  } else if (riskLevel === 'WARNING') {
    warningMessage = 'CAUTION — Potential collision detected.'
  }

  const simStatus = isRunning && !isPaused ? 'RUNNING' : isPaused ? 'PAUSED' : 'STOPPED'

  return (
    <div className="simulator-container">
      {/* Header */}
      <header className="simulator-header">
        <div className="header-titles">
          <h1>SafeRoad</h1>
          <p>Vehicle-to-Vehicle Safety Simulator</p>
        </div>
        <div className="header-controls">
          <button className="control-btn start-btn" onClick={handleStart}>Start</button>
          <button className="control-btn pause-btn" onClick={handlePause}>Pause</button>
          <button className="control-btn reset-btn" onClick={handleReset}>Reset</button>
        </div>
      </header>

      {/* Visible Driver Warning Banner */}
      <div className={`warning-banner banner-${riskLevel.toLowerCase()}`}>
        <span className="banner-icon">
          {riskLevel === 'CRITICAL' ? '🚨' : riskLevel === 'WARNING' ? '⚠️' : '✅'}
        </span>
        <span className="banner-text">{warningMessage}</span>
      </div>

      {/* Main Layout Area */}
      <div className="simulator-main">
        {/* Road Simulation Area */}
        <div className="road-area">
          <div className="road" ref={roadWidthRef}>
            <div className="road-edge top-edge"></div>
            <div className="lane lane-top">
              <div className="car car-v1" style={{ transform: `translateX(${posV1}px)` }} title="V01 (60 km/h)">
                <div className="car-body">
                  <div className="car-roof"></div>
                  <div className="headlights"></div>
                </div>
                <span className="car-label">V01</span>
              </div>
            </div>
            <div className="centerline"></div>
            <div className="lane lane-bottom">
              <div className="car car-v2" style={{ transform: `translateX(${posV2}px)` }} title="V02 (40 km/h)">
                <div className="car-body">
                  <div className="car-roof"></div>
                  <div className="headlights"></div>
                </div>
                <span className="car-label">V02</span>
              </div>
            </div>
            <div className="road-edge bottom-edge"></div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="sidebar">
          <h2>System Status</h2>
          <ul className="status-list">
            <li>
              <span className="status-label">Vehicles:</span>
              <span className="status-value">2</span>
            </li>
            <li>
              <span className="status-label">GPS:</span>
              <span className="status-value active">ON</span>
            </li>
            <li>
              <span className="status-label">V2V:</span>
              <span className="status-value inactive">OFF</span>
            </li>
            <li className="risk-li">
              <span className="status-label">Collision Risk:</span>
              <span className={`status-value risk-${riskLevel.toLowerCase()}`}>{riskLevel}</span>
            </li>
            <li>
              <span className="status-label">TTC:</span>
              <span className="status-value">{ttc !== null ? `${ttc.toFixed(1)}s` : 'N/A'}</span>
            </li>
          </ul>
        </aside>
      </div>

      {/* Footer */}
      <footer className="simulator-footer">
        <div className="footer-item">
          <span className="footer-label">Simulation:</span>
          <span className={`footer-val ${simStatus.toLowerCase()}`}>{simStatus}</span>
        </div>
        <div className="footer-item">
          <span className="footer-label">V01:</span>
          <span className="footer-val">60 km/h</span>
        </div>
        <div className="footer-item">
          <span className="footer-label">V02:</span>
          <span className="footer-val">40 km/h</span>
        </div>
      </footer>
    </div>
  )
}

export default App
