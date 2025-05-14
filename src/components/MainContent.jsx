import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import RecipeDialog from "./RecipeDialog";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI"; // <-- Add this
import * as storage from "../utils/storage";
import { generateImage } from "./imageAI"; // Import the imageAI function

export default function MainContent({
  data,
  selected,
  selectedRecipe,
  addRecipe,
}) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [translatedCategory, setTranslatedCategory] = useState(
    selected?.category
  );
  const itemsPerPage = 4;
  const [openView, setOpenView] = useState(selectedRecipe || false);
  const [openAdd, setOpenAdd] = useState(addRecipe || false);
  const [viewedItem, setViewedItem] = useState(selectedRecipe || null);

  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    preparation: "",
  });

  useEffect(() => {
    const translateCategory = async () => {
      if (i18n.language !== "he") {
        const translated = await translateDirectly(
          selected?.category,
          i18n.language
        );
        setTranslatedCategory(translated);
      } else {
        setTranslatedCategory(selected?.category);
      }
    };
    translateCategory();
  }, [selected?.category, i18n.language]);

  const handleViewOpen = (item) => {
    console.log("View:", item);
    setViewedItem(item);
    setOpenView(true);
  };

  const handleAddClick = () => {
    setOpenAdd(true);
  };

  const handleAddRecipe = async (recipe) => {
    console.log("Add:", recipe, selected);

    const category = selected;

    try {
      // Generate an image based on the recipe title
      const imageUrl = await generateImage(recipe.title);
      console.log("Generated Image URL:", imageUrl);

      // Use store.addRecipe to add the recipe with the generated image
      const response = await storage.addRecipe(
        {
          title: recipe.title,
          ingredients: recipe.ingredients.split(",").map((i) => i.trim()),
          preparation: recipe.preparation,
          categoryId: selected?._id,
          imageUrl: imageUrl || "https://placehold.co/100x100?text=No+Image", // Fallback if image generation fails
        },
        category
      );

      console.log("Recipe added:", response);

      // Optionally call a function to refresh recipes list from parent
      // onRecipeAdded?.(response);
    } catch (error) {
      console.error("Error adding recipe:", error.response?.data || error.message);
    }

    // Cleanup dialogs
    setNewRecipe({ title: "", ingredients: "", preparation: "" });
    setOpenAdd(false);
    setOpenView(false);
  };

  const totalItems = selected?.itemPage?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = selected?.itemPage?.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div className="main">
      <div
        className="main-title"
        style={{ display: "flex", alignItems: "center", gap: "1rem" }}
      >
        <h1>{translatedCategory}</h1>
        <Button variant="contained" color="primary" onClick={handleAddClick}>
          {t("addRecipe")}
        </Button>
      </div>
      <p style={{ flexBasis: "100%", textAlign: "center" }}>
        {t("page")} {page}, {t("recipes")} {startIndex + 1}–{endIndex} {t("of")}{" "}
        {totalItems}
      </p>{" "}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      )}
      <div className="row d-flex justify-content-center">
        {currentItems?.map((item, index) => (
          <div
            key={index}
            className="col-12 col-sm-8 col-md-6 col-lg-4 mb-4 d-flex justify-content-center"
            onClick={() => handleViewOpen(item)}
          >
            <CaseCard
              index={startIndex + index + 1}
              item={item}
              category={selected.category}
            />
          </div>
        ))}
      </div>
      <RecipeDialog
        open={openView}
        onClose={() => setOpenView(false)}
        type="view"
        recipe={viewedItem}
        onSave={(recipe) => {
          console.log("update:", recipe);
          handleAddRecipe(recipe)}} // Pass the recipe data to handleAddRecipe
        targetLang={i18n.language} // <-- Add this
      />
<RecipeDialog
  open={openAdd}
  onClose={() => setOpenAdd(false)}
  type="add"
  recipe={newRecipe}
  onSave={(recipe) => {
    handleAddRecipe(recipe)
  }
} // Pass the recipe data to handleAddRecipe
  targetLang={i18n.language}
/>
    </div>
  );
}
