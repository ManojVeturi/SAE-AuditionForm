import React from 'react';
import './SplashScreen.css';

export default function SplashScreen({ finishLoading }) {
  return (
    <div className={`splash-screen ${finishLoading ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <h1 className="splash-title font-display">
          <span className="text-white">SAE</span> <span className="text-primary">AUDITION</span> <span className="text-white">2026</span> 
        </h1>
      </div>
      
      <div className="speed-lines">
        <div className="line line-1"></div>
        <div className="line line-2"></div>
        <div className="line line-3"></div>
      </div>

      {/* The racing car wrapper */}
      <div className={`racing-car-wrapper ${finishLoading ? 'zoom-off' : 'drive-in'}`}>
        <svg viewBox="0 0 120 40" width="160" height="50" xmlns="http://www.w3.org/2000/svg" className="racing-car-svg">
          {/* Rear Wing */}
          <rect x="5" y="10" width="10" height="15" fill="#E50914" />
          <rect x="10" y="5" width="12" height="5" fill="#E50914" />
          
          {/* Main Body */}
          <path d="M15,25 L25,18 L60,18 L80,22 L105,25 L115,28 L115,30 L15,30 Z" fill="#E50914" />
          
          {/* Front Wing */}
          <path d="M100,28 L118,28 L118,32 L100,32 Z" fill="#222" />
          
          {/* Driver Cockpit */}
          <path d="M45,18 L55,13 L65,18 Z" fill="#111" />
          <circle cx="55" cy="14" r="5" fill="#fff" />
          
          {/* Wheels */}
          <circle cx="30" cy="28" r="9" fill="#111" stroke="#444" strokeWidth="2.5"/>
          <circle cx="90" cy="28" r="9" fill="#111" stroke="#444" strokeWidth="2.5"/>
          
          {/* Wheel Rims */}
          <circle cx="30" cy="28" r="4" fill="#fff"/>
          <circle cx="90" cy="28" r="4" fill="#fff"/>
          
          {/* Neon Underglow Line (Theme) */}
          <path d="M25,32 L95,32" stroke="#ff3333" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      </div>

      <div className="track">
        <div className={`track-progress ${finishLoading ? 'track-complete' : ''}`}></div>
      </div>
    </div>
  );
}
