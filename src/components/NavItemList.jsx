import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import * as store from "../utils/storage";

// dnd-kit imports
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

// A sortable item component using dnd-kit
function SortableItem({ item, index, onSelect, editCategories, translatedCategory, delCategoryCallback }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li ref={setNodeRef} style={style} className="flex items-center justify-start">
      {editCategories && <span className="cursor-move" {...attributes} {...listeners}> ☰ </span>}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelect(item);
        }}
      >
        {editCategories && index + 1 + "."}{" "}
        {translatedCategory || item.category}
      </a>
      {editCategories && (
        <button
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm("Are you sure?")) {
              store.delCategory(item._id, item.category);
              delCategoryCallback(item._id);
            }
          }}
          className="ml-2 text-red-500"
        >
          🗑
        </button>
      )}
    </li>
  );
}

export default function NavItemList({ pages = [], onSelect, editCategories }) {
  const { t, i18n } = useTranslation();

  // Initialize items with a unique _id
  const initializeItems = () =>
    pages.map((item) => ({
      ...item,
      _id: item._id || Date.now() + Math.random(),
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
      _id: Date.now() + Math.random(), // assign a unique id
      category: inputValue.trim(),
      createdAt: dayjs().format("DD-MM-YYYY"),
      itemPage: [],
    };
    store.addCategory(inputValue.trim());
    setItems([...items, newItem]);
    setInputValue("");
  };

  // Callback when drag ends: update order and persist
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      store.handleItemsChangeOrder(newItems);
    }
  };

  // Configure sensors for pointer activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Callback to delete an item from state
  const handleDelCategory = (id) => {
    setItems((prevItems) => prevItems.filter((i) => i._id !== id));
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item._id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
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
