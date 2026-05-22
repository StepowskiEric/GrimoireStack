import { useState, useEffect, useRef } from 'react';

export default function BookSplash({ onFinish }: { onFinish: () => void }) {
  const [fading, setFading] = useState(false);
  const [show, setShow] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef(false);

  useEffect(() => {
    // Check if we've already shown the intro this session
    if (sessionStorage.getItem('grimoire-splash-seen')) {
      skipRef.current = true;
      setShow(false);
      onFinish();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      sessionStorage.setItem('grimoire-splash-seen', '1');
      setFading(true);
      setTimeout(() => { setShow(false); onFinish(); }, 1000);
    };

    const handleError = () => {
      setShow(false);
      onFinish();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Auto-play
    video.play().catch(() => {
      // Auto-play blocked (mobile/data) — skip splash
      setShow(false);
      onFinish();
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onFinish]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#080604',
      opacity: fading ? 0 : 1,
      transition: 'opacity 1s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <video
        ref={videoRef}
        src="/book-cover.mp4"
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <button
        onClick={() => {
          if (!skipRef.current) {
            skipRef.current = true;
            sessionStorage.setItem('grimoire-splash-seen', '1');
            setFading(true);
            setTimeout(() => { setShow(false); onFinish(); }, 1000);
            videoRef.current?.pause();
          }
        }}
        style={{
          position: 'absolute', bottom: 30, right: 30,
          fontFamily: "'Cinzel', serif", fontSize: '0.65rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', padding: '8px 18px',
          border: '1px solid rgba(212,175,55,0.15)', borderRadius: 4,
          background: 'rgba(8,6,4,0.7)', color: '#6a5a3a',
          cursor: 'pointer', backdropFilter: 'blur(4px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.color = '#d4af37'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.color = '#6a5a3a'; }}
      >
        ✦ Skip Intro
      </button>
    </div>
  );
}
