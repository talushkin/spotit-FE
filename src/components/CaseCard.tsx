import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Language support removed: only English
import type { Song } from "../utils/storage";
import { DisplayType } from "../utils/storage";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";

interface CaseCardProps {
  item: Song;
  category: string;
  index?: number;
  isDarkMode?: boolean;
  onAddSongToList?: (song: Song, location?: number) => void;
  onSelectSong?: (song: Song) => void;
  displayType?: DisplayType;
  isMobile?: boolean;
  showMobileActions?: boolean;
}

export default function CaseCard({ item, category, index, isDarkMode = true, onAddSongToList, onSelectSong, displayType = DisplayType.Slider, isMobile = false, showMobileActions = false }: CaseCardProps) {
  const navigate = useNavigate();
  // Handler for play button: select and play (do not add to list here)

  // Language support removed: only English
  const [imageUrl] = useState<string>(
    "C:\\FE-code\\recipes\\BE\\images\\1747127810600-generated-image.png"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const isPlaylist = Array.isArray((item as any).songs) && (item as any).songs.length > 0;

  const handlePlaySong = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPlaylist) {
      // Replace current playlist with all songs from this playlist
      if (onAddSongToList) {
        (item as any).songs.forEach((song: any) => {
          onAddSongToList(song, 1);
        });
      }
      return;
    }
    // Extract YouTube video ID from item.url
    let videoId = "";
    if (item.url) {
      const match = item.url.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }
    if (videoId) {
      navigate(`/watch/${videoId}`);
    } else {
      // fallback: just play as before
      if (onAddSongToList) {
        onAddSongToList(item, 1);
      }
    }
  };
  // Handler for add-to-song-list button (to be implemented by parent via prop or context)
  const handleAddToSongList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddSongToList) {
      if (isPlaylist) {
        // Add all songs from playlist to the list
        console.log("Adding all playlist songs to list:", (item as any).songs);
        (item as any).songs.forEach((song: any) => {
          onAddSongToList(song, -1);
        });
      } else {
        console.log("Adding song to list, should not play!:", item);
        onAddSongToList(item, -1); // -1 = add to bottom
      }
    } else {
      alert(`Add to song list: ${item.title}`);
    }
  };

  // Drag-to-scroll logic for parent song slider
  const onMouseDown = (e: React.MouseEvent) => {
    // Find the closest parent with id 'song-slider'
    let slider = (e.target as HTMLElement).closest('#song-slider') as HTMLDivElement | null;
    if (!slider) return;
    let isDragging = true;
    let startX = e.pageX - (slider.offsetLeft || 0);
    let scrollLeft = slider.scrollLeft;
    document.body.style.cursor = 'grabbing';
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;
      moveEvent.preventDefault();
      const x = moveEvent.pageX - (slider?.offsetLeft || 0);
      const walk = (x - startX) * 1.2;
      if (slider) slider.scrollLeft = scrollLeft - walk;
    };
    const onMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Circle display for "circles" type (artist cards)
  if (displayType === DisplayType.Circles) {
    return (
      <div
        className="case circle-case"
        onMouseDown={onMouseDown}
        style={{
          backgroundColor: isDarkMode ? "#333" : "#fffce8",
          border: isDarkMode ? "1px solid rgb(71, 69, 69)" : "1px solid rgb(234, 227, 227)",
          borderRadius: "50%",
          width: 120,
          height: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          margin: "0 auto",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <img
          src={item.image || item.imageUrl || imageUrl}
          alt={item.artist || item.title}
          style={{
            width: 80,
            height: 80,
            objectFit: "cover",
            borderRadius: "50%",
            cursor: "pointer",
            marginBottom: 6,
            marginTop: 6,
            border: isDarkMode ? "2px solid #222" : "2px solid #eee"
          }}
          onClick={handlePlaySong}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/80x80?text=${item.artist || item.title}`;
          }}
        />
      </div>
    );
  }

  // Default (rectangle) display
  // Clean the title for display and tooltip
  let cleanTitle = item.title.replace(/&quot;/g, '"');
  cleanTitle = cleanTitle.replace(/&[a-zA-Z0-9#]+;/g, '').replace(/["'`]/g, '');
  const shouldShowMobileButtons = isMobile && showMobileActions;

  return (
    <Tooltip title={cleanTitle} arrow placement="top">
      <div
        className="case"
        onMouseDown={onMouseDown}
        style={{
          backgroundColor: isDarkMode ? "#333" : "#fffce8",
          border: isDarkMode
            ? "1px solid rgb(71, 69, 69)"
            : "1px solid rgb(234, 227, 227)",
          borderRadius: "18px",
          transition: "border 0.2s",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src={item.image || item.imageUrl || imageUrl}
          alt={item.title}
          style={{
            width: "180px",
            height: "140px",
            objectFit: "cover",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
            cursor: "pointer"
          }}
          onClick={handlePlaySong}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/180x140?text=${item.title}`;
          }}
        />
        {/* Only show title for non-circles displayType, using type-safe workaround to avoid TS2367 */}
        {[DisplayType.Slider, DisplayType.Radio, DisplayType.SearchResults, DisplayType.Recommended, DisplayType.ArtistRadio, DisplayType.DailyMix, DisplayType.Trending, DisplayType.DiscoverWeekly, DisplayType.RecommendedArtists, DisplayType.RadioOfTheDay, DisplayType.TopCharts, DisplayType.ThrowbackHits].includes(displayType) && (
          (() => {
            // Detect if the title is Hebrew (contains any Hebrew unicode range)
            const isHebrew = /[\u0590-\u05FF]/.test(item.title);
            return (
              <h2
                style={{
                  fontSize: "1rem",
                  margin: "8px 0 0 0",
                  textAlign: "center",
                  color: isDarkMode ? "#fff" : "#333",
                  width: "100%",
                  maxWidth: "180px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  cursor: "pointer",
                  direction: isHebrew ? "ltr" : undefined
                }}
              >
                {isLoading ? "Loading..." : cleanTitle}
              </h2>
            );
          })()
        )}
       
        <Tooltip
          title={isPlaylist ? "Play the playlist" : "Play song"}
          arrow placement="top"
        >
          <button
            className="case-play-btn"
            tabIndex={-1}
            onClick={handlePlaySong}
            aria-label="Play and select song"
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
              opacity: isMobile ? (shouldShowMobileButtons ? 1 : 0) : undefined,
              transition: "opacity 0.28s ease, transform 0.28s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              zIndex: 2,
              textDecoration: "none",
              pointerEvents: isMobile ? (shouldShowMobileButtons ? "auto" : "none") : undefined,
              transform: isMobile ? (shouldShowMobileButtons ? "translateY(0)" : "translateY(28px)") : undefined,
              border: "none",
              cursor: "pointer",
              willChange: "opacity, transform",
            }}
          >
            <PlayArrowIcon style={{ color: "#fff", fontSize: 32 }} />
          </button>
        </Tooltip>
        {/* Add to song list button */}
        <Tooltip
          title={isPlaylist ? "Add the playlist to current playlist" : "Add to playlist"}
          arrow placement="top"
        >
          <button
            className="case-add-btn"
            onClick={handleAddToSongList}
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
              opacity: isMobile ? (shouldShowMobileButtons ? 1 : 0) : undefined,
              transition: "opacity 0.28s ease, transform 0.28s ease",
              pointerEvents: isMobile ? (shouldShowMobileButtons ? "auto" : "none") : undefined,
              transform: isMobile ? (shouldShowMobileButtons ? "translateY(0)" : "translateY(28px)") : undefined,
              willChange: "opacity, transform",
            }}
            tabIndex={-1}
            aria-label="Add to song list"
          >
            <AddIcon style={{ color: isDarkMode ? "#fff" : "#1db954", fontSize: 20 }} />
          </button>
        </Tooltip>
        {/* Overlay for hover effect */}
        <style>
          {`
            @media (hover: hover) and (pointer: fine) {
              .case .case-play-btn,
              .case .case-add-btn {
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.28s ease, transform 0.28s ease;
                transform: translateY(28px);
              }
              .case:hover .case-play-btn,
              .case:hover .case-add-btn {
                opacity: 1 !important;
                pointer-events: auto !important;
                transform: translateY(0);
              }
              .case:not(:hover) .case-play-btn,
              .case:not(:hover) .case-add-btn {
                transform: translateY(28px);
              }
            }
          `}
        </style>
      </div>
    </Tooltip>
  );
}
