import React, { useEffect, useMemo, useRef } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface LyricsPopupProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  artist?: string;
  lines: string[];
  currentTime: number;
  totalDuration: number;
  isLoading: boolean;
  error: string | null;
}

const VISIBLE_LINES = 4;
const LINE_HEIGHT = 24;

const LyricsPopup: React.FC<LyricsPopupProps> = ({
  open,
  onClose,
  title,
  artist,
  lines,
  currentTime,
  totalDuration,
  isLoading,
  error,
}) => {
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayLines = useMemo(() => {
    if (lines.length > 0) return lines;
    if (isLoading) return ["Loading lyrics..."];
    if (error) return [error];
    return ["No lyrics available."];
  }, [lines, isLoading, error]);

  const translateY = useMemo(() => {
    const maxOffset = Math.max(displayLines.length - VISIBLE_LINES, 0);
    if (maxOffset === 0 || totalDuration <= 0) return 0;
    const progress = Math.min(Math.max(currentTime / totalDuration, 0), 1);
    const offsetLines = Math.round(maxOffset * progress);
    return -offsetLines * LINE_HEIGHT;
  }, [displayLines.length, currentTime, totalDuration]);

  useEffect(() => {
    if (!open || !error) return undefined;
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    autoCloseTimerRef.current = setTimeout(() => {
      onClose();
    }, 3000);
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [open, error, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "6vh",
        zIndex: 1600,
      }}
    >
      <div
        style={{
          width: "80vw",
          height: "40vh",
          background: "#111827",
          color: "#f9fafb",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {error && (
          <div
            style={{
              background: "#991b1b",
              color: "#fee2e2",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{title || "Lyrics"}</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{artist || ""}</div>
          </div>
          <IconButton onClick={onClose} size="small" sx={{ color: "#e5e7eb" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <div
          style={{
            marginTop: 12,
            height: VISIBLE_LINES * LINE_HEIGHT,
            overflow: "hidden",
            borderRadius: 8,
            background: "#0f172a",
            padding: "8px 12px",
            position: "relative",
            alignSelf: "center",
          }}
        >
          <div
            style={{
              transform: `translateY(${translateY}px)`,
              transition: "transform 0.5s linear",
            }}
          >
            {displayLines.map((line, idx) => (
              <div
                key={`${line}-${idx}`}
                style={{
                  height: LINE_HEIGHT,
                  lineHeight: `${LINE_HEIGHT}px`,
                  fontSize: 14,
                  color: line ? "#f9fafb" : "#6b7280",
                }}
              >
                {line || "..."}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsPopup;
