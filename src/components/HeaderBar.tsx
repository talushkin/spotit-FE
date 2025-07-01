import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import RecipeDialog from "./RecipeDialog";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { translateDirectly } from "./translateAI";
import { useNavigate } from "react-router-dom";
import type { Category, Recipe } from "../utils/storage";

interface HeaderBarProps {
  logo: string;
  onHamburgerClick: () => void;
  pages: Category[];
  desktop: boolean;
  setSelectedCategory: (cat: Category) => void;
  setSelectedRecipe: (recipe: Recipe) => void;
  selectedRecipe: Recipe | null;
  isDarkMode: boolean;
}

// Add type for search/autocomplete options
interface RecipeOption {
  title: string;
  category: string;
  originalTitle: string;
}

export default function HeaderBar({
  logo,
  onHamburgerClick,
  pages,
  desktop,
  setSelectedCategory,
  setSelectedRecipe,
  selectedRecipe,
  isDarkMode,
}: HeaderBarProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<RecipeOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const [searchActive, setSearchActive] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [translatedOptions, setTranslatedOptions] = useState<RecipeOption[]>([]);

  // Build allRecipes as before
  const allRecipes = pages?.flatMap((category) =>
    category.itemPage.map((r) => ({ ...r, category: category.category }))
  ) || [];

  useEffect(() => {
    if (!allRecipes) return;
    setTranslatedOptions(
      allRecipes.map((r) => ({
        title: r.title,
        category: r.category,
        originalTitle: r.title,
      }))
    );
  }, [allRecipes, i18n.language]);

  useEffect(() => {
    if (searchInputRef.current && searchQuery === "") {
      searchInputRef.current.value = "";
    }
  }, [searchQuery]);

  const handleSearchChange = (_event: React.SyntheticEvent, value: string) => {
    setShowMobileSearch(false);
    setSearchQuery(value);
    if (!value) {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = translatedOptions.filter((opt) =>
      opt.title?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

  const handleSelect = (_event: React.SyntheticEvent, value: string | null) => {
    if (!value) return;
    const option = translatedOptions.find((opt) => opt.title === value);
    if (option) {
      const recipe = allRecipes.find((r) => r.title === option.originalTitle);
      if (recipe) {
        setDialogOpen(true);
        setSearchActive(false);
        setShowMobileSearch(false);
        setSearchQuery("");
        setFilteredSuggestions([]);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        navigate(
          `/spotit/${encodeURIComponent(recipe.category)}/${encodeURIComponent(recipe.title)}`
        );
        window.location.reload();
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && searchActive) {
      setSearchActive(false);
      setSearchQuery("");
      setFilteredSuggestions([]);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const fadeStyle: React.CSSProperties = {
    transition:
      "opacity 0.4s cubic-bezier(.4,0,.2,1), width 0.4s cubic-bezier(.4,0,.2,1)",
    opacity: searchActive ? 0 : 1,
    width: searchActive ? 0 : "auto",
    pointerEvents: searchActive ? ("none" as React.CSSProperties["pointerEvents"]) : ("auto" as React.CSSProperties["pointerEvents"]),
    willChange: "opacity,width",
    overflow: "hidden",
    minWidth: 0,
    display: searchActive ? "none" : "flex",
    alignItems: "center",
    gap: "8px",
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
          background: isDarkMode ? "#000" : undefined, // Set dark background if dark mode
        }}
      >
        {/* Left side: Hamburger and Site Name */}
        <div
          style={{
            display: searchActive ? "none" : "flex",
            alignItems: "center",
            gap: "8px",
            ...fadeStyle,
          }}
        >
          {!desktop && !searchActive  && (
  <button className="hamburger" onClick={onHamburgerClick}>
    ☰
  </button>
)}
          <img
            src="https://vt-photos.s3.amazonaws.com/recipe-app-icon-generated-image.png"
            alt="Logo"
            style={{
              width: "60px",
              borderRadius: "50%",
            }}
          />
          <div className="SiteName">spotIt</div>
        </div>
        {/* Search input or icon */}
        <div style={{ flex: 0, maxWidth: "100%" }}>
          {/* Show magnifier on small screens, input on desktop or when expanded */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Mobile: show icon if not expanded */}
            <span
              style={{
                display:
                  !desktop && !showMobileSearch ? "inline-flex" : "none",
                alignItems: "center",
                cursor: "pointer",
                color: "white",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "50%",
                padding: "8px",
                marginLeft: "8px",
              }}
              onClick={() => setShowMobileSearch(true)}
            >
              <SearchIcon sx={{ fontSize: 28 }} />
            </span>
            {/* Show input if desktop or mobile search expanded */}
            <Autocomplete
              freeSolo
              options={translatedOptions.map((opt) => opt.title)}
              onInputChange={handleSearchChange}
              onChange={handleSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e, e.target.value)}
                  label={t("search")}
                  placeholder="recipe name"
                  variant="outlined"
                  sx={{
                    minWidth: "50px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                    borderWidth: "0px",
                    backgroundColor: isDarkMode ? "#222" : "#f5f5f5", // dark grey for dark mode, light for light mode
                    backgroundImage: "none",
                    backgroundSize: undefined,
                    backgroundRepeat: undefined,
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputLabel-root": { color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": { borderWidth: 0 },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                      borderWidth: "2px",
                      borderRadius: "8px",
                    },
                    "&.Mui-focused .MuiInputBase-input": {
                      color: "white",
                    },
                    "&.Mui-focused .MuiInputLabel-root": {
                      color: "white",
                    },
                    display:
                      desktop || showMobileSearch ? "block" : "none",
                    transition: "width 0.3s",
                  }}
                  InputProps={{
                    ...params.InputProps,
                  }}
                  onFocus={() => setSearchActive(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setSearchActive(false);
                      setShowMobileSearch(false);
                    }, 100);
                  }}
                  onKeyDown={handleKeyDown}
                />
              )}
              sx={{
                width:
                  desktop || showMobileSearch
                    ? { xs: "90vw", sm: "200px" }
                    : "0",
                maxWidth: "95%",
                transition: "width 0.3s ease",
                backgroundColor: isDarkMode ? "#222" : "#f5f5f5", // dark grey for dark mode, light for light mode
                backgroundImage: "none",
                backgroundSize: undefined,
                backgroundRepeat: undefined,
                borderRadius: "8px",
                position: "relative",
                "& .MuiInputBase-input": {
                  color: "white",
                },
                "& .MuiInputLabel-root": {
                  color: "white",
                },
                "&:focus-within .MuiOutlinedInput-notchedOutline": {
                  borderColor: "white",
                  borderWidth: "2px",
                },
                "&:focus-within .MuiInputBase-input": {
                  color: "white",
                },
                "&:focus-within .MuiInputLabel-root": {
                  color: "white",
                },
                "&:focus-within": {
                  width: "95vw",
                  maxWidth: "95vw",
                  zIndex: 10,
                  position: "relative",
                  left: "unset",
                  right: "unset",
                  margin: "0 auto",
                  borderRadius: "8px",
                  borderWidth: "0px",
                },
                boxSizing: "border-box",
                display: desktop || showMobileSearch ? "block" : "none",
              }}
            />
          </div>
        </div>
      </div>

    </>
  );
}
