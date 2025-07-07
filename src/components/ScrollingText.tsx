import React, { useEffect, useState, useRef } from "react";
// ScrollingText component for long titles with smooth X translation and fading sides
const ScrollingText: React.FC<{ text: string; width?: number }> = ({ text, width = 180 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);
  const [pauseAtEnd, setPauseAtEnd] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [maxOffset, setMaxOffset] = useState(0);
  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        setShouldScroll(textWidth > containerWidth);
        setMaxOffset(textWidth - containerWidth);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [text, width]);

  useEffect(() => {
    if (!shouldScroll) {
      setOffset(0);
      setPauseAtEnd(false);
      return;
    }
    let req: number;
    let start: number | null = null;
    let localOffset = 0;
    let direction = 1;
    let paused = false;
    const speed = 30; // px per second
    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      if (paused) {
        req = requestAnimationFrame(animate);
        return;
      }
      let nextOffset = localOffset + direction * (speed * (elapsed / 1000));
      if (nextOffset >= maxOffset) {
        nextOffset = maxOffset;
        direction = -1;
        paused = true;
        setTimeout(() => {
          paused = false;
          start = null;
          localOffset = nextOffset;
          req = requestAnimationFrame(animate);
        }, 2000);
      } else if (nextOffset <= 0) {
        nextOffset = 0;
        direction = 1;
        paused = true;
        setTimeout(() => {
          paused = false;
          start = null;
          localOffset = nextOffset;
          req = requestAnimationFrame(animate);
        }, 1000);
      }
      setOffset(nextOffset);
      localOffset = nextOffset;
      if (!paused) {
        start = timestamp;
        req = requestAnimationFrame(animate);
      }
    };
    req = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(req);
    // eslint-disable-next-line
  }, [shouldScroll, maxOffset]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: 24,
      }}
      title={text}
    >
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          transform: `translateX(${-offset}px)`,
          transition: 'transform 0.1s linear',
          whiteSpace: 'nowrap',
          fontSize: '1rem',
        }}
      >
        {text}
      </span>
      {/* Fading sides */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 15,
        height: '100%',
        pointerEvents: 'none',
        background: 'linear-gradient(to right, #333 80%, transparent)',
        opacity: shouldScroll ? 0.7 : 0,
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: 15,
        height: '100%',
        pointerEvents: 'none',
        background: 'linear-gradient(to left, #333 80%, transparent)',
        opacity: shouldScroll ? 0.7 : 0,
        zIndex: 1
      }} />
    </div>
  );
};

export default ScrollingText;
