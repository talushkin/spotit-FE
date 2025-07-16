import React, { useState } from "react";
import type { Playlist } from "../utils/storage";
import CasePlaylist from "./CasePlaylist";

interface PlaylistSliderProps {
  playlists: Playlist[];
  isDarkMode: boolean;
  onAddSongToList: (playlist: Playlist) => void;
  onPlaylistHover?: (playlist: Playlist | null, rect?: DOMRect) => void;
}

const PlaylistSlider: React.FC<PlaylistSliderProps> = ({ playlists, isDarkMode, onAddSongToList, onPlaylistHover }) => {
  return (
    <div className="playlist-slider" style={{ background: isDarkMode ? '#0a3d2e' : '#e8f5e9', padding: '16px 0', borderRadius: '18px', width: '100%', overflowX: 'auto', display: 'flex', gap: '18px' }}>
      {playlists.map((playlist, idx) => (
        <CasePlaylist
          key={playlist.id}
          playlist={playlist}
          isDarkMode={isDarkMode}
          onAddSongToList={onAddSongToList}
          onHover={() => {
            const el = document.getElementsByClassName('case')[idx] as HTMLElement;
            onPlaylistHover && onPlaylistHover(playlist, el?.getBoundingClientRect());
          }}
          onLeave={() => onPlaylistHover && onPlaylistHover(null)}
        />
      ))}
    </div>
  );
};

export default PlaylistSlider;
