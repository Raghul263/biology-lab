'use client';

import React, { useEffect, useRef, useState } from 'react';

const CELLS = [
  { phase: 'Interphase', color: '#4ade80', emoji: '🔬' },
  { phase: 'Prophase', color: '#60a5fa', emoji: '🧬' },
  { phase: 'Metaphase', color: '#f472b6', emoji: '⚗️' },
  { phase: 'Anaphase', color: '#fb923c', emoji: '🔭' },
  { phase: 'Telophase', color: '#a78bfa', emoji: '🧪' },
];

function FloatingCell({ x, y, size, color, delay, duration }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color}44, ${color}11)`,
        border: `1px solid ${color}33`,
        animation: `floatCell ${duration}s ease-in-out ${delay}s infinite alternate`,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function LandingScreen({ onTour, onWorkout }) {
  const [hovered, setHovered] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const floatingCells = [
    { x: 5, y: 15, size: '120px', color: '#4ade80', delay: 0, duration: 6 },
    { x: 88, y: 8, size: '80px', color: '#60a5fa', delay: 1.5, duration: 7 },
    { x: 3, y: 70, size: '60px', color: '#f472b6', delay: 0.8, duration: 5.5 },
    { x: 92, y: 65, size: '100px', color: '#fb923c', delay: 2, duration: 8 },
    { x: 45, y: 88, size: '70px', color: '#a78bfa', delay: 1, duration: 6.5 },
    { x: 70, y: 75, size: '50px', color: '#4ade80', delay: 3, duration: 5 },
    { x: 20, y: 40, size: '40px', color: '#60a5fa', delay: 2.5, duration: 7.5 },
    { x: 78, y: 35, size: '55px', color: '#f472b6', delay: 0.5, duration: 6 },
  ];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #0d2b1a 0%, #050a0f 60%, #030608 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes floatCell {
          from { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          to { transform: translateY(-30px) rotate(15deg); opacity: 0.8; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes rotateOrbit {
          from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
        }
        @keyframes cellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes dnaHelix {
          0% { transform: scaleY(1) translateY(0); }
          25% { transform: scaleY(0.6) translateY(8px); }
          75% { transform: scaleY(0.6) translateY(-8px); }
          100% { transform: scaleY(1) translateY(0); }
        }
        .landing-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(0);
          cursor: pointer;
          border: none;
          outline: none;
        }
        .landing-btn:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .landing-btn:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>

      {/* Floating background cells */}
      {floatingCells.map((cell, i) => (
        <FloatingCell key={i} {...cell} />
      ))}

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Radial glow center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Orbiting dots */}
      {CELLS.map((cell, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '8px',
          height: '8px',
          marginTop: '-4px',
          marginLeft: '-4px',
          animation: `rotateOrbit ${8 + i * 2}s linear ${i * 1.2}s infinite`,
          transformOrigin: '0 0',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: cell.color,
            boxShadow: `0 0 8px ${cell.color}`,
          }} />
        </div>
      ))}

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        opacity: mounted ? 1 : 0,
        animation: mounted ? 'fadeSlideUp 0.8s ease-out forwards' : 'none',
      }}>

        {/* Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#4ade80',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          animation: 'fadeSlideUp 0.6s ease-out 0.1s both',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
          Virtual Biology Lab — Class XI Standard
        </div>

        {/* Title group */}
        <div style={{
          textAlign: 'center',
          animation: 'fadeSlideUp 0.7s ease-out 0.2s both',
        }}>
          {/* DNA emoji rotating */}
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            animation: 'cellPulse 3s ease-in-out infinite',
            display: 'inline-block',
            filter: 'drop-shadow(0 0 20px rgba(74,222,128,0.5))',
          }}>🧅</div>

          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #4ade80 40%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
          }}>
            Mitosis in Onion<br />Root Tip
          </h1>

          <p style={{
            margin: '12px 0 0 0',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.45)',
            fontWeight: 400,
            maxWidth: '420px',
            lineHeight: 1.6,
            letterSpacing: '0.2px',
          }}>
            Observe the stages of cell division — Prophase, Metaphase, Anaphase & Telophase — in a virtual 3D laboratory
          </p>
        </div>

        {/* Mitosis phase pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'fadeSlideUp 0.7s ease-out 0.3s both',
        }}>
          {CELLS.map((cell) => (
            <div key={cell.phase} style={{
              padding: '4px 12px',
              background: `${cell.color}15`,
              border: `1px solid ${cell.color}30`,
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 600,
              color: cell.color,
              letterSpacing: '0.5px',
            }}>
              {cell.phase}
            </div>
          ))}
        </div>

        {/* Button pair */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'fadeSlideUp 0.8s ease-out 0.4s both',
        }}>

          {/* Guided Tour Button */}
          <button
            className="landing-btn"
            onMouseEnter={() => setHovered('tour')}
            onMouseLeave={() => setHovered(null)}
            onClick={onTour}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              background: hovered === 'tour'
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #16a34a, #15803d)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              boxShadow: hovered === 'tour'
                ? '0 16px 40px rgba(34,197,94,0.45), 0 0 0 1px rgba(34,197,94,0.3)'
                : '0 8px 24px rgba(34,197,94,0.25), 0 0 0 1px rgba(34,197,94,0.2)',
              minWidth: '200px',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '20px' }}>▶️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>Guided Tour</div>
              <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.8 }}>Watch the experiment step-by-step</div>
            </div>
          </button>

          {/* Workout Button */}
          <button
            className="landing-btn"
            onMouseEnter={() => setHovered('workout')}
            onMouseLeave={() => setHovered(null)}
            onClick={onWorkout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              background: hovered === 'workout'
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.06)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              boxShadow: hovered === 'workout'
                ? '0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2)'
                : '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.12)',
              minWidth: '200px',
              justifyContent: 'center',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span style={{ fontSize: '20px' }}>🧪</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>Workout Lab</div>
              <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7 }}>Perform the experiment freely</div>
            </div>
          </button>
        </div>

        {/* Footer note */}
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.2)',
          margin: 0,
          animation: 'fadeSlideUp 0.8s ease-out 0.5s both',
        }}>
          🎓 CBSE / ICSE Biology Practical · Class XI
        </p>
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.5), rgba(34,211,238,0.5), transparent)',
      }} />
    </div>
  );
}
