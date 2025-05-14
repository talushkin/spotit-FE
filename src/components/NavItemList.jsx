import { ReactSortable } from "react-sortablejs";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import * as store from "../utils/storage";

export default function NavItemList({ pages, onSelect, editCategories }) {
  const { t, i18n } = useTranslation();
  // Use _id if available; if not, generate a unique id for new categories
  const initializeItems = () =>
    pages?.map((item) => ({
      ...item,
      _id: item._id || Date.now() + Math.random(), // ensure unique key
    }));
  const [items, setItems] = useState(initializeItems());
  const [translatedCategories, setTranslatedCategories] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [newCat, setNewCat] = useState(false);

  if (!pages) return null;

  // Sync items with pages once on mount (only if pages change completely)
  useEffect(() => {
    setItems(initializeItems());
  }, [pages]);

  // Translate category names if not in English
  useEffect(() => {
    const translateCategories = async () => {
      const translations = await Promise.all(
        pages?.map((item) => translateDirectly(item.category, i18n.language))
      );
      setTranslatedCategories(translations);
    };
    translateCategories();
  }, [pages, i18n.language]);

  const handleAddItem = () => {
    setNewCat(false);
    if (inputValue.trim() === "") return;
    const newItem = {
      _id: Date.now() + Math.random(), // assign a unique id
      category: inputValue.trim(),
      createdAt: dayjs().format("DD-MM-YYYY"),
      itemPage: [],
    };
    store.addCategory(inputValue.trim());
    setItems([...items, newItem]);
    setInputValue("");
  };

  // Update order without forcing a reload
  const handleItemsChangeOrder = (newOrder) => {
    setItems(newOrder);
    store.handleItemsChangeOrder(newOrder);
  };

  return (
    <>
      <ReactSortable
        tag="ul"
        list={items}
        setList={handleItemsChangeOrder}
        handle=".handle"
        animation={150}
      >
        {items?.map((item, index) => (
          <li key={item._id} className="flex items-center justify-start">
            {editCategories && <span className="handle cursor-move"> ☰ </span>}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
            >
              {editCategories && index + 1 + "."}{" "}
              {translatedCategories[index] || item.category}
            </a>
            {editCategories && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm("Are you sure?")) {
                    store.delCategory(item._id, item.category);
                    setItems(items.filter((i) => i._id !== item._id));
                  }
                }}
                className="ml-2 text-red-500"
              >
                🗑
              </button>
            )}
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
