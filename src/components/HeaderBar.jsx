import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField } from "@mui/material";
import RecipeDialog from "./RecipeDialog"; // Import the dialog
import Button from "@mui/material/Button"; // Corrected import from MUI

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

  const allRecipes = pages.flatMap((category) => category.itemPage);

  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
    const filtered = allRecipes.filter((page) => {
      const title = page?.title?.toLowerCase() || "";
      const ingredients = page?.ingredients?.toLowerCase() || "";
      const description = page?.description?.toLowerCase() || "";

      return (
        title.includes(value.toLowerCase()) ||
        ingredients.includes(value.toLowerCase()) ||
        description.includes(value.toLowerCase())
      );
    });
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
          padding: "8px",
          gap: "16px",
        }}
      >
        <button className="hamburger" onClick={onHamburgerClick}>
          ☰
        </button>
        <div className="SiteName">{t("appName")}</div>
        <div style={{ flex: 1 }}>
          <Autocomplete
            fullWidth
            freeSolo
            options={filteredSuggestions.map((page) => page.title)}
            onInputChange={handleSearchChange}
            onChange={handleSelect} // Open dialog on select
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
              width: "100%",
              backgroundColor: "lightblue", // Set the background color to light blue
              padding: "1rem", // Optional: Add padding if needed
              borderRadius: "8px", // Optional: Add border radius for rounded corners
            }}
          />
        </div>
        <Button variant="contained" color="primary" onClick={toggleDarkMode}>
          Dark
        </Button>
      </div>

      {/* Show Recipe Dialog when recipe is selected */}
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
