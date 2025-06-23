import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";

const BASE_URL = "https://be-tan-theta.vercel.app";

const RecipeDialog = ({
  open,
  onClose,
  onSave,
  onDelete,
  recipe,
  targetLang = "en",
  type,
  categoryName,
  autoFill = false,
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

  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isFillingAI, setIsFillingAI] = useState(false);

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
    if (editableRecipe && autoFill) {
      handleFillAI();
    }
  }, [autoFill]);

  useEffect(() => {
    if (!recipe || !targetLang || !open || targetLang === "en") return;
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
    console.log("Saving recipe:", editableRecipe);
    onSave(editableRecipe);
    onClose();
  };

  const handleFillAI = async () => {
    setIsFillingAI(true);
    try {
      let aiTitle = editableRecipe.title;
      // If language is not English, translate the title to English before sending to AI
      if (i18n.language !== "en") {
        try {
          aiTitle = await translateDirectly(editableRecipe.title, "en");
        } catch (e) {
          aiTitle = editableRecipe.title; // fallback if translation fails
        }
      }
      const authToken = localStorage.getItem("authToken") || "1234";
      const response = await fetch(`${BASE_URL}/api/ai/fill-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          categoryName: categoryName,
          title: aiTitle,
          recipeId: recipe?._id,
        }),
      });
      if (!response.ok) throw new Error("Failed to fill recipe via AI");

      const data = await response.json();

      // If the current language is not English, translate the AI results back to the current language
      let translatedTitle = data.title || editableRecipe.title;
      let translatedIngredients = data.ingredients;
      let translatedPreparation = data.preparation;
      if (i18n.language !== "en") {
        try {
          [translatedTitle, translatedIngredients, translatedPreparation] =
            await Promise.all([
              translateDirectly(aiTitle , i18n.language),
              translateDirectly(data.ingredients, i18n.language),
              translateDirectly(data.preparation, i18n.language),
            ]);
        } catch (e) {
          // fallback to original if translation fails
        }
      }

      setEditableRecipe((prev) => ({
        ...prev,
        ingredients: translatedIngredients,
        title: translatedTitle,
        preparation: translatedPreparation,
      }));
      await handleRecreateImage(aiTitle || editableRecipe.title);
    } catch (error) {
      console.error("Error while filling recipe via AI:", error);
    } finally {
      setIsFillingAI(false);
    }
  };

  const handleRecreateImage = async (text = editableRecipe?.title) => {
    setIsLoadingImage(true);
    try {
      const authToken = localStorage.getItem("authToken") || "1234";
      const response = await fetch(`${BASE_URL}/api/ai/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          text: text,
          recipeId: recipe?._id,
        }),
      });
      if (!response.ok) throw new Error("Failed to recreate image via AI");

      const data = await response.json();
      setEditableRecipe((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
      }));
    } catch (error) {
      console.error("Error while recreating image via AI:", error);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      editableRecipe._id = recipe?._id;
      onDelete(editableRecipe);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dir={isRTL ? "rtl" : "ltr"}
      PaperProps={{
        style: { maxWidth: "95%", width: "95%" },
      }}
    >
      <DialogTitle
        style={{
          backgroundColor: "#f7f1e3",
          textAlign: "center",
          padding: "10px 0 0 0",
          fontSize: "20px",
        }}
      >
        {editableRecipe.title}
        <IconButton
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>×</span>
        </IconButton>
      </DialogTitle>

      <Box position="relative">
        {isFillingAI && (
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255,255,255,0.6)"
            zIndex={10}
          >
            <CircularProgress />
          </Box>
        )}

        <DialogContent
          style={{
            backgroundColor: "#f7f1e3",
          }}
        >
          <Box
            position="relative"
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginBottom={2}
          >
            <img
              src={
                editableRecipe.imageUrl ||
                "https://placehold.co/100x100?text=No+Image"
              }
              alt={editableRecipe.title}
              style={{ maxHeight: "300px", borderRadius: "28px" }}
            />
            {isLoadingImage && (
              <CircularProgress
                size={48}
                style={{
                  position: "absolute",
                }}
              />
            )}
            <IconButton
              onClick={() => handleRecreateImage(editableRecipe.title)}
              title={t("recreate image")}
              style={{ position: "absolute", right: 10, top: 10 }}
            >
              <span style={{ fontSize: "24px" }}>✏️</span>
            </IconButton>
          </Box>

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
      </Box>

      <DialogActions
        sx={{
          display: "flex",
          gap: 2,
          width: "100%",
          justifyContent: "center",
          "& > button": {
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            paddingLeft: 2,
            paddingRight: 2,
            height: "48px", // Ensures all buttons have the same height
            fontWeight: "bold", // Matches nav button style
            borderRadius: "4px",
          },
        }}
      >
        <Button onClick={handleFillAI} variant="contained" color="secondary">
          {t("AI")}
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          {t("delete")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("save")}
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;
