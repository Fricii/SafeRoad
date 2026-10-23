import { useState } from 'react'
import './App.css'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

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

      {/* Main Layout Area */}
      <div className="simulator-main">
        {/* Road Simulation Area */}
        <div className="road-area">
          <div className="road">
            <div className="road-edge top-edge"></div>
            <div className="lane lane-top">
              <div className="car car-v1" style={{ transform: 'translateX(120px)' }} title="V01 (60 km/h)">
                <div className="car-body">
                  <div className="car-roof"></div>
                  <div className="headlights"></div>
                </div>
                <span className="car-label">V01</span>
              </div>
            </div>
            <div className="centerline"></div>
            <div className="lane lane-bottom">
              <div className="car car-v2" style={{ transform: 'translateX(580px)' }} title="V02 (40 km/h)">
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
