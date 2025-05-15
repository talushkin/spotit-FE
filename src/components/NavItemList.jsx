import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import { useDispatch } from "react-redux";
import { addCategoryThunk, reorderCategoriesThunk, delCategoryThunk } from "../store/dataSlice";

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

// A sortable item component using dnd‑kit
function SortableItem({
  item,
  index,
  onSelect,
  editCategories,
  translatedCategory,
  delCategoryCallback,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-start"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center w-full">
        <div className="flex items-center mr-2">
          {editCategories && (
            <div className="flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (
                    window.confirm("Delete ? `" + translatedCategory + "`")
                  ) {
                    delCategoryCallback(item._id);
                  }
                }}
                className="text-red-500 mr-1"
              >
                🗑
              </button>
              <span>☰</span>
            </div>
          )}
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelect(item);
          }}
          className="flex-1"
          style={{ display: "flex", alignItems: "center" }}
        >
          {editCategories && index + 1 + ". "}
          {translatedCategory || item.category}
        </a>
      </div>
    </li>
  );
}

export default function NavItemList({
  pages = [],
  onSelect,
  editCategories,
  onOrderChange,
  setReorder,
}) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Initialize items with a unique _id and default priority 
  const initializeItems = () =>
    pages.map((item, index) => ({
      ...item,
      _id: item._id || Date.now() + Math.random(),
      priority: item.priority !== undefined ? item.priority : index + 1,
    }));

  const [items, setItems] = useState(initializeItems());
  const [translatedCategories, setTranslatedCategories] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [newCat, setNewCat] = useState(false);

  // Sync items with pages when pages change
  useEffect(() => {
    setItems(initializeItems());
  }, [pages]);

  // Translate category names
  useEffect(() => {
    const translateCategories = async () => {
      if (pages.length === 0) return;
      const translations = await Promise.all(
        pages.map((item) => translateDirectly(item.category, i18n.language))
      );
      setTranslatedCategories(translations);
    };
    translateCategories();
  }, [pages, i18n.language]);

  const handleAddItem = () => {
    setNewCat(false);
    if (inputValue.trim() === "") return;
    const newItem = {
      _id: Date.now() + Math.random(),
      category: inputValue.trim(),
      createdAt: dayjs().format("DD-MM-YYYY"),
      itemPage: [],
      priority: items.length + 1,
    };
    // Dispatch redux thunk to add category instead of calling storage directly
    dispatch(addCategoryThunk(inputValue.trim()));
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
              translatedCategory={translatedCategories[index]}
              delCategoryCallback={handleDelCategory}
            />
          ))}
        </SortableContext>
      </DndContext>
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
