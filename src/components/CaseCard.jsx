import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import dayjs from "dayjs";
import * as storage from "../utils/storage";

export default function CaseCard({ item, category, index }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [translated, setTranslated] = useState({
    title: "",
    description: "",
  });
  const [imageUrl, setImageUrl] = useState("C:\\FE-code\\recipes\\BE\\images\\1747127810600-generated-image.png");
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
    <div className="case">
      <img src={item.imageUrl || imageUrl} alt={translated.title || item.title} />
      <p>{index ? `${t("recipe")} ${index}` : ""}</p>
      <p>{item.createdAt? `${t("createdAt")}: ${dayjs(item.createdAt).format("DD-MM-YYYY") }` : ""}</p>
      <h2>{isLoading ? t("loading") : translated.title}</h2>
      <p>{isLoading ? "..." : translated.description}</p>
    </div>
  );
}
