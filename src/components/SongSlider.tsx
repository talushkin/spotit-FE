import React from "react";
import CaseCard from "./CaseCard";
import type { Song, Genre } from "../utils/storage";

interface SongSliderProps {
  songs: Song[];
  selectedGenre?: Genre;
  isDarkMode: boolean;
  onAddSongToList: (song: Song, location?: number) => void;
  onSelectSong: (song: Song) => void;
}


const SongSlider: React.FC<SongSliderProps> = ({
  songs,
  selectedGenre,
  isDarkMode,
  onAddSongToList,
  onSelectSong,
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
          //gap: '1.5rem',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          maxWidth: '70vw',
          cursor: 'pointer',
          userSelect: 'none',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
        }}
      >
        {songs.map((item, index) => (
          <div
            key={index}
            style={{ minWidth: 220, maxWidth: 220, flex: '0 0 auto', cursor: 'pointer' }}
            onClick={() => onSelectSong(item)}
          >
            <CaseCard
              index={index + 1}
              item={item}
              category={selectedGenre?.genre || ''}
              isDarkMode={isDarkMode}
              onAddSongToList={onAddSongToList}
              onSelectSong={onSelectSong}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSlider;
