import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";

const RecipeDialog = ({
  open,
  onClose,
  onSave,
  recipe,
  targetLang = "en",
  type,
}) => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === "he" || i18n.language === "ar";

  const [translated, setTranslated] = useState({
    title: "",
    ingredients: "",
    preparation: "",
  });

  const [editableRecipe, setEditableRecipe] = useState({
    title: recipe?.title || "",
    ingredients: recipe?.ingredients || "",
    preparation: recipe?.preparation || "",
  });

  // Sync editableRecipe with the recipe prop when it changes
  useEffect(() => {
    if (recipe) {
      setEditableRecipe({
        title: recipe.title || "",
        ingredients: recipe.ingredients || "",
        preparation: recipe.preparation || "",
      });
    }
  }, [recipe]);

  useEffect(() => {
    if (!recipe || !targetLang || !open) return;

    const doTranslate = async () => {
      try {
        console.log("Translating recipe:", recipe, "to language:", targetLang);
        const [title, ingredients, preparation] = await Promise.all([
          translateDirectly(recipe.title, targetLang),
          translateDirectly(recipe.ingredients, targetLang),
          translateDirectly(recipe.preparation, targetLang),
        ]);
        setEditableRecipe({ title, ingredients, preparation });
        console.log("Translation completed:", { title, ingredients, preparation });
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
  };

  return (
    <Dialog open={open} onClose={onClose} dir={isRTL ? "rtl" : "ltr"}>
      <DialogTitle>{type} recipe</DialogTitle>
      <DialogContent>
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
        <Button onClick={handleSave} variant="contained">
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;
