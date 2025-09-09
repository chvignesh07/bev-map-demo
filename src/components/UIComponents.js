import React from 'react';

// AI Integration Points - Future enhancement
// TODO: Import AI routing predictions and user behavior analysis
// TODO: Add privacy controls for user data

// ETA Widget - displays estimated time of arrival
export const EtaWidget = ({ eta }) => {
  return (
    <div className="eta-widget carplay-widget">
      <div className="widget-icon">🕰️</div>
      <div className="widget-content">
        <div className="eta-time">{eta || '-- min'}</div>
        <div className="eta-label">ETA</div>
      </div>
    </div>
  );
};

// Lane Guidance Component - shows which lane to be in
export const LaneGuidance = ({ guidance }) => {
  return (
    <div className="lane-guidance carplay-widget">
      <div className="guidance-arrow">⬅️</div>
      <div className="guidance-text">
        {guidance || 'Stay in current lane'}
      </div>
    </div>
  );
};

// Compass Component - shows current bearing
export const Compass = ({ bearing }) => {
  const getDirection = (bearing) => {
    if (bearing >= 337.5 || bearing < 22.5) return 'N';
    if (bearing >= 22.5 && bearing < 67.5) return 'NE';
    if (bearing >= 67.5 && bearing < 112.5) return 'E';
    if (bearing >= 112.5 && bearing < 157.5) return 'SE';
    if (bearing >= 157.5 && bearing < 202.5) return 'S';
    if (bearing >= 202.5 && bearing < 247.5) return 'SW';
    if (bearing >= 247.5 && bearing < 292.5) return 'W';
    if (bearing >= 292.5 && bearing < 337.5) return 'NW';
    return 'N';
  };

  return (
    <div className="compass-widget carplay-widget">
      <div className="compass-ring">
        <div 
          className="compass-needle"
          style={{ transform: `rotate(${bearing}deg)` }}
        >
          ⬆️
        </div>
      </div>
      <div className="compass-direction">
        {getDirection(bearing)}
      </div>
    </div>
  );
};

// Speed Limit Component
export const SpeedLimit = ({ limit }) => {
  return (
    <div className="speed-limit carplay-widget">
      <div className="speed-limit-sign">
        <div className="speed-number">{limit || '--'}</div>
        <div className="speed-label">MPH</div>
      </div>
    </div>
  );
};

// Exit Information Component
export const ExitInfo = ({ info }) => {
  return (
    <div className="exit-info carplay-widget">
      <div className="exit-icon">🛣️</div>
      <div className="exit-text">
        {info || 'Continue straight'}
      </div>
    </div>
  );
};

// Vehicle Status Component - shows current vehicle state
export const VehicleStatus = ({ vehicle }) => {
  if (!vehicle) return null;

  return (
    <div className="vehicle-status carplay-widget">
      <div className="status-row">
        <span className="status-label">Speed:</span>
        <span className="status-value">{vehicle.speed} mph</span>
      </div>
      <div className="status-row">
        <span className="status-label">Mode:</span>
        <span className="status-value">
          {vehicle.type === 'ego' ? 'Autonomous' : 'Manual'}
        </span>
      </div>
      {vehicle.turnSignal && (
        <div className="status-row">
          <span className="status-label">Signal:</span>
          <span className="status-value">
            {vehicle.turnSignal === 'left' ? '⬅️ Left' : '➡️ Right'}
          </span>
        </div>
      )}
    </div>
  );
};

// AI Integration Component - Future enhancement placeholder
export const AIStatusIndicator = ({ aiStatus }) => {
  // TODO: Connect to AI decision engine status
  const status = aiStatus || 'active';
  
  return (
    <div className="ai-status carplay-widget">
      <div className={`ai-indicator ${status}`}>
        <div className="ai-icon">🤖</div>
        <div className="ai-label">AI: {status.toUpperCase()}</div>
      </div>
    </div>
  );
};

// Privacy Status Component - Shows data protection status
export const PrivacyIndicator = ({ privacyLevel }) => {
  // TODO: Connect to privacy filter settings
  const level = privacyLevel || 'protected';
  
  const getPrivacyIcon = (level) => {
    switch(level) {
      case 'protected': return '🔒';
      case 'anonymous': return '📝';
      case 'minimal': return '🔓';
      default: return '🔒';
    }
  };

  return (
    <div className="privacy-indicator carplay-widget">
      <div className={`privacy-status ${level}`}>
        <span className="privacy-icon">{getPrivacyIcon(level)}</span>
        <span className="privacy-label">{level.toUpperCase()}</span>
      </div>
    </div>
  );
};

// Combined CarPlay UI Overlay - Main container for all widgets
export const CarPlayUI = ({ 
  eta, 
  laneGuidance, 
  bearing, 
  speedLimit, 
  exitInfo, 
  vehicle,
  aiStatus,
  privacyLevel 
}) => {
  return (
    <div className="carplay-ui">
      {/* Top Row */}
      <div className="ui-top">
        <EtaWidget eta={eta} />
        <ExitInfo info={exitInfo} />
        <AIStatusIndicator aiStatus={aiStatus} />
      </div>
      
      {/* Left Side */}
      <div className="ui-left">
        <LaneGuidance guidance={laneGuidance} />
      </div>
      
      {/* Right Side */}
      <div className="ui-right">
        <Compass bearing={bearing} />
        <SpeedLimit limit={speedLimit} />
        <PrivacyIndicator privacyLevel={privacyLevel} />
      </div>
      
      {/* Bottom Row */}
      <div className="ui-bottom">
        <VehicleStatus vehicle={vehicle} />
      </div>
    </div>
  );
};

// Export all components as default
export default {
  EtaWidget,
  LaneGuidance,
  Compass,
  SpeedLimit,
  ExitInfo,
  VehicleStatus,
  AIStatusIndicator,
  PrivacyIndicator,
  CarPlayUI
};
