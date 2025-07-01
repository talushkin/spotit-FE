import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ThemeModeButton from "./ThemeModeButton";
import LanguageSelector from "./LanguageSelector";
import type { Category } from "../utils/storage";

interface CategoryItem {
  _id: string;
  category: string;
  createdAt?: string;
  itemPage?: any[];
  priority?: number;
  translatedCategory?: { [lang: string]: string } | Array<{ lang: string; value: string; _id?: string }>;
}

interface NavMenuProps {
  pages: Category[];
  onSelect: (item: CategoryItem) => void;
  isOpen: boolean;
  language: string;
  desktop: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onHamburgerClick: () => void;
}

function toCategoryItem(cat: Category): CategoryItem {
  return {
    _id: cat._id,
    category: cat.category,
    itemPage: cat.itemPage,
    // Only assign if present
    ...(cat as any).createdAt && { createdAt: (cat as any).createdAt },
    ...(cat as any).priority && { priority: (cat as any).priority },
    translatedCategory: cat.translatedCategory as CategoryItem["translatedCategory"],
  };
}

export default function NavMenu({ pages, onSelect, isOpen, language, desktop, isDarkMode, toggleDarkMode, onHamburgerClick }: NavMenuProps) {
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [reorder, setReorder] = useState(false);
  const [orderedPages, setOrderedPages] = useState<CategoryItem[]>(pages.map(toCategoryItem));

  const navigate = useNavigate();

  useEffect(() => {
    setOrderedPages(pages.map(toCategoryItem));
  }, [pages]);

  const handleOrderChange = (newOrder: CategoryItem[]) => {
    setOrderedPages(newOrder);
  };

  const handleSelectCategory = (item: CategoryItem) => {
    setEditCategories(false);
    setReorder(false);

    if (item?.category) {
      const categoryEncoded = encodeURIComponent(item.category);
      navigate(`/spotit/${categoryEncoded}`);
    }
    onHamburgerClick();
    onSelect(item);
    console.log("Selected category:", item);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      className={`nav ${isOpen || reorder || desktop ? "show" : "hide"}`}
      style={{
        background: isDarkMode ? "#222" : "#222", // Dark grey for dark mode, light for light mode
        minHeight: "100vh",
        transition: "background 0.3s",
      }}
    >
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
          backgroundColor: "darkgrey",
          "&:hover": {
            backgroundColor: "grey",
            "& .MuiSvgIcon-root": {
              color: "black",
            },
          },
        }}
        onClick={() => setEditCategories(!editCategories)}
      >
        {t("changeOrder")}
      </Button>
      {/* Only show language and theme buttons on desktop */}
      {desktop && (
        <>
          <div style={{ marginTop: "0rem", marginBottom: "0rem" }}>
            <LanguageSelector language={language} handleLanguageChange={handleLanguageChange} />
          </div>
          <ThemeModeButton isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </>
      )}
    </div>
  );
}
