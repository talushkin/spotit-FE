import React from "react";
import { IconButton, Slider } from "@mui/material";
import YouTube from "react-youtube";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import MicIcon from "@mui/icons-material/Mic";
import CachedIcon from "@mui/icons-material/Cached";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PersonIcon from "@mui/icons-material/Person";
import type { Song } from "../utils/storage";

interface FooterControlPanelProps {
  isDarkMode: boolean;
  isMobile: boolean;
  videoId: string;
  thumbUrl: string;
  selectedSong?: Song;
  isPlaying: boolean;
  handlePrevSong: () => void;
  handlePlayPause: () => void;
  handleNextSong: () => void;
  getCurrentSongIndex: () => number;
  songList: Song[];
  playerRef: React.MutableRefObject<any>;
  onPlayerReady: (event: { target: any }) => void;
  totalDuration: number;
  currentTime: number;
  handleSeek: (event: Event, value: number | number[]) => void;
  formatTime: (seconds: number) => string;
  setVolume: (v: number) => void;
  volume: number;
  isKaraokeLoading: boolean;
  showKaraokeToast: boolean;
  toastMessage: string | null;
  karaokeReady: boolean;
  karaokeMode: "mic" | "speaker" | "profile";
  isCurrentKaraokeReady: boolean;
  onKaraokeGenerate: () => void;
  onKaraokeModeToggle: () => void;
  karaokeAudioRef?: React.RefObject<HTMLAudioElement | null>;
  karaokeMeterRef?: React.RefObject<HTMLCanvasElement | null>;
}

const FooterControlPanel: React.FC<FooterControlPanelProps> = ({
  isDarkMode,
  isMobile,
  videoId,
  thumbUrl,
  selectedSong,
  isPlaying,
  handlePrevSong,
  handlePlayPause,
  handleNextSong,
  getCurrentSongIndex,
  songList,
  playerRef,
  onPlayerReady,
  totalDuration,
  currentTime,
  handleSeek,
  formatTime,
  setVolume,
  volume,
  isKaraokeLoading,
  showKaraokeToast,
  toastMessage,
  karaokeReady,
  karaokeMode,
  isCurrentKaraokeReady,
  onKaraokeGenerate,
  onKaraokeModeToggle,
  karaokeAudioRef,
  karaokeMeterRef,
}) => {
  const hasKaraokeTracks =
    !!isCurrentKaraokeReady ||
    !!karaokeReady ||
    !!(selectedSong && (selectedSong.kar === true || selectedSong.vocals === true));

  if (!songList.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 250, maxWidth: 400 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 1, marginTop: -40 }}>
        <Slider
          orientation="vertical"
          min={0}
          max={100}
          value={volume}
          onChange={(_, value) => setVolume(Array.isArray(value) ? value[0] : value)}
          sx={{
            height: 60,
            marginBottom: 6,
            color: '#1976d2',
            '& .MuiSlider-thumb': {
              backgroundColor: '#1976d2',
              border: '2px solid #fff',
            },
            ml: 1,
          }}
        />
        <span style={{ fontSize: 12, color: '#1976d2', marginLeft: 5 ,marginTop: -45 }}>{volume}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {videoId && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: isMobile ? '100%' : undefined }}>
              {thumbUrl && (
                <img
                  src={thumbUrl}
                  alt={selectedSong?.title || "thumbnail"}
                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", marginRight: 8, cursor: 'pointer' }}
                  onClick={() => {
                    if (videoId) {
                      window.location.href = `/watch/${videoId}`;
                    }
                  }}
                />
              )}
              <IconButton onClick={handlePrevSong} color="primary" disabled={getCurrentSongIndex() <= 0}>
                <SkipPreviousIcon />
              </IconButton>
              <IconButton onClick={handlePlayPause} color="primary">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                {showKaraokeToast && toastMessage && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: "50%",
                      transform: "translate(-50%, -6px)",
                      background: isDarkMode ? "#1f2937" : "#e8f5e9",
                      color: isDarkMode ? "#f9fafb" : "#1b5e20",
                      padding: "4px 8px",
                      borderRadius: 8,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      boxShadow: isDarkMode ? "0 4px 10px rgba(0,0,0,0.35)" : "0 4px 10px rgba(0,0,0,0.18)",
                      animation: isKaraokeLoading ? "karaokeBlink 2s ease-in-out infinite" : undefined,
                    }}
                  >
                    {toastMessage}
                  </div>
                )}
                {hasKaraokeTracks ? (
                  <IconButton
                    onClick={onKaraokeModeToggle}
                    sx={{ color: isDarkMode ? "#fff" : "#111" }}
                  >
                    {karaokeMode === "mic" && <MicIcon />}
                    {karaokeMode === "speaker" && <VolumeUpIcon />}
                    {karaokeMode === "profile" && <PersonIcon />}
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={onKaraokeGenerate}
                    sx={{ color: isDarkMode ? "#fff" : "#111" }}
                  >
                    {isKaraokeLoading ? (
                      <CachedIcon sx={{ animation: "karaokeSpin 1s linear infinite" }} />
                    ) : (
                      <PersonIcon />
                    )}
                  </IconButton>
                )}
              </div>
              <IconButton onClick={handleNextSong} color="primary" disabled={getCurrentSongIndex() === songList.length - 1 || songList.length === 0}>
                <SkipNextIcon />
              </IconButton>
            </div>
            <YouTube
              videoId={videoId}
              opts={{
                width: "1",
                height: "1",
                playerVars: { controls: 0, modestbranding: 1, autoplay: 1 },
              }}
              onReady={onPlayerReady}
              onPause={() => {}}
              onPlay={() => {}}
              onEnd={handleNextSong}
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", left: -9999 }}
            />
            <style>{`@keyframes karaokeSpin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } @keyframes karaokeBlink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }`}</style>
            <div style={{ marginTop: 4, color: isDarkMode ? "#fff" : "#222", textAlign: "center", fontWeight: 600, fontSize: "1.1rem" }}>
              {selectedSong?.title || ""}
              {(selectedSong?.duration || totalDuration) && (
                <span style={{ fontWeight: 400, fontSize: "1rem", color: isDarkMode ? "#bbb" : "#333", marginLeft: 8 }}>
                  {typeof selectedSong?.duration === 'string' && selectedSong.duration
                    ? selectedSong.duration
                    : (totalDuration ? formatTime(totalDuration) : "")}
                </span>
              )}
              {selectedSong?.artist && (
                <span style={{ fontWeight: 400, fontSize: "0.95rem", color: isDarkMode ? "#bbb" : "#333", display: "block" }}>
                  {selectedSong.artist}
                </span>
              )}
              <div style={{ marginTop:-10, width: 240, marginLeft: "auto", marginRight: "auto" }}>
                <Slider
                  min={0}
                  max={totalDuration || 1}
                  value={typeof currentTime === 'number' && !isNaN(currentTime) ? Math.min(currentTime, totalDuration || 1) : 0}
                  onChange={handleSeek}
                  step={1}
                  size="small"
                  sx={{ marginTop:-20,  color: isDarkMode ? "#1db954" : "#024803" , margin: "0px" }}
                />
                <div style={{ display: "flex", marginTop: -20 ,justifyContent: "space-between", fontSize: 12, color: isDarkMode ? "#bbb" : "#333" }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{typeof selectedSong?.duration === 'string' && selectedSong.duration
                    ? selectedSong.duration
                    : (totalDuration ? formatTime(totalDuration) : "")}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FooterControlPanel;
