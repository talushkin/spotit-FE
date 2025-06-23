import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import RecipeDialog from "./RecipeDialog";
import cardboardTexture from "../assets/cardboard-texture.jpg";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

export default function HeaderBar({
  logo,
  onHamburgerClick,
  pages,
  desktop
}) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language);

  // Track if search is active (focused or has value)
  const [searchActive, setSearchActive] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchInputRef = useRef(null);

  // Reset the input value in the DOM when searchQuery is reset
  useEffect(() => {
    if (searchInputRef.current && searchQuery === "") {
      searchInputRef.current.value = "";
    }
  }, [searchQuery]);

  const allRecipes = pages?.flatMap((category) => category.itemPage);


  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
    if (!value) {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = allRecipes?.filter((recipe) =>
      recipe.title?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

  const handleSelect = (event, value) => {
    const recipe = allRecipes.find((page) => page.title === value);
    if (recipe) {
      setSelectedRecipe(recipe);
      setDialogOpen(true);
    }
  };

  // Handle ESC key to exit search and fade in ham/recipes
  const handleKeyDown = (event) => {
    if (event.key === "Escape" && searchActive) {
      setSearchActive(false);
      setSearchQuery(""); // <-- Reset the search text
      setFilteredSuggestions([]);
      console.log(searchQuery,"Search closed, fading in hamburger and recipes");
      // Optionally blur the input
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  // Fade and width animation styles for left side (hamburger/logo/title)
  const fadeStyle = {
    transition: "opacity 0.4s cubic-bezier(.4,0,.2,1), width 0.4s cubic-bezier(.4,0,.2,1)",
    opacity: searchActive ? 0 : 1,
    width: searchActive ? 0 : "auto",
    pointerEvents: searchActive ? "none" : "auto",
    willChange: "opacity,width",
    overflow: "hidden",
    minWidth: 0,
    display: searchActive ? "none" : "flex", // Hide completely when faded out
  };

  return (
    <>
      <div
        className="HeaderBar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px",
          flexWrap: "nowrap",
          width: "100%",
          boxSizing: "border-box",
          maxHeight: "80px",
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
          {!desktop && (
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
          <div className="SiteName">{t("appName")}</div>
        </div>
        {/* Search input or icon */}
        <div style={{ flex: 0, maxWidth: "95%" }}>
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
              options={filteredSuggestions.map((page) => page.title)}
              onInputChange={handleSearchChange}
              onChange={handleSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e, e.target.value)}
                  label={t("search")}
                  placeholder="keywords"
                  variant="outlined"
                  sx={{
                    minWidth: "50px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                    borderWidth: "0px",
                    backgroundImage: `url(${cardboardTexture})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "repeat",
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
                    width:
                      !desktop && showMobileSearch
                        ? "90vw"
                        : desktop
                        ? "200px"
                        : "0",
                    transition: "width 0.3s",
                  }}
                  InputProps={{
                    ...params.InputProps,
                  }}
                  onFocus={() => setSearchActive(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!searchQuery) setSearchActive(false);
                      if (!desktop) setShowMobileSearch(false);
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
                backgroundImage: `url(${cardboardTexture})`,
                backgroundSize: "fit",
                backgroundRepeat: "repeat",
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
      {selectedRecipe && (
        <RecipeDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          recipe={selectedRecipe}
          targetLang={i18n.language}
        />
      )}
    </>
  );
}
