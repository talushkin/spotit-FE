// utils/storage.js
import dayjs from "dayjs";

const STORAGE_KEY = "recipesData";

export const loadData = (defaultData) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultData;
};

export const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log("saved", STORAGE_KEY, data);
};

export const addRecipe = (recipe, category) => {
  if (!recipe || !category) {
    console.error("Category or recipe not sent!");
    return null;
  }
  const data = loadData();
  console.log(data);
  const index = data.site.pages.findIndex((p) => p.category === category);
  if (index !== -1) {
    const exists = data.site.pages[index].itemPage?.some(
      (p) => p.title === recipe.title
    );
    if (exists) {
      console.warn(
        `recipe "${recipe.title}" already exists on category:`,
        category
      );
      return;
    }
    data.site.pages[index].itemPage.unshift({
      ...recipe,
      createdAt: new Date().toISOString().split("T")[0],
    });
    console.log(
      `recipe "${recipe.title}" added succcessfully to category: ${category}`
    );
    saveData(data);
  } else {
    console.error("Category not found:", category);
  }
};

export const delRecipe = (recipe, category) => {
  const data = loadData();
  const index = data.site.pages.findIndex((p) => p.category === category);
  if (index !== -1) {
    data.site.pages[index].itemPage = data.site.pages[index].itemPage.filter(
      (item) => item.title !== recipe.title
    );
    saveData(data);
  } else {
    console.error("Category not found:", category);
  }
};

export const addCategory = (category) => {
  const data = loadData();
  const exists = data.site.pages.some((p) => p.category === category);
  if (exists) {
    console.warn("Category already exists:", category);
    return;
  }

  const newCategory = {
    category: category.trim(),
    priority: data.site.pages.length + 1,
    createdAt: dayjs().format("DD-MM-YYYY"),
    itemPage: [],
  };
  console.log("Category added successfully:", category);
  data.site.pages.push(newCategory);
  saveData(data);
};

export const delCategory = (category) => {
  const data = loadData();
  data.site.pages = data.site.pages.filter((p) => p.category !== category);
  saveData(data);
};

export const handleItemsChangeOrder = (newOrder) => {
  const data = loadData();
  data.site.pages = newOrder.map((item, index) => ({
    ...item,
    priority: index + 1,
  }));
  saveData(data);
};
