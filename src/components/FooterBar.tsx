import React, { useRef, useState } from "react";
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
import { Box, IconButton } from "@mui/material";
import LanguageSelector from "./LanguageSelector";
import ThemeModeButton from "./ThemeModeButton";
import YouTube, { YouTubePlayer } from "react-youtube";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";

interface FooterBarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  i18n: any;
  selectedRecipe?: { url?: string; title?: string; artist?: string };
  onPrevSong?: () => void;
  onNextSong?: () => void;
}

// Accept a prop for the song list (recipes) and the current index for highlighting
interface Song {
  title: string;
  duration?: string;
  artist?: string;
}

interface FooterBarExtendedProps extends FooterBarProps {
  songList?: Song[];
  currentSongIndex?: number;
}


function SortableSongRow({ song, idx, isSelected, onClick, isDarkMode }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: idx.toString() });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isSelected ? (isDarkMode ? "#444" : "#e0ffe0") : "transparent",
    cursor: "grab"
  };
  // Scrolling logic for long titles
  const [scrollIndex, setScrollIndex] = React.useState(0);
  const shouldScroll = song.title && song.title.length > 30;
  React.useEffect(() => {
    if (!shouldScroll || !isSelected) {
      setScrollIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % (song.title.length - 29));
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
      {...attributes}
      {...listeners}
    >
      <td style={{ width: 32, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {idx + 1}
      </td>
      <td style={{ padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#fff" : "#222"), fontWeight: isSelected ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", maxWidth: 180 }}>
        {displayTitle}
      </td>
      <td style={{ width: 60, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {song.duration || ""}
      </td>
    </tr>
  );
}

export default function FooterBar({ isDarkMode, toggleDarkMode, language, i18n, selectedRecipe, onPrevSong, onNextSong, songList: propSongList = [], currentSongIndex = 0 }: FooterBarExtendedProps) {
  // State to keep track of played songs
  const [songList, setSongList] = useState<Song[]>(propSongList);
  // Handler for language change
  // DnD-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Handle drag end for song list
  const handleSongDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = songList.findIndex((_, i) => i.toString() === active.id);
    const newIndex = songList.findIndex((_, i) => i.toString() === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setSongList((prev) => arrayMove(prev, oldIndex, newIndex));
  };
  const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newLang = event.target.value as string;
    i18n.changeLanguage(newLang);
  };

  // YouTube player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const addSongToList = (song?: { title?: string; duration?: string; artist?: string }) => {
    if (!song || !song.title) return;
    // Ensure title is string
    const safeSong: Song = {
      title: song.title || "",
      duration: song.duration,
      artist: song.artist,
    };
    setSongList((prev) => {
      if (prev.some((s) => s.title === safeSong.title && s.artist === safeSong.artist)) return prev;
      return [...prev, safeSong];
    });
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      // Add to song list when play is pressed
      addSongToList(selectedRecipe);
    }
  };

  // Update current time every second when playing
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const time = playerRef.current?.getCurrentTime?.() || 0;
        setCurrentTime(time);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    event.target.setVolume(100);
    event.target.playVideo();
    setIsPlaying(true);
    // Add to song list when player is ready (autoplay)
    addSongToList(selectedRecipe);
    // Set total duration
    const duration = event.target.getDuration?.() || 0;
    setTotalDuration(duration);
  };

  // Extract YouTube video ID (declare only once, above all uses)
  const videoId = React.useMemo(() => {
    if (!selectedRecipe?.url) return "";
    if (selectedRecipe.url.includes("youtube.com")) {
      return selectedRecipe.url.split("v=")[1]?.split("&")[0] || "";
    } else if (selectedRecipe.url.includes("youtu.be")) {
      return selectedRecipe.url.split("/").pop() || "";
    }
    return "";
  }, [selectedRecipe?.url]);

  // When video changes, update total duration
  React.useEffect(() => {
    if (playerRef.current) {
      const duration = playerRef.current.getDuration?.() || 0;
      setTotalDuration(duration);
    }
    setCurrentTime(0);
  }, [videoId]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const thumbUrl = React.useMemo(() => {
    if (!videoId) return "";
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }, [videoId]);

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
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 1,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
        gap: 2,
      }}
    >
      <div style={{ width: "30%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {videoId && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {thumbUrl && (
                <img
                  src={thumbUrl}
                  alt={selectedRecipe?.title || "thumbnail"}
                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", marginRight: 8 }}
                />
              )}
              <IconButton onClick={onPrevSong} color="primary" disabled={!onPrevSong}>
                <SkipPreviousIcon />
              </IconButton>
              <IconButton onClick={handlePlayPause} color="primary">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={onNextSong} color="primary" disabled={!onNextSong}>
                <SkipNextIcon />
              </IconButton>
            </div>
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
              style={{ display: "none" }}
              iframeClassName="yt-hidden-iframe"
            />
            <style>{`.yt-hidden-iframe { display: none !important; }`}</style>
            <div style={{ marginTop: 4, color: isDarkMode ? "#fff" : "#222", textAlign: "center", fontWeight: 600, fontSize: "1.1rem" }}>
              {selectedRecipe?.title || ""}
              {selectedRecipe?.artist && (
                <span style={{ fontWeight: 400, fontSize: "0.95rem", color: isDarkMode ? "#bbb" : "#333", display: "block" }}>
                  {selectedRecipe.artist}
                </span>
              )}
              {/* Song location display */}
              {(isPlaying || currentTime > 0) && (
                <span style={{ fontWeight: 400, fontSize: "0.95rem", color: isDarkMode ? "#bbb" : "#333", display: "block" }}>
                  {formatTime(currentTime)}
                  {" / "}
                  {typeof (selectedRecipe as Song | undefined)?.duration === 'string' && (selectedRecipe as Song).duration
                    ? (selectedRecipe as Song).duration
                    : (totalDuration ? formatTime(totalDuration) : "")}
                </span>
              )}
            </div>
          </>
        )}
      </div>
      <div style={{ width: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        {songList.length > 0 && (
          <div style={{
            width: "100%",
            maxHeight: 4 * 32 + 8, // 4 rows * row height + some padding
            overflowY: songList.length > 4 ? "auto" : "visible",
            borderRadius: 8,
            background: "transparent"
          }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSongDragEnd}>
              <SortableContext items={songList.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent" }}>
                  <tbody>
                    {songList.map((song, idx) => (
                      <SortableSongRow
                        key={idx}
                        song={song}
                        idx={idx}
                        isSelected={idx === currentSongIndex}
                        onClick={() => {
                          // Play and select the clicked song
                          if (idx !== currentSongIndex) {
                            setIsPlaying(false);
                            setTimeout(() => {
                              setIsPlaying(true);
                            }, 100);
                          }
                          // Update selectedRecipe and currentSongIndex if possible
                          if (typeof window !== 'undefined') {
                            // Try to update via navigation (simulate selection)
                            if (song.title) {
                              // Try to find category if available
                              let category = (selectedRecipe && (selectedRecipe as any).category) || '';
                              if (category && song.title) {
                                const url = `/spotit/${encodeURIComponent(category)}/${encodeURIComponent(song.title)}`;
                                window.location.href = url;
                              }
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
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </Box>
  );
}