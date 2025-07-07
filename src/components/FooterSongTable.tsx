import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Song } from "../utils/storage";

interface FooterSongTableProps {
  isMobile: boolean;
  songList: Song[];
  sensors: any;
  handleSongDragEnd: (event: any) => void;
  SortableSongRow: React.FC<any>;
  selectedSong: Song | undefined;
  nextSongToHighlight: Song | null;
  currentSongIndex: number;
  setIsPlaying: (v: boolean) => void;
  setSelectedSong: (song: Song) => void;
  isDarkMode: boolean;
}


// SongTableRow: Draggable, hoverable, with play icon and drag support
interface SongTableRowProps {
  song: Song;
  idx: number;
  isSelected: boolean;
  isNextSelected: boolean;
  isDarkMode: boolean;
  hoveredRow: number | null;
  setHoveredRow: (idx: number | null) => void;
  onClick: () => void;
}

function SongTableRow({
  song,
  idx,
  isSelected,
  isNextSelected,
  isDarkMode,
  hoveredRow,
  setHoveredRow,
  onClick
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
  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHoveredRow(idx)}
      onMouseLeave={() => setHoveredRow(null)}
      onMouseDown={() => { setMouseDown(true); setDragged(false); }}
      onMouseUp={() => { if (mouseDown && !dragged) onClick(); setMouseDown(false); setDragged(false); }}
      onMouseMove={() => { if (mouseDown) setDragged(true); }}
    >
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
      <td style={{ padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#fff" : "#222"), fontWeight: isSelected ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
        {song.title}
      </td>
      <td style={{ width: 60, textAlign: "right", padding: "2px 8px", color: isSelected ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: isSelected ? 700 : 400 }}>
        {song.duration || ""}
      </td>
    </tr>
  );
}

const FooterSongTable: React.FC<FooterSongTableProps> = ({
  isMobile,
  songList,
  sensors,
  handleSongDragEnd,
  SortableSongRow,
  selectedSong,
  nextSongToHighlight,
  currentSongIndex,
  setIsPlaying,
  setSelectedSong,
  isDarkMode,
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  if (!songList.length) return null;
  // Responsive wrapper: add gap between CP and songList for desktop
  return (
    <div
      style={{
        width: "100%",
        maxHeight: 4 * 32 + 8,
        overflowY: songList.length > 4 ? "auto" : "visible",
        borderRadius: 8,
        background: "transparent",
        marginTop: -12,
        ...(typeof window !== "undefined" && window.innerWidth > 650
          ? { marginLeft: 24 }
          : {})
      }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSongDragEnd}>
        <SortableContext items={songList.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent" }}>
            <thead>
              <tr>
                <th style={{
                  width: 45,
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
                }}>Index</th>
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
                  onClick={() => {
                    setSelectedSong(song);
                    setIsPlaying(true);
                  }}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default FooterSongTable;
