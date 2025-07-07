import React, { useRef } from "react";
import YouTube, { YouTubePlayer as YTPlayerType } from "react-youtube";


interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  volume?: number; // 0-100
  noControls?: boolean;
  onSpaceToggle?: () => void;
}


const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, autoplay = true, volume = 50, noControls = false, onSpaceToggle }) => {
  const playerRef = useRef<YTPlayerType | null>(null);

  const onReady = (event: { target: YTPlayerType }) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    if (autoplay) event.target.playVideo();
  };

  React.useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Spacebar play/pause handler
  React.useEffect(() => {
    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (playerRef.current) {
          const state = playerRef.current.getPlayerState();
          if (state === 1) {
            playerRef.current.pauseVideo();
          } else {
            playerRef.current.playVideo();
          }
        }
        if (onSpaceToggle) onSpaceToggle();
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [onSpaceToggle]);

  return (
    <div style={{ width: "100vw", maxWidth: "100vw", height: "100vh", background: "#000", margin: 0, padding: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ flex: 1, height: '100%', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        <YouTube
          videoId={videoId}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: autoplay ? 1 : 0,
              rel: 0,
              controls: 0,
              modestbranding: 1,
              fs: 0,
              disablekb: 1,
              showinfo: 0,
              playsinline: 1,
            },
          }}
          style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'auto' }}
          iframeClassName="yt-iframe-fullwidth yt-iframe-no-controls"
          onReady={onReady}
        />
      <style>{`
        .yt-iframe-fullwidth {
          width: 100% !important;
          height: 100% !important;
          min-width: 0 !important;
          min-height: 0 !important;
          border: none;
          display: block;
        }
        .yt-iframe-no-controls {
          pointer-events: auto;
          outline: none !important;
        }
        .yt-iframe-no-controls:focus {
          outline: none !important;
        }
      `}</style>
      </div>
      <style>{`
        .yt-iframe-fullwidth {
          width: 100% !important;
          height: 100% !important;
          min-width: 0 !important;
          min-height: 0 !important;
          border: none;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default YouTubePlayer;
