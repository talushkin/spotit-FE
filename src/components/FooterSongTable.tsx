import React, { useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Song } from "../utils/storage";
import { IconButton } from "@mui/material";
import YouTube from "react-youtube";

interface FooterSongTableProps {
  isMobile: boolean;
  songList: Song[];
  setSongList: (songs: Song[]) => void;
  sensors: any;
  handleSongDragEnd: (event: any) => void;
  SortableSongRow: React.FC<any>;
  selectedSong: Song | undefined;
  nextSongToHighlight: Song | null;
  currentSongIndex: number;
  setSelectedSong: (song: Song | null) => void;
  onSongTitleSelect: (song: Song) => void;
  isDarkMode: boolean;
  isKaraokeLoading: boolean;
  activeKaraokeRowIndex: number | null;
  karaokeReadyKeys: Set<string>;
  pendingKaraokeRowIndex: number | null;
  onKaraokeGenerate: (rowIndex: number) => void;
}


// SongTableRow: Draggable, hoverable, with play icon and drag support
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import CachedIcon from "@mui/icons-material/Cached";

interface SongTableRowProps {
  song: Song;
  idx: number;
  isSelected: boolean;
  isNextSelected: boolean;
  isDarkMode: boolean;
  hoveredRow: number | null;
  setHoveredRow: (idx: number | null) => void;
  onClick: () => void;
  onRemoveSong: (idx: number) => void;
  isKaraokeActive: boolean;
  isKaraokeReady: boolean;
  isKaraokePending: boolean;
  onKaraokeClick: () => void;
  resolvedDuration?: string;
}

function SongTableRow({
  song,
  idx,
  isSelected,
  isNextSelected,
  isDarkMode,
  hoveredRow,
  setHoveredRow,
  onClick,
  onRemoveSong,
  isKaraokeActive,
  isKaraokeReady,
  isKaraokePending,
  onKaraokeClick,
  resolvedDuration,
}: SongTableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idx.toString() });
  const style = {
    cursor: isDragging ? "grabbing" : "grab",
    background:
      isSelected
        ? '#000'
        : isNextSelected
          ? (isDarkMode ? '#222b44' : '#e3f2fd')
          : hoveredRow === idx
            ? (isDarkMode ? "#222" : "#f0f0f0")
            : "transparent",
    transition: "background 0.2s",
    ...(transform ? { transform: CSS.Transform.toString(transform) } : {}),
    ...(transition ? { transition } : {}),
    opacity: isDragging ? 0.7 : 1,
  };
  // Prevent play on drag: only play if not dragging
  const [mouseDown, setMouseDown] = useState(false);
  const [dragged, setDragged] = useState(false);
  const karaokeColor = isKaraokeReady
    ? (isDarkMode ? "#90caf9" : "#1976d2")
    : (isDarkMode ? "#bbb" : "#444");

  const karaokeAnimation = isKaraokeActive
    ? "karaokeSpin 1s linear infinite"
    : isKaraokePending
      ? "karaokeBlink 1.6s ease-in-out infinite"
      : undefined;

  return (
    <tr
      ref={setNodeRef}
      style={{
        ...style,
        scrollSnapAlign: "start",
        scrollSnapStop: "normal"
      }}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHoveredRow(idx)}
      onMouseLeave={() => setHoveredRow(null)}
      onMouseDown={() => { setMouseDown(true); setDragged(false); }}
      onMouseUp={() => { setMouseDown(false); setDragged(false); }}
      onMouseMove={() => { if (mouseDown) setDragged(true); }}
    >
      <td style={{ width: 30, minWidth: 26, maxWidth: 34, height: 30, textAlign: "center", padding: "2px 0px" }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onKaraokeClick();
          }}
          disabled={isKaraokeReady}
          sx={{
            color: karaokeColor,
            padding: "2px",
            width: 24,
            height: 24,
            opacity: isKaraokeReady ? 1 : undefined,
            "&.Mui-disabled": { color: karaokeColor },
          }}
        >
          {isKaraokeActive ? (
            <CachedIcon sx={{ animation: karaokeAnimation, fontSize: 18 }} />
          ) : (
            <PersonIcon sx={{ animation: karaokeAnimation, fontSize: 18 }} />
          )}
        </IconButton>
      </td>
      <td style={{ width: 22, minWidth: 18, maxWidth: 26, height: 30, textAlign: "center", padding: "2px 0px" }}>
        <button
          className="delete-btn"
          onClick={e => { e.stopPropagation(); onRemoveSong(idx); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7
          }}
          title="Remove from playlist"
        >
          <DeleteIcon className="delete-icon" style={{ color: isDarkMode ? "#bbb" : "#888", fontSize: 18, transition: "color 0.15s" }} />
        </button>
        <style>{`
          .delete-btn:hover .delete-icon {
            color: #fff !important;
          }
        `}</style>
      </td>
      <td style={{ width: 45, height: 30, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {hoveredRow === idx ? (
          <span title="Play" style={{ display: "inline-flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="10" fill={isDarkMode ? "#222" : "#eee"} />
              <polygon points="8,6 15,10 8,14" fill={isDarkMode ? "#fff" : "#222"} />
            </svg>
          </span>
        ) : (
          idx + 1
        )}
      </td>
      <td
        style={{
          padding: "2px 8px",
          color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#fff" : "#222"),
          fontWeight: isSelected ? 700 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "auto",
          maxWidth: "600px",
          minWidth: 0,
          position: "relative",
          display: "table-cell",
          cursor: "pointer"
        }}
        title={song.title}
        onClick={(e) => {
          e.stopPropagation();
          if (!dragged) onClick();
        }}
      >
        {song.title}
      </td>
      <td style={{ width: 60, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {song.duration || resolvedDuration || ""}
      </td>
    </tr>
  );
}

const FooterSongTable: React.FC<FooterSongTableProps> = ({
  isMobile,
  songList,
  setSongList,
  sensors,
  handleSongDragEnd,
  SortableSongRow,
  selectedSong,
  nextSongToHighlight,
  currentSongIndex,
  setSelectedSong,
  onSongTitleSelect,
  isDarkMode,
  isKaraokeLoading,
  activeKaraokeRowIndex,
  karaokeReadyKeys,
  pendingKaraokeRowIndex,
  onKaraokeGenerate,
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [resolvedDurations, setResolvedDurations] = useState<Record<string, string>>({});

  const getSongKey = (song: Song) => `${song.title || ""}::${song.artist || ""}`;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getVideoId = (url?: string) => {
    if (!url) return "";
    if (url.includes("youtube.com")) {
      return url.split("v=")[1]?.split("&")[0] || "";
    }
    if (url.includes("youtu.be")) {
      return url.split("/").pop()?.split("?")[0] || "";
    }
    return "";
  };

  const nextDurationProbe = useMemo(() => {
    for (const song of songList) {
      const key = getSongKey(song);
      if (song.duration) continue;
      if (resolvedDurations[key]) continue;
      const videoId = getVideoId(song.url);
      if (videoId) {
        return { key, videoId };
      }
    }
    return null;
  }, [songList, resolvedDurations]);

  const handleProbeReady = (probeKey: string, event: { target: any }) => {
    let attempts = 0;
    const readDuration = () => {
      const seconds = event.target.getDuration?.() || 0;
      if (seconds > 0) {
        setResolvedDurations((prev) => ({
          ...prev,
          [probeKey]: formatTime(seconds),
        }));
        return;
      }
      if (attempts < 12) {
        attempts += 1;
        setTimeout(readDuration, 180);
      }
    };
    readDuration();
  };

  // Remove song handler
  function handleRemoveSong(removeIdx: number) {
    const songToRemove = songList[removeIdx];
    const isPlayedSong = selectedSong && songToRemove.title === selectedSong.title && songToRemove.artist === selectedSong.artist;
    console.log("Remove song:", songToRemove, isPlayedSong ? "(currently playing)" : "");
    const newList = songList.filter((_, i) => i !== removeIdx);
    setSongList(newList);
    if (isPlayedSong) {
      setSelectedSong(newList[0] || null);
    }
  }

  if (!songList.length) return null;
  // Responsive wrapper: add gap between CP and songList for desktop
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "90vw",
        maxHeight: 4 * 32 + 8,
        overflowY: songList.length > 4 ? "auto" : "visible",
        borderRadius: 8,
        background: "transparent",
        marginTop: -12,
        scrollSnapType: "y mandatory",
        ...(typeof window !== "undefined" && window.innerWidth > 650
          ? { marginLeft: 24 }
          : {})
      }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSongDragEnd}>
        {nextDurationProbe && (
          <div style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
            <YouTube
              videoId={nextDurationProbe.videoId}
              opts={{
                width: "1",
                height: "1",
                playerVars: { controls: 0, autoplay: 0, modestbranding: 1, mute: 1 },
              }}
              onReady={(event) => handleProbeReady(nextDurationProbe.key, event)}
            />
          </div>
        )}
        <SortableContext items={songList.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
          <table style={{ width: "100%", maxWidth: "90vw", tableLayout: "fixed", borderCollapse: "collapse", background: "transparent" }}>
            <thead>
              <tr>
                <th style={{
                  width: 30,
                  textAlign: "center",
                  padding: "2px 0px",
                  color: isDarkMode ? "#bbb" : "#333",
                  fontWeight: 700,
                  background: "#fff0",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backdropFilter: isDarkMode ? undefined : "blur(2px)",
                  backgroundColor: isDarkMode ? "#181818f0" : "#fff8"
                }}></th>
                <th style={{
                  width: 25,
                  textAlign: "right",
                  padding: "2px 8px",
                  color: isDarkMode ? "#bbb" : "#333",
                  fontWeight: 700,
                  background: "#fff0",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backdropFilter: isDarkMode ? undefined : "blur(2px)",
                  backgroundColor: isDarkMode ? "#181818f0" : "#fff8"
                }}></th>
                <th style={{
                  width: 45,
                  textAlign: "right",
                  padding: "2px 8px",
                  color: isDarkMode ? "#bbb" : "#333",
                  fontWeight: 700,
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backdropFilter: isDarkMode ? undefined : "blur(2px)",
                  backgroundColor: isDarkMode ? "#181818f0" : "#fff8"
                }}>#</th>
                <th style={{
                  padding: "2px 8px",
                  color: isDarkMode ? "#bbb" : "#333",
                  fontWeight: 700,
                  background: "#fff0",
                  textAlign: "left",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backdropFilter: isDarkMode ? undefined : "blur(2px)",
                  backgroundColor: isDarkMode ? "#181818f0" : "#fff8"
                }}>Song</th>
                <th style={{
                  width: 60,
                  textAlign: "right",
                  padding: "2px 8px",
                  color: isDarkMode ? "#bbb" : "#333",
                  fontWeight: 700,
                  background: "#fff0",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backdropFilter: isDarkMode ? undefined : "blur(2px)",
                  backgroundColor: isDarkMode ? "#181818f0" : "#fff8"
                }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {songList.map((song, idx) => (
                <SongTableRow
                  key={idx}
                  song={{
                    ...song,
                    title: song.title || "",
                    artist: song.artist || ""
                  }}
                  idx={idx}
                  isSelected={!!(selectedSong && song.title === selectedSong?.title && song.artist === selectedSong?.artist)}
                  isNextSelected={!!(nextSongToHighlight && song.title === nextSongToHighlight?.title && song.artist === nextSongToHighlight?.artist)}
                  isDarkMode={isDarkMode}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
                  onClick={() => onSongTitleSelect(song)}
                  onRemoveSong={removeIdx => handleRemoveSong(removeIdx)}
                  isKaraokeActive={isKaraokeLoading && activeKaraokeRowIndex === idx}
                  isKaraokeReady={karaokeReadyKeys.has(`${song.title || ""}::${song.artist || ""}`)}
                  isKaraokePending={isKaraokeLoading && pendingKaraokeRowIndex === idx}
                  onKaraokeClick={() => onKaraokeGenerate(idx)}
                  resolvedDuration={resolvedDurations[getSongKey(song)]}
                />
              ))}

            </tbody>
          </table>
        </SortableContext>
      </DndContext>
      <style>{`@keyframes karaokeSpin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } @keyframes karaokeBlink { 0% { opacity: 1; } 50% { opacity: 0.45; } 100% { opacity: 1; } }`}</style>
    </div>
  );
};

export default FooterSongTable;
