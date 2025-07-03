import React from "react";
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

// Helper to render a song row as <tr> for table (mobile)
function SongTableRow(props: any) {
  const { SortableSongRow, ...rest } = props;
  // Render as <tr> for table
  return (
    <tr>
      <td colSpan={3} style={{ padding: 0, border: 0 }}>
        <SortableSongRow {...rest} />
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
        marginTop: 12,
        // Add gap for desktop (screen width > 650px)
        ...(typeof window !== "undefined" && window.innerWidth > 650
          ? { marginLeft: 24 } // or adjust as needed
          : {})
      }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSongDragEnd}>
        <SortableContext items={songList.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "transparent" }}>
            <tbody>
              {songList.map((song, idx) => (
                <tr key={idx}>
                  <td style={{ width: 32, textAlign: "right", padding: "2px 8px", color: (selectedSong && song.title === selectedSong.title && song.artist === selectedSong.artist) ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: (selectedSong && song.title === selectedSong.title && song.artist === selectedSong.artist) ? 700 : 400 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "2px 8px", color: (selectedSong && song.title === selectedSong.title && song.artist === selectedSong.artist) ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#fff" : "#222"), fontWeight: (selectedSong && song.title === selectedSong.title && song.artist === selectedSong.artist) ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", maxWidth: 180, display: "flex", alignItems: "center", gap: 4 }}>
                    {song.title.length > 30 ? song.title.slice(0, 30) + '...' : song.title}
                  </td>
                  <td style={{ width: 60, textAlign: "right", padding: "2px 8px", color: (selectedSong && song.title === selectedSong.title && song.artist === selectedSong.artist) ? (isDarkMode ? "#fff" : "#024803") : (isDarkMode ? "#bbb" : "#333"), fontWeight: (selectedSong && song.title === selectedSong.title && song.artist === selectedSong.artist) ? 700 : 400 }}>
                    {song.duration || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default FooterSongTable;
