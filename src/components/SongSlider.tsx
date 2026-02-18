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
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 650);
  const [centeredIndex, setCenteredIndex] = useState<number | null>(null);

  // Determine displayType from selectedGenre
  const displayType: DisplayType = selectedGenre?.displayType || DisplayType.Slider;

  const onMouseDown = (e: React.MouseEvent) => {
    // Only start drag if the target is an IMG inside a .case
    const target = e.target as HTMLElement;
    if (!(target.tagName === 'IMG' && target.closest('.case'))) return;
    isDragging = true;
    startX = e.pageX - (sliderRef.current?.offsetLeft || 0);
    scrollLeft = sliderRef.current?.scrollLeft || 0;
    document.body.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    isDragging = false;
    document.body.style.cursor = '';
  };
  const onMouseUp = () => {
    isDragging = false;
    document.body.style.cursor = '';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2.5; // scroll speed (increased)
    if (sliderRef.current) sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const updateCenteredCard = () => {
    if (!isMobile) {
      setCenteredIndex(null);
      return;
    }

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

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 650);
      requestAnimationFrame(updateCenteredCard);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [isMobile, songs.length]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const onScroll = () => {
      requestAnimationFrame(updateCenteredCard);
    };

    slider.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(updateCenteredCard);

    return () => {
      slider.removeEventListener('scroll', onScroll);
    };
  }, [songs, isMobile]);

  // Gradient backgrounds per displayType
  const getSliderBackground = () => {
    // Special case: search results slider (genre === 'Search Results')
    if (selectedGenre?.genre === 'Search Results') {
      return '#001a3a'; // Full dark blue
    }
    if (displayType === "circles") {
      return isDarkMode
        ? "linear-gradient(90deg, #3a3a3a 0%, #222 100%)"
        : "linear-gradient(90deg, #f7e8ff 0%, #fffce8 100%)";
    }
    if (displayType === "radio") {
      return isDarkMode
        ? "linear-gradient(90deg, #2b3a55 0%, #222 100%)"
        : "linear-gradient(90deg, #e0f7fa 0%, #fffce8 100%)";
    }
    if (displayType === "slider") {
      return isDarkMode
        ? "linear-gradient(90deg, #232526 0%, #333 100%)"
        : "linear-gradient(90deg, #f5f7fa 0%, #fffce8 100%)";
    }
    // Default fallback
    return isDarkMode
      ? "linear-gradient(90deg, #232526 0%, #333 100%)"
      : "linear-gradient(90deg, #f5f7fa 0%, #fffce8 100%)";
  };

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {/* Genre title */}
      {selectedGenre?.genre && (
        <div
          style={{
            fontWeight: 600,
            fontSize: '1.3rem',
            marginBottom: '0px',
            color: isDarkMode ? 'white' : '#222',
            textAlign: 'left',
            marginLeft: '0.5rem',
          }}
        >
          {selectedGenre.genre}
        </div>
      )}
      <div
        id="song-slider"
        ref={sliderRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          maxWidth: '100vw',
          cursor: 'grab',
          userSelect: 'none',
          gap: '10px',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          borderRadius: '16px',
          boxShadow: isDarkMode ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
          padding: '0.5rem 0',
          scrollbarColor: isDarkMode ? '#444 #000' : '#ccc #f5f5f5',
          scrollbarWidth: 'thin',
          background: getSliderBackground(),
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
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
        {songs.map((item: Song, index: number) => (
          <div
            key={index}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            style={
              displayType === "circles"
                ? {
                    minWidth: 120,
                    width: 120,
                    height: 140,
                    flex: '0 0 auto',
                    cursor: 'pointer',
                    margin: '0 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }
                : {
                    minWidth: window.innerWidth <= 650 ? 160 : 180,
                    width: window.innerWidth <= 650 ? 160 : 180,
                    flex: '0 0 auto',
                    cursor: 'pointer',
                    margin: '0 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSlider;
