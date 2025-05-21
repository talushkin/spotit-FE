import React, { useState, useEffect } from "react";
import NavItemList from "./NavItemList";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { useNavigate } from "react-router-dom"; // ✅ Step 1

export default function NavMenu({ pages, onSelect, isOpen, toggleDarkMode, language, desktop }) {
  const { t, i18n } = useTranslation();
  const [editCategories, setEditCategories] = useState(false);
  const [reorder, setReorder] = useState(false);
  const [orderedPages, setOrderedPages] = useState(pages);

  const navigate = useNavigate(); // ✅ Step 2

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
    
    // ✅ Step 3: Navigate to the new route
    if (item?.category) {
      const categoryEncoded = encodeURIComponent(item.category);
      navigate(`/recipes/${categoryEncoded}`);
    }
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
        onClick={() => setEditCategories(!editCategories)}
        sx={{
          marginLeft: '60px',
          backgroundColor: 'darkblue',
          "&:hover": {
            backgroundColor: 'blue',
            "& .MuiSvgIcon-root": {
              color: 'black',
            },
          },
        }}
      >{t("changeOrder")}
      </Button>
      <Button
        variant="contained"
        onClick={toggleDarkMode}
        sx={{
          backgroundColor: 'darkgreen',
          mt: '200px',
          mb: 2,
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
