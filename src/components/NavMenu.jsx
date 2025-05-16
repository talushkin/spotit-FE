import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";

export default function NavMenu({ pages, onSelect, isOpen, toggleDarkMode }) {
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [reorder, setReorder] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");

  const [orderedPages, setOrderedPages] = useState(pages);

  useEffect(() => {
    setOrderedPages(pages);
  }, [pages]);

  const handleOrderChange = (newOrder) => {
    console.log("New order received:", newOrder);
    setOrderedPages(newOrder);
  };

  const handleSelectCategory = (item) => {
    onSelect(item);
    setEditCategories(false);
    setReorder(false);
  };

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    document.body.dir = newLang === "he" || newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <div className={`nav ${isOpen || reorder ? "show" : "hide"}`}>
      <NavItemList
        editCategories={editCategories}
        pages={orderedPages}
        onSelect={handleSelectCategory}
        onOrderChange={handleOrderChange}
        setReorder={setReorder}
      />
      <a href="#" onClick={() => setEditCategories(!editCategories)}>
        {t("changeOrder")}
      </a>
      <Button
        variant="contained"
        onClick={toggleDarkMode}
        sx={{
          backgroundColor: "darkgreen",
          "&:hover": {
            backgroundColor: "green",
            "& .MuiSvgIcon-root": {
              color: "black",
            },
          },
        }}
      >
        <Brightness4Icon sx={{ color: "black" }} />
      </Button>
      <Box
        mt={2}
        sx={{
          width: "300px", // Fixed width for language bar
          backgroundColor: "darkgreen",
          padding: "1rem",
          borderRadius: "28px",
          "& .MuiInputBase-root": {
            color: "white",
          },
          "& .MuiInputLabel-root": {
            color: "white",
          },
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="language-select-label">
            {t("language") || "Language"}
          </InputLabel>
          <MuiSelect
            labelId="language-select-label"
            value={language}
            label={t("language") || "Language"}
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
      </Box>
    </div>
  );
}
