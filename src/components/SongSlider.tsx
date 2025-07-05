import React, { useState, useEffect, useRef } from "react";
import CaseCard from "./CaseCard";
import type { Song, Genre } from "../utils/storage";
import { Margin } from "@mui/icons-material";

interface SongSliderProps {
  songs: Song[];
  selectedGenre?: Genre;
  isDarkMode: boolean;
  onAddSongToList: (song: Song, location?: number) => void;
  //onSelectSong: (song: Song) => void;
}

const SongSlider: React.FC<SongSliderProps> = ({
  songs,
  selectedGenre,
  isDarkMode,
  onAddSongToList,
  //onSelectSong,
}) => {
  // Drag-to-scroll logic
  const sliderRef = useRef<HTMLDivElement>(null);
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

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
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          borderRadius: '16px',
          boxShadow: isDarkMode ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
          padding: '0.5rem 0',
          scrollbarColor: isDarkMode ? '#444 #000' : '#ccc #f5f5f5',
          scrollbarWidth: 'thin',
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
        {songs.map((item, index) => (
          <div
            key={index}
            style={{
              minWidth: window.innerWidth <= 650 ? 160 : 240,
              width: window.innerWidth <= 650 ? 160 : 240,
              flex: '0 0 auto',
              cursor: 'pointer',
              margin: '0 10px', // Reduce horizontal gap to almost touch
            }}
          >
            <CaseCard
              index={index + 1}
              item={item}
              category={selectedGenre?.genre || ''}
              isDarkMode={isDarkMode}
              onAddSongToList={onAddSongToList}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSlider;
