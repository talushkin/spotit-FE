import React, { useState, useEffect } from "react";
import SongSlider from "./SongSlider";
import PlaylistSlider from "./PlaylistSlider";
import { useSelector } from "react-redux";
import type { Genre, Song, Playlist } from "../utils/storage";
import { DisplayType } from "../utils/storage";

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
  const [hoveredPlaylist, setHoveredPlaylist] = useState<Playlist | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

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
            selectedGenre={{ genre: "Search Results", songs: searchSliderSongs, displayType: DisplayType.Slider }}
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
              {genre.displayType === 'playlist' && Array.isArray(genre.playlists) ? (
                <>
                  <PlaylistSlider
                    playlists={genre.playlists}
                    isDarkMode={isDarkMode}
                    onAddSongToList={(playlist) => {
                      // Optionally add all songs from playlist to the song list
                      if (playlist.songs && Array.isArray(playlist.songs)) {
                        setSongList([...songList, ...playlist.songs]);
                      }
                    }}
                    onPlaylistHover={(playlist, rect) => {
                      setHoveredPlaylist(playlist);
                      console.log("Hovered playlist:", playlist ? playlist.songs : []);
                      {console.log("Hovered playlist location:", rect)}
                      setHoveredRect(rect || null);
                    }}
                  />
                  {/* Only show tooltip if playlist has songs */}
                  {hoveredPlaylist && hoveredRect && Array.isArray(hoveredPlaylist.songs) && hoveredPlaylist.songs.length > 0 && (
                    
                    <div
                      style={{
                        position: 'absolute',
                        left: hoveredRect.right + 12,
                        top: 600,
                        width: '340px',
                        height: hoveredRect.height,
                        background: isDarkMode ? '#222' : '#fff',
                        color: isDarkMode ? '#fff' : '#222',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                        zIndex: 99999,
                        overflowY: 'auto',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                      }}
                    >
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {hoveredPlaylist.songs.slice(0, 10).map((s, idx) => (
                          <li key={idx} style={{
                            marginBottom: 8,
                            fontSize: '1rem',
                            lineHeight: '1.3',
                            background: isDarkMode ? '#222' : '#fff',
                            color: isDarkMode ? '#fff' : '#222',
                            padding: '2px 0',
                            borderRadius: '4px',
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            textOverflow: 'clip',
                            wordBreak: 'break-word',
                            maxWidth: '300px',
                            zIndex: 99999
                          }}>
                            {idx + 1}. {s.title.length > 20 ? s.title.slice(0, 20) + '…' : s.title}
                            {s.artist ? ` / ${s.artist}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <SongSlider
                  songs={genre.songs || []}
                  selectedGenre={genre}
                  isDarkMode={isDarkMode}
                  onAddSongToList={onAddSongToList}
                />
              )}
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
