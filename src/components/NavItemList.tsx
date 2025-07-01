import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import { useDispatch } from "react-redux";
import { addCategoryThunk, reorderCategoriesThunk, delCategoryThunk } from "../store/dataSlice";
import { Button } from "@mui/material";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import i18n from "../i18n";

const isRTL = i18n.dir() === "rtl";

interface CategoryItem {
  _id: string;
  category: string;
  createdAt?: string;
  itemPage?: any[];
  priority?: number;
  translatedCategory?: { [lang: string]: string } | Array<{ lang: string; value: string; _id?: string }>;
}

interface SortableItemProps {
  item: CategoryItem;
  index: number;
  onSelect: (item: CategoryItem) => void;
  editCategories: boolean;
  translatedCategory: string;
  delCategoryCallback: (id: string) => void;
}

// A sortable item component using dnd‑kit
function SortableItem({
  item,
  index,
  onSelect,
  editCategories,
  translatedCategory,
  delCategoryCallback,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: "#222", // dark grey always (you can add theme logic if needed)
    color: "#fff",
    borderRadius: "8px",
    margin: "4px 0",
    transitionProperty: "background, color, box-shadow",
    transitionDuration: "0.3s",
    cursor: "pointer",
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    ...(editCategories && { border: "2px dashed #444" }),
  };

  // Compute recipe count for this category
  const recipeCount = item.itemPage?.length || 0;

  // Get the image URL from the first recipe in the category, if available
  const firstRecipeImage =
    item.itemPage && item.itemPage.length > 0
      ? item.itemPage[0].imageUrl
      : "https://placehold.co/40x40?text=No+Image";

  return (
    <li
      ref={setNodeRef}
      style={style}
      dir={isRTL ? "rtl" : "ltr"}
      className="nav-item flex items-center justify-start nowrap sortable-li"
      {...attributes}
      {...listeners}
    >
      {editCategories && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (window.confirm("Delete ? `" + translatedCategory + "`")) {
                delCategoryCallback(item._id);
              }
            }}
          >
            🗑
          </button>
          ☰
        </>
      )}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelect(item);
        }}
        className="flex-1 flex items-center"
        style={{ color: "#fff", textDecoration: "none" }}
      >
        {editCategories && index + 1 + ". "}
        {translatedCategory || item.category}{" "}
        <span className="text-gray-500 ml-2" style={{ color: "#bbb" }}>
          ({recipeCount})
        </span>
      </a>
      <style>
        {`
          .sortable-li:hover {
            background: #333 !important;
            color: #fff !important;
          }
        `}
      </style>
    </li>
  );
}

interface NavItemListProps {
  pages: CategoryItem[];
  onSelect: (item: CategoryItem) => void;
  editCategories: boolean;
  onOrderChange?: (items: CategoryItem[]) => void;
  setReorder: (val: boolean) => void;
}

export default function NavItemList({
  pages = [],
  onSelect,
  editCategories,
  onOrderChange,
  setReorder,
}: NavItemListProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Initialize items with a unique _id and default priority 
  const initializeItems = () =>
    pages.map((item, index) => ({
      ...item,
      _id: item._id || Date.now() + Math.random(),
      priority: item.priority !== undefined ? item.priority : index + 1,
    }));

  const getTranslatedCategory = (item, lang) => {
    if (!item.translatedCategory) return null;
    return item.translatedCategory[lang] || null;
  };

  const [items, setItems] = useState(initializeItems());
  const [inputValue, setInputValue] = useState("");
  const [newCat, setNewCat] = useState(false);

  // Sync items with pages when pages change
  useEffect(() => {
    setItems(initializeItems());
  }, [pages]);

  // Translate category names and cache them per language
  useEffect(() => {
    const translateCategories = async () => {
      if (pages.length === 0) return;
      const lang = i18n.language;
      const newItems = await Promise.all(
        pages.map(async (item) => {
          // If translatedCategory is an array, look for the lang object
          if (Array.isArray(item.translatedCategory)) {
            const found = item.translatedCategory.find(
              (t) => t.lang === lang && t.value
            );
            if (found) {
              return {
                ...item,
                translatedCategory: {
                  ...item.translatedCategory,
                  [lang]: found.value,
                },
              };
            }
          }
          // If already translated for this lang in object format, use it
          if (item.translatedCategory && item.translatedCategory[lang]) {
            return item;
          }
          // Otherwise, translate and save
          const translated = await translateDirectly(item.category, lang);
          return {
            ...item,
            translatedCategory: {
              ...(item.translatedCategory || {}),
              [lang]: translated,
            },
          };
        })
      );
      setItems(
        initializeItems().map((item, idx) => ({
          ...item,
          translatedCategory: newItems[idx].translatedCategory,
        }))
      );
    };
    translateCategories();
    // eslint-disable-next-line
  }, [pages, i18n.language]);

  const handleAddItem = async () => {
    setNewCat(false);
    if (inputValue.trim() === "") return;
    // Translate the category to English before saving
    let englishCategory = inputValue.trim();
    try {
      englishCategory = await translateDirectly(inputValue.trim(), "en");
    } catch (e) {
      // fallback to original if translation fails
      englishCategory = inputValue.trim();
    }
    const newItem = {
      _id: Date.now() + Math.random(),
      category: englishCategory,
      createdAt: dayjs().format("DD-MM-YYYY"),
      itemPage: [],
      priority: items.length + 1,
    };
    dispatch(addCategoryThunk(englishCategory));
    setItems([...items, newItem]);
    setInputValue("");
  };

  // Callback when drag ends: update order, set new priorities, persist via redux
  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log("Drag ended", active, over);
    if (!over) return; // No item was dropped
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      let newItems = arrayMove(items, oldIndex, newIndex);
      // Update each item's priority based on its new index
      newItems = newItems.map((item, idx) => ({ ...item, priority: idx + 1 }));
      console.log("Moved items", newItems);
      setItems(newItems);
      dispatch(reorderCategoriesThunk(newItems));
      // Notify parent if needed
      onOrderChange && onOrderChange(newItems);
      setReorder(true);
    }
  };

  // Callback to delete an item from state using redux thunk
  const handleDelCategory = (id) => {
    const categoryToDelete = items.find((i) => i._id === id)?.category || "";
    dispatch(delCategoryThunk({ categoryId: id, categoryName: categoryToDelete }));
    setItems((prevItems) => prevItems.filter((i) => i._id !== id));
  };

  // Sort items by priority before rendering
  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);

  return (
    <>
      <DndContext sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortedItems.map((item) => item._id)} strategy={verticalListSortingStrategy}>
          {sortedItems.map((item, index) => (
            <SortableItem
              key={item._id}
              item={item}
              index={index}
              onSelect={onSelect}
              editCategories={editCategories}
              translatedCategory={
                item.translatedCategory && item.translatedCategory[i18n.language]
                  ? item.translatedCategory[i18n.language]
                  : item.category
              }
              delCategoryCallback={handleDelCategory}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!newCat && (
        <Button
          variant="contained"
          onClick={() => setNewCat(true)}
          sx={{
            backgroundColor: (theme) => theme.palette.mode === "dark" ? "#222" : "#222", // dark grey on dark theme
            color: (theme) => theme.palette.mode === "dark" ? "#fff" : "#fff",
            "&:hover": {
              backgroundColor: (theme) => theme.palette.mode === "dark" ? "#333" : "#333",
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            },
          }}
        >
      + {t("addCategory")}
    </Button >
      )
}
{
  newCat && (
    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <input
        type="text"
        placeholder={t("addCategory")}
        value={inputValue}
        autoFocus
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "x" || e.key === "X") {
            setNewCat(false);
            setInputValue("");
          }
          if (e.key === "Enter") {
            handleAddItem();
          }
        }}
        className="p-2 rounded w-full"
        style={{
          width: "calc(100% - 0.25rem)", // 80% of parent minus half the gap
          minWidth: "80px",
          maxWidth: "calc(100% - 0.25rem)",
        }}
      />
      <button
        type="button"
        onClick={() => {
          setNewCat(false);
          setInputValue("");
        }}
        style={{
          width: "20%",
          minWidth: "40px",
          maxWidth: "60px",
          background: "#333",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ×
      </button>
    </div>
  )
}
    </>
  );
}
