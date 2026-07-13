/**
 * EyeDefs — static SVG definitions for the Lidless Eye.
 *
 * Gradients, filters, and clip paths shared across eye renderers.
 */

export default function EyeDefs() {
  return (
    <defs>
      <radialGradient id="cast-iris-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#5a4a3a" stopOpacity="0.6" />
        <stop offset="60%" stopColor="#2a1a1a" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0a0608" stopOpacity="0.95" />
      </radialGradient>
      <radialGradient id="cast-pupil-grad" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#1a0a0a" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
      <radialGradient id="cast-blood-grad" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#c44545" stopOpacity="0.95" />
        <stop offset="60%" stopColor="#8a1a1a" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#4a0a0a" stopOpacity="0.7" />
      </radialGradient>
      <filter id="cast-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath id="cast-iris-clip">
        <ellipse cx="120" cy="80" rx="55" ry="38" />
      </clipPath>
    </defs>
  );
}
