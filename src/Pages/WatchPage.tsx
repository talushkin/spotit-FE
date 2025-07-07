
import React from "react";
import YouTubePlayer from "../components/YouTubePlayer";
import { useSelector } from "react-redux";
import HeaderBar from "../components/HeaderBar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
interface WatchPageProps {
  videoId: string;
}

const WatchPage: React.FC<WatchPageProps> = ({ videoId }) => {
  const volume = useSelector((state: any) => state.data.volume ?? 50);
  const isDarkMode = true; // TODO: Replace with global theme state if available
  const navigate = useNavigate();
  // ESC key handler
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [navigate]);
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        background: isDarkMode ? '#000' : '#fffce8',
        position: 'relative',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <YouTubePlayer
          videoId={videoId}
          autoplay={true}
          volume={volume}
          noControls={true}
        />
        {/* Back Arrow absolutely positioned over the video */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            zIndex: 3000,
            pointerEvents: "auto"
          }}
        >
          <button
            aria-label="Back to Home"
            style={{
              background: isDarkMode ? "rgba(30,30,30,0.7)" : "rgba(255,255,255,0.7)",
              border: "none",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isDarkMode ? "#fff" : "#222",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: "background 0.2s",
              outline: "none",
              borderWidth: 0,
            }}
            onClick={() => navigate("/", { replace: true })}
            tabIndex={0}
          >
            <ArrowBackIcon style={{ fontSize: 32, color: isDarkMode ? "#fff" : "#222" }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
