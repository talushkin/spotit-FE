import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setVolume } from "../store/dataSlice";
import {
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter
} from "@dnd-kit/core";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, IconButton, Slider } from "@mui/material";
// LanguageSelector removed: only English
import ThemeModeButton from "./ThemeModeButton";
import FooterControlPanel from "./FooterControlPanel";
import FooterSongTable from "./FooterSongTable";

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
  // Add prop for hidden state
  hidden?: boolean;
  onShowFooter?: () => void;
}




// SortableSongRow is now exported for use in FooterSongTable
export const SortableSongRow = ({ song, idx, isSelected, isNextSelected, onClick, isDarkMode }: any) => {
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
  // Scrolling logic for long titles with pause at end
  const [scrollIndex, setScrollIndex] = useState(0);
  const [pauseAtEnd, setPauseAtEnd] = useState(false);
  const shouldScroll = song.title && song.title.length > 30;
  React.useEffect(() => {
    if (!shouldScroll || !isSelected) {
      setScrollIndex(0);
      setPauseAtEnd(false);
      return;
    }
    let interval: NodeJS.Timeout | null = null;
    let pauseTimeout: NodeJS.Timeout | null = null;
    const maxScroll = song.title.length - 30;
    if (pauseAtEnd) {
      pauseTimeout = setTimeout(() => {
        setScrollIndex(0);
        setPauseAtEnd(false);
      }, 3000); // 3 sec pause at end
    } else {
      interval = setInterval(() => {
        setScrollIndex((prev: number) => {
          if (prev >= maxScroll) {
            setPauseAtEnd(true);
            return prev;
          }
          return prev + 1;
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [shouldScroll, isSelected, song.title, pauseAtEnd]);

  let displayTitle = song.title;
  if (shouldScroll && isSelected) {
    displayTitle = song.title.slice(scrollIndex, scrollIndex + 30);
    if (scrollIndex >= song.title.length - 30) {
      // show full end of title, then pause
      displayTitle = song.title.slice(song.title.length - 30);
    }
  } else if (shouldScroll) {
    displayTitle = song.title.slice(0, 30) + '...';
  }

  // Only return a <tr> if used inside a <table>, otherwise return a <div>
  // This fixes the JSX parse error if used outside a table context
  // Always return a <div> to avoid JSX parse errors in non-table context
  return (
    <div
      ref={setNodeRef as any}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...attributes}
      {...listeners}
    >
      <span style={{ width: 32, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {hovered ? <PlayArrowIcon fontSize="small" style={{ verticalAlign: "middle", color: isDarkMode ? "#90caf9" : "#1976d2" }} /> : idx + 1}
      </span>
      <span style={{ padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#fff" : "#222"), fontWeight: isSelected ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", maxWidth: 180, display: "inline-flex", alignItems: "center", gap: 4 }}>
        {displayTitle}
      </span>
      <span style={{ width: 60, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400, marginRight: 30 }}>
        {song.duration || ""}
      </span>

    </div>
  );
};


const FooterBar = (props: any) => {
  // Destructure props and fallback for legacy prop names
  const {
    isDarkMode,
    toggleDarkMode,
    selectedSong,
    setSelectedSong,
    onPrevSong,
    onNextSong,
    songList: propSongList = [],
    setSongList: setAppSongList,
    currentSongIndex,
    hidden,
    onShowFooter
  } = props;

  const isMobile = useIsMobile();
  const [nextSongToHighlight, setNextSongToHighlight] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const dispatch = useDispatch();
  const volume = useSelector((state: any) => state.data.volume ?? 50);
  const setVolumeGlobal = (v: number) => dispatch(setVolume(v));
  const [songList, setSongList] = useState<Song[]>(propSongList);
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);
  useEffect(() => {
    setSongList(propSongList);
  }, [propSongList]);

  // Keep propSongList in sync with reordered songList
  useEffect(() => {
    if (typeof setAppSongList === 'function' && songList !== propSongList) {
      setAppSongList(songList);
    }
  }, [songList]);
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
      console.log('Next song:', nextSong);
      setSelectedSong(nextSong);
      setCurrentTime(0);
      // setTimeout(() => {
      //   if (playerRef.current) {
      //     playerRef.current.seekTo(0, true);
      //     const duration = playerRef.current.getDuration?.() || 0;
      //     setTotalDuration(duration);
      //   }
      //   setIsPlaying(true);
      // }, 200);
    }
  };

  const handlePrevSong = () => {
    const idx = getCurrentSongIndex();
    if (idx > 0) {
      const prevSong = songList[idx - 1];
      setSelectedSong(prevSong);
      setCurrentTime(0);
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(0, true);
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
      }, 500);
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
        position: "fixed",
        left: 0,
        width: "100vw",
        zIndex: 1200,
        background: isDarkMode ? "#333" : "#024803",
        borderTop: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: isMobile ? "center" : "center",
        alignItems: isMobile ? "center" : "center",
        px: 2,
        py: 1,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
        gap: 2,
        bottom: 0,
        transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
        transform: isMobile && hidden ? 'translateY(calc(100% - 115px))' : 'translateY(0)',
        pointerEvents: isMobile && hidden ? 'auto' : undefined,
        cursor: isMobile && hidden ? 'pointer' : undefined,
      }}
      onClick={isMobile && hidden && onShowFooter ? ((e: React.MouseEvent<HTMLDivElement>) => { e.stopPropagation(); onShowFooter(); }) : undefined}
    >
      {/* Desktop: Controls left (30%), Songlist right (60%) */}
      {/* Controls and theme button: group for mobile */}
      <Box
        sx={{
          display: isMobile ? 'flex' : 'block',
          flexDirection: isMobile ? 'row' : undefined,
          alignItems: isMobile ? 'center' : undefined,
          justifyContent: isMobile ? 'center' : undefined,
          width: isMobile ? '100%' : undefined,
          position: 'relative',
        }}
      >
        <FooterControlPanel
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          videoId={videoId}
          thumbUrl={thumbUrl}
          selectedSong={selectedSong as Song}
          isPlaying={isPlaying}
          handlePrevSong={handlePrevSong}
          handlePlayPause={handlePlayPause}
          handleNextSong={handleNextSong}
          getCurrentSongIndex={getCurrentSongIndex}
          songList={songList}
          playerRef={playerRef}
          onPlayerReady={onPlayerReady}
          totalDuration={totalDuration}
          currentTime={currentTime}
          handleSeek={handleSeek}
          formatTime={formatTime}
          setVolume={setVolumeGlobal}
          volume={volume}
        />
        {/* ThemeModeButton: only show on desktop at far right */}
      </Box>
      <FooterSongTable
        isMobile={isMobile}
        songList={songList}
        sensors={sensors}
        handleSongDragEnd={handleSongDragEnd}
        SortableSongRow={SortableSongRow}
        selectedSong={selectedSong as Song}
        nextSongToHighlight={nextSongToHighlight}
        currentSongIndex={currentSongIndex}
        setIsPlaying={setIsPlaying}
        setSelectedSong={setSelectedSong}
        isDarkMode={isDarkMode}
      />
      {/* ThemeModeButton: only show on desktop at far right */}
      {!isMobile && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      )}
    </Box>
  );
};

export default FooterBar;