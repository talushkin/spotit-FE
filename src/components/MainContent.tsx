import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
import SongSlider from "./SongSlider";
import { useSelector } from "react-redux";
import type { Genre, Song } from "../utils/storage";

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
  // Add prop to control footer visibility
  footerHidden?: boolean;
  setFooterHidden?: (hidden: boolean) => void;
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
  footerHidden,
  setFooterHidden,
}) => {
  const [searchSliderSongs, setSearchSliderSongs] = useState<Song[]>([]);
  const [rowJustify, setRowJustify] = useState<string>(
    window.innerWidth <= 770
      ? "center"
      : "flex-start"
  );

  // Songs are stored in selectedGenre?.songs
  const songs = selectedGenre?.songs || [];
  // UseSelector directly, no createSelector (no transformation needed)
  const searchOptions: Song[] = useSelector((state: any) =>
    state && state.data && Array.isArray(state.data.searchOptions)
      ? state.data.searchOptions
      : []
  );

  useEffect(() => {
    setSearchSliderSongs(
      searchOptions.map((r: Song) => ({
        ...r,
        originalTitle: r.title,
        imageUrl: r.imageUrl || r.image || undefined,
      }))
    );
  }, [searchOptions]);

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


  // const handleSelectSong = (song: Song) => {
  //   console.log("Selected song:", song);
  //   //setSelectedSong(song);
  //   onAddSongToList(song, -1); // Add to bottom of song list
  // };

  // Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 650);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 650);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Tap handler for mobile to hide/show footer
  const handleMainTap = () => {
    if (isMobile && setFooterHidden) {
      setFooterHidden(!footerHidden);
    }
  };

  // Hide footer on drag/scroll (touchmove or mousemove after mousedown)
  useEffect(() => {
    if (!isMobile || !setFooterHidden) return;
    let dragging = false;
    let dragStartY = 0;
    let dragMoved = false;
    const onTouchStart = (e: TouchEvent) => {
      dragging = true;
      dragStartY = e.touches[0].clientY;
      dragMoved = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const deltaY = Math.abs(e.touches[0].clientY - dragStartY);
      if (deltaY > 10 && !footerHidden) {
        setFooterHidden(true);
        dragMoved = true;
      }
    };
    const onTouchEnd = () => {
      dragging = false;
    };
    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      dragStartY = e.clientY;
      dragMoved = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const deltaY = Math.abs(e.clientY - dragStartY);
      if (deltaY > 10 && !footerHidden) {
        setFooterHidden(true);
        dragMoved = true;
      }
    };
    const onMouseUp = () => {
      dragging = false;
    };
    const main = document.querySelector('.main');
    if (main) {
      main.addEventListener('touchstart', onTouchStart as EventListener);
      main.addEventListener('touchmove', onTouchMove as EventListener);
      main.addEventListener('touchend', onTouchEnd as EventListener);
      main.addEventListener('mousedown', onMouseDown as EventListener);
      main.addEventListener('mousemove', onMouseMove as EventListener);
      main.addEventListener('mouseup', onMouseUp as EventListener);
    }
    return () => {
      if (main) {
        main.removeEventListener('touchstart', onTouchStart as EventListener);
        main.removeEventListener('touchmove', onTouchMove as EventListener);
        main.removeEventListener('touchend', onTouchEnd as EventListener);
        main.removeEventListener('mousedown', onMouseDown as EventListener);
        main.removeEventListener('mousemove', onMouseMove as EventListener);
        main.removeEventListener('mouseup', onMouseUp as EventListener);
      }
    };
  }, [isMobile, setFooterHidden, footerHidden]);

  return (
    <div className="main" onClick={handleMainTap} style={{ cursor: isMobile ? 'pointer' : undefined, marginBottom: 120}}>
      {/* Song sliders for all genres, stacked vertically */}
      {/*add slider for search results*/}
      {searchSliderSongs.length > 0 && (
            <div
              key={"search results"}
              style={{
                // display: 'flex',
                // flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '100%',
                marginBottom: '0rem',
                marginTop: '0rem',
                overflowX: 'hidden',
              }}
            >
          <SongSlider
            songs={searchSliderSongs}
            selectedGenre={{ genre: "Search Results", songs: searchSliderSongs }}
            isDarkMode={isDarkMode}
            onAddSongToList={onAddSongToList}
          />
        </div>
      )}
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
                marginBottom: '0rem',
                marginTop: '0rem',
                overflowX: 'hidden',
              }}
            >
              <SongSlider
                songs={genre.songs || []}
                selectedGenre={genre}
                isDarkMode={isDarkMode}
                onAddSongToList={onAddSongToList}
                //onSelectSong={handleSelectSong}
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
