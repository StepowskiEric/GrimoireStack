/* eslint-disable react/no-array-index-key -- decorative procedural arrays; index is stable for the lifetime of the mount */

import { useRef, useEffect, useState } from 'react';
import SchoolSigil from './SchoolSigil.tsx';

export default function GrimoireEye({ searchQuery, onSearchChange, totalMatches, featuredSchools, onSchoolSelect, isSearching, eyeRadius = 220 }) {
  const containerRef = useRef(null);
  const pupilRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [blinkPhase, setBlinkPhase] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  
  // Progressive enhancement: detect reduced motion and performance capabilities
  const [enhancedMode, setEnhancedMode] = useState(true);
  
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Simple performance check: if device is likely low-end, disable some effects
    const isLowEnd = typeof navigator !== 'undefined' && 
      navigator.hardwareConcurrency && 
      navigator.hardwareConcurrency <= 2;
    const isMobile = typeof navigator !== 'undefined' && 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Enable enhanced mode only if conditions are favorable
    setEnhancedMode(!prefersReducedMotion && !isLowEnd && !(isMobile && window.innerWidth < 768));
  }, []);

  // Track mouse for eye tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 0.4;
      const clampedDist = Math.min(dist, maxDist) / maxDist;
      const angle = Math.atan2(dy, dx);
      setMousePos({
        x: Math.cos(angle) * clampedDist * 0.3 + 0.5,
        y: Math.sin(angle) * clampedDist * 0.3 + 0.5,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Breathing/pulsing animation - simplified for performance when needed
  useEffect(() => {
    let raf;
    const animate = () => {
      // Use simpler timing for reduced motion or low-end devices
      const time = enhancedMode ? Date.now() / 2000 : Date.now() / 4000;
      setBreathPhase(time);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [enhancedMode]);

  // Random blinking
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 5000;
      const blinkDuration = 150 + Math.random() * 200;
      setTimeout(() => {
        setBlinkPhase(1);
        setTimeout(() => setBlinkPhase(0), blinkDuration);
        scheduleBlink();
      }, delay);
    };
    const id = setTimeout(scheduleBlink, 2000);
    return () => clearTimeout(id);
  }, []);

  // Background eye blink data - more varied and unsettling
  const bgEyes = useRef(
    Array.from({ length: 40 }, (_, _i) => ({
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 0.8 + Math.random() * 3, // More size variety
      delay: Math.random() * 10,
      speed: 1.5 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      // Add variety: some eyes are larger, some have tears, some are bruised
      type: Math.random() < 0.3 ? 'large' : Math.random() < 0.2 ? 'tearful' : Math.random() < 0.25 ? 'bruised' : 'normal',
      tearChance: Math.random() < 0.15, // 15% chance of occasional tears
      color: Math.random() < 0.4 ? '#7a3a5a' : Math.random() < 0.3 ? '#8a9a6a' : Math.random() < 0.2 ? '#6a2a4a' : '#5a6a40',
    }))
  ).current;

  // Simplified calculations for reduced motion/low-end devices
  const breathScale = enhancedMode 
    ? 1 + Math.sin(breathPhase * Math.PI * 2) * 0.02 
    : 1;
  const irisOffsetX = enhancedMode ? (mousePos.x - 0.5) * 18 : 0;
  const irisOffsetY = enhancedMode ? (mousePos.y - 0.5) * 12 : 0;
  const pupilOffsetX = enhancedMode ? (mousePos.x - 0.5) * 28 : 0;
  const pupilOffsetY = enhancedMode ? (mousePos.y - 0.5) * 20 : 0;

  return (
    <div ref={containerRef} className="grimoire-eye-wrapper">
      {/* Background blinking eyes - varied and unsettling */}
      <svg className="bg-eyes-canvas" viewBox="0 0 100 100" preserveAspectRatio="none">
        {bgEyes.map((eye, i) => {
          const blink = Math.sin(breathPhase * eye.speed + eye.phase) > 0.92 ? 0.05 : 1;
          const opacity = 0.12 + Math.sin(breathPhase * 0.3 + eye.phase) * 0.08;
          
          // Simplified version for reduced motion/low-end devices
          if (!enhancedMode) {
            return (
              <g key={i}>
                <ellipse
                  cx={eye.x}
                  cy={eye.y}
                  rx={eye.size / 2}
                  ry={(eye.size / 2) * blink}
                  fill="#8a9a6a"
                  opacity={opacity}
                />
                {blink > 0.3 && (
                  <circle
                    cx={eye.x}
                    cy={eye.y}
                    r={eye.size * 0.15}
                    fill="#020203"
                    opacity={opacity}
                  />
                )}
              </g>
            );
          }
          
          // Enhanced version with variety
          const isLarge = eye.type === 'large';
          const isBruised = eye.type === 'bruised';
          
          // Size variation
          const baseSize = isLarge ? eye.size * 1.5 : eye.size;
          
          // Color variation
          const eyeColor = isBruised ? '#6a2a4a' : eye.color;
          
          return (
            <g key={i}>
              {/* Main eye */}
              <ellipse
                cx={eye.x}
                cy={eye.y}
                rx={baseSize / 2}
                ry={(baseSize / 2) * blink}
                fill={eyeColor}
                opacity={opacity}
                filter={isLarge ? 'url(#wet)' : undefined}
              />
              {blink > 0.3 && (
                <circle
                  cx={eye.x + (Math.sin(breathPhase + eye.phase) * baseSize * 0.1)}
                  cy={eye.y}
                  r={baseSize * 0.15}
                  fill="#020203"
                  opacity={opacity}
                />
              )}
              
              {/* Occasional tear for some eyes */}
              {eye.tearChance && blink > 0.3 && (
                <path
                  d={`M ${eye.x},${eye.y + baseSize * 0.4} 
                      Q ${eye.x + 1},${eye.y + baseSize * 0.4 + 3} ${eye.x},${eye.y + baseSize * 0.4 + 6}
                      Q ${eye.x - 1},${eye.y + baseSize * 0.4 + 3} ${eye.x},${eye.y + baseSize * 0.4} Z`}
                  fill={`rgba(138,154,106,${opacity * 0.3})`}
                  style={{
                    animation: `tearFall 4s ease-in infinite`,
                    animationDelay: `${eye.delay}s`
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* The Great Eye */}
      <div className="great-eye-container" style={{ transform: `scale(${breathScale})` }}>
        <svg
          viewBox="0 0 400 280"
          className="great-eye-svg"
          style={{
            filter: `drop-shadow(0 0 ${40 + Math.sin(breathPhase * Math.PI * 3) * 15}px rgba(138,154,106,0.15))
                     drop-shadow(0 0 ${80 + Math.sin(breathPhase * Math.PI * 2) * 20}px rgba(138,154,106,0.08))`,
          }}
        >
          <defs>
            {/* Organic wet texture - subtle */}
            <filter id="wet" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="13" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" result="displaced" />
              <feGaussianBlur in="displaced" stdDeviation="0.3" result="blurred" />
              <feSpecularLighting in="blurred" surfaceScale="3" specularConstant="0.8" specularExponent="30" lightingColor="#8a9a6a" result="spec">
                <fePointLight x="200" y="100" z="60" />
              </feSpecularLighting>
              <feComposite in="spec" in2="blurred" operator="in" result="specComp" />
              <feBlend in="blurred" in2="specComp" mode="screen" />
            </filter>

            {/* Vein texture - more visible, pulsating */}
            <filter id="veins" x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="4" seed="7" result="turb" />
              <feColorMatrix in="turb" type="matrix"
                values="0 0 0 0 0.8   0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.4 0"
                result="colored" />
              <feGaussianBlur in="colored" stdDeviation="1.2" result="veinBlur" />
              <feComposite in="veinBlur" in2="SourceGraphic" operator="atop" />
            </filter>
            
            {/* Blood vessel pulse filter */}
            <filter id="bloodPulse" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="13" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
            </filter>

            {/* Pupil glow */}
            <radialGradient id="pupilGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#1a2a30" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#060a0f" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#020203" stopOpacity="1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </radialGradient>

            {/* Iris gradient */}
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8a9a6a" stopOpacity="0.25" />
              <stop offset="30%" stopColor="#0a5a3a" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#4a1a3a" stopOpacity="0.15" />
              <stop offset="85%" stopColor="#1a2530" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0a0c14" stopOpacity="0.6" />
            </radialGradient>

            {/* Sclera gradient */}
            <radialGradient id="scleraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#141a24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0d1018" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#06070a" stopOpacity="0.98" />
            </radialGradient>

            {/* Glowing ring */}
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a9a6a" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#4a1a3a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#8a9a6a" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Outer glow rings */}
          <ellipse cx="200" cy="140" rx="220" ry="140"
            fill="none" stroke="url(#ringGrad)" strokeWidth="0.5" opacity="0.3"
            style={{ animation: 'ringRotate1 20s linear infinite' }} />
          <ellipse cx="200" cy="140" rx="205" ry="130"
            fill="none" stroke="url(#ringGrad)" strokeWidth="0.8" opacity="0.2"
            style={{ animation: 'ringRotate2 30s linear infinite reverse' }} />
          <ellipse cx="200" cy="140" rx="190" ry="120"
            fill="none" stroke="#8a9a6a" strokeWidth="0.5" opacity="0.15"
            strokeDasharray="4 8" style={{ animation: 'ringRotate1 15s linear infinite' }} />

          {/* Sclera (the eyeball) - stretched horizontally, lidless */}
          <g filter="url(#wet)">
            <path
              d="M 15,140 C 15,40 70,5 200,5 C 330,5 385,40 385,140 C 385,240 330,275 200,275 C 70,275 15,240 15,140 Z"
              fill="url(#scleraGrad)"
              stroke="rgba(138,154,106,0.08)"
              strokeWidth="0.8"
            />
          </g>

          {/* Veins overlay - pulsating blood vessels */}
          <g filter="url(#veins)" opacity="0.45">
            <path
              d="M 15,140 C 15,40 70,5 200,5 C 330,5 385,40 385,140 C 385,240 330,275 200,275 C 70,275 15,240 15,140 Z"
              fill="url(#scleraGrad)"
            />
          </g>
          
          {/* Organic blood vessels - thick, pulsating */}
          {Array.from({ length: 12 }).map((_, i) => {
            const startAngle = (i / 12) * Math.PI * 2;
            const startX = 200 + Math.cos(startAngle) * 130;
            const startY = 140 + Math.sin(startAngle) * 85;
            
            // Create branching vein paths
            const branches = Array.from({ length: 3 }).map((_branch, j) => {
              const branchAngle = startAngle + (j - 1) * 0.2;
              const length = 40 + Math.random() * 30;
              const endX = startX + Math.cos(branchAngle) * length;
              const endY = startY + Math.sin(branchAngle) * length * 0.65;
              const midX = startX + Math.cos(branchAngle) * length * 0.5 + (Math.random() - 0.5) * 15;
              const midY = startY + Math.sin(branchAngle) * length * 0.5 + (Math.random() - 0.5) * 10;
              
              return { endX, endY, midX, midY };
            });
            
            // Main vessel
            const mainEndX = startX + Math.cos(startAngle) * (60 + Math.random() * 40);
            const mainEndY = startY + Math.sin(startAngle) * (40 + Math.random() * 25);
            const mainMidX = startX + Math.cos(startAngle) * 30 + (Math.random() - 0.5) * 20;
            const mainMidY = startY + Math.sin(startAngle) * 20 + (Math.random() - 0.5) * 15;
            
            const pulseOpacity = 0.12 + Math.sin(breathPhase * Math.PI * 2 + i) * 0.06;
            const pulseWidth = 1.5 + Math.sin(breathPhase * Math.PI * 3 + i * 0.5) * 0.5;
            
            return (
              <g key={`vessel-${i}`} filter="url(#bloodPulse)">
                {/* Main vessel */}
                <path
                  d={`M ${startX},${startY} Q ${mainMidX},${mainMidY} ${mainEndX},${mainEndY}`}
                  fill="none"
                  stroke={`rgba(138,30,30,${pulseOpacity})`}
                  strokeWidth={pulseWidth}
                  strokeLinecap="round"
                />
                {/* Branches */}
                {branches.map((branch, j) => (
                  <path
                    key={`branch-${i}-${j}`}
                    d={`M ${startX},${startY} Q ${branch.midX},${branch.midY} ${branch.endX},${branch.endY}`}
                    fill="none"
                    stroke={`rgba(122,26,26,${pulseOpacity * 0.7})`}
                    strokeWidth={pulseWidth * 0.6}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            );
          })}

          {/* Iris */}
          <g transform={`translate(${irisOffsetX}, ${irisOffsetY})`}>
            <ellipse cx="200" cy="140" rx="125" ry="82" fill="url(#irisGrad)" />
            
            {/* Iris outer ring - pulsating organic edge */}
            <ellipse cx="200" cy="140" rx="125" ry="82" 
              fill="none" 
              stroke={`rgba(138,154,106,${0.15 + Math.sin(breathPhase * Math.PI * 2) * 0.08})`}
              strokeWidth="2"
              style={{ filter: 'url(#wet)' }} />

            {/* Iris fibrous texture - writhing organic tendrils */}
            {Array.from({ length: 48 }).map((_, i) => {
              const angle = (i / 48) * Math.PI * 2;
              const innerR = 38 + Math.sin(breathPhase * 2 + i) * 3;
              const outerR = 110 + Math.cos(breathPhase * 1.5 + i * 0.5) * 5;
              const midR = (innerR + outerR) * 0.5;
              const waveAmplitude = 8 + Math.sin(breathPhase * 3 + i * 0.3) * 4;
              
              // Create writhing curve control points
              const x1 = 200 + Math.cos(angle) * innerR;
              const y1 = 140 + Math.sin(angle) * innerR * 0.65;
              const x2 = 200 + Math.cos(angle + waveAmplitude * 0.01) * outerR;
              const y2 = 140 + Math.sin(angle + waveAmplitude * 0.01) * outerR * 0.65;
              const cx1 = 200 + Math.cos(angle + 0.1) * midR;
              const cy1 = 140 + Math.sin(angle + 0.1) * midR * 0.65;
              const cx2 = 200 + Math.cos(angle - 0.1) * (midR + waveAmplitude);
              const cy2 = 140 + Math.sin(angle - 0.1) * (midR + waveAmplitude) * 0.65;
              
              // Vary thickness and opacity for organic feel
              const thickness = 0.3 + Math.sin(i * 0.7) * 0.8 + Math.random() * 0.5;
              const opacity = 0.04 + Math.sin(i * 0.5) * 0.03;
              
              // Color varies between sickly green and bruised purple
              const colorMix = Math.sin(i * 0.3) * 0.5 + 0.5;
              const r = Math.floor(138 + (122 - 138) * colorMix);
              const g = Math.floor(154 + (58 - 154) * colorMix);
              const b = Math.floor(106 + (90 - 106) * colorMix);
              
              return (
                <path
                  key={`tendril-${i}`}
                  d={`M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`}
                  fill="none"
                  stroke={`rgba(${r},${g},${b},${opacity})`}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  style={{ 
                    filter: 'url(#wet)',
                    animation: `tendrilWrithe ${3 + Math.random() * 2}s ease-in-out infinite alternate`
                  }}
                />
              );
            })}

            {/* Iris inner ring - darker, more defined */}
            <ellipse cx="200" cy="140" rx="45" ry="28" 
              fill="none" 
              stroke="rgba(2,2,5,0.4)"
              strokeWidth="1.5"
              style={{ filter: 'url(#wet)' }} />

            {/* Pupil */}
            <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
              {/* Vertical slit pupil - more feline/eldritch */}
              <path
                d="M 200,104 C 215,104 218,140 218,140 C 218,140 215,176 200,176 C 185,176 182,140 182,140 C 182,140 185,104 200,104 Z"
                fill="url(#pupilGrad)"
              />
              
              {/* Pupil inner glow - pulsating */}
              <ellipse cx="200" cy="140" rx="12" ry="20" 
                fill={`rgba(138,154,106,${0.1 + Math.sin(breathPhase * Math.PI * 3) * 0.05})`}
                style={{ filter: 'blur(2px)' }} />
              
              {/* Pupil inner highlight */}
              <ellipse cx="192" cy="128" rx="8" ry="5"
                fill="rgba(138,154,106,0.08)" opacity="0.7" />
              
              {/* Secondary highlight */}
              <ellipse cx="208" cy="152" rx="5" ry="3"
                fill="rgba(138,154,106,0.04)" opacity="0.5" />
            </g>
          </g>

          {/* Eyelid crease - thin, lidless */}
          <path
            d="M 15,140 C 15,45 70,12 200,12 C 330,12 385,45 385,140"
            fill="none"
            stroke="rgba(2,2,5,0.5)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 15,140 C 15,235 70,268 200,268 C 330,268 385,235 385,140"
            fill="none"
            stroke="rgba(2,2,5,0.5)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Eyelash tentacles - grotesque, organic with bulbous tips */}
          {Array.from({ length: 16 }).map((_, i) => {
            const t = i / 15;
            const baseX = 40 + t * 320;
            const baseY = 15 + Math.sin(t * Math.PI) * 12;
            
            // Create writhing, organic path
            const length = 25 + Math.random() * 20;
            const waveAmplitude = 8 + Math.random() * 12;
            const waveFrequency = 2 + Math.random() * 2;
            
            // Control points for organic curve
            const midX = baseX + (Math.random() - 0.5) * 20;
            const midY = baseY - length * 0.6 + Math.sin(t * waveFrequency) * waveAmplitude;
            const tipX = baseX + (Math.random() - 0.5) * 30;
            const tipY = baseY - length;
            
            // Bulbous tip size
            const bulbSize = 2 + Math.random() * 3;
            
            // Color varies between sickly green and bruised purple
            const colorMix = Math.sin(i * 0.4) * 0.5 + 0.5;
            const r = Math.floor(138 + (122 - 138) * colorMix);
            const g = Math.floor(154 + (58 - 154) * colorMix);
            const b = Math.floor(106 + (90 - 106) * colorMix);
            
            // Thickness varies
            const thickness = 1.5 + Math.sin(i * 0.7) * 1 + Math.random() * 0.8;
            
            return (
              <g key={`top-${i}`} filter="url(#wet)">
                {/* Tentacle body */}
                <path
                  d={`M ${baseX},${baseY} Q ${midX},${midY} ${tipX},${tipY}`}
                  fill="none"
                  stroke={`rgba(${r},${g},${b},0.25)`}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  style={{ 
                    animation: `tendrilWrithe ${4 + Math.random() * 2}s ease-in-out infinite alternate`
                  }}
                />
                {/* Bulbous tip */}
                <circle
                  cx={tipX}
                  cy={tipY}
                  r={bulbSize}
                  fill={`rgba(${r},${g},${b},0.15)`}
                  style={{ filter: 'url(#wet)' }}
                />
                {/* Inner highlight on tip */}
                <circle
                  cx={tipX - 0.5}
                  cy={tipY - 0.5}
                  r={bulbSize * 0.4}
                  fill={`rgba(200,200,200,0.1)`}
                />
              </g>
            );
          })}

          {/* Eyelash tentacles - bottom, more numerous and thicker */}
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const baseX = 50 + t * 300;
            const baseY = 260 + Math.sin(t * Math.PI) * 10;
            
            // Create writhing, organic path
            const length = 20 + Math.random() * 18;
            const waveAmplitude = 6 + Math.random() * 10;
            const waveFrequency = 2.5 + Math.random() * 1.5;
            
            // Control points for organic curve
            const midX = baseX + (Math.random() - 0.5) * 18;
            const midY = baseY + length * 0.6 + Math.sin(t * waveFrequency) * waveAmplitude;
            const tipX = baseX + (Math.random() - 0.5) * 25;
            const tipY = baseY + length;
            
            // Bulbous tip size
            const bulbSize = 1.5 + Math.random() * 2.5;
            
            // More bruised/purple color for bottom tentacles
            const colorMix = Math.sin(i * 0.5) * 0.3 + 0.7;
            const r = Math.floor(122 + (138 - 122) * colorMix);
            const g = Math.floor(58 + (154 - 58) * colorMix);
            const b = Math.floor(90 + (106 - 90) * colorMix);
            
            // Thickness varies
            const thickness = 1.2 + Math.sin(i * 0.6) * 0.8 + Math.random() * 0.6;
            
            return (
              <g key={`bot-${i}`} filter="url(#wet)">
                {/* Tentacle body */}
                <path
                  d={`M ${baseX},${baseY} Q ${midX},${midY} ${tipX},${tipY}`}
                  fill="none"
                  stroke={`rgba(${r},${g},${b},0.2)`}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  style={{ 
                    animation: `tendrilWrithe ${3.5 + Math.random() * 2}s ease-in-out infinite alternate`
                  }}
                />
                {/* Bulbous tip */}
                <circle
                  cx={tipX}
                  cy={tipY}
                  r={bulbSize}
                  fill={`rgba(${r},${g},${b},0.12)`}
                  style={{ filter: 'url(#wet)' }}
                />
              </g>
            );
          })}
          
          {/* Tear droplets - occasional weeping (only in enhanced mode) */}
          {enhancedMode && Array.from({ length: 5 }).map((_, i) => {
            // Random starting position along the bottom edge
            const startX = 100 + Math.random() * 200;
            const startY = 220 + Math.random() * 40;
            
            // Random timing for each tear
            const delay = i * 2 + Math.random() * 5;
            const duration = 3 + Math.random() * 2;
            
            // Tear size and color
            const tearSize = 2 + Math.random() * 3;
            const tearOpacity = 0.1 + Math.random() * 0.15;
            
            return (
              <g key={`tear-${i}`}>
                {/* Tear drop */}
                <path
                  d={`M ${startX},${startY} 
                      Q ${startX + 2},${startY + 10} ${startX},${startY + 20}
                      Q ${startX - 2},${startY + 10} ${startX},${startY} Z`}
                  fill={`rgba(138,154,106,${tearOpacity})`}
                  style={{
                    filter: 'url(#wet)',
                    animation: `tearFall ${duration}s ease-in infinite`,
                    animationDelay: `${delay}s`
                  }}
                />
                {/* Tear highlight */}
                <circle
                  cx={startX - 0.5}
                  cy={startY + 5}
                  r={tearSize * 0.3}
                  fill={`rgba(200,200,200,${tearOpacity * 0.5})`}
                  style={{
                    animation: `tearFall ${duration}s ease-in infinite`,
                    animationDelay: `${delay}s`
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Blink overlay */}
        <div className="eye-blink-overlay" style={{
          transform: `scaleY(${blinkPhase})`,
          opacity: blinkPhase > 0 ? 1 : 0,
        }} />

        {/* School filaments positioned around the eye */}
        <div className="eye-filaments">
          {featuredSchools.map((school, i) => {
            const total = featuredSchools.length;
            const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * eyeRadius;
            const y = Math.sin(angle) * eyeRadius * 0.5;
            // Simplified filament rendering for reduced motion/low-end devices
            if (!enhancedMode) {
              return (
                <button
                  key={school.id}
                  className="eye-filament-btn"
                  onClick={() => onSchoolSelect(school.id)}
                  type="button"
                  style={{
                    '--tx': `${x}px`,
                    '--ty': `${y}px`,
                    transform: `translate(${x}px, ${y}px)`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                  title={school.name}
                >
                  <span className="eye-filament-btn__glow" />
                  <span className="eye-filament-btn__symbol"><SchoolSigil schoolId={school.id} size={22} /></span>
                  <span className="eye-filament-btn__name">{school.real}</span>
                  <span className="eye-filament-btn__count">{school.spells.length}</span>
                </button>
              );
            }
            
            // Enhanced filament with pulsing sync to eye heartbeat
            const pulseIntensity = Math.sin(breathPhase * Math.PI * 2 + i * 0.5) * 0.15 + 0.85;
            const glowOpacity = Math.sin(breathPhase * Math.PI * 3 + i * 0.3) * 0.2 + 0.3;
            
            return (
              <button
                key={school.id}
                className="eye-filament-btn"
                onClick={() => onSchoolSelect(school.id)}
                type="button"
                style={{
                  '--tx': `${x}px`,
                  '--ty': `${y}px`,
                  transform: `translate(${x}px, ${y}px) scale(${pulseIntensity})`,
                  animationDelay: `${i * 0.3}s`,
                  boxShadow: `0 0 ${15 + glowOpacity * 20}px rgba(138,154,106,${glowOpacity * 0.3}), inset 0 0 ${8 + glowOpacity * 10}px rgba(138,154,106,${glowOpacity * 0.1})`,
                }}
                title={school.name}
              >
                <span className="eye-filament-btn__glow" style={{ opacity: glowOpacity }} />
                <span className="eye-filament-btn__symbol"><SchoolSigil schoolId={school.id} size={22} /></span>
                <span className="eye-filament-btn__name">{school.real}</span>
                <span className="eye-filament-btn__count">{school.spells.length}</span>
              </button>
            );
          })}
        </div>

        {/* Search input in the pupil */}
        <div ref={pupilRef} className={`pupil-search ${isSearching ? 'pupil-search--active' : ''}`}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder=""
            aria-label="Search spells"
            className="pupil-search__input"
          />
          {!searchQuery && (
            <span className="pupil-search__placeholder">Search the abyss...</span>
          )}
          {searchQuery && totalMatches > 0 && (
            <span className="pupil-search__matches">{totalMatches} found</span>
          )}
        </div>
      </div>
    </div>
  );
}
