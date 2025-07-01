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
import AutorenewIcon from "@mui/icons-material/Autorenew";

const BASE_URL = "https://be-tan-theta.vercel.app";

interface Recipe {
  _id?: string;
  title: string;
  ingredients: string;
  preparation: string;
  imageUrl?: string;
}

interface RecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  recipe: Recipe;
  targetLang?: string;
  type?: string;
  categoryName?: string;
  autoFill?: boolean;
}

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
}: RecipeDialogProps) => {
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
  const [isTranslating, setIsTranslating] = useState({
    title: false,
    ingredients: false,
    preparation: false,
  });
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedRecipe, setTranslatedRecipe] = useState({
    title: "",
    ingredients: "",
    preparation: "",
  });

  useEffect(() => {
    // Reset to English when dialog opens or recipe changes
    setShowTranslated(false);
    setEditableRecipe({
      title: recipe?.title || "",
      ingredients: recipe?.ingredients || "",
      preparation: recipe?.preparation || "",
      imageUrl: recipe?.imageUrl || "",
      _id: recipe?._id || "",
    });
    setTranslatedRecipe({
      title: "",
      ingredients: "",
      preparation: "",
    });
  }, [recipe, open]);

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

  // useEffect(() => {
  //   if (!recipe || !targetLang || !open || targetLang === "en") return;
  //   const doTranslate = async () => {
  //     try {
  //       setIsTranslating({ title: true, ingredients: true, preparation: true });
  //       const [title, ingredients, preparation] = await Promise.all([
  //         translateDirectly(recipe.title, targetLang),
  //         translateDirectly(recipe.ingredients, targetLang),
  //         translateDirectly(recipe.preparation, targetLang),
  //       ]);
  //       setEditableRecipe((prev) => ({
  //         ...prev,
  //         title,
  //         ingredients,
  //         preparation,
  //       }));
  //     } catch (error) {
  //       console.error("Error during translation:", error);
  //     } finally {
  //       setIsTranslating({ title: false, ingredients: false, preparation: false });
  //     }
  //   };
  //   doTranslate();
  // }, [recipe, targetLang, open]);

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
      let translatedTitle = data.title;
      let translatedIngredients = data.ingredients;
      let translatedPreparation = data.preparation;
      if (i18n.language !== "en") {
        try {
          [translatedTitle, translatedIngredients, translatedPreparation] =
            await Promise.all([
              translateDirectly(data.title , i18n.language),
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
      await handleRecreateImage(data.title);
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

  const handleLangButton = async () => {
    if (!showTranslated && targetLang !== "en") {
      setIsTranslating({ title: true, ingredients: true, preparation: true });
      try {
        const [title, ingredients, preparation] = await Promise.all([
          translateDirectly(recipe.title, targetLang),
          translateDirectly(recipe.ingredients, targetLang),
          translateDirectly(recipe.preparation, targetLang),
        ]);
        setTranslatedRecipe({ title, ingredients, preparation });
        setEditableRecipe((prev) => ({
          ...prev,
          title,
          ingredients,
          preparation,
        }));
      } catch (error) {
        console.error("Error during translation:", error);
      } finally {
        setIsTranslating({ title: false, ingredients: false, preparation: false });
        setShowTranslated(true);
      }
    } else {
      // Switch back to English/original
      setEditableRecipe({
        title: recipe?.title || "",
        ingredients: recipe?.ingredients || "",
        preparation: recipe?.preparation || "",
        imageUrl: recipe?.imageUrl || "",
        _id: recipe?._id || "",
      });
      setShowTranslated(false);
    }
  };

  return (
    <Dialog
      open={open||false}
      onClose={onClose}
      dir={isRTL ? "rtl" : "ltr"}
      PaperProps={{
        style: {
          maxWidth: "98vw",
          width: "98vw",
          maxHeight: "98vh",
          height: "98vh",
          borderRadius: "24px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          background: "rgb(247, 241, 227)",
          overflow: "auto",
        },
      }}
      disableEscapeKeyDown={false} // Allow ESC to close
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <DialogTitle
        style={{
          backgroundColor: "#f7f1e3",
          textAlign: "center",
          padding: "10px",
          fontSize: "2.8rem", // Enlarged title text
          fontWeight: "bold",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          position: "relative",
          minHeight: "60px",
        }}
      >
        {editableRecipe.title}
        <IconButton
          onClick={onClose}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: "bold", lineHeight: 1 }}>×</span>
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
            style={{ minHeight: "180px" }}
          >
            {/* Stack language buttons vertically on the left */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 16,
                zIndex: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Button
                variant={showTranslated ? "outlined" : "contained"}
                size="small"
                sx={{
                  background: showTranslated ? "#fff" : "darkgreen",
                  color: showTranslated ? "inherit" : "#fff",
                  borderRadius: "16px",
                  fontWeight: "bold",
                  minWidth: "90px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
                onClick={() => {
                  if (showTranslated) handleLangButton();
                }}
              >
                ENGLISH
              </Button>
              <Button
                variant={showTranslated ? "contained" : "outlined"}
                size="small"
                sx={{
                  background: showTranslated ? "darkgreen" : "#fff",
                  color: showTranslated ? "#fff" : "inherit",
                  borderRadius: "16px",
                  fontWeight: "bold",
                  minWidth: "90px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
                onClick={() => {
                  if (!showTranslated) handleLangButton();
                }}
                disabled={targetLang === "en"}
              >
                {targetLang === "en"
                  ? "ENGLISH"
                  : t(targetLang.charAt(0).toUpperCase() + targetLang.slice(1))}
              </Button>
            </Box>

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
              style={{
                position: "absolute",
                top: 12,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <AutorenewIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>

          <Box position="relative">
            <TextField
              label={t("recipeName")}
              value={editableRecipe.title}
              onChange={handleChange("title")}
              fullWidth
              margin="normal"
              InputProps={{
                style: {
                  fontSize: "2rem",
                  fontWeight: "bold",
                },
                readOnly: isTranslating.title,
              }}
              InputLabelProps={{
                style: {
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                },
              }}
            />
            {isTranslating.title && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 2,
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                <CircularProgress size={32} />
                <span style={{ marginTop: 8, fontWeight: "bold", fontSize: "1rem" }}>
                  {t("loading")}
                </span>
              </Box>
            )}
          </Box>

          <Box position="relative">
            <TextField
              label={t("ingredients")}
              value={editableRecipe.ingredients}
              onChange={handleChange("ingredients")}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              InputProps={{
                readOnly: isTranslating.ingredients,
              }}
            />
            {isTranslating.ingredients && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 2,
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                <CircularProgress size={32} />
                <span style={{ marginTop: 8, fontWeight: "bold", fontSize: "1rem" }}>
                  {t("loading")}
                </span>
              </Box>
            )}
          </Box>

          <Box position="relative">
            <TextField
              label={t("preparation")}
              value={editableRecipe.preparation}
              onChange={handleChange("preparation")}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              InputProps={{
                readOnly: isTranslating.preparation,
              }}
            />
            {isTranslating.preparation && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 2,
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                <CircularProgress size={32} />
                <span style={{ marginTop: 8, fontWeight: "bold", fontSize: "1rem" }}>
                  {t("loading")}
                </span>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Box>

      <DialogActions
        sx={{
          display: "flex",
          gap: 2,
          width: "100%",
          justifyContent: "center",
          background: "rgb(247, 241, 227)", // Set background color for actions area
          "& > button": {
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            paddingLeft: 2,
            paddingRight: 2,
            height: "48px",
            fontWeight: "bold",
            borderRadius: "10px",
          },
        }}
      >
        <Button onClick={handleFillAI} variant="contained" color="secondary">
          {t("AI")}
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          sx={{
            background: "#fff",
            color: "#d32f2f",
            border: "1px solid #d32f2f",
            "&:hover": {
              background: "#f7f1e3",
              color: "#b71c1c",
              border: "1px solid #b71c1c",
            },
          }}
        >
          {t("delete")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("save")}
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          {t("close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;
