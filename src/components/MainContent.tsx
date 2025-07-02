import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
import SongSlider from "./SongSlider";
import { useNavigate } from "react-router-dom";
// Update this import to only include exported members from "../utils/storage"
import type { Genre, Song } from "../utils/storage";
import { add } from "@dnd-kit/utilities";

// --- Types ---

interface MainContentProps {
  selectedGenre: Genre;
  selectedSong: Song | null;
  desktop: boolean;
  isDarkMode: boolean;
  songList: Song[];
  setSongList: (songs: Song[]) => void;
  onAddSongToList: (song: Song, location?: number) => void;
  setSelectedSong: (song: Song | null) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  selectedGenre,
  selectedSong,
  desktop,
  isDarkMode,
  songList,
  setSongList,
  onAddSongToList,
  setSelectedSong,
}) => {
  const [rowJustify, setRowJustify] = useState<string>(
    window.innerWidth <= 770
      ? "center"
      : "flex-start"
  );

  // Songs are stored in selectedGenre?.songs
  const songs = selectedGenre?.songs || [];

  useEffect(() => {
    const handleResize = () => {
      setRowJustify(
        window.innerWidth <= 770
          ? "center"
          : "flex-start"
      );
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const totalItems = songs.length;


  const handleSelectSong = (song: Song) => {
    console.log("Selected song:", song);
    //setSelectedSong(song);
    onAddSongToList(song, -1); // Add to bottom of song list
  };

  return (
    <div className="main">

      {/* Song sliders for all genres, stacked vertically */}
      {Array.isArray(require('../data/songs.json').site.genres)
        ? require('../data/songs.json').site.genres.map((genre: Genre, idx: number) => (
            <div
              key={genre.genre || idx}
              style={{
                // display: 'flex',
                // flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '100%',
                marginBottom: '1.5rem',
                marginTop: '1.5rem',
                overflowX: 'hidden',
              }}
            >
              <SongSlider
                songs={genre.songs || []}
                selectedGenre={genre}
                isDarkMode={isDarkMode}
                onAddSongToList={onAddSongToList}
                onSelectSong={handleSelectSong}
              />
            </div>
          ))
        : null}
    </div>
  );



/**
 * MainContent component.
 *
 * Serves as the primary content area of the application.
 * Renders the main interface and manages the core functionality
 * displayed to the user.
 *
 * @component
 * @returns {JSX.Element} The rendered main content of the application.
 */
}

export default MainContent;
