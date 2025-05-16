import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function NavMenu({ pages, onSelect, isOpen }) {
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [reorder, setReorder] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");

  // Create a state for orderedPages that will be updated when the order changes
  const [orderedPages, setOrderedPages] = useState(pages);

  // Resync orderedPages when pages prop changes
  useEffect(() => {
    setOrderedPages(pages);
  }, [pages]);

  // Callback to update the order from NavItemList
  const handleOrderChange = (newOrder) => {
    console.log("New order received:", newOrder);
    setOrderedPages(newOrder);
  };

  // New function to handle category selection, closing the nav afterward
  const handleSelectCategory = (item) => {
    onSelect(item);
    // Close the navigation menu by resetting states
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
      <Box
        mt={2}
        sx={{
          width: "400px", // Fixed width for language bar
          backgroundColor: "#f7f1e3",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="language-select-label">
            {t("language") || "Language"}
          </InputLabel>
          <Select
            labelId="language-select-label"
            value={language}
            label={t("language") || "Language"}
            onChange={handleLanguageChange}
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
          </Select>
        </FormControl>
      </Box>
    </div>
  );
}
