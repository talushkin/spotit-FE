import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ThemeModeButton from "./ThemeModeButton.jsx";
import LanguageSelector from "./LanguageSelector.jsx";

export default function NavMenu({ pages, onSelect, isOpen, language, desktop, isDarkMode, toggleDarkMode }) {
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [reorder, setReorder] = useState(false);
  const [orderedPages, setOrderedPages] = useState(pages);

  const navigate = useNavigate();

  useEffect(() => {
    setOrderedPages(pages);
  }, [pages]);

  const handleOrderChange = (newOrder) => {
    setOrderedPages(newOrder);
  };

  const handleSelectCategory = (item) => {
    onSelect(item);
    setEditCategories(false);
    setReorder(false);

    if (item?.category) {
      const categoryEncoded = encodeURIComponent(item.category);
      navigate(`/recipes/${categoryEncoded}`);
    }
  };

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <div className={`nav ${isOpen || reorder || desktop ? "show" : "hide"}`}>
      <NavItemList
        editCategories={editCategories}
        pages={orderedPages}
        onSelect={handleSelectCategory}
        onOrderChange={handleOrderChange}
        setReorder={setReorder}
      />
      <Button
        variant="contained"
        sx={{
          backgroundColor: "darkgreen",
          "&:hover": {
            backgroundColor: "green",
            "& .MuiSvgIcon-root": {
              color: "black",
            },
          },
        }}
        onClick={() => setEditCategories(!editCategories)}
      >
        {t("changeOrder")}
      </Button>
      <div style={{ marginTop: "0rem", marginBottom: "0rem" }}>
        <LanguageSelector language={language} handleLanguageChange={handleLanguageChange} />
      </div>
      <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  );
}
