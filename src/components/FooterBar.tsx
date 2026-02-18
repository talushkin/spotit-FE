
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


  // ...existing code...
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
  // Audio refs for karaoke and vocals
  const karaokeAudioRef = useRef<HTMLAudioElement | null>(null);
  const vocalsAudioRef = useRef<HTMLAudioElement | null>(null);

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
  const [isKaraokeLoading, setIsKaraokeLoading] = useState(false);
  const [showKaraokeToast, setShowKaraokeToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Set karaokeReady to true if the selectedSong has kar property true (for default song)
  const [karaokeReady, setKaraokeReady] = useState(() => {
    if (props.selectedSong && (props.selectedSong.kar === true || props.selectedSong.vocals === true)) {
      return true;
    }
    return false;
  });

  // Ensure karaokeReady is true if selectedSong changes to a song with kar or vocals true
  useEffect(() => {
    if (selectedSong && (selectedSong.kar === true || selectedSong.vocals === true)) {
      setKaraokeReady(true);
    }
  }, [selectedSong]);
  const [karaokeMode, setKaraokeMode] = useState<"mic" | "speaker" | "profile">("mic");
  const [activeKaraokeRowIndex, setActiveKaraokeRowIndex] = useState<number | null>(null);
  const [karaokeReadyKeys, setKaraokeReadyKeys] = useState<Set<string>>(new Set());
  const [pendingKaraokeRowIndex, setPendingKaraokeRowIndex] = useState<number | null>(null);
  const pendingKaraokeRowRef = useRef<number | null>(null);
  const karaokeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const karaokeToastRef = useRef<NodeJS.Timeout | null>(null);
  const playDelayRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnimationRef = useRef<number | null>(null);
  const pendingAutoPlayRef = useRef(false);
  // Lyrics/Genius state removed
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

  useEffect(() => {
    pendingKaraokeRowRef.current = pendingKaraokeRowIndex;
  }, [pendingKaraokeRowIndex]);

  useEffect(() => {
    return () => {
      if (karaokeTimerRef.current) clearTimeout(karaokeTimerRef.current);
      if (karaokeToastRef.current) clearTimeout(karaokeToastRef.current);
      if (playDelayRef.current) clearTimeout(playDelayRef.current);
      if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);
    };
  }, []);

  // Lyrics/Genius effect removed

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
  
  const getSongKey = (song?: Song | null) => {
    if (!song) return "";
    return `${song.title || ""}::${song.artist || ""}`;
  };

  const startKaraokeForIndex = (targetIndex: number) => {
    const targetSong = songList[targetIndex] || selectedSong || null;
    const targetKey = getSongKey(targetSong);
    if (!targetKey || karaokeReadyKeys.has(targetKey)) return;

    setActiveKaraokeRowIndex(targetIndex >= 0 ? targetIndex : null);
    setIsKaraokeLoading(true);
    setShowKaraokeToast(true);
    setToastMessage("creating kareoke");
    setKaraokeReady(false);

    if (karaokeTimerRef.current) clearTimeout(karaokeTimerRef.current);
    if (karaokeToastRef.current) clearTimeout(karaokeToastRef.current);

    karaokeTimerRef.current = setTimeout(() => {
      const readySong = songList[targetIndex] || selectedSong || null;
      const readyKey = getSongKey(readySong);
      if (readyKey) {
        setKaraokeReadyKeys((prev) => {
          const next = new Set(prev);
          next.add(readyKey);
          return next;
        });
      }

      setIsKaraokeLoading(false);
      setKaraokeReady(true);
      setToastMessage("kareoke created!");
      setShowKaraokeToast(true);
      karaokeToastRef.current = setTimeout(() => {
        setShowKaraokeToast(false);
        setToastMessage(null);
      }, 2000);

      const pendingIndex = pendingKaraokeRowRef.current;
      if (typeof pendingIndex === "number") {
        setPendingKaraokeRowIndex(null);
        startKaraokeForIndex(pendingIndex);
      }
    }, 2000);
  };

  const handleKaraokeGenerate = (rowIndex?: number) => {
    const currentIndex = getCurrentSongIndex();
    const targetIndex = typeof rowIndex === "number" ? rowIndex : currentIndex;
    const targetSong = songList[targetIndex] || selectedSong || null;
    const targetKey = getSongKey(targetSong);
    if (targetKey && karaokeReadyKeys.has(targetKey)) return;

    if (isKaraokeLoading) {
      if (typeof targetIndex === "number") {
        setPendingKaraokeRowIndex(targetIndex);
      }
      return;
    }

    startKaraokeForIndex(targetIndex);
  };

  const getModeTargets = (mode: "mic" | "speaker" | "profile") => {
    if (mode === "mic") return { yt: 100, kar: 0, voc: 0 };
    if (mode === "speaker") return { yt: 0, kar: 1, voc: 0 };
    return { yt: 0, kar: 0, voc: 1 };
  };

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
  const clamp100 = (value: number) => Math.max(0, Math.min(100, value));

  const setModeVolumesInstant = (mode: "mic" | "speaker" | "profile") => {
    const yt = playerRef.current;
    const kar = karaokeAudioRef.current;
    const voc = vocalsAudioRef.current;
    const target = getModeTargets(mode);
    if (yt) yt.setVolume(clamp100(target.yt));
    if (kar) kar.volume = clamp01(target.kar);
    if (voc) voc.volume = clamp01(target.voc);
  };

  const fadeToMode = (mode: "mic" | "speaker" | "profile", duration = 220) => {
    const yt = playerRef.current;
    const kar = karaokeAudioRef.current;
    const voc = vocalsAudioRef.current;
    if (!yt && !kar && !voc) return;

    if (fadeAnimationRef.current) cancelAnimationFrame(fadeAnimationRef.current);

    const target = getModeTargets(mode);
    const fromYt = clamp100(yt?.getVolume?.() ?? 0);
    const fromKar = clamp01(kar?.volume ?? 0);
    const fromVoc = clamp01(voc?.volume ?? 0);
    const start = performance.now();

    const tick = (now: number) => {
      const rawT = (now - start) / duration;
      const t = Math.max(0, Math.min(rawT, 1));
      if (yt) yt.setVolume(clamp100(Math.round(fromYt + (target.yt - fromYt) * t)));
      if (kar) kar.volume = clamp01(fromKar + (target.kar - fromKar) * t);
      if (voc) voc.volume = clamp01(fromVoc + (target.voc - fromVoc) * t);

      if (t < 1) {
        fadeAnimationRef.current = requestAnimationFrame(tick);
      } else {
        fadeAnimationRef.current = null;
      }
    };

    fadeAnimationRef.current = requestAnimationFrame(tick);
  };

  const syncAudioToYouTube = () => {
    const yt = playerRef.current;
    if (!yt) return;
    const ytTime = yt.getCurrentTime?.() || 0;
    const threshold = 0.12;
    const kar = karaokeAudioRef.current;
    const voc = vocalsAudioRef.current;

    if (kar) {
      if (Math.abs((kar.currentTime || 0) - ytTime) > threshold) {
        kar.currentTime = ytTime;
      }
      if (kar.paused) kar.play().catch(() => {});
    }

    if (voc) {
      if (Math.abs((voc.currentTime || 0) - ytTime) > threshold) {
        voc.currentTime = ytTime;
      }
      if (voc.paused) voc.play().catch(() => {});
    }
  };

  const ensureAuxTracksPlaying = () => {
    if (!isPlaying) return;
    const yt = playerRef.current;
    if (!yt) return;
    const ytTime = yt.getCurrentTime?.() || 0;
    const threshold = 0.12;

    const kar = karaokeAudioRef.current;
    if (kar) {
      if (Math.abs((kar.currentTime || 0) - ytTime) > threshold) {
        kar.currentTime = ytTime;
      }
      if (kar.paused) {
        kar.play().catch(() => {});
      }
    }

    const voc = vocalsAudioRef.current;
    if (voc) {
      if (Math.abs((voc.currentTime || 0) - ytTime) > threshold) {
        voc.currentTime = ytTime;
      }
      if (voc.paused) {
        voc.play().catch(() => {});
      }
    }
  };

  const handleKaraokeModeToggle = () => {
    let nextMode: "mic" | "speaker" | "profile" = karaokeMode;
    if (karaokeMode === "mic") nextMode = "speaker";
    else if (karaokeMode === "speaker") nextMode = "profile";
    else nextMode = "mic";
    setKaraokeMode(nextMode);

    if (playerRef.current) {
      if (!isPlaying) {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
      syncAudioToYouTube();
      fadeToMode(nextMode);
    } else {
      pendingAutoPlayRef.current = true;
    }
  };
  // Language support removed: only English

  // (removed duplicate declarations)

  const handlePlayPause = () => {
    const yt = playerRef.current;
    const kar = karaokeAudioRef.current;
    const voc = vocalsAudioRef.current;
    if (!yt) {
      pendingAutoPlayRef.current = true;
      return;
    }
    if (isPlaying) {
      yt.pauseVideo();
      if (kar) kar.pause();
      if (voc) voc.pause();
      setIsPlaying(false);
    } else {
      if (yt) yt.setVolume(0);
      if (kar) kar.volume = 0;
      if (voc) voc.volume = 0;
      yt.playVideo();
      syncAudioToYouTube();
      fadeToMode(karaokeMode);
      setIsPlaying(true);
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
        const kar = karaokeAudioRef.current;
        const voc = vocalsAudioRef.current;
        if (kar && Math.abs((kar.currentTime || 0) - time) > 0.12) {
          kar.currentTime = time;
        }
        if (voc && Math.abs((voc.currentTime || 0) - time) > 0.12) {
          voc.currentTime = time;
        }
        ensureAuxTracksPlaying();
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
    setModeVolumesInstant(karaokeMode);
    if (pendingAutoPlayRef.current) {
      if (playDelayRef.current) clearTimeout(playDelayRef.current);
      playDelayRef.current = setTimeout(() => {
        event.target.playVideo();
        syncAudioToYouTube();
        fadeToMode(karaokeMode);
        setIsPlaying(true);
        pendingAutoPlayRef.current = false;
      }, 500);
    }
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
    if (pendingAutoPlayRef.current && playerRef.current) {
      if (playDelayRef.current) clearTimeout(playDelayRef.current);
      playDelayRef.current = setTimeout(() => {
        playerRef.current?.playVideo();
        syncAudioToYouTube();
        fadeToMode(karaokeMode);
        setIsPlaying(true);
        pendingAutoPlayRef.current = false;
      }, 500);
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
    const seekTo = Array.isArray(value) ? value[0] : value;
    if (playerRef.current) playerRef.current.seekTo(seekTo, true);
    if (karaokeAudioRef.current) karaokeAudioRef.current.currentTime = seekTo;
    if (vocalsAudioRef.current) vocalsAudioRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const handleSongTitleSelect = (song: Song) => {
    setSelectedSong(song);
    setIsPlaying(false);
    pendingAutoPlayRef.current = true;
  };


  // Compose audio URLs using existing videoId (public path, not src/)
  const karaokeUrl = videoId ? `/data/cache/${videoId}_karaoke.mp3` : undefined;
  const vocalsUrl = videoId ? `/data/cache/${videoId}_vocals.mp3` : undefined;

  // Audio error state
  const [karaokeAudioError, setKaraokeAudioError] = useState(false);
  const [vocalsAudioError, setVocalsAudioError] = useState(false);

  useEffect(() => {
    setModeVolumesInstant(karaokeMode);
  }, [karaokeMode, karaokeUrl, vocalsUrl]);

  useEffect(() => {
    setKaraokeAudioError(false);
  }, [karaokeUrl]);

  useEffect(() => {
    setVocalsAudioError(false);
  }, [vocalsUrl]);

  // Karaoke waveform feedback
  const [karaokeLevel, setKaraokeLevel] = useState(0);
  const karaokeMeterRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!karaokeAudioRef.current) return;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    let rafId: number;
    const audio = karaokeAudioRef.current;
    const setup = () => {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 32;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const draw = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(data);
          // Use max value as level (convert Uint8Array to Array for Math.max)
          const level = Math.max.apply(null, Array.from(data)) / 255;
          setKaraokeLevel(level);
          // Draw bar
          const canvas = karaokeMeterRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#4caf50';
              ctx.fillRect(0, 0, canvas.width * level, canvas.height);
            }
          }
          rafId = requestAnimationFrame(draw);
        };
        draw();
      } catch {}
    };
    audio.addEventListener('play', setup);
    if (!audio.paused) setup();
    return () => {
      audio.removeEventListener('play', setup);
      if (audioCtx) audioCtx.close();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [karaokeUrl, karaokeAudioError]);

  return (
    <>
      {/* Hidden audio elements for karaoke and vocals, only if file is found */}
      {karaokeUrl && !karaokeAudioError && (
        <audio
          ref={karaokeAudioRef}
          src={karaokeUrl}
          preload="auto"
          onCanPlay={() => {
            setModeVolumesInstant(karaokeMode);
            ensureAuxTracksPlaying();
          }}
          onError={() => setKaraokeAudioError(true)}
        />
      )}
      {/* Karaoke waveform meter moved to FooterControlPanel */}
      {/* Song thumbnail moved to FooterControlPanel */}
      {vocalsUrl && !vocalsAudioError && (
        <audio
          ref={vocalsAudioRef}
          src={vocalsUrl}
          preload="auto"
          onCanPlay={() => {
            setModeVolumesInstant(karaokeMode);
            ensureAuxTracksPlaying();
          }}
          onError={() => setVocalsAudioError(true)}
        />
      )}
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
          isKaraokeLoading={isKaraokeLoading}
          showKaraokeToast={showKaraokeToast}
          toastMessage={toastMessage}
          karaokeReady={karaokeReady}
          karaokeMode={karaokeMode}
          isCurrentKaraokeReady={karaokeReadyKeys.has(getSongKey(selectedSong as Song))}
          onKaraokeGenerate={() => handleKaraokeGenerate()}
          onKaraokeModeToggle={handleKaraokeModeToggle}
          karaokeAudioRef={karaokeAudioRef}
          karaokeMeterRef={karaokeMeterRef}
        />
        {/* ThemeModeButton: only show on desktop at far right */}
      </Box>
      <FooterSongTable
        isMobile={isMobile}
        songList={songList}
        setSongList={setSongList}
        sensors={sensors}
        handleSongDragEnd={handleSongDragEnd}
        SortableSongRow={SortableSongRow}
        selectedSong={selectedSong}
        nextSongToHighlight={nextSongToHighlight}
        currentSongIndex={currentSongIndex}
        onSongTitleSelect={handleSongTitleSelect}
        setSelectedSong={setSelectedSong}
        isDarkMode={isDarkMode}
        isKaraokeLoading={isKaraokeLoading}
        activeKaraokeRowIndex={activeKaraokeRowIndex}
        karaokeReadyKeys={karaokeReadyKeys}
        pendingKaraokeRowIndex={pendingKaraokeRowIndex}
        onKaraokeGenerate={handleKaraokeGenerate}
      />

      {/* ThemeModeButton: only show on desktop at far right */}
      {!isMobile && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      )}
    </Box>
    </>
  );
};

export default FooterBar;