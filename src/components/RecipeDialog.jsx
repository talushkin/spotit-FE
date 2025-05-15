import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";

const RecipeDialog = ({
  open,
  onClose,
  onSave,
  onDelete, // new prop for deleting recipe
  recipe,
  targetLang = "en",
  type,
}) => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "he" || i18n.language === "ar";

  const [editableRecipe, setEditableRecipe] = useState({
    title: recipe?.title || "",
    ingredients: recipe?.ingredients || "",
    preparation: recipe?.preparation || "",
    imageUrl: recipe?.imageUrl || "",
    _id: recipe?._id || "",
  });

  // Sync editableRecipe with the recipe prop when it changes
  useEffect(() => {
    if (recipe) {
      setEditableRecipe({
        title: recipe.title || "",
        ingredients: recipe.ingredients || "",
        preparation: recipe.preparation || "",
        imageUrl: recipe.imageUrl || "",
      });
    }
  }, [recipe]);

  useEffect(() => {
    if (!recipe || !targetLang || !open) return;
    const doTranslate = async () => {
      try {
        const [title, ingredients, preparation] = await Promise.all([
          translateDirectly(recipe.title, targetLang),
          translateDirectly(recipe.ingredients, targetLang),
          translateDirectly(recipe.preparation, targetLang),
        ]);
        setEditableRecipe((prev) => ({
          ...prev,
          title,
          ingredients,
          preparation,
        }));
      } catch (error) {
        console.error("Error during translation:", error);
      }
    };
    doTranslate();
  }, [recipe, targetLang, open]);

  const handleChange = (field) => (event) => {
    setEditableRecipe((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    onSave(editableRecipe); // Pass the updated recipe to the onSave callback
            onClose()
  };

  const handleFillAI = async () => {
    try {
      const authToken = localStorage.getItem("authToken") || "1234";
      const response = await fetch("http://localhost:5000/api/ai/fill-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: editableRecipe.title, recipeId: recipe?._id }),
      });
      if (!response.ok) {
        throw new Error("Failed to fill recipe via AI");
      }
      const data = await response.json();
      // Assuming data contains { ingredients, preparation }
      setEditableRecipe((prev) => ({
        ...prev,
        ingredients: data.ingredients,
        preparation: data.preparation,
      }));
      handleRecreateImage();
    } catch (error) {
      console.error("Error while filling recipe via AI:", error);
    }
  };

  const handleRecreateImage = async () => {
    try {
      const authToken = localStorage.getItem("authToken") || "1234";
      const response = await fetch("http://localhost:5000/api/ai/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text: editableRecipe.title+':'+editableRecipe.ingredients, recipeId: recipe?._id }),
      });
      if (!response.ok) {
        throw new Error("Failed to recreate image via AI");
      }
      const data = await response.json();
      // Assuming data contains { imageUrl }
      setEditableRecipe((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
      }));
    } catch (error) {
      console.error("Error while recreating image via AI:", error);
    }
  };

  const handleDelete = () => {
      if (onDelete) {
        editableRecipe._id = recipe?._id; // Ensure we have the correct ID
        console.log("Deleting recipe:", editableRecipe);
        onDelete(editableRecipe);
        onClose()
      }

  };

  return (
    <Dialog open={open} onClose={onClose} dir={isRTL ? "rtl" : "ltr"}>
      <DialogTitle>
        {type} recipe {recipe?._id ? recipe._id : ""}
      </DialogTitle>
      <DialogContent>
        {/* Container for image and recycle (pencil) icon */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={editableRecipe.imageUrl || "https://placehold.co/100x100?text=No+Image"}
            alt={editableRecipe.title}
            style={{ margin: "10px", maxWidth: "100%" }}
          />
          <IconButton onClick={handleRecreateImage} title={t("recreate image")}>
            {/* Using a simple pencil icon (Unicode) */}
            <span style={{ fontSize: "24px" }}>✏️</span>
          </IconButton>
        </div>
        <TextField
          label={t("recipeName")}
          value={editableRecipe.title}
          onChange={handleChange("title")}
          fullWidth
          margin="normal"
        />
        <TextField
          label={t("ingredients")}
          value={editableRecipe.ingredients}
          onChange={handleChange("ingredients")}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <TextField
          label={t("preparation")}
          value={editableRecipe.preparation}
          onChange={handleChange("preparation")}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("close")}</Button>
        <Button onClick={handleFillAI} variant="contained" color="secondary">
          {t("fill AI")}
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          {t("delete")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;
