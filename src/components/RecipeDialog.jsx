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
  const isRTL = i18n.language === "he";

  const [translated, setTranslated] = useState({
    title: "",
    ingredients: "",
    preparation: "",
  });

  useEffect(() => {
    if (!recipe || !targetLang || !open) return;

    const doTranslate = async () => {
      const [title, ingredients, preparation] = await Promise.all([
        translateDirectly(recipe.title, targetLang),
        translateDirectly(recipe.ingredients, targetLang),
        translateDirectly(recipe.preparation, targetLang),
      ]);
      setTranslated({ title, ingredients, preparation });
    };

    if (recipe.title) {
      doTranslate();
    }
  }, [recipe, targetLang, open]);

  return (
    <Dialog open={open} onClose={onClose} dir={isRTL ? "rtl" : "ltr"}>
      <DialogTitle>{type} recipe</DialogTitle>
      <DialogContent>
        <TextField
          label={t("recipeName")}
          defaultValue={translated.title || recipe?.title}
          fullWidth
          margin="normal"
        />
        <TextField
          label={t("ingredients")}
          fullWidth
          multiline
          rows={4}
          defaultValue={translated.ingredients || recipe?.ingredients}
          margin="normal"
        />
        <TextField
          label={t("preparation")}
          fullWidth
          multiline
          rows={4}
          defaultValue={translated.preparation || recipe?.preparation}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("close")}</Button>
        <Button onClick={onSave} variant="contained">
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;
