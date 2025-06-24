import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import dayjs from "dayjs";
import * as storage from "../utils/storage";

export default function CaseCard({ item, category, index, isDarkMode }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [translated, setTranslated] = useState({
    title: "",
    description: "",
  });
  const [imageUrl, setImageUrl] = useState(
    "C:\\FE-code\\recipes\\BE\\images\\1747127810600-generated-image.png"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateFields = async () => {
      setIsLoading(true);
      try {
        const [title, description] = await Promise.all([
          translateDirectly(item.title, currentLang),
          translateDirectly(item.description, currentLang),
        ]);
        setTranslated({ title, description });
      } catch (error) {
        console.error("Translation error:", error);
        setTranslated({ title: item.title, description: item.description });
      } finally {
        setIsLoading(false);
      }
    };

    if (item && currentLang !== "en") {
      translateFields();
    } else {
      setTranslated({ title: item.title, description: item.description });
    }
  }, [item, currentLang]);

  const isNewRecipe = item.title === "ADD NEW RECEPY";
  const linkHref = `/recipies/${encodeURIComponent(
    category
  )}/${encodeURIComponent(item.title)}`;

  return (
    <div
      className="case"
      style={{
        backgroundColor: isDarkMode ? "#333" : "#fffce8",
        border: isDarkMode
          ? "1px solid rgb(71, 69, 69)"
          : "1px solid rgb(234, 227, 227)",
        borderRadius: "18px",
        transition: "border 0.2s",
      }}
    >
      <img
        src={item.imageUrl || imageUrl}
        alt={translated.title || item.title}
        onError={(e) => {
          e.target.src = `https://placehold.co/100x100?text=${item.title}`;
        }}
      />
      <h2>{isLoading ? t("loading") : translated.title}</h2>
      <p style={{ color: isDarkMode ? "#fff" : "#333" }}>
        {item.createdAt ? ` ${dayjs(item.createdAt).format("DD-MM-YYYY")}` : ""}
      </p>
    </div>
  );
}
