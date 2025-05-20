import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import {
  Button,
  Box,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";

export default function NavMenu({ pages, onSelect, isOpen, toggleDarkMode,language,desktop }) {
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [reorder, setReorder] = useState(false);

  const [orderedPages, setOrderedPages] = useState(pages);

  useEffect(() => {
    setOrderedPages(pages);
  }, [pages]);

    useEffect(() => {
    console.log("isOpen changed:", isOpen);
  }, [isOpen]);

  const handleOrderChange = (newOrder) => {
    console.log("New order received:", newOrder);
    setOrderedPages(newOrder);
  };

  const handleSelectCategory = (item) => {
    onSelect(item);
    setEditCategories(false);
    setReorder(false);
  };

  return (
<div
  className={`nav ${isOpen || reorder || desktop ? "show" : "hide"}`}

>
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
      backgroundColor: 'darkgreen',
      mt: '200px', // Pushes the button to the bottom
      mb: 2, // Optional bottom margin
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
</div>

  );
}
