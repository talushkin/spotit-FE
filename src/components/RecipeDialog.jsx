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
import cardboardTexture from "../assets/cardboard-texture.jpg";

// Define base URL
const BASE_URL = "https://be-tan-theta.vercel.app";

const RecipeDialog = ({
  open,
  onClose,
  onSave,
  onDelete, // new prop for deleting recipe
  recipe,
  targetLang = "en",
  type,
  categoryName
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
    if (!recipe || !targetLang || !open || targetLang==='en') return;
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
    onClose();
  };

  const handleFillAI = async () => {
    try {
      const authToken = localStorage.getItem("authToken") || "1234";
      const response = await fetch(`${BASE_URL}/api/ai/fill-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ categoryName:categoryName , title: editableRecipe.title, recipeId: recipe?._id }),
      });
      if (!response.ok) {
        throw new Error("Failed to fill recipe via AI");
      }
      const data = await response.json();
      // Assuming data contains { ingredients, preparation }
      setEditableRecipe((prev) => ({
        ...prev,
        ingredients: data.ingredients,
        title: data.title || prev.title,
        preparation: data.preparation,
      }));
      handleRecreateImage(data.title || editableRecipe.title);
    } catch (error) {
      console.error("Error while filling recipe via AI:", error);
    }
  };

  const handleRecreateImage = async (text=editableRecipe.title) => {
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
      editableRecipe._id = recipe?._id; // Ensure correct ID
      console.log("Deleting recipe:", editableRecipe);
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
        style: { maxWidth: "90%", width: "90%" },
      }}
    >
      <DialogTitle
        style={{
          backgroundColor: "#f7f1e3",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          textAlign: "center",
          justifyContent: "center",
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
      <DialogContent
        style={{
          backgroundColor: "#f7f1e3",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        {/* Container for image and recycle (pencil) icon */}
        <div
          style={{
            justifyContent:"center",
            justifyItems:"center",
            display: "flex",
            alignItems: "center",
            borderRadius: "8px"
          }}
        >
          <img
            src={editableRecipe.imageUrl || "https://placehold.co/100x100?text=No+Image"}
            alt={editableRecipe.title}
            style={{ margin: "10px", maxWidth: "100%", borderRadius: "28px" }}
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
