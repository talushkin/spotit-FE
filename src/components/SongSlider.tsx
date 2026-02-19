import React, { useState, useEffect, useRef } from "react";
import CaseCard from "./CaseCard";
import type { Song, Genre } from "../utils/storage";
import { DisplayType } from "../utils/storage";
import { Margin } from "@mui/icons-material";


interface SongSliderProps {
  songs: Song[];
  selectedGenre?: Genre;
  isDarkMode: boolean;
  onAddSongToList: (song: Song, location?: number) => void;
}

const SongSlider: React.FC<SongSliderProps> = ({
  songs,
  selectedGenre,
  isDarkMode,
  onAddSongToList,
}: SongSliderProps) => {
  // Drag-to-scroll logic
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const snapTimeoutRef = useRef<number | null>(null);
  const isTouchingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const momentumRafRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 650);
  const [centeredIndex, setCenteredIndex] = useState<number | null>(null);
  const genreLabel = selectedGenre?.genre || "Playlist";

  const genreCardColor = React.useMemo(() => {
    const palette = [
      "#EF5350", "#AB47BC", "#5C6BC0", "#42A5F5", "#26A69A",
      "#66BB6A", "#D4E157", "#FFA726", "#8D6E63", "#78909C"
    ];
    const seed = (genreLabel || "").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[seed % palette.length];
  }, [genreLabel]);

  const caseCardBgColor = React.useMemo(() => {
    const hex = genreCardColor.replace('#', '');
    if (hex.length !== 6) return genreCardColor;
    const toDark = (value: string) => Math.max(0, Math.floor(parseInt(value, 16) * 0.8));
    const r = toDark(hex.slice(0, 2));
    const g = toDark(hex.slice(2, 4));
    const b = toDark(hex.slice(4, 6));
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, [genreCardColor]);

  // Determine displayType from selectedGenre
  const displayType: DisplayType = selectedGenre?.displayType || DisplayType.Slider;
  const standardCardWidth = displayType === "circles" ? 120 : (window.innerWidth <= 650 ? 160 : 180);
  const standardCardHeight = displayType === "circles" ? 140 : 210;

  const stopMomentum = () => {
    if (momentumRafRef.current !== null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  };

  const startMomentum = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    let velocity = dragVelocityRef.current;
    if (Math.abs(velocity) < 0.02) return;

    stopMomentum();
    let previousTs = performance.now();
    const friction = 0.93;

    const step = (ts: number) => {
      const currentSlider = sliderRef.current;
      if (!currentSlider) {
        stopMomentum();
        return;
      }
      const delta = Math.max(1, ts - previousTs);
      previousTs = ts;
      currentSlider.scrollLeft += velocity * delta;
      velocity *= friction;

      if (Math.abs(velocity) < 0.02) {
        stopMomentum();
        if (isMobile) scheduleSnapToCenter();
        return;
      }

      momentumRafRef.current = requestAnimationFrame(step);
    };

    momentumRafRef.current = requestAnimationFrame(step);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // Ignore interactive controls so card buttons still work
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, [role="button"]')) return;
    stopMomentum();
    isDraggingRef.current = true;
    startXRef.current = e.pageX - (sliderRef.current?.offsetLeft || 0);
    scrollLeftRef.current = sliderRef.current?.scrollLeft || 0;
    dragVelocityRef.current = 0;
    lastDragTimeRef.current = performance.now();
    lastScrollLeftRef.current = sliderRef.current?.scrollLeft || 0;
    document.body.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    startMomentum();
  };
  const onMouseUp = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    startMomentum();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const slider = sliderRef.current;
    if (!slider) return;
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startXRef.current) * (isMobile ? 2.8 : 2.2);
    const nextScrollLeft = scrollLeftRef.current - walk;
    slider.scrollLeft = nextScrollLeft;

    const now = performance.now();
    const dt = Math.max(1, now - lastDragTimeRef.current);
    const ds = nextScrollLeft - lastScrollLeftRef.current;
    dragVelocityRef.current = ds / dt;
    lastDragTimeRef.current = now;
    lastScrollLeftRef.current = nextScrollLeft;
  };

  const updateCenteredCard = () => {
    const viewportCenterX = window.innerWidth / 2;
    let closestIndex = -1;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenterX - viewportCenterX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    setCenteredIndex((prev) => (prev === closestIndex ? prev : closestIndex));
  };

  const snapNearestCardToCenter = () => {
    const slider = sliderRef.current;
    if (!slider || cardRefs.current.length === 0) return;

    const sliderRect = slider.getBoundingClientRect();
    const sliderCenterX = sliderRect.left + sliderRect.width / 2;
    let closestCard: HTMLDivElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card: HTMLDivElement | null) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenterX - sliderCenterX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCard = card as HTMLDivElement;
      }
    });

    if (closestCard) {
      const cardRect = (closestCard as HTMLDivElement).getBoundingClientRect();
      const deltaToCenter = cardRect.left + cardRect.width / 2 - sliderCenterX;
      const targetLeft = slider.scrollLeft + deltaToCenter;

      slider.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    }
  };

  const scheduleSnapToCenter = () => {
    if (!isMobile) {
      if (snapTimeoutRef.current !== null) {
        window.clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
      return;
    }
    if (snapTimeoutRef.current !== null) {
      window.clearTimeout(snapTimeoutRef.current);
    }
    snapTimeoutRef.current = window.setTimeout(() => {
      if (!isTouchingRef.current && !isDraggingRef.current) {
        snapNearestCardToCenter();
      }
    }, 220);
  };

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 650);
      requestAnimationFrame(updateCenteredCard);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      stopMomentum();
    };
  }, [isMobile, songs.length]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onScroll = () => {
      if (!isMobile) return;
      requestAnimationFrame(updateCenteredCard);
      scheduleSnapToCenter();
    };

    slider.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(updateCenteredCard);

    return () => {
      slider.removeEventListener('scroll', onScroll);
      if (snapTimeoutRef.current !== null) {
        window.clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [songs, isMobile]);

  const handleTouchStart = () => {
    isTouchingRef.current = true;
    if (snapTimeoutRef.current !== null) {
      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    if (isMobile) scheduleSnapToCenter();
  };

  const handleWheel = () => {
    if (isMobile) scheduleSnapToCenter();
  };

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div
        id="song-slider"
        ref={sliderRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'auto',
          scrollSnapType: isMobile ? 'x proximity' : undefined,
          maxWidth: '100vw',
          cursor: 'grab',
          userSelect: 'none',
          gap: '30px',
          touchAction: 'pan-x',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          borderRadius: '16px',
          boxShadow: isDarkMode ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
          padding: '0.5rem 0',
          scrollbarColor: isDarkMode ? '#444 #000' : '#ccc #f5f5f5',
          scrollbarWidth: 'thin',
          background: genreCardColor,
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Custom scrollbar for horizontal slider */}
        <style>{`
          #song-slider::-webkit-scrollbar {
            height: 6px;
            background: ${isDarkMode ? '#000' : '#f5f5f5'};
          }
          #song-slider::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? '#444' : '#ccc'};
            border-radius: 3px;
          }
        `}</style>
        <div
          style={
            displayType === "circles"
              ? {
                  minWidth: standardCardWidth,
                  width: standardCardWidth,
                  height: standardCardHeight,
                  flex: '0 0 auto',
                  cursor: 'default',
                  margin: '0 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              : {
                  minWidth: standardCardWidth,
                  width: standardCardWidth,
                  height: standardCardHeight,
                  flex: '0 0 auto',
                  cursor: 'default',
                  margin: '0 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
          }
        >
          <div
            style={{
              width: standardCardWidth,
              height: standardCardHeight,
              borderRadius: 16,
              background: genreCardColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "10px",
              color: "#1f1f1f",
              fontWeight: 800,
              fontSize: displayType === "circles" ? "0.95rem" : "1.1rem",
              boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
            }}
          >
            {genreLabel}
          </div>
        </div>
        {songs.map((item: Song, index: number) => (
          <div
            key={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            style={
              displayType === "circles"
                ? {
                    minWidth: standardCardWidth,
                    width: standardCardWidth,
                    height: standardCardHeight,
                    flex: '0 0 auto',
                    scrollSnapAlign: isMobile ? 'center' : undefined,
                    scrollSnapStop: isMobile ? 'normal' : undefined,
                    cursor: 'pointer',
                    margin: '0 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                : {
                    minWidth: standardCardWidth,
                    width: standardCardWidth,
                    height: standardCardHeight,
                    flex: '0 0 auto',
                    scrollSnapAlign: isMobile ? 'center' : undefined,
                    scrollSnapStop: isMobile ? 'normal' : undefined,
                    cursor: 'pointer',
                    margin: '0 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
            }
          >
            {/* Title above the card: only for circles */}
            {displayType === "circles" && (
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: isDarkMode ? '#fff' : '#222',
                  textAlign: 'center',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                  marginTop: 2,
                  minHeight: 22,
                }}
              >
                {item.artist || item.title}
              </div>
            )}
            <CaseCard
              index={index + 1}
              item={item}
              category={selectedGenre?.genre || ''}
              isDarkMode={isDarkMode}
              onAddSongToList={onAddSongToList}
              displayType={displayType}
              isMobile={isMobile}
              showMobileActions={centeredIndex === index}
              bgColor={caseCardBgColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSlider;
