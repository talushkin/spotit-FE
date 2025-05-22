import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField } from "@mui/material";
import RecipeDialog from "./RecipeDialog";
import cardboardTexture from "../assets/cardboard-texture.jpg";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem, Button
} from "@mui/material";
export default function HeaderBar({
  logo,
  onHamburgerClick,
  pages,
  toggleDarkMode,
  desktop, isDarkMode
}) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language);

  const allRecipes = pages?.flatMap((category) => category.itemPage);

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    document.body.dir = newLang === "he" || newLang === "ar" ? "rtl" : "ltr";
  };

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
          flexWrap: "nowrap",
          width: "100%",
          boxSizing: "border-box",
          maxHeight: "80px",
        }}
      >
        {/* Left side: Hamburger and Site Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!desktop &&
            (<button className="hamburger" onClick={onHamburgerClick}>
              ☰
            </button>)
          }
          <img
            src="https://vt-photos.s3.amazonaws.com/recipe-app-icon-generated-image.png"
            alt="Logo"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              marginLeft: "8px",
            }}
          />
          <div className="SiteName">{t("appName")}</div>

        </div>

        <div>
          <FormControl sx={{ maxWidth: "150px", marginRight: "8px" }}>
            <InputLabel id="language-select-label">
            </InputLabel>
            <MuiSelect
              labelId="language-select-label"
              value={language}
              onChange={handleLanguageChange}
              sx={{
                backgroundColor: "darkgreen",
                color: "white",
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="he">עברית</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="ar">العربية</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="it">Italiano</MenuItem>
              <MenuItem value="pt">Português</MenuItem>
              <MenuItem value="ru">Русский</MenuItem>
              <MenuItem value="zh">中文</MenuItem>
              <MenuItem value="ja">日本語</MenuItem>
              <MenuItem value="ko">한국어</MenuItem>
              <MenuItem value="pl">Polski</MenuItem>
              <MenuItem value="tr">Türkçe</MenuItem>
              <MenuItem value="nl">Nederlands</MenuItem>
            </MuiSelect>
          </FormControl>
        </div>
              <Button
        variant="contained"
        onClick={toggleDarkMode}
        sx={{
          backgroundColor: 'darkgreen',
          // mt: '200px',
          //mb: 2,
          "&:hover": {
            backgroundColor: 'green',
            "& .MuiSvgIcon-root": {
              color: 'black',
            },
          },
        }}
      >
        <Brightness4Icon sx={{ color: 'black' }} />
      </Button>
        {/* Right side: Search */}
        <div style={{ flex: 0, maxWidth: "400px" }}>
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
                placeholder="keywords"
                variant="outlined"
                fullWidth
                sx={{
                  minWidth: "150px",
                  maxWidth: "400px",
                  backgroundImage: `url(${cardboardTexture})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "repeat",
                  borderRadius: "8px",
                  "& .MuiInputBase-input": { color: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                }}
              />
            )}
            sx={{
              maxHeight: "80px",
              padding: "0px",
              maxWidth: "150px",
              transition: "width 0.3s ease",
              backgroundImage: `url(${cardboardTexture})`,
              backgroundSize: "fit",
              padding: "0.1rem",
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
              "&.MuiOutlinedInput-root": {
                padding: "0 px",
                "& fieldset": {
                  borderColor: "black",
                },
                "&:hover fieldset": {
                  borderColor: "black",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "black",
                },
                "&.MuiOutlinedInput-root": {
                  padding: "0 px",
                }

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
      )},

    </>
  );
}
