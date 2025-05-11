import { ReactSortable } from "react-sortablejs";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import * as store from "../utils/storage";

export default function NavItemList({ pages, onSelect, editCategories }) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(pages);
  const [translatedCategories, setTranslatedCategories] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [newCat, setNewCat] = useState("");

  // Sync items with pages
  useEffect(() => {
    setItems(pages);
  }, [pages]);

  // Translate category names if not in Hebrew
  useEffect(() => {
    const translateCategories = async () => {
      if (i18n.language !== "he") {
        const translations = await Promise.all(
          pages.map((item) => translateDirectly(item.category, i18n.language))
        );
        setTranslatedCategories(translations);
      } else {
        setTranslatedCategories(pages.map((item) => item.category));
      }
    };

    translateCategories();
  }, [pages, i18n.language]);

  const handleAddItem = () => {
    setNewCat(false);
    if (inputValue.trim() === "") return;

    const newItem = {
      category: inputValue.trim(),
      createdAt: dayjs().format("DD-MM-YYYY"),
      itemPage: [],
    };
    store.addCategory(inputValue.trim());
    const newItems = [...items, newItem];
    setItems(newItems);
    setInputValue("");
  };

  const handleItemsChangeOrder = (newOrder) => {
    setItems(newOrder);
    store.handleItemsChangeOrder(newOrder);
    window.location.reload();
  };

  return (
    <>
      <ReactSortable
        tag="ul"
        list={items}
        setList={setItems}
        handle=".handle"
        animation={150}
      >
        {items.map((item, index) => (
          <li key={index} className="flex items-center justify-start">
            {editCategories && <span className="handle cursor-move"> ☰ </span>}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
            >
              {editCategories && index + 1 + "."}
              {translatedCategories[index] || item.category}
            </a>
          </li>
        ))}
      </ReactSortable>

      {!newCat && (
        <a href="#" onClick={() => setNewCat(true)}>
          + {t("addCategory")}
        </a>
      )}

      {newCat && (
        <input
          type="text"
          placeholder={t("addCategory")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddItem();
            }
          }}
          className="mt-2 p-2 border rounded w-full"
        />
      )}
    </>
  );
}
