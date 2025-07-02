
import type { Genre } from "../utils/storage";
import React from "react";
import NavItemList from "./NavItemList";
import { useNavigate } from "react-router-dom";
// LanguageSelector removed: only English

// --- Types ---
interface GenreItem {
  _id: string;
  genre: string;
  createdAt?: string;
  songs?: any[];
  priority: number;
  translatedGenre?: { [lang: string]: string } | Array<{ lang: string; value: string; _id?: string }>;
}


interface NavMenuProps {
  genres: Genre[];
  isOpen: boolean;
  desktop: boolean;
  isDarkMode: boolean;
  onSelect: (item: Genre) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ genres, isOpen, desktop, isDarkMode, onSelect }) => {

//console.log("NavMenu rendered with genres:", genres);

  const handleSelectGenre = (item: Genre) => {
    if (item?.genre) {
      onSelect(item);
    }
  };

  return (
    <div
      className={`nav ${isOpen || desktop ? "show" : "hide"}`}
      style={{
        background: isDarkMode ? "#222" : "#222", // Dark grey for dark mode, light for light mode
        minHeight: "100vh",
        transition: "background 0.3s",
      }}
    >
      <NavItemList
        genres={genres}
        onSelect={handleSelectGenre}
      />
      {/* Only show language and theme buttons on desktop */}
      {/* LanguageSelector removed: only English */}
    </div>
  );
};

export default NavMenu;
