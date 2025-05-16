import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField } from "@mui/material";
import RecipeDialog from "./RecipeDialog";
import cardboardTexture from "../assets/cardboard-texture.jpg";

export default function HeaderBar({
  logo,
  onHamburgerClick,
  pages,
  toggleDarkMode,
}) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  return (
    <>
      <div
        className="HeaderBar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // space between hamburger and search
          padding: "8px",
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left side: Hamburger and Site Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="hamburger" onClick={onHamburgerClick}>
            ☰
          </button>
          <div className="SiteName">{t("appName")}</div>
        </div>
        {/* Right side: Search */}
        <div style={{ flexShrink: 0 }}>
          <Autocomplete
            freeSolo
            options={filteredSuggestions.map((page) => page.title)}
            onInputChange={handleSearchChange}
            onChange={handleSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e, e.target.value)}
                label={t("search")}
                placeholder="Enter recipe title, ingredients or keywords"
                variant="outlined"
                fullWidth
              />
            )}
            sx={{
              minWidth: "200px" ,
              transition: "width 0.3s ease",
              backgroundImage: `url(${cardboardTexture})`,
              backgroundSize: "fit",
              backgroundRepeat: "repeat",
              "& .MuiInputBase-input": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "&:focus-within": {
                width: "100%",
              },
              borderRadius: "8px",
              padding: "1rem",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "black",
                },
                "&:hover fieldset": {
                  borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black",
                },
              },
            }}
          />
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
