import React from "react";
import type { Playlist } from "../utils/storage";

interface CasePlaylistProps {
  playlist: Playlist;
  isDarkMode: boolean;
  onAddSongToList: (playlist: Playlist) => void;
  onHover?: () => void;
  onLeave?: () => void;
}

const CasePlaylist: React.FC<CasePlaylistProps> = ({ playlist, isDarkMode, onAddSongToList, onHover, onLeave }) => {
  return (
    <div
      className="case"
      style={{
        backgroundColor: isDarkMode ? "#333" : "#fffce8",
        border: isDarkMode ? "1px solid rgb(71, 69, 69)" : "1px solid rgb(234, 227, 227)",
        borderRadius: "18px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <img
        src={playlist.image}
        alt={playlist.title}
        style={{
          width: "180px",
          minWidth: "180px",
          height: "140px",
          objectFit: "cover",
          borderTopLeftRadius: "18px",
          borderTopRightRadius: "18px",
          cursor: "pointer"
        }}
      />
      <h2
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          color: isDarkMode ? "#fff" : "#222",
          textAlign: "center",
          margin: "8px 0 0 0",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {playlist.title}
      </h2>
      {playlist.description && (
        <div style={{ fontSize: "0.9rem", color: isDarkMode ? "#ccc" : "#444", marginBottom: 4, maxHeight: 40, overflow: "hidden", textOverflow: "ellipsis" }}>{playlist.description}</div>
      )}
      <a href={playlist.url} target="_blank" rel="noopener noreferrer" style={{ color: isDarkMode ? '#80cbc4' : '#0a3d2e', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'underline', marginTop: 2 }}>View Playlist</a>
      {/* Play and Add buttons for playlist */}
      <button
        className="case-play-btn"
        tabIndex={-1}
        aria-label="Play and select playlist"
        style={{
          position: "absolute",
          background: "#1db954",
          borderRadius: "50%",
          left: "18px",
          bottom: "50px",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          transition: "opacity 0.3s, transform 0.3s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 2,
          textDecoration: "none",
          pointerEvents: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        {/* Play icon here */}
        ▶
      </button>
      <button
        className="case-add-btn"
        onClick={() => onAddSongToList(playlist)}
        style={{
          position: "absolute",
          right: "18px",
          bottom: "50px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: isDarkMode ? "#222" : "#e0ffe0",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          cursor: "pointer",
          zIndex: 2,
          opacity: 0,
          transition: "opacity 0.3s, transform 0.3s",
          pointerEvents: "none",
        }}
        tabIndex={-1}
        aria-label="Add playlist to song list"
      >
        {/* Add icon here */}
        ＋
      </button>
      {/* Tooltip removed, now handled by parent */}
      <style>{`
        .case .case-play-btn,
        .case .case-add-btn {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s, transform 0.3s;
          transform: translateY(40px);
        }
        .case:hover .case-play-btn,
        .case:hover .case-add-btn {
          opacity: 1 !important;
          pointer-events: auto !important;
          animation: fadeInPlayBtn 0.3s;
          transform: translateY(0);
        }
        .case:not(:hover) .case-play-btn,
        .case:not(:hover) .case-add-btn {
          animation: fadeOutPlayBtn 0.3s;
          transform: translateY(40px);
        }
        @keyframes fadeInPlayBtn {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeOutPlayBtn {
          from { opacity: 1; transform: translateY(0);}
          to { opacity: 0; transform: translateY(40px);}
        }
      `}</style>
    </div>
  );
};

export default CasePlaylist;
