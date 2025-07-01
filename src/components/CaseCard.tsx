import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import dayjs from "dayjs";
import type { Recipe } from "../utils/storage";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";

interface CaseCardProps {
  item: Recipe;
  category: string;
  index?: number;
  isDarkMode?: boolean;
  onAddSongToList?: (song: any) => void;
}

export default function CaseCard({ item, category, index, isDarkMode = true, onAddSongToList }: CaseCardProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [translated, setTranslated] = useState<{ title: string; description?: string }>({
    title: "",
    description: "",
  });
  const [imageUrl] = useState<string>(
    "C:\\FE-code\\recipes\\BE\\images\\1747127810600-generated-image.png"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const translateFields = async () => {
      setIsLoading(true);
      try {
        const [title, description] = await Promise.all([
          translateDirectly(item.title, currentLang),
          translateDirectly(item.preparation ?? "", currentLang),
        ]);
        setTranslated({ title, description });
      } catch (error) {
        console.error("Translation error:", error);
        setTranslated({ title: item.title, description: item.preparation });
      } finally {
        setIsLoading(false);
      }
    };

    if (item && currentLang !== "en") {
      translateFields();
    } else {
      setTranslated({ title: item.title, description: item.preparation });
    }
  }, [item, currentLang]);

  const isNewRecipe = item.title === "ADD NEW RECEPY";
  const linkHref = `/spotit/${encodeURIComponent(category)}/${encodeURIComponent(item.title)}`;

  // Handler for add-to-song-list button (to be implemented by parent via prop or context)
  const handleAddToSongList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddSongToList) {
      onAddSongToList(item);
    } else {
      alert(`Add to song list: ${item.title}`);
    }
  };

  return (
    <div
      className="case"
      style={{
        backgroundColor: isDarkMode ? "#333" : "#fffce8",
        border: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        borderRadius: "18px",
        transition: "border 0.2s",
        width: "180px",
        height: "220px",
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
        alt={translated.title || item.title}
        style={{
          width: "180px",
          height: "140px",
          objectFit: "cover",
          borderTopLeftRadius: "18px",
          borderTopRightRadius: "18px",
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/180x140?text=${item.title}`;
        }}
      />
      <h2
        style={{
          fontSize: "1rem",
          margin: "8px 0 0 0",
          textAlign: "center",
          color: isDarkMode ? "#fff" : "#333",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {isLoading ? t("loading") : translated.title}
      </h2>
      {/* Remove date display */}
      {/* <p
        style={{
          color: isDarkMode ? "#aaa" : "#333",
          fontSize: "0.85rem",
          margin: "2px 0 0 0",
          textAlign: "center",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.createdAt ? ` ${dayjs(item.createdAt).format("DD-MM-YYYY")}` : ""}
      </p> */}
      {/* Green play button on hover */}
      <a
        href={linkHref}
        className="case-play-btn"
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
        }}
        tabIndex={-1}
      >
        <PlayArrowIcon style={{ color: "#fff", fontSize: 32 }} />
      </a>
      {/* Add to song list button */}
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
          opacity: 0,
          transition: "opacity 0.3s, transform 0.3s",
          pointerEvents: "none",
        }}
        tabIndex={-1}
        aria-label="Add to song list"
      >
        <AddIcon style={{ color: isDarkMode ? "#fff" : "#1db954", fontSize: 20 }} />
      </button>
      {/* Overlay for hover effect */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
}
