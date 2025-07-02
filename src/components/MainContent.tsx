import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
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
      <div
        className="main-title"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            flexBasis: "100%",
            textAlign: "center",
            color: isDarkMode ? "white" : "inherit",
            fontSize: "2rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100vw",
            lineHeight: "2rem",
                marginTop: "1rem",
          }}
          title={selectedGenre?.genre}
        >
          {selectedGenre?.genre}
        </div>
      </div>


      {/* DnD and editOrder logic omitted for brevity; only show song list */}
      <div
        className="row d-flex"
        style={{
          justifyContent: rowJustify,
        }}
      >
        {songs.map((item, index) => {
          let colClass = "col-2";
          return (
            <div
              key={index}
              className={`${colClass} mb-4 d-flex`}
              style={{
                justifyContent: rowJustify,
              }}
              onClick={() => handleSelectSong(item)}
            >
              <CaseCard
                index={index + 1}
                item={item}
                category={selectedGenre?.genre}
                isDarkMode={isDarkMode}
                onAddSongToList={onAddSongToList}
                onSelectSong={handleSelectSong}
              />
            </div>
          );
        })}
      </div>

    </div>
  );
};

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
export default MainContent;
