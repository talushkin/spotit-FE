import * as React from "react";
const { useRef, useState, useEffect, useMemo } = React;
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, IconButton, Slider } from "@mui/material";
// LanguageSelector removed: only English
import ThemeModeButton from "./ThemeModeButton";

// Helper to detect mobile (max-width: 650px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 650 : false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 650);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}
import YouTube, { YouTubePlayer } from "react-youtube";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import type { Song } from "../utils/storage";

interface FooterBarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  selectedSong?: { url?: string; title?: string; artist?: string };
  setSelectedSong: (song: Song | null) => void;
  onPrevSong?: () => void;
  onNextSong?: () => void;
}



interface FooterBarExtendedProps extends FooterBarProps {
  songList?: Song[];
  setSongList?: (list: Song[]) => void;
  currentSongIndex?: number;
}






function SortableSongRow({ song, idx, isSelected, isNextSelected, onClick, isDarkMode }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: idx.toString() });
  const [hovered, setHovered] = useState(false);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isSelected
      ? (isDarkMode ? "#444" : "#e0ffe0")
      : isNextSelected
        ? (isDarkMode ? "#222" : "#cce0ff")
        : hovered
          ? (isDarkMode ? "#222b44" : "#e3f2fd")
          : "transparent",
    cursor: hovered ? "pointer" : "grab",
    border: isNextSelected ? (isDarkMode ? '1px solid #1976d2' : '1px solid #1976d2') : undefined,
  };
  // Scrolling logic for long titles
  const [scrollIndex, setScrollIndex] = useState(0);
  const shouldScroll = song.title && song.title.length > 30;
  useEffect(() => {
    if (!shouldScroll || !isSelected) {
      setScrollIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setScrollIndex((prev: number) => (prev + 1) % (song.title.length - 29));
    }, 500); // 0.5 sec per letter
    return () => clearInterval(interval);
  }, [shouldScroll, isSelected, song.title]);

  let displayTitle = song.title;
  if (shouldScroll && isSelected) {
    displayTitle = song.title.slice(scrollIndex, scrollIndex + 30);
  } else if (shouldScroll) {
    displayTitle = song.title.slice(0, 30) + '...';
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...attributes}
      {...listeners}
    >
      <td style={{ width: 32, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {hovered ? <PlayArrowIcon fontSize="small" style={{ verticalAlign: "middle", color: isDarkMode ? "#90caf9" : "#1976d2" }} /> : idx + 1}
      </td>
      <td style={{ padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#fff" : "#222"), fontWeight: isSelected ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", maxWidth: 180, display: "flex", alignItems: "center", gap: 4 }}>
        {displayTitle}
      </td>
      <td style={{ width: 60, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {song.duration || ""}
      </td>
    </tr>
  );
}

export default function FooterBar({ isDarkMode, toggleDarkMode, selectedSong, setSelectedSong, songList: propSongList = [], setSongList: setAppSongList, currentSongIndex = 0 }: FooterBarExtendedProps) {
  const isMobile = useIsMobile();
  // Next song highlight state
  const [nextSongToHighlight, setNextSongToHighlight] = useState<Song | null>(null);

  // YouTube player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const playerRef = useRef<YouTubePlayer | null>(null);


  // Volume state
  const [volume, setVolume] = useState(10);
  // Next song highlight state (no crossfade)
  // (removed crossfade and next player state)

  // Update YouTube player volume when changed
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);
  // State to keep track of played songs (local for drag, but syncs with app)
  const [songList, setSongList] = useState<Song[]>(propSongList);

  // Sync local songList with app songList when propSongList changes
  useEffect(() => {
    setSongList(propSongList);
  }, [propSongList]);
  // DnD-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Handle drag end for song list
  const handleSongDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = songList.findIndex((_: any, i: number) => i.toString() === active.id);
    const newIndex = songList.findIndex((_: any, i: number) => i.toString() === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newList = arrayMove(songList, oldIndex, newIndex);
    setSongList(newList);
    if (typeof setAppSongList === 'function') setAppSongList(newList);
  };

  // Inner next/prev song logic
  const getCurrentSongIndex = () => {
    if (!selectedSong) return 0;
    //console.log('Current song:', selectedSong);
    return songList.findIndex(
      (s: Song) => s.title === selectedSong.title && s.artist === selectedSong.artist
    );
  };

  const handleNextSong = () => {
    const idx = getCurrentSongIndex();
    if (idx >= 0 && idx < songList.length - 1) {
      const nextSong = songList[idx + 1];
      setSelectedSong(nextSong);
      setTimeout(() => {
        // Update duration for new song
        if (playerRef.current) {
          const duration = playerRef.current.getDuration?.() || 0;
          setTotalDuration(duration);
        }
        setIsPlaying(true);
      }, 200);
    }
  };

  const handlePrevSong = () => {
    const idx = getCurrentSongIndex();
    if (idx > 0) {
      const prevSong = songList[idx - 1];
      //setSelectedSong(prevSong);
      setTimeout(() => {
        // Update duration for new song
        if (playerRef.current) {
          const duration = playerRef.current.getDuration?.() || 0;
          setTotalDuration(duration);
        }
        setIsPlaying(true);
      }, 200);
    }
  };
  // Language support removed: only English

  // (removed duplicate declarations)

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      // Add to song list when play is pressed
      //addSongToList(selectedSong);
    }
  };

  // Update current time every 0.1s for slider, highlight next song 20s before end, and switch to next song at end
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isPlaying && playerRef.current) {
      intervalId = setInterval(() => {
        const time = playerRef.current?.getCurrentTime?.() || 0;
        const duration = playerRef.current?.getDuration?.() || 0;
        setCurrentTime(time);
        const idx = getCurrentSongIndex();
        // Highlight next song 20 seconds before end
        if (
          duration > 0 &&
          time >= duration - 20 &&
          idx < songList.length - 1
        ) {
          setNextSongToHighlight(songList[idx + 1]);
        } else {
          setNextSongToHighlight(null);
        }
        // Switch to next song at end
        if (duration > 0 && time >= duration && songList.length > 1) {
          if (idx < songList.length - 1) {
            setSelectedSong(songList[idx + 1]);
          }
        }
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, playerRef.current, selectedSong, songList, volume, setSelectedSong]);

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    event.target.playVideo();
    setIsPlaying(true);
    // Set total duration
    const duration = event.target.getDuration?.() || 0;
    setTotalDuration(duration);
  };


  // Extract YouTube video ID (declare only once, above all uses)
  const getVideoId = (url?: string) => {
    if (!url) return "";
    if (url.includes("youtube.com")) {
      return url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("youtu.be")) {
      return url.split("/").pop() || "";
    }
    return "";
  };
  const videoId = useMemo(() => getVideoId(selectedSong?.url), [selectedSong?.url]);

  // When video changes, update total duration
  React.useEffect(() => {
    if (playerRef.current) {
      const duration = playerRef.current.getDuration?.() || 0;
      setTotalDuration(duration);
    }
  }, [videoId]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const thumbUrl = useMemo(() => {
    if (!videoId) return "";
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }, [videoId]);

  // Handler for seeking in the video
  const handleSeek = (event: Event, value: number | number[]) => {
    if (!playerRef.current) return;
    const seekTo = Array.isArray(value) ? value[0] : value;
    playerRef.current.seekTo(seekTo, true);
    setCurrentTime(seekTo);
  };

  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        left: 0,
        width: "100vw",
        zIndex: 1200,
        background: isDarkMode ? "#333" : "#024803",
        borderTop: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "flex-start" : "center",
        alignItems: isMobile ? "stretch" : "center",
        px: 2,
        py: 1,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
        gap: 2,
      }}
    >
      {/* Volume always left, vertical, on left of thumbnails (desktop only) */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: isMobile ? '100%' : '40%' }}>
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Slider
              orientation="vertical"
              min={0}
              max={100}
              value={volume}
              onChange={(_, value) => setVolume(Array.isArray(value) ? value[0] : value)}
              sx={{
                height: 64,
                color: '#1976d2',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#1976d2',
                  border: '2px solid #fff',
                },
                ml: 1,
              }}
            />
            <span style={{ fontSize: 12, color: '#1976d2', marginTop: 4 }}>{volume}</span>
          </div>
        )}
        {/* Player controls and info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {videoId && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: isMobile ? '100%' : undefined }}>
                {thumbUrl && (
                  <img
                    src={thumbUrl}
                    alt={selectedSong?.title || "thumbnail"}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", marginRight: 8 }}
                  />
                )}
                <IconButton onClick={handlePrevSong} color="primary" disabled={getCurrentSongIndex() <= 0}>
                  <SkipPreviousIcon />
                </IconButton>
                <IconButton onClick={handlePlayPause} color="primary">
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={handleNextSong} color="primary" disabled={getCurrentSongIndex() === songList.length - 1 || songList.length === 0}>
                  <SkipNextIcon />
                </IconButton>
              </div>
              {/* Main YouTube player (current song) */}
              <YouTube
                videoId={videoId}
                opts={{
                  width: "0.1",
                  height: "0.1",
                  playerVars: { controls: 0, modestbranding: 1, autoplay: 1 },
                }}
                onReady={onPlayerReady}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onEnd={handleNextSong}
                style={{ display: "none" }}
                iframeClassName="yt-hidden-iframe"
              />
              <style>{`.yt-hidden-iframe { display: none !important; }`}</style>
              <div style={{ marginTop: 4, color: isDarkMode ? "#fff" : "#222", textAlign: "center", fontWeight: 600, fontSize: "1.1rem" }}>
                {selectedSong?.title || ""}
                {((selectedSong as Song)?.duration || totalDuration) && (
                  <span style={{ fontWeight: 400, fontSize: "1rem", color: isDarkMode ? "#bbb" : "#333", marginLeft: 8 }}>
                    ({
                      typeof (selectedSong as Song)?.duration === 'string' && (selectedSong as Song).duration
                        ? (selectedSong as Song).duration
                        : (totalDuration ? formatTime(totalDuration) : "")
                    })
                  </span>
                )}
                {selectedSong?.artist && (
                  <span style={{ fontWeight: 400, fontSize: "0.95rem", color: isDarkMode ? "#bbb" : "#333", display: "block" }}>
                    {selectedSong.artist}
                  </span>
                )}
                {/* Song location display and progress bar */}
                {(1 === 1) && (
                  <div style={{ marginTop: 8, width: 240, marginLeft: "auto", marginRight: "auto" }}>
                    {/* Main player time slider */}
                    <Slider
                      min={0}
                      max={totalDuration || 1}
                      value={typeof currentTime === 'number' && !isNaN(currentTime) ? Math.min(currentTime, totalDuration || 1) : 0}
                      onChange={handleSeek}
                      step={1}
                      size="small"
                      sx={{ color: isDarkMode ? "#1db954" : "#024803" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: isDarkMode ? "#bbb" : "#333" }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{typeof (selectedSong as Song | undefined)?.duration === 'string' && (selectedSong as Song).duration
                        ? (selectedSong as Song).duration
                        : (totalDuration ? formatTime(totalDuration) : "")}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* Song list: on mobile, show under player controls; on desktop, show to the right */}
          {songList.length > 0 && (
            <div style={{
              width: isMobile ? "100%" : "100%",
              maxHeight: 4 * 32 + 8,
              overflowY: songList.length > 4 ? "auto" : "visible",
              borderRadius: 8,
              background: "transparent",
              marginTop: isMobile ? 12 : 0
            }}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSongDragEnd}>
                <SortableContext items={songList.map((_: any, i: number) => i.toString())} strategy={verticalListSortingStrategy}>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent" }}>
                    <tbody>
                      {songList.map((song, idx) => (
                        <SortableSongRow
                          key={idx}
                          song={song}
                          idx={idx}
                          isSelected={
                            selectedSong && song.title === selectedSong.title && song.artist === selectedSong.artist
                          }
                          isNextSelected={
                            nextSongToHighlight && song.title === nextSongToHighlight.title && song.artist === nextSongToHighlight.artist
                          }
                          onClick={() => {
                            // Play and select the clicked song
                            if (idx !== currentSongIndex) {
                              setIsPlaying(false);
                              setTimeout(() => {
                                setIsPlaying(true);
                              }, 100);
                            }
                            // Update selectedSong and currentSongIndex if possible
                            if (typeof window !== 'undefined') {
                              // Try to update via navigation (simulate selection)
                              if (song.title) {
                                // Try to find genre if available
                                let genre = (selectedSong && (selectedSong as any).genre) || '';
                                setSelectedSong({
                                  title: song.title,
                                  artist: song.artist,
                                  url: song.url,
                                  duration: song.duration,
                                  genre: genre
                                });
                              }
                            }
                          }}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </tbody>
                  </table>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>
      {/* ThemeModeButton: only show on desktop */}
      {!isMobile && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      )}
    </Box>
  );
}