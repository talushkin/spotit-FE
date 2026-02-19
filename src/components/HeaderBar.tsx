import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Genre, Song } from "../utils/storage";
import SearchBar from "./SearchBar";
import { fetchPlaylistsByTitle } from "../store/dataSlice";
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';
import type { AuthUser } from "./AuthGate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  loadPlayedSongsHistory,
  clearPlayedSongsHistory,
  saveUserPlaylistToLocalStorage,
  type PlayedSongHistoryEntry
} from "../utils/storage";





interface HeaderBarProps {
  logo: string;
  onHamburgerClick: () => void;
  genres: Genre[];
  desktop: boolean;
  setSelectedGenre: (genre: Genre) => void;
  setSelectedSong: (song: Song) => void;
  selectedSong: Song | null;
  isDarkMode: boolean;
  songList?: Song[]; // Optional prop for song list
  setSongList?: (songs: Song[]) => void; // Optional setter for song list
  onAddSongToList?: (song: Song, location?: number) => void; // Optional function to add song to list
  authUser: AuthUser;
  onLogout: () => void;
  onSettings: () => void;
  onSavePlaylist: () => void;
  onExportPlaylist: () => void;
}

export default function HeaderBar({
  logo,
  onHamburgerClick,
  genres,
  desktop,
  setSelectedGenre,
  setSelectedSong,
  selectedSong,
  isDarkMode,
  songList = [],
  setSongList = () => {}, // Default to no-op if not provided
  onAddSongToList,
  authUser,
  onLogout,
  onSettings,
  onSavePlaylist,
  onExportPlaylist
}: HeaderBarProps) {
  // Use correct dispatch type for thunks
  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
  // Use Redux state for allSongs
  const allSongs = useSelector((state: any) => state.data.site?.allSongs || []);
  const setAllSongs = (songs: Song[]) => {
    // Optionally, dispatch an action to update allSongs in Redux if needed
    // For now, this is a no-op for compatibility
  };

  // Handler for when a search miss occurs (not found locally)
  const handleSearchMiss = (title: string) => {
    // console.log("Search miss for title:", title);
    dispatch(fetchPlaylistsByTitle(title));
  };

  // Track if search is active (focus or has value)
  const [searchActive, setSearchActive] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [currentPlaylistPopupOpen, setCurrentPlaylistPopupOpen] = useState(false);
  const [playlistHistoryPopupOpen, setPlaylistHistoryPopupOpen] = useState(false);
  const [playedSongsHistory, setPlayedSongsHistory] = useState<PlayedSongHistoryEntry[]>([]);
  // Determine if mobile
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 650 : false;

  useEffect(() => {
    if (!avatarMenuOpen) return;

    const closeMenu = () => setAvatarMenuOpen(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [avatarMenuOpen]);

  const formatPlayedAt = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const handleClearCurrentPlaylist = () => {
    setSongList([]);
    setSelectedSong(null as any);
    saveUserPlaylistToLocalStorage([], {
      id: authUser.id,
      email: authUser.email,
    });
    setAvatarMenuOpen(false);
  };

  const handleClearPlaylistHistory = () => {
    clearPlayedSongsHistory({
      id: authUser.id,
      email: authUser.email,
    });
    setPlayedSongsHistory([]);
    setAvatarMenuOpen(false);
  };

  return (
    <>
      <div
        className="HeaderBar"
        style={{
          display: "flex",
          position: "sticky",
          top: 0,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px",
          flexWrap: "nowrap",
          width: "100%",
          boxSizing: "border-box",
          maxHeight: "80px",
          background: isDarkMode ? "#000" : undefined,
        }}
      >
        {/* Desktop: SearchBar right of app name; Mobile: normal */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {!(isMobile && searchActive) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                minWidth: 0,
              }}
            >
              {!desktop && (
                <button className="hamburger" onClick={onHamburgerClick}>
                  ☰
                </button>
              )}
              {/* Inline SVG waveform icon, matches app icon */}
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: "50%", background: isDarkMode ? "#222" : "#fff", boxShadow: isDarkMode ? undefined : "0 0 4px #ccc" }}>
                <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="64" height="64" rx="16" fill="#000" />
                  <path d="M8 32h4m4 0h4m4 0h4m4 0h4m4 0h4m4 0h4m4 0h4" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                  <path d="M16 32v-8m8 8v-16m8 16v-24m8 24v-16m8 16v-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              <div className="SiteName">Spot.it</div>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  title={authUser.email}
                  aria-label={authUser.name}
                  onClick={(event) => {
                    event.stopPropagation();
                    setAvatarMenuOpen((open) => !open);
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #4c4c4c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isDarkMode ? "#151515" : "#f3f3f3",
                    color: isDarkMode ? "#fff" : "#000",
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {authUser.picture ? (
                    <img
                      src={authUser.picture}
                      alt={authUser.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    authUser.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")
                  )}
                </button>
                {avatarMenuOpen && (
                  <div
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      position: "absolute",
                      top: 46,
                      right: 0,
                      minWidth: 240,
                      borderRadius: 10,
                      border: `1px solid ${isDarkMode ? "#2f2f2f" : "#d9d9d9"}`,
                      background: isDarkMode ? "#151515" : "#fff",
                      boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
                      zIndex: 2500,
                      padding: 6,
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px 10px",
                        borderBottom: `1px solid ${isDarkMode ? "#2a2a2a" : "#ececec"}`,
                        marginBottom: 4,
                      }}
                    >
                      <div style={{ color: isDarkMode ? "#fff" : "#111", fontWeight: 700, fontSize: 14 }}>
                        {[authUser.firstName, authUser.lastName].filter(Boolean).join(" ") || "-"}
                      </div>
                      <div
                        style={{
                          color: isDarkMode ? "#a9a9a9" : "#666",
                          fontSize: 12,
                          marginTop: 4,
                          wordBreak: "break-word",
                        }}
                      >
                        {authUser.email}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 4px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPlaylistPopupOpen(true);
                          setAvatarMenuOpen(false);
                        }}
                        style={{
                          flex: 1,
                          border: "none",
                          background: "transparent",
                          color: isDarkMode ? "#fff" : "#111",
                          textAlign: "left",
                          padding: "8px 8px",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        Current Playlist
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCurrentPlaylist}
                        title="Delete current playlist"
                        style={{
                          border: "none",
                          background: "transparent",
                          color: isDarkMode ? "#ff9b9b" : "#b3261e",
                          padding: 6,
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 4px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          const history = loadPlayedSongsHistory({ id: authUser.id, email: authUser.email });
                          setPlayedSongsHistory(history);
                          setPlaylistHistoryPopupOpen(true);
                          setAvatarMenuOpen(false);
                        }}
                        style={{
                          flex: 1,
                          border: "none",
                          background: "transparent",
                          color: isDarkMode ? "#fff" : "#111",
                          textAlign: "left",
                          padding: "8px 8px",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        Playlist History
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPlaylistHistory}
                        title="Delete playlist history"
                        style={{
                          border: "none",
                          background: "transparent",
                          color: isDarkMode ? "#ff9b9b" : "#b3261e",
                          padding: 6,
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        onSavePlaylist();
                      }}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: isDarkMode ? "#fff" : "#111",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Save Playlist
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        onExportPlaylist();
                      }}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: isDarkMode ? "#fff" : "#111",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Export Playlist JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        onSettings();
                      }}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: isDarkMode ? "#fff" : "#111",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        onLogout();
                      }}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: isDarkMode ? "#fff" : "#111",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              {desktop && (
                <div style={{ minWidth: 0, flex: '0 0 auto', marginLeft: 16 }}>
                  <SearchBar
                    desktop={desktop}
                    isDarkMode={isDarkMode}
                    genres={genres}
                    allSongs={allSongs}
                    setAllSongs={setAllSongs}
                    setSelectedSong={setSelectedSong}
                    onAddSongToList={onAddSongToList}
                    onSearchMiss={handleSearchMiss}
                    setSearchActive={setSearchActive}
                  />
                </div>
              )}
            </div>
          )}
          {!desktop && (
            <SearchBar
              desktop={desktop}
              isDarkMode={isDarkMode}
              genres={genres}
              allSongs={allSongs}
              setAllSongs={setAllSongs}
              setSelectedSong={setSelectedSong}
              onAddSongToList={onAddSongToList}
              onSearchMiss={handleSearchMiss}
              setSearchActive={setSearchActive}
            />
          )}
        </div>
            {currentPlaylistPopupOpen && (
              <div
                onClick={() => setCurrentPlaylistPopupOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  zIndex: 3000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                }}
              >
                <div
                  onClick={(event) => event.stopPropagation()}
                  style={{
                    width: "min(860px, 96vw)",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    borderRadius: 12,
                    border: `1px solid ${isDarkMode ? "#2f2f2f" : "#d9d9d9"}`,
                    background: isDarkMode ? "#151515" : "#fff",
                    color: isDarkMode ? "#fff" : "#111",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: `1px solid ${isDarkMode ? "#2a2a2a" : "#ececec"}`,
                      position: "sticky",
                      top: 0,
                      background: isDarkMode ? "#151515" : "#fff",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>Current Playlist History</div>
                    <button
                      type="button"
                      onClick={() => setCurrentPlaylistPopupOpen(false)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: isDarkMode ? "#fff" : "#111",
                        cursor: "pointer",
                        fontSize: 18,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ padding: 16 }}>
                      {songList.length === 0 ? (
                      <div style={{ color: isDarkMode ? "#b0b0b0" : "#666" }}>
                          Current playlist is empty.
                      </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>#</th>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>Song</th>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>Artist</th>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>Played At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {songList.map((song, songIndex) => (
                                <tr key={`current_${songIndex}_${song.title || ""}`}>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{songIndex + 1}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{song.title || "Untitled"}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{song.artist || "-"}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{song.playedAt ? formatPlayedAt(song.playedAt) : "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            )}
              {playlistHistoryPopupOpen && (
                <div
                  onClick={() => setPlaylistHistoryPopupOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    zIndex: 3000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                  }}
                >
                  <div
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      width: "min(860px, 96vw)",
                      maxHeight: "80vh",
                      overflowY: "auto",
                      borderRadius: 12,
                      border: `1px solid ${isDarkMode ? "#2f2f2f" : "#d9d9d9"}`,
                      background: isDarkMode ? "#151515" : "#fff",
                      color: isDarkMode ? "#fff" : "#111",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderBottom: `1px solid ${isDarkMode ? "#2a2a2a" : "#ececec"}`,
                        position: "sticky",
                        top: 0,
                        background: isDarkMode ? "#151515" : "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>Playlist History</div>
                      <button
                        type="button"
                        onClick={() => setPlaylistHistoryPopupOpen(false)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: isDarkMode ? "#fff" : "#111",
                          cursor: "pointer",
                          fontSize: 18,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ padding: 16 }}>
                      {playedSongsHistory.length === 0 ? (
                        <div style={{ color: isDarkMode ? "#b0b0b0" : "#666" }}>No played songs yet.</div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>#</th>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>Song</th>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>Artist</th>
                                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#333" : "#e5e5e5"}` }}>Played At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {playedSongsHistory.map((entry, index) => (
                                <tr key={entry.id}>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{index + 1}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{entry.song?.title || "Untitled"}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{entry.song?.artist || "-"}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${isDarkMode ? "#262626" : "#f1f1f1"}` }}>{formatPlayedAt(entry.playedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
      </div>
    </>
  );
}
