import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Genre, Song } from "../utils/storage";
import SearchBar from "./SearchBar";
import { fetchSongsByTitle } from "../store/dataSlice";
import type { ThunkDispatch } from '@reduxjs/toolkit';
import type { AnyAction } from 'redux';





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
  onAddSongToList
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
    dispatch(fetchSongsByTitle(title));
  };

  // Track if search is active (focus or has value)
  const [searchActive, setSearchActive] = useState(false);
  // Determine if mobile
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 650 : false;

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
      </div>
    </>
  );
}
