import NavItemList from "./NavItemList";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function NavMenu({ pages, onSelect, isOpen }) {
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [language, setLanguage] = useState(i18n.language || "en");

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    document.body.dir = newLang === "he" || newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <div className={`nav ${isOpen ? "show" : "hide"}`}>
      <NavItemList
        editCategories={editCategories}
        pages={pages}
        onSelect={onSelect}
      />
      <a href="#" onClick={() => setEditCategories(!editCategories)}>
        {t("changeOrder")}
      </a>
      <Box
        mt={2}
        sx={{
          backgroundColor: "lightblue", // Set the background color to light blue
          padding: "1rem", // Optional: Add padding if needed
          borderRadius: "8px", // Optional: Add border radius for rounded corners
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
