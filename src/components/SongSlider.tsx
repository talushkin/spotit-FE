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
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {/* Genre title */}
      {selectedGenre?.genre && (
        <div
          style={{
            fontWeight: 600,
            fontSize: '1.3rem',
            marginBottom: '0.5rem',
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
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          maxWidth: '100vw',
          cursor: 'pointer',
          userSelect: 'none',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          background: isDarkMode ? '#000' : '#f5f5f5',
          borderRadius: '16px',
          boxShadow: isDarkMode ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
          padding: '0.5rem 0',
          scrollbarColor: isDarkMode ? '#444 #000' : '#ccc #f5f5f5',
          scrollbarWidth: 'thin',
        }}
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
              //height: window.innerWidth <= 650 ? 160 : 240,
              flex: '0 0 auto',
              cursor: 'pointer',
                margin: '0.5rem',
            }}
            //onClick={() => onSelectSong(item)}
          >
            <CaseCard
              index={index + 1}
              item={item}
              category={selectedGenre?.genre || ''}
              isDarkMode={isDarkMode}
              onAddSongToList={onAddSongToList}
              //onSelectSong={onSelectSong}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSlider;
