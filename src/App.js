import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import './App.css';

// AI/Privacy module integration point - Future enhancement
// TODO: Import AI decision engine and privacy filters here

function App() {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Load default scenario on mount
  useEffect(() => {
    loadDefaultScenario();
  }, []);

  const loadDefaultScenario = async () => {
    try {
      // In a real app, this would fetch from an API
      const response = await fetch('/scenario.json');
      const scenario = await response.json();
      setCurrentScenario(scenario);
    } catch (error) {
      console.error('Failed to load scenario:', error);
      // Fallback to demo data
      setCurrentScenario({
        name: "Highway Merge Demo",
        duration: 30000,
        vehicles: [
          {
            id: 'ego',
            type: 'ego',
            position: [-122.4194, 37.7749],
            heading: 45,
            speed: 65,
            turnSignal: 'left'
          },
          {
            id: 'lead',
            type: 'other',
            position: [-122.4184, 37.7759],
            heading: 45,
            speed: 70,
            turnSignal: null
          }
        ],
        route: {
          eta: "12 min",
          nextTurn: "Exit 24B - Financial District",
          laneGuidance: "Keep left for exit",
          speedLimit: 65
        },
        fieldOfView: {
          front: {
            angle: 120,
            distance: 150
          },
          rear: {
            angle: 90,
            distance: 50
          }
        }
      });
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetScenario = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  // AI Integration Point - Future enhancement
  // const processAIDecisions = (sensorData) => {
  //   // AI decision engine would process sensor data here
  //   // Privacy filters would redact sensitive information
  //   return filteredDecisions;
  // };

  return (
    <div className="App">
      <div className="demo-controls">
        <h1>BEV Map Demo</h1>
        <div className="playback-controls">
          <button onClick={togglePlayback}>
            {isPlaying ? 'Pause' : 'Play'} Scenario
          </button>
          <button onClick={resetScenario}>Reset</button>
          <span className="scenario-name">
            {currentScenario?.name || 'Loading...'}
          </span>
        </div>
      </div>
      
      {currentScenario && (
        <MapView 
          scenario={currentScenario}
          isPlaying={isPlaying}
          playbackTime={playbackTime}
          onTimeUpdate={setPlaybackTime}
        />
      )}
      
      <div className="tech-info">
        <p>Built with React + Mapbox GL JS | Ready for AI/Privacy modules</p>
        <p>🚗 Autonomous Vehicle Navigation Demo</p>
      </div>
    </div>
  );
}

export default App;
