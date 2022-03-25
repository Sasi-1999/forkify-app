import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helper.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    console.error(`${err}💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    console.log(state.search.results);
  } catch (err) {
    console.error(`${err}💥💥💥`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
  });

  state.recipe.servings = newServings;
};

const storeBookmarks = () => {
  try {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
  } catch (err) {
    console.error(err, "localStorage disabled, can't use bookmarks");
  }
};

export const addBookmark = function (recipe) {
  // Adding bookmark
  state.bookmarks.push(recipe);

  // mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  storeBookmarks();
};

export const deleteBookmark = function (id) {
  // Deleting bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // mark current recipe as NOT bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  storeBookmarks();
};

const restoreBookmarks = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

restoreBookmarks();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe, newRecipeArr) {
  try {
    const ingQty = newRecipeArr
      .filter(entry => entry[0].includes('quantity'))
      .map(ing => ing[1]);
    const ingUnit = newRecipeArr
      .filter(entry => entry[0].includes('unit'))
      .map(ing => ing[1]);
    const ingItem = newRecipeArr
      .filter(entry => entry[0].includes('item'))
      .map(ing => ing[1]);

    const ingredientsArr = ingQty;
    const ingredients = ingredientsArr.map((ing, i) => {
      return {
        quantity: +ingQty[i],
        unit: ingUnit[i],
        description: ingItem[i],
      };
    });

    // .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
    // .map(ing => {
    //   // const ingArr = ing[1].replaceAll(' ', '').split(',');
    //   const ingArr = ing[1].split(',').map(el => el.trim());
    //   console.log(ingArr);

    //   if (ingArr.length !== 3)
    //     throw new Error(
    //       'Wrong ingredient format! Please use the correct format'
    //     );

    //   const [quantity, unit, description] = ingArr;
    //   return { quantity: quantity ? +quantity : null, unit, description };
    // });
    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
