/**
 * ==========================================================================
 * RECIPE EXPLORER - HUMAN-DESIGNED EDITORIAL APPLICATION JAVASCRIPT
 * ==========================================================================
 */

// Global Application State
const AppState = {
  currentView: 'home',
  currentRecipe: null,
  currentServings: 2,
  baseServings: 2,
  parsedIngredients: [],
  favorites: [],
  mealPlan: {},
  recentSearches: [],
  pantryIngredients: [],
  exploreViewMode: 'grid', // 'grid' | 'list'
  activeFilters: {
    query: '',
    cuisine: 'all',
    category: 'all',
    time: 'all',
    difficulty: 'all',
    sort: 'featured'
  },
  apiCache: new Map(),
  cookMode: {
    recipe: null,
    steps: [],
    currentStepIndex: 0,
    timerSeconds: 0,
    timerInitial: 0,
    timerInterval: null,
    isTimerRunning: false,
    synth: window.speechSynthesis || null
  }
};

// ==========================================================================
// DOM ELEMENT SELECTION
// ==========================================================================

// Legacy compatibility selectors
const searchBox = document.querySelector('.searchBox') || document.getElementById('hero-search-input');
const searchBtn = document.querySelector('.searchBtn') || document.getElementById('hero-search-submit');
const recipeContainer = document.querySelector('.recipe-container') || document.getElementById('home-recipe-grid');
const recipeDetailsContent = document.querySelector('.recipe-details-content') || document.getElementById('recipe-details-content');
const recipeCloseBtn = document.querySelector('.recipe-close-btn') || document.getElementById('modal-close-btn');

// Extended Elements
const heroSearchForm = document.getElementById('hero-search-form');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchClear = document.getElementById('hero-search-clear');
const searchSuggestionsDropdown = document.getElementById('search-suggestions-dropdown');
const recentSearchesGroup = document.getElementById('recent-searches-group');
const recentSearchChips = document.getElementById('recent-search-chips');
const clearRecentBtn = document.getElementById('clear-recent-btn');
const heroSurpriseBtn = document.getElementById('hero-surprise-btn');

const homeRecipeGrid = document.getElementById('home-recipe-grid');
const exploreRecipeGrid = document.getElementById('explore-recipe-grid');
const favoritesRecipeGrid = document.getElementById('favorites-recipe-grid');

const exploreSearchInput = document.getElementById('explore-search-input');
const exploreSearchClear = document.getElementById('explore-search-clear');
const filterCuisine = document.getElementById('filter-cuisine');
const filterCategory = document.getElementById('filter-category');
const filterTime = document.getElementById('filter-time');
const filterDifficulty = document.getElementById('filter-difficulty');
const filterSort = document.getElementById('filter-sort');
const exploreChipsContainer = document.getElementById('explore-chips-container');
const exploreResultsCount = document.getElementById('explore-results-count');
const exploreClearFiltersBtn = document.getElementById('explore-clear-filters-btn');
const viewGridBtn = document.getElementById('view-grid-btn');
const viewListBtn = document.getElementById('view-list-btn');

const recipeDetailModal = document.getElementById('recipe-detail-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');

const navFavBadge = document.getElementById('nav-fav-badge');
const mobileFavDot = document.getElementById('mobile-fav-dot');
const groceryBadge = document.getElementById('grocery-badge');

const headerRandomBtn = document.getElementById('header-random-btn');
const headerGroceryBtn = document.getElementById('header-grocery-btn');
const headerPantryBtn = document.getElementById('header-pantry-btn');

// Cook Mode Elements
const cookModeOverlay = document.getElementById('cook-mode-overlay');
const cookModeRecipeTitle = document.getElementById('cook-mode-recipe-title');
const cookModeStepTracker = document.getElementById('cook-mode-step-tracker');
const cookProgressFill = document.getElementById('cook-progress-fill');
const cookStepBadge = document.getElementById('cook-step-badge');
const cookStepInstruction = document.getElementById('cook-step-instruction');
const cookPrevStepBtn = document.getElementById('cook-prev-step-btn');
const cookNextStepBtn = document.getElementById('cook-next-step-btn');
const cookModeExitBtn = document.getElementById('cook-mode-exit-btn');
const cookTtsBtn = document.getElementById('cook-tts-btn');
const cookIngredientsToggleBtn = document.getElementById('cook-ingredients-toggle-btn');
const cookIngredientsDrawer = document.getElementById('cook-ingredients-drawer');
const cookDrawerCloseBtn = document.getElementById('cook-drawer-close-btn');
const cookDrawerIngredientsList = document.getElementById('cook-drawer-ingredients-list');

// Timer Elements
const timerDisplay = document.getElementById('timer-display');
const timerToggleBtn = document.getElementById('timer-toggle-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const timerPreset1m = document.getElementById('timer-preset-1m');
const timerPreset5m = document.getElementById('timer-preset-5m');
const timerPreset10m = document.getElementById('timer-preset-10m');

// Pantry Section & Studio Elements
const pantryCustomInput = document.getElementById('pantry-custom-input');
const pantryAddBtn = document.getElementById('pantry-add-btn');
const pantryChipsContainer = document.getElementById('pantry-chips-container');
const pantryPlaceholderText = document.getElementById('pantry-placeholder-text');
const pantrySearchSubmit = document.getElementById('pantry-search-submit');
const pantryClearAllBtn = document.getElementById('pantry-clear-all-btn');

const pantryStudioChips = document.getElementById('pantry-studio-chips');
const pantryActiveCount = document.getElementById('pantry-active-count');
const pantryStudioCustomInput = document.getElementById('pantry-studio-custom-input');
const pantryStudioAddBtn = document.getElementById('pantry-studio-add-btn');
const pantryStudioMatchBtn = document.getElementById('pantry-studio-match-btn');

// Meal Planner Elements
const weeklyPlannerGrid = document.getElementById('weekly-planner-grid');
const plannerAutoGenerateBtn = document.getElementById('planner-auto-generate-btn');
const plannerGroceryBtn = document.getElementById('planner-grocery-btn');
const plannerClearBtn = document.getElementById('planner-clear-btn');

// Favorites Elements
const favoritesSearchInput = document.getElementById('favorites-search-input');
const favSummaryCount = document.getElementById('fav-summary-count');
const favSummaryTime = document.getElementById('fav-summary-time');
const favClearAllBtn = document.getElementById('fav-clear-all-btn');

// Modals
const groceryModal = document.getElementById('grocery-modal');
const groceryModalClose = document.getElementById('grocery-modal-close');
const groceryItemsContainer = document.getElementById('grocery-items-container');
const groceryCopyBtn = document.getElementById('grocery-copy-btn');
const groceryPrintBtn = document.getElementById('grocery-print-btn');

const addToPlanModal = document.getElementById('add-to-plan-modal');
const addToPlanClose = document.getElementById('add-to-plan-close');
const addToPlanRecipeName = document.getElementById('add-to-plan-recipe-name');
const planSelectDay = document.getElementById('plan-select-day');
const planSelectMeal = document.getElementById('plan-select-meal');
const confirmAddToPlanBtn = document.getElementById('confirm-add-to-plan-btn');

const toastContainer = document.getElementById('toast-container');
const footerSearchForm = document.getElementById('footer-search-form');
const footerSearchInput = document.getElementById('footer-search-input');

// ==========================================================================
// LOCAL STORAGE & STATE PERSISTENCE
// ==========================================================================

const initStorage = () => {
  try {
    const savedFavs = localStorage.getItem('recipe_explorer_favorites');
    AppState.favorites = savedFavs ? JSON.parse(savedFavs) : [];

    const savedPlan = localStorage.getItem('recipe_explorer_meal_plan');
    AppState.mealPlan = savedPlan ? JSON.parse(savedPlan) : {
      monday: { breakfast: null, lunch: null, dinner: null },
      tuesday: { breakfast: null, lunch: null, dinner: null },
      wednesday: { breakfast: null, lunch: null, dinner: null },
      thursday: { breakfast: null, lunch: null, dinner: null },
      friday: { breakfast: null, lunch: null, dinner: null },
      saturday: { breakfast: null, lunch: null, dinner: null },
      sunday: { breakfast: null, lunch: null, dinner: null }
    };

    const savedRecent = localStorage.getItem('recipe_explorer_recent_searches');
    AppState.recentSearches = savedRecent ? JSON.parse(savedRecent) : ['Butter Chicken', 'Pasta', 'Biryani', 'Salmon'];
  } catch (e) {
    console.error('Could not load storage:', e);
  }
  updateBadges();
  renderRecentSearches();
};

const saveFavorites = () => {
  try {
    localStorage.setItem('recipe_explorer_favorites', JSON.stringify(AppState.favorites));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
  updateBadges();
};

const saveMealPlan = () => {
  try {
    localStorage.setItem('recipe_explorer_meal_plan', JSON.stringify(AppState.mealPlan));
  } catch (e) {
    console.error('Failed to save meal plan', e);
  }
  updateBadges();
};

const saveRecentSearches = () => {
  try {
    localStorage.setItem('recipe_explorer_recent_searches', JSON.stringify(AppState.recentSearches));
  } catch (e) {
    console.error('Failed to save recent searches', e);
  }
  renderRecentSearches();
};

const addRecentSearch = (query) => {
  if (!query || query.trim().length === 0) return;
  const q = query.trim();
  AppState.recentSearches = [q, ...AppState.recentSearches.filter(item => item.toLowerCase() !== q.toLowerCase())].slice(0, 8);
  saveRecentSearches();
};

const updateBadges = () => {
  const count = AppState.favorites.length;
  if (navFavBadge) navFavBadge.textContent = count;
  if (mobileFavDot) {
    mobileFavDot.style.display = count > 0 ? 'block' : 'none';
  }

  // Count planned meals
  let plannedCount = 0;
  if (AppState.mealPlan) {
    Object.values(AppState.mealPlan).forEach(day => {
      if (day.breakfast) plannedCount++;
      if (day.lunch) plannedCount++;
      if (day.dinner) plannedCount++;
    });
  }
  if (groceryBadge) {
    groceryBadge.textContent = plannedCount;
    groceryBadge.style.display = plannedCount > 0 ? 'flex' : 'none';
  }
};

// ==========================================================================
// TOAST NOTIFICATION SYSTEM
// ==========================================================================

const showToast = (message, type = 'info', icon = 'fa-check') => {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast-item ${type === 'success' ? 'success' : ''}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 260);
  }, 3000);
};

// ==========================================================================
// CUSTOM DROPDOWNS CONTROLLER
// ==========================================================================

const initCustomDropdowns = () => {
  const dropdowns = document.querySelectorAll('.custom-dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const triggerText = dropdown.querySelector('.trigger-text');
    const menu = dropdown.querySelector('.dropdown-menu');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const filterKey = dropdown.dataset.filter;
    const hiddenSelect = dropdown.querySelector('select');

    if (!trigger || !menu) return;

    // Toggle open
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other open dropdowns
      dropdowns.forEach(other => {
        if (other !== dropdown) other.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });

    // Select Item
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = item.dataset.value;
        const text = item.textContent.trim().replace(/^✓\s*/, '');

        // Update active class
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        if (triggerText) triggerText.textContent = text;
        dropdown.classList.remove('open');

        // Update hidden native select if present
        if (hiddenSelect) {
          hiddenSelect.value = value;
          hiddenSelect.dispatchEvent(new Event('change'));
        }

        // Handle explore filter updates
        if (filterKey && AppState.activeFilters) {
          AppState.activeFilters[filterKey] = value;
          executeExploreSearch();
        }
      });
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });

  // Escape key closes open dropdowns
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });
};

const setCustomDropdownValue = (dropdownId, value) => {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  const triggerText = dropdown.querySelector('.trigger-text');
  const items = dropdown.querySelectorAll('.dropdown-item');
  const hiddenSelect = dropdown.querySelector('select');

  items.forEach(item => {
    if (item.dataset.value === value) {
      items.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      if (triggerText) triggerText.textContent = item.textContent.trim();
    }
  });

  if (hiddenSelect) hiddenSelect.value = value;
};

// ==========================================================================
// API LAYER (TheMealDB)
// ==========================================================================

const API = {
  baseUrl: 'https://www.themealdb.com/api/json/v1/1',

  async fetchCached(url) {
    if (AppState.apiCache.has(url)) {
      return AppState.apiCache.get(url);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    AppState.apiCache.set(url, data);
    return data;
  },

  async searchByName(name) {
    const data = await this.fetchCached(`${this.baseUrl}/search.php?s=${encodeURIComponent(name)}`);
    return data.meals || [];
  },

  async lookupById(id) {
    const data = await this.fetchCached(`${this.baseUrl}/lookup.php?i=${encodeURIComponent(id)}`);
    return data.meals ? data.meals[0] : null;
  },

  async filterByCategory(category) {
    const data = await this.fetchCached(`${this.baseUrl}/filter.php?c=${encodeURIComponent(category)}`);
    return data.meals || [];
  },

  async filterByArea(area) {
    const data = await this.fetchCached(`${this.baseUrl}/filter.php?a=${encodeURIComponent(area)}`);
    return data.meals || [];
  },

  async filterByIngredient(ingredient) {
    const data = await this.fetchCached(`${this.baseUrl}/filter.php?i=${encodeURIComponent(ingredient)}`);
    return data.meals || [];
  },

  async getRandom() {
    const res = await fetch(`${this.baseUrl}/random.php`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  }
};

// ==========================================================================
// RECIPE DATA ENRICHMENT
// ==========================================================================

const enrichRecipe = (meal) => {
  if (!meal) return null;

  const idNum = parseInt(meal.idMeal || '52772', 10) || 52772;
  const rating = (4.6 + ((idNum % 4) / 10)).toFixed(1);
  const reviewsCount = 120 + (idNum % 340);

  const ingredientCount = countIngredients(meal);
  let cookTime = 30;
  let prepTime = 15;
  let difficulty = 'Medium';

  if (ingredientCount <= 6) {
    cookTime = 20;
    prepTime = 10;
    difficulty = 'Easy';
  } else if (ingredientCount >= 12) {
    cookTime = 50;
    prepTime = 25;
    difficulty = 'Chef Level';
  }

  const tags = [];
  if (meal.strCategory === 'Vegetarian' || meal.strCategory === 'Vegan') {
    tags.push('Vegetarian');
  }
  if (meal.strCategory === 'Chicken' || meal.strCategory === 'Beef' || meal.strCategory === 'Seafood') {
    tags.push('High Protein');
  }
  if (cookTime <= 30) {
    tags.push('Quick & Easy');
  }

  let snippet = `An authentic and beloved ${meal.strCategory || 'culinary'} dish originating from ${meal.strArea || 'international'} kitchens.`;
  if (meal.strInstructions) {
    const cleanInst = meal.strInstructions.replace(/[\r\n]+/g, ' ').trim();
    snippet = cleanInst.length > 130 ? cleanInst.substring(0, 130) + '...' : cleanInst;
  }

  return {
    ...meal,
    rating,
    reviewsCount,
    cookTime,
    prepTime,
    totalTime: cookTime + prepTime,
    difficulty,
    tags,
    snippet,
    calories: 390 + (idNum % 260)
  };
};

const countIngredients = (meal) => {
  let count = 0;
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim()) {
      count++;
    }
  }
  return count;
};

// ==========================================================================
// INGREDIENT MEASURE & STEP PARSER
// ==========================================================================

const parseIngredientsWithMeasures = (meal) => {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      items.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : ''
      });
    }
  }
  return items;
};

const scaleMeasure = (measureStr, multiplier) => {
  if (!measureStr || multiplier === 1) return measureStr;

  const fractionRegex = /^(\d+\s+)?(\d+)\/(\d+)/;
  const decimalRegex = /^(\d+(\.\d+)?)/;

  const fractionMatch = measureStr.match(fractionRegex);
  if (fractionMatch) {
    let whole = fractionMatch[1] ? parseFloat(fractionMatch[1].trim()) : 0;
    let num = parseFloat(fractionMatch[2]);
    let den = parseFloat(fractionMatch[3]);
    let total = (whole + num / den) * multiplier;
    let scaledFraction = decimalToFraction(total);
    return measureStr.replace(fractionRegex, scaledFraction);
  }

  const decimalMatch = measureStr.match(decimalRegex);
  if (decimalMatch) {
    let num = parseFloat(decimalMatch[1]) * multiplier;
    let formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
    return measureStr.replace(decimalRegex, formatted);
  }

  return measureStr;
};

const decimalToFraction = (decimal) => {
  if (decimal % 1 === 0) return decimal.toString();
  const whole = Math.floor(decimal);
  const remainder = decimal - whole;
  const tolerance = 0.08;

  const fractions = [
    { dec: 0.25, str: '1/4' },
    { dec: 0.333, str: '1/3' },
    { dec: 0.5, str: '1/2' },
    { dec: 0.666, str: '2/3' },
    { dec: 0.75, str: '3/4' }
  ];

  for (const f of fractions) {
    if (Math.abs(remainder - f.dec) <= tolerance) {
      return whole > 0 ? `${whole} ${f.str}` : f.str;
    }
  }

  return decimal.toFixed(1).replace(/\.0$/, '');
};

const parseInstructionSteps = (instructionsText) => {
  if (!instructionsText) return ['Prepare ingredients and cook according to recipe instructions.'];

  let cleaned = instructionsText.replace(/STEP\s*\d+[:.-]?/gi, '\n');
  cleaned = cleaned.replace(/\r\n/g, '\n');

  let rawSteps = cleaned.split(/\n+/).map(s => s.trim()).filter(s => s.length > 15);

  if (rawSteps.length <= 1) {
    rawSteps = cleaned.split(/(?<=[.?!])\s+(?=[A-Z])/).map(s => s.trim()).filter(s => s.length > 15);
  }

  return rawSteps.length > 0 ? rawSteps : [instructionsText];
};

// ==========================================================================
// SKELETON LOADERS & EMPTY STATES
// ==========================================================================

const renderSkeletonCards = (container, count = 6) => {
  if (!container) return;
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line title"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
};

const renderEmptyState = (container, title, message, ctaText = 'Explore Recipes', ctaAction = () => navigateTo('explore')) => {
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="fa-solid fa-utensils"></i>
      </div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-desc">${message}</p>
      <button type="button" class="action-btn-primary empty-cta-btn">
        <i class="fa-solid fa-compass"></i>
        <span>${ctaText}</span>
      </button>
    </div>
  `;
  const btn = container.querySelector('.empty-cta-btn');
  if (btn) {
    btn.addEventListener('click', ctaAction);
  }
};

// ==========================================================================
// RECIPE CARD BUILDER
// ==========================================================================

const createRecipeCardElement = (meal) => {
  const enriched = enrichRecipe(meal);
  const isFavorited = AppState.favorites.some(f => f.idMeal === enriched.idMeal);

  const card = document.createElement('div');
  card.className = 'recipe-card recipe';
  card.dataset.id = enriched.idMeal;

  card.innerHTML = `
    <div class="recipe-card-media">
      <img src="${enriched.strMealThumb}" alt="${enriched.strMeal}" class="recipe-card-img" loading="lazy">
      <div class="recipe-card-badges">
        ${enriched.strArea ? `<span class="recipe-badge recipe-badge-cuisine"><i class="fa-solid fa-earth-americas"></i> ${enriched.strArea}</span>` : ''}
        ${enriched.strCategory ? `<span class="recipe-badge recipe-badge-category"><i class="fa-solid fa-tag"></i> ${enriched.strCategory}</span>` : ''}
      </div>
      <button type="button" class="card-favorite-btn ${isFavorited ? 'favorited' : ''}" title="${isFavorited ? 'Remove from favorites' : 'Save to favorites'}" aria-label="Favorite recipe">
        <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>
    </div>
    <div class="recipe-card-body">
      <div class="recipe-card-meta-top">
        <span class="card-time"><i class="fa-regular fa-clock"></i> ${enriched.cookTime} min</span>
        <span class="card-difficulty"><i class="fa-solid fa-gauge-high"></i> ${enriched.difficulty}</span>
      </div>
      <h3 class="recipe-card-title">${enriched.strMeal}</h3>
      <p class="recipe-card-desc">${enriched.snippet}</p>
      <div class="recipe-card-footer">
        <div class="card-rating">
          <i class="fa-solid fa-star"></i>
          <span>${enriched.rating}</span>
        </div>
        <button type="button" class="card-cta-btn">
          <span>View Recipe</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  // Favorite button handler
  const favBtn = card.querySelector('.card-favorite-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(enriched, favBtn);
  });

  // Open recipe details modal
  card.addEventListener('click', () => {
    openRecipePopup(enriched);
  });

  return card;
};

// ==========================================================================
// FAVORITES SYSTEM
// ==========================================================================

const toggleFavorite = (meal, buttonEl) => {
  const existsIndex = AppState.favorites.findIndex(f => f.idMeal === meal.idMeal);
  if (existsIndex >= 0) {
    AppState.favorites.splice(existsIndex, 1);
    showToast(`Removed "${meal.strMeal}" from favorites`, 'info', 'fa-heart-crack');
    if (buttonEl) {
      buttonEl.classList.remove('favorited');
      buttonEl.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
  } else {
    AppState.favorites.push(meal);
    showToast(`Saved "${meal.strMeal}" to favorites!`, 'success', 'fa-heart');
    if (buttonEl) {
      buttonEl.classList.add('favorited');
      buttonEl.innerHTML = '<i class="fa-solid fa-heart"></i>';
    }
  }
  saveFavorites();
  if (AppState.currentView === 'favorites') {
    renderFavoritesView();
  }
};

const renderFavoritesView = () => {
  if (!favoritesRecipeGrid) return;
  favoritesRecipeGrid.innerHTML = '';

  const query = (favoritesSearchInput?.value || '').toLowerCase().trim();
  const filtered = AppState.favorites.filter(m => 
    m.strMeal.toLowerCase().includes(query) ||
    (m.strCategory && m.strCategory.toLowerCase().includes(query)) ||
    (m.strArea && m.strArea.toLowerCase().includes(query))
  );

  // Update summary strip
  if (favSummaryCount) {
    favSummaryCount.textContent = `${AppState.favorites.length} Saved Recipes`;
  }
  if (favClearAllBtn) {
    favClearAllBtn.style.display = AppState.favorites.length > 0 ? 'inline-flex' : 'none';
  }

  if (filtered.length === 0) {
    renderEmptyState(
      favoritesRecipeGrid,
      'Your cookbook journal is waiting.',
      'Save recipes you discover and build your personal collection of culinary inspirations.',
      'Discover Recipes',
      () => navigateTo('explore')
    );
    return;
  }

  filtered.forEach(meal => {
    favoritesRecipeGrid.appendChild(createRecipeCardElement(meal));
  });
};

if (favoritesSearchInput) {
  favoritesSearchInput.addEventListener('input', () => {
    renderFavoritesView();
  });
}

if (favClearAllBtn) {
  favClearAllBtn.addEventListener('click', () => {
    if (confirm('Clear all recipes from your saved favorites?')) {
      AppState.favorites = [];
      saveFavorites();
      renderFavoritesView();
      showToast('Saved recipes cleared', 'info');
    }
  });
}

// ==========================================================================
// RECIPE DETAIL MODAL CONTROLLER
// ==========================================================================

const openRecipePopup = async (mealInput) => {
  let meal = mealInput;

  if (!meal.strInstructions && meal.idMeal) {
    renderSkeletonCards(recipeDetailsContent, 1);
    if (recipeDetailModal) {
      recipeDetailModal.classList.add('open');
      recipeDetailModal.style.display = 'flex';
    }
    try {
      const fullMeal = await API.lookupById(meal.idMeal);
      if (fullMeal) meal = fullMeal;
    } catch (e) {
      console.error('Error fetching full meal:', e);
    }
  }

  const enriched = enrichRecipe(meal);
  AppState.currentRecipe = enriched;
  AppState.baseServings = 2;
  AppState.currentServings = 2;
  AppState.parsedIngredients = parseIngredientsWithMeasures(enriched);

  renderRecipeDetailsModal(enriched);

  if (recipeDetailModal) {
    recipeDetailModal.classList.add('open');
    recipeDetailModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
};

const closeRecipePopup = () => {
  if (recipeDetailModal) {
    recipeDetailModal.classList.remove('open');
    recipeDetailModal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

const renderRecipeDetailsModal = (meal) => {
  if (!recipeDetailsContent) return;

  const isFavorited = AppState.favorites.some(f => f.idMeal === meal.idMeal);
  const steps = parseInstructionSteps(meal.strInstructions);
  const multiplier = AppState.currentServings / AppState.baseServings;

  recipeDetailsContent.innerHTML = `
    <div class="recipe-detail-grid">
      <!-- Left Column: Media & Stats -->
      <div class="recipe-detail-media">
        <div class="detail-hero-img-wrap">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="detail-hero-img">
        </div>

        <div class="detail-stats-grid">
          <div class="stat-box">
            <div class="stat-label">Prep Time</div>
            <div class="stat-value"><i class="fa-regular fa-clock" style="color:var(--primary);"></i> ${meal.prepTime}m</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Cook Time</div>
            <div class="stat-value"><i class="fa-solid fa-fire" style="color:var(--secondary);"></i> ${meal.cookTime}m</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total Time</div>
            <div class="stat-value"><i class="fa-solid fa-hourglass-half" style="color:var(--success);"></i> ${meal.totalTime}m</div>
          </div>
        </div>

        <!-- Macro Nutritional Breakdown -->
        <div style="background:var(--bg-card-subtle); border-radius:var(--radius-sm); padding:14px; border:1px solid var(--border); margin-bottom:16px;">
          <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:8px;">
            Estimated Nutrition (Per Serving)
          </div>
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:0.88rem; color:var(--text-dark);">
            <span>🔥 ${meal.calories} kcal</span>
            <span>🥩 28g Protein</span>
            <span>🌾 34g Carbs</span>
            <span>🥑 16g Fat</span>
          </div>
        </div>

        ${meal.strYoutube ? `
          <a href="${meal.strYoutube}" target="_blank" rel="noopener noreferrer" class="action-btn-primary" style="justify-content:center; background:#CC181E; width:100%;">
            <i class="fa-brands fa-youtube"></i>
            <span>Watch Video Walkthrough</span>
          </a>
        ` : ''}
      </div>

      <!-- Right Column: Info, Ingredients & Instructions -->
      <div class="recipe-detail-info">
        <div class="detail-tags">
          ${meal.strArea ? `<span class="detail-tag"><i class="fa-solid fa-earth-americas"></i> ${meal.strArea}</span>` : ''}
          ${meal.strCategory ? `<span class="detail-tag"><i class="fa-solid fa-tag"></i> ${meal.strCategory}</span>` : ''}
          <span class="detail-tag" style="background:var(--success-light); color:var(--success);"><i class="fa-solid fa-check"></i> Chef Tested</span>
        </div>

        <h2 class="detail-title recipeName" id="modal-recipe-title">${meal.strMeal}</h2>

        <div class="detail-rating-row">
          <div class="rating-pill">
            <i class="fa-solid fa-star"></i>
            <span>${meal.rating}</span>
            <span style="color:var(--text-muted); font-weight:400;">(${meal.reviewsCount} reviews)</span>
          </div>
          <span>•</span>
          <span style="font-weight:600;"><i class="fa-solid fa-gauge-high"></i> ${meal.difficulty}</span>
        </div>

        <!-- Detail Actions Row -->
        <div class="detail-actions-row">
          <button type="button" class="btn-cook-mode" id="modal-start-cook-btn">
            <i class="fa-solid fa-utensils"></i>
            <span>Start Cook Mode</span>
          </button>
          <button type="button" class="btn-detail-fav ${isFavorited ? 'favorited' : ''}" id="modal-fav-btn">
            <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            <span>${isFavorited ? 'Saved' : 'Save Recipe'}</span>
          </button>
          <button type="button" class="btn-detail-share" id="modal-share-btn" title="Share recipe">
            <i class="fa-solid fa-share-nodes"></i>
            <span>Share</span>
          </button>
          <button type="button" class="btn-detail-plan" id="modal-plan-btn" title="Add to Meal Plan">
            <i class="fa-solid fa-calendar-plus"></i>
            <span>Plan</span>
          </button>
        </div>

        <!-- Scalable Ingredients Section -->
        <div class="ingredients-header">
          <h3>Ingredients</h3>
          <div class="servings-stepper">
            <span class="servings-label">Servings:</span>
            <button type="button" class="stepper-btn" id="servings-minus-btn" aria-label="Decrease servings">−</button>
            <span class="servings-count" id="modal-servings-count">${AppState.currentServings}</span>
            <button type="button" class="stepper-btn" id="servings-plus-btn" aria-label="Increase servings">+</button>
          </div>
        </div>

        <div class="ingredient-checklist ingredientList" id="modal-ingredients-list">
          ${renderIngredientsListHtml(AppState.parsedIngredients, multiplier)}
        </div>

        <!-- Instructions Step-by-Step -->
        <div class="instructions-header RecipeInstructions">
          <h3>Cooking Instructions</h3>
        </div>

        <div class="instruction-steps-list">
          ${steps.map((step, idx) => `
            <div class="instruction-step-card">
              <div class="step-number-badge">0${idx + 1}</div>
              <div class="step-content">
                <p class="step-text">${step}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  setupModalInteractions(meal, steps);
};

const renderIngredientsListHtml = (ingredients, multiplier) => {
  return ingredients.map((item, idx) => {
    const scaledMeasure = scaleMeasure(item.measure, multiplier);
    return `
      <label class="ingredient-item" data-index="${idx}">
        <input type="checkbox" class="ingredient-checkbox">
        <span class="ingredient-measure">${scaledMeasure}</span>
        <span class="ingredient-name">${item.ingredient}</span>
      </label>
    `;
  }).join('');
};

const setupModalInteractions = (meal, steps) => {
  const minusBtn = document.getElementById('servings-minus-btn');
  const plusBtn = document.getElementById('servings-plus-btn');
  const servingsCountEl = document.getElementById('modal-servings-count');
  const ingredientsListEl = document.getElementById('modal-ingredients-list');

  if (minusBtn && plusBtn) {
    minusBtn.addEventListener('click', () => {
      if (AppState.currentServings > 1) {
        AppState.currentServings -= 1;
        servingsCountEl.textContent = AppState.currentServings;
        const mult = AppState.currentServings / AppState.baseServings;
        ingredientsListEl.innerHTML = renderIngredientsListHtml(AppState.parsedIngredients, mult);
        setupCheckboxListeners();
      }
    });

    plusBtn.addEventListener('click', () => {
      if (AppState.currentServings < 12) {
        AppState.currentServings += 1;
        servingsCountEl.textContent = AppState.currentServings;
        const mult = AppState.currentServings / AppState.baseServings;
        ingredientsListEl.innerHTML = renderIngredientsListHtml(AppState.parsedIngredients, mult);
        setupCheckboxListeners();
      }
    });
  }

  const setupCheckboxListeners = () => {
    document.querySelectorAll('.ingredient-item').forEach(label => {
      const cb = label.querySelector('.ingredient-checkbox');
      cb.addEventListener('change', () => {
        if (cb.checked) {
          label.classList.add('checked');
        } else {
          label.classList.remove('checked');
        }
      });
    });
  };
  setupCheckboxListeners();

  const favBtn = document.getElementById('modal-fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      toggleFavorite(meal, favBtn);
      const isFav = AppState.favorites.some(f => f.idMeal === meal.idMeal);
      favBtn.querySelector('span').textContent = isFav ? 'Saved' : 'Save Recipe';
    });
  }

  const shareBtn = document.getElementById('modal-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: `Recipe: ${meal.strMeal}`,
        text: `Check out this delicious recipe for ${meal.strMeal} on Recipe Explorer!`,
        url: window.location.href
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {}
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Recipe link copied to clipboard!', 'success', 'fa-link');
      }
    });
  }

  const planBtn = document.getElementById('modal-plan-btn');
  if (planBtn) {
    planBtn.addEventListener('click', () => {
      openAddToPlanDialog(meal);
    });
  }

  const startCookBtn = document.getElementById('modal-start-cook-btn');
  if (startCookBtn) {
    startCookBtn.addEventListener('click', () => {
      closeRecipePopup();
      launchCookMode(meal, steps);
    });
  }
};

// ==========================================================================
// DISTRACTION-FREE "COOK MODE"
// ==========================================================================

const launchCookMode = (meal, steps) => {
  AppState.cookMode.recipe = meal;
  AppState.cookMode.steps = steps;
  AppState.cookMode.currentStepIndex = 0;

  if (cookModeRecipeTitle) cookModeRecipeTitle.textContent = meal.strMeal;

  if (cookDrawerIngredientsList) {
    cookDrawerIngredientsList.innerHTML = renderIngredientsListHtml(AppState.parsedIngredients, 1);
  }

  renderCookModeStep();

  if (cookModeOverlay) {
    cookModeOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

const renderCookModeStep = () => {
  const { steps, currentStepIndex } = AppState.cookMode;
  const total = steps.length;
  const currentStep = steps[currentStepIndex];

  if (cookModeStepTracker) {
    cookModeStepTracker.textContent = `Step ${currentStepIndex + 1} of ${total} (${Math.round(((currentStepIndex + 1) / total) * 100)}% Complete)`;
  }

  if (cookProgressFill) {
    cookProgressFill.style.width = `${((currentStepIndex + 1) / total) * 100}%`;
  }

  if (cookStepBadge) {
    cookStepBadge.textContent = `STEP 0${currentStepIndex + 1}`;
  }

  if (cookStepInstruction) {
    cookStepInstruction.textContent = currentStep;
  }

  if (cookPrevStepBtn) {
    cookPrevStepBtn.style.visibility = currentStepIndex === 0 ? 'hidden' : 'visible';
  }

  if (cookNextStepBtn) {
    if (currentStepIndex === total - 1) {
      cookNextStepBtn.innerHTML = `<span>Complete Cooking!</span> <i class="fa-solid fa-trophy"></i>`;
    } else {
      cookNextStepBtn.innerHTML = `<span>Next Step</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
  }

  const timerMatch = currentStep.match(/(\d+)\s*(minute|min|hour|hr)/i);
  if (timerMatch) {
    let minutes = parseInt(timerMatch[1], 10);
    if (timerMatch[2].toLowerCase().startsWith('h')) minutes *= 60;
    setCookTimer(minutes * 60);
  }
};

const exitCookMode = () => {
  if (AppState.cookMode.synth) {
    AppState.cookMode.synth.cancel();
  }
  resetCookTimer();
  if (cookModeOverlay) {
    cookModeOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

if (cookPrevStepBtn) {
  cookPrevStepBtn.addEventListener('click', () => {
    if (AppState.cookMode.currentStepIndex > 0) {
      AppState.cookMode.currentStepIndex--;
      renderCookModeStep();
    }
  });
}

if (cookNextStepBtn) {
  cookNextStepBtn.addEventListener('click', () => {
    const { steps, currentStepIndex, recipe } = AppState.cookMode;
    if (currentStepIndex < steps.length - 1) {
      AppState.cookMode.currentStepIndex++;
      renderCookModeStep();
    } else {
      showToast(`🎉 Bon Appétit! You completed ${recipe.strMeal}!`, 'success', 'fa-trophy');
      exitCookMode();
    }
  });
}

if (cookModeExitBtn) {
  cookModeExitBtn.addEventListener('click', exitCookMode);
}

if (cookTtsBtn) {
  cookTtsBtn.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported in this browser.', 'info');
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      return;
    }
    const text = AppState.cookMode.steps[AppState.cookMode.currentStepIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    synth.speak(utterance);
  });
}

if (cookIngredientsToggleBtn && cookIngredientsDrawer) {
  cookIngredientsToggleBtn.addEventListener('click', () => {
    cookIngredientsDrawer.classList.toggle('open');
  });
}
if (cookDrawerCloseBtn && cookIngredientsDrawer) {
  cookDrawerCloseBtn.addEventListener('click', () => {
    cookIngredientsDrawer.classList.remove('open');
  });
}

window.addEventListener('keydown', (e) => {
  if (cookModeOverlay && cookModeOverlay.classList.contains('active')) {
    if (e.key === 'ArrowRight') {
      cookNextStepBtn.click();
    } else if (e.key === 'ArrowLeft') {
      cookPrevStepBtn.click();
    } else if (e.key === 'Escape') {
      exitCookMode();
    }
  } else if (recipeDetailModal && recipeDetailModal.classList.contains('open')) {
    if (e.key === 'Escape') {
      closeRecipePopup();
    }
  }
});

// ==========================================================================
// COOKING TIMER & WEB AUDIO CHIME
// ==========================================================================

const setCookTimer = (seconds) => {
  resetCookTimer();
  AppState.cookMode.timerSeconds = seconds;
  AppState.cookMode.timerInitial = seconds;
  updateTimerDisplay();
};

const updateTimerDisplay = () => {
  const s = AppState.cookMode.timerSeconds;
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  if (timerDisplay) {
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
};

const startCookTimer = () => {
  if (AppState.cookMode.timerSeconds <= 0) return;
  AppState.cookMode.isTimerRunning = true;
  if (timerToggleBtn) {
    timerToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
  }

  AppState.cookMode.timerInterval = setInterval(() => {
    if (AppState.cookMode.timerSeconds > 0) {
      AppState.cookMode.timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(AppState.cookMode.timerInterval);
      AppState.cookMode.isTimerRunning = false;
      if (timerToggleBtn) {
        timerToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
      }
      playTimerChime();
      showToast('⏰ Cooking timer finished!', 'success', 'fa-bell');
    }
  }, 1000);
};

const pauseCookTimer = () => {
  clearInterval(AppState.cookMode.timerInterval);
  AppState.cookMode.isTimerRunning = false;
  if (timerToggleBtn) {
    timerToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
  }
};

const resetCookTimer = () => {
  clearInterval(AppState.cookMode.timerInterval);
  AppState.cookMode.isTimerRunning = false;
  AppState.cookMode.timerSeconds = AppState.cookMode.timerInitial || 0;
  updateTimerDisplay();
  if (timerToggleBtn) {
    timerToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
  }
};

const playTimerChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.15 + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + idx * 0.15);
      osc.stop(audioCtx.currentTime + idx * 0.15 + 0.6);
    });
  } catch (e) {}
};

if (timerToggleBtn) {
  timerToggleBtn.addEventListener('click', () => {
    if (AppState.cookMode.isTimerRunning) {
      pauseCookTimer();
    } else {
      startCookTimer();
    }
  });
}
if (timerResetBtn) timerResetBtn.addEventListener('click', resetCookTimer);
if (timerPreset1m) timerPreset1m.addEventListener('click', () => setCookTimer(60));
if (timerPreset5m) timerPreset5m.addEventListener('click', () => setCookTimer(300));
if (timerPreset10m) timerPreset10m.addEventListener('click', () => setCookTimer(600));

// ==========================================================================
// WEEKLY MEAL PLANNER & GROCERY LIST
// ==========================================================================

const renderWeeklyPlanner = () => {
  if (!weeklyPlannerGrid) return;
  weeklyPlannerGrid.innerHTML = '';

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  days.forEach((dayKey, idx) => {
    const dayData = AppState.mealPlan[dayKey] || { breakfast: null, lunch: null, dinner: null };
    const col = document.createElement('div');
    col.className = 'day-column';

    col.innerHTML = `
      <div class="day-header">
        <h3 class="day-title">${dayNames[idx]}</h3>
        <span class="day-date-tag">Day ${idx + 1}</span>
      </div>
      ${renderMealSlotHtml(dayKey, 'breakfast', 'Breakfast', dayData.breakfast)}
      ${renderMealSlotHtml(dayKey, 'lunch', 'Lunch', dayData.lunch)}
      ${renderMealSlotHtml(dayKey, 'dinner', 'Dinner', dayData.dinner)}
    `;

    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const slotCard = col.querySelector(`.meal-slot[data-meal="${mealType}"]`);
      if (slotCard) {
        const removeBtn = slotCard.querySelector('.slot-remove-btn');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            AppState.mealPlan[dayKey][mealType] = null;
            saveMealPlan();
            renderWeeklyPlanner();
            showToast(`Removed from ${dayNames[idx]} ${mealType}`, 'info');
          });
        }
        const viewBtn = slotCard.querySelector('.slot-view-btn');
        if (viewBtn) {
          viewBtn.addEventListener('click', () => {
            openRecipePopup(dayData[mealType]);
          });
        }
        const addBtn = slotCard.querySelector('.slot-empty-btn');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            navigateTo('explore');
            showToast(`Choose a recipe and click "Plan" to assign to ${dayNames[idx]} ${mealType}`, 'info');
          });
        }
      }
    });

    weeklyPlannerGrid.appendChild(col);
  });
};

const renderMealSlotHtml = (dayKey, mealType, label, recipe) => {
  if (recipe) {
    return `
      <div class="meal-slot meal-slot-filled" data-day="${dayKey}" data-meal="${mealType}">
        <span class="meal-slot-label">${label}</span>
        <div class="slot-recipe-card">
          <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="slot-thumb">
          <div class="slot-details">
            <div class="slot-title">${recipe.strMeal}</div>
            <div class="slot-meta">${recipe.strCategory || 'Meal'} • 30m</div>
          </div>
          <div class="slot-actions">
            <button type="button" class="slot-btn slot-view-btn" title="View details"><i class="fa-solid fa-eye"></i></button>
            <button type="button" class="slot-btn slot-remove-btn" title="Remove meal"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="meal-slot" data-day="${dayKey}" data-meal="${mealType}">
        <span class="meal-slot-label">${label}</span>
        <button type="button" class="slot-empty-btn">
          <i class="fa-solid fa-plus"></i>
          <span>Add ${label}</span>
        </button>
      </div>
    `;
  }
};

let targetRecipeForPlan = null;
const openAddToPlanDialog = (meal) => {
  targetRecipeForPlan = meal;
  if (addToPlanRecipeName) addToPlanRecipeName.textContent = meal.strMeal;
  if (addToPlanModal) {
    addToPlanModal.classList.add('open');
    addToPlanModal.style.display = 'flex';
  }
};

if (confirmAddToPlanBtn) {
  confirmAddToPlanBtn.addEventListener('click', () => {
    if (!targetRecipeForPlan) return;
    const day = planSelectDay.value;
    const meal = planSelectMeal.value;

    AppState.mealPlan[day][meal] = targetRecipeForPlan;
    saveMealPlan();

    if (addToPlanModal) {
      addToPlanModal.classList.remove('open');
      addToPlanModal.style.display = 'none';
    }

    showToast(`Added "${targetRecipeForPlan.strMeal}" to ${day.toUpperCase()} ${meal.toUpperCase()}`, 'success', 'fa-calendar-check');
    if (AppState.currentView === 'planner') {
      renderWeeklyPlanner();
    }
  });
}

if (addToPlanClose) {
  addToPlanClose.addEventListener('click', () => {
    addToPlanModal.classList.remove('open');
    addToPlanModal.style.display = 'none';
  });
}

if (plannerAutoGenerateBtn) {
  plannerAutoGenerateBtn.addEventListener('click', async () => {
    showToast('Generating personalized 7-day culinary plan...', 'info', 'fa-wand-magic-sparkles');
    try {
      const [curries, pastas, chicken, seafood] = await Promise.all([
        API.filterByCategory('Vegetarian'),
        API.filterByCategory('Pasta'),
        API.filterByCategory('Chicken'),
        API.filterByCategory('Seafood')
      ]);

      const pool = [...curries, ...pastas, ...chicken, ...seafood].sort(() => 0.5 - Math.random());
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      let pIdx = 0;
      days.forEach(day => {
        AppState.mealPlan[day] = {
          breakfast: pool[pIdx++ % pool.length],
          lunch: pool[pIdx++ % pool.length],
          dinner: pool[pIdx++ % pool.length]
        };
      });

      saveMealPlan();
      renderWeeklyPlanner();
      showToast('✨ 7-day gourmet meal plan generated successfully!', 'success', 'fa-sparkles');
    } catch (e) {
      console.error('Error auto-generating meal plan:', e);
      showToast('Could not generate plan right now. Please try again.', 'error');
    }
  });
}

if (plannerClearBtn) {
  plannerClearBtn.addEventListener('click', () => {
    if (confirm('Clear all scheduled meals for this week?')) {
      AppState.mealPlan = {
        monday: { breakfast: null, lunch: null, dinner: null },
        tuesday: { breakfast: null, lunch: null, dinner: null },
        wednesday: { breakfast: null, lunch: null, dinner: null },
        thursday: { breakfast: null, lunch: null, dinner: null },
        friday: { breakfast: null, lunch: null, dinner: null },
        saturday: { breakfast: null, lunch: null, dinner: null },
        sunday: { breakfast: null, lunch: null, dinner: null }
      };
      saveMealPlan();
      renderWeeklyPlanner();
      showToast('Weekly meal plan cleared.', 'info');
    }
  });
}

const openGroceryListModal = async () => {
  if (!groceryModal) return;
  groceryItemsContainer.innerHTML = '<div style="text-align:center; padding:30px;"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--primary);"></i><p style="margin-top:10px;">Aggregating grocery ingredients...</p></div>';
  groceryModal.classList.add('open');
  groceryModal.style.display = 'flex';

  const plannedRecipes = [];
  Object.values(AppState.mealPlan).forEach(day => {
    if (day.breakfast) plannedRecipes.push(day.breakfast);
    if (day.lunch) plannedRecipes.push(day.lunch);
    if (day.dinner) plannedRecipes.push(day.dinner);
  });

  if (plannedRecipes.length === 0) {
    groceryItemsContainer.innerHTML = `
      <div style="text-align:center; padding:32px;">
        <i class="fa-solid fa-basket-shopping" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
        <p style="font-weight:600; color:var(--text-dark);">No meals scheduled in your Weekly Planner yet.</p>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">Add recipes or click "Generate My Week" to produce your shopping list automatically.</p>
      </div>
    `;
    return;
  }

  const ingredientMap = new Map();
  for (const item of plannedRecipes) {
    let meal = item;
    if (!meal.strIngredient1 && meal.idMeal) {
      try {
        const full = await API.lookupById(meal.idMeal);
        if (full) meal = full;
      } catch (e) {}
    }
    const ingredients = parseIngredientsWithMeasures(meal);
    ingredients.forEach(ing => {
      const name = ing.ingredient.toLowerCase();
      if (!ingredientMap.has(name)) {
        ingredientMap.set(name, { name: ing.ingredient, measures: [ing.measure] });
      } else {
        if (ing.measure) ingredientMap.get(name).measures.push(ing.measure);
      }
    });
  }

  let html = '';
  ingredientMap.forEach((val) => {
    html += `
      <label class="grocery-item-row">
        <input type="checkbox" style="width:16px; height:16px; accent-color:var(--primary);">
        <span style="font-weight:700; color:var(--primary); min-width:80px;">${val.measures.filter(Boolean).join(' + ') || '1 portion'}</span>
        <span style="color:var(--text-dark); text-transform:capitalize;">${val.name}</span>
      </label>
    `;
  });

  groceryItemsContainer.innerHTML = html;
};

if (headerGroceryBtn) headerGroceryBtn.addEventListener('click', openGroceryListModal);
if (plannerGroceryBtn) plannerGroceryBtn.addEventListener('click', openGroceryListModal);
if (groceryModalClose) {
  groceryModalClose.addEventListener('click', () => {
    groceryModal.classList.remove('open');
    groceryModal.style.display = 'none';
  });
}
if (groceryCopyBtn) {
  groceryCopyBtn.addEventListener('click', () => {
    const items = Array.from(groceryItemsContainer.querySelectorAll('.grocery-item-row'))
      .map(row => row.innerText.trim())
      .join('\n');
    navigator.clipboard.writeText(`🛒 RECIPE EXPLORER GROCERY LIST:\n\n${items}`);
    showToast('Grocery list copied to clipboard!', 'success', 'fa-copy');
  });
}
if (groceryPrintBtn) {
  groceryPrintBtn.addEventListener('click', () => {
    window.print();
  });
}

// ==========================================================================
// PANTRY MATCHING & STUDIO
// ==========================================================================

const updatePantryChipsUI = () => {
  const count = AppState.pantryIngredients.length;

  if (pantryChipsContainer) {
    if (count === 0) {
      pantryChipsContainer.innerHTML = '<span class="pantry-empty-prompt" id="pantry-placeholder-text">Click staples above or type custom ingredients to match recipes...</span>';
    } else {
      pantryChipsContainer.innerHTML = AppState.pantryIngredients.map(ing => `
        <span class="pantry-chip">
          <span>${ing}</span>
          <button type="button" class="pantry-remove-chip-btn" data-ingredient="${ing}"><i class="fa-solid fa-xmark"></i></button>
        </span>
      `).join('');
    }
  }

  if (pantryStudioChips) {
    if (count === 0) {
      pantryStudioChips.innerHTML = '<span class="pantry-studio-empty">No ingredients selected yet. Click any staple to build your kitchen inventory.</span>';
    } else {
      pantryStudioChips.innerHTML = AppState.pantryIngredients.map(ing => `
        <span class="pantry-chip">
          <span>${ing}</span>
          <button type="button" class="pantry-remove-chip-btn" data-ingredient="${ing}"><i class="fa-solid fa-xmark"></i></button>
        </span>
      `).join('');
    }
  }

  if (pantryActiveCount) pantryActiveCount.textContent = `${count} item${count === 1 ? '' : 's'}`;
  if (pantryClearAllBtn) pantryClearAllBtn.style.display = count > 0 ? 'inline-block' : 'none';

  // Attach chip remove listeners
  document.querySelectorAll('.pantry-remove-chip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ing = btn.dataset.ingredient;
      AppState.pantryIngredients = AppState.pantryIngredients.filter(i => i !== ing);
      document.querySelectorAll(`.pantry-tag-btn[data-ingredient="${ing}"]`).forEach(t => t.classList.remove('selected'));
      updatePantryChipsUI();
    });
  });
};

const addPantryIngredient = (ing) => {
  if (!ing || !ing.trim()) return;
  const clean = ing.trim().toLowerCase();
  if (!AppState.pantryIngredients.includes(clean)) {
    AppState.pantryIngredients.push(clean);
    updatePantryChipsUI();
  }
};

// Tag buttons
document.querySelectorAll('.pantry-tag-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const ing = btn.dataset.ingredient;
    if (AppState.pantryIngredients.includes(ing)) {
      AppState.pantryIngredients = AppState.pantryIngredients.filter(i => i !== ing);
      btn.classList.remove('selected');
    } else {
      AppState.pantryIngredients.push(ing);
      btn.classList.add('selected');
    }
    updatePantryChipsUI();
  });
});

if (pantryAddBtn && pantryCustomInput) {
  pantryAddBtn.addEventListener('click', () => {
    addPantryIngredient(pantryCustomInput.value);
    pantryCustomInput.value = '';
  });
  pantryCustomInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPantryIngredient(pantryCustomInput.value);
      pantryCustomInput.value = '';
    }
  });
}

if (pantryStudioAddBtn && pantryStudioCustomInput) {
  pantryStudioAddBtn.addEventListener('click', () => {
    addPantryIngredient(pantryStudioCustomInput.value);
    pantryStudioCustomInput.value = '';
  });
  pantryStudioCustomInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPantryIngredient(pantryStudioCustomInput.value);
      pantryStudioCustomInput.value = '';
    }
  });
}

if (pantryClearAllBtn) {
  pantryClearAllBtn.addEventListener('click', () => {
    AppState.pantryIngredients = [];
    document.querySelectorAll('.pantry-tag-btn').forEach(b => b.classList.remove('selected'));
    updatePantryChipsUI();
  });
}

const performPantrySearch = async () => {
  if (AppState.pantryIngredients.length === 0) {
    showToast('Please select or add at least one pantry ingredient first.', 'info');
    return;
  }

  navigateTo('explore');
  renderSkeletonCards(exploreRecipeGrid, 8);
  showToast(`Matching recipes for: ${AppState.pantryIngredients.join(', ')}...`, 'info', 'fa-kitchen-set');

  try {
    const mainIng = AppState.pantryIngredients[0];
    const meals = await API.filterByIngredient(mainIng);
    renderExploreRecipes(meals);
  } catch (e) {
    console.error('Error querying by ingredients:', e);
    renderEmptyState(exploreRecipeGrid, 'No recipes matched your pantry ingredients.', 'Try adding different staples or exploring by cuisine.');
  }
};

if (pantrySearchSubmit) pantrySearchSubmit.addEventListener('click', performPantrySearch);
if (pantryStudioMatchBtn) pantryStudioMatchBtn.addEventListener('click', performPantrySearch);

// ==========================================================================
// EXPLORE & SEARCH CONTROLLER
// ==========================================================================

const executeExploreSearch = async () => {
  if (!exploreRecipeGrid) return;
  renderSkeletonCards(exploreRecipeGrid, 8);

  const { query, cuisine, category, sort } = AppState.activeFilters;
  let results = [];

  try {
    if (query && query.trim().length > 0) {
      results = await API.searchByName(query);
    } else if (cuisine !== 'all') {
      results = await API.filterByArea(cuisine);
    } else if (category !== 'all') {
      results = await API.filterByCategory(category);
    } else {
      results = await API.searchByName('a');
    }

    // Sort
    if (sort === 'alpha') {
      results.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    } else if (sort === 'rating') {
      results.sort((a, b) => (parseInt(b.idMeal, 10) % 5) - (parseInt(a.idMeal, 10) % 5));
    }

    renderExploreRecipes(results);
  } catch (error) {
    console.error('Explore error:', error);
    renderEmptyState(exploreRecipeGrid, 'Something went wrong.', 'Unable to load recipes. Please check your connection and try again.');
  }
};

const renderExploreRecipes = (meals) => {
  if (!exploreRecipeGrid) return;
  exploreRecipeGrid.innerHTML = '';

  if (!meals || meals.length === 0) {
    if (exploreResultsCount) exploreResultsCount.innerHTML = `Showing <strong>0</strong> recipes`;
    renderEmptyState(
      exploreRecipeGrid,
      'No recipes found',
      'Try searching another ingredient, cuisine, or category.',
      'Reset All Filters',
      resetAllFilters
    );
    return;
  }

  if (exploreResultsCount) {
    exploreResultsCount.innerHTML = `Showing <strong>${meals.length}</strong> delicious recipes`;
  }

  meals.forEach(meal => {
    exploreRecipeGrid.appendChild(createRecipeCardElement(meal));
  });

  if (exploreClearFiltersBtn) {
    exploreClearFiltersBtn.style.display = (AppState.activeFilters.query || AppState.activeFilters.cuisine !== 'all' || AppState.activeFilters.category !== 'all') ? 'inline-flex' : 'none';
  }
};

const resetAllFilters = () => {
  AppState.activeFilters = {
    query: '',
    cuisine: 'all',
    category: 'all',
    time: 'all',
    difficulty: 'all',
    sort: 'featured'
  };

  if (exploreSearchInput) exploreSearchInput.value = '';
  setCustomDropdownValue('dropdown-cuisine', 'all');
  setCustomDropdownValue('dropdown-category', 'all');
  setCustomDropdownValue('dropdown-time', 'all');
  setCustomDropdownValue('dropdown-difficulty', 'all');
  setCustomDropdownValue('dropdown-sort', 'featured');

  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  document.querySelector('.filter-chip[data-chip="all"]')?.classList.add('active');

  executeExploreSearch();
};

if (exploreClearFiltersBtn) exploreClearFiltersBtn.addEventListener('click', resetAllFilters);

// View Switcher (Grid vs List View)
if (viewGridBtn && viewListBtn) {
  viewGridBtn.addEventListener('click', () => {
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
    exploreRecipeGrid?.classList.remove('list-view');
    AppState.exploreViewMode = 'grid';
  });

  viewListBtn.addEventListener('click', () => {
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
    exploreRecipeGrid?.classList.add('list-view');
    AppState.exploreViewMode = 'list';
  });
}

// Explore Horizontal Chips
if (exploreChipsContainer) {
  exploreChipsContainer.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      exploreChipsContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const val = chip.dataset.chip;
      if (val === 'all') {
        resetAllFilters();
      } else if (['Indian', 'Italian', 'Mexican'].includes(val)) {
        AppState.activeFilters.cuisine = val;
        AppState.activeFilters.category = 'all';
        setCustomDropdownValue('dropdown-cuisine', val);
        setCustomDropdownValue('dropdown-category', 'all');
        executeExploreSearch();
      } else {
        AppState.activeFilters.category = val;
        AppState.activeFilters.cuisine = 'all';
        setCustomDropdownValue('dropdown-category', val);
        setCustomDropdownValue('dropdown-cuisine', 'all');
        executeExploreSearch();
      }
    });
  });
}

// Search Inputs
let searchDebounceTimer = null;
const handleSearchInput = (inputVal) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    AppState.activeFilters.query = inputVal;
    if (inputVal.trim().length > 0) {
      addRecentSearch(inputVal);
    }
    executeExploreSearch();
  }, 350);
};

if (exploreSearchInput) {
  exploreSearchInput.addEventListener('input', (e) => {
    handleSearchInput(e.target.value);
    if (exploreSearchClear) {
      exploreSearchClear.classList.toggle('visible', e.target.value.length > 0);
    }
  });
}
if (exploreSearchClear) {
  exploreSearchClear.addEventListener('click', () => {
    exploreSearchInput.value = '';
    exploreSearchClear.classList.remove('visible');
    handleSearchInput('');
  });
}

// ==========================================================================
// HERO SEARCH & AUTOCOMPLETE
// ==========================================================================

const renderRecentSearches = () => {
  if (!recentSearchChips || !recentSearchesGroup) return;
  if (AppState.recentSearches.length === 0) {
    recentSearchesGroup.style.display = 'none';
    return;
  }
  recentSearchesGroup.style.display = 'block';
  recentSearchChips.innerHTML = AppState.recentSearches.map(term => `
    <button type="button" class="dropdown-chip" data-search="${term}">
      <i class="fa-solid fa-clock-rotate-left"></i> ${term}
    </button>
  `).join('');

  recentSearchChips.querySelectorAll('.dropdown-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const term = btn.dataset.search;
      if (heroSearchInput) heroSearchInput.value = term;
      searchSuggestionsDropdown?.classList.remove('open');
      performHeroSearch(term);
    });
  });
};

if (clearRecentBtn) {
  clearRecentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    AppState.recentSearches = [];
    saveRecentSearches();
  });
}

document.querySelectorAll('.dropdown-chip[data-search]').forEach(chip => {
  chip.addEventListener('click', () => {
    const term = chip.dataset.search;
    if (heroSearchInput) heroSearchInput.value = term;
    searchSuggestionsDropdown?.classList.remove('open');
    performHeroSearch(term);
  });
});

if (heroSearchInput) {
  heroSearchInput.addEventListener('focus', () => {
    searchSuggestionsDropdown?.classList.add('open');
  });
  heroSearchInput.addEventListener('input', (e) => {
    if (heroSearchClear) {
      heroSearchClear.classList.toggle('visible', e.target.value.length > 0);
    }
  });
}

if (heroSearchClear) {
  heroSearchClear.addEventListener('click', () => {
    heroSearchInput.value = '';
    heroSearchClear.classList.remove('visible');
    heroSearchInput.focus();
  });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.hero-search-wrapper')) {
    searchSuggestionsDropdown?.classList.remove('open');
  }
});

const performHeroSearch = (query) => {
  if (!query || !query.trim()) return;
  addRecentSearch(query);
  AppState.activeFilters.query = query;
  if (exploreSearchInput) exploreSearchInput.value = query;
  navigateTo('explore');
  executeExploreSearch();
};

if (heroSearchForm) {
  heroSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = heroSearchInput ? heroSearchInput.value.trim() : '';
    if (q) performHeroSearch(q);
  });
}

// Quick Filter Tags below hero
document.querySelectorAll('.quick-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    const category = tag.dataset.tag;
    navigateTo('explore');
    if (category === 'Quick & Easy') {
      AppState.activeFilters.query = 'Pasta';
    } else if (category === 'Vegetarian') {
      AppState.activeFilters.category = 'Vegetarian';
      setCustomDropdownValue('dropdown-category', 'Vegetarian');
    } else if (category === 'High Protein') {
      AppState.activeFilters.category = 'Chicken';
      setCustomDropdownValue('dropdown-category', 'Chicken');
    } else if (category === 'Healthy') {
      AppState.activeFilters.category = 'Vegetarian';
      setCustomDropdownValue('dropdown-category', 'Vegetarian');
    } else if (category === 'Dessert') {
      AppState.activeFilters.category = 'Dessert';
      setCustomDropdownValue('dropdown-category', 'Dessert');
    }
    executeExploreSearch();
  });
});

// Category Cards in Inspiration Section
document.querySelectorAll('.category-card, .cat-editorial-card').forEach(card => {
  card.addEventListener('click', () => {
    const query = card.dataset.query;
    const area = card.dataset.area;
    const cat = card.dataset.categoryFilter;

    navigateTo('explore');
    if (query) {
      AppState.activeFilters.query = query;
      if (exploreSearchInput) exploreSearchInput.value = query;
    } else if (area) {
      AppState.activeFilters.cuisine = area;
      setCustomDropdownValue('dropdown-cuisine', area);
    } else if (cat) {
      AppState.activeFilters.category = cat;
      setCustomDropdownValue('dropdown-category', cat);
    }
    executeExploreSearch();
  });
});

const catStoryBtn = document.getElementById('cat-story-btn');
if (catStoryBtn) {
  catStoryBtn.addEventListener('click', () => {
    const area = catStoryBtn.dataset.area;
    navigateTo('explore');
    AppState.activeFilters.cuisine = area;
    setCustomDropdownValue('dropdown-cuisine', area);
    executeExploreSearch();
  });
}

// ==========================================================================
// LEGACY COMPATIBILITY & CTAS
// ==========================================================================

const fetchRecipes = async (query) => {
  try {
    if (homeRecipeGrid) renderSkeletonCards(homeRecipeGrid, 6);
    const meals = await API.searchByName(query);
    if (homeRecipeGrid) {
      homeRecipeGrid.innerHTML = '';
      if (!meals || meals.length === 0) {
        renderEmptyState(homeRecipeGrid, 'No recipes found.', `We couldn't find recipes matching "${query}".`);
        return;
      }
      meals.forEach(meal => {
        homeRecipeGrid.appendChild(createRecipeCardElement(meal));
      });
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    if (homeRecipeGrid) {
      renderEmptyState(homeRecipeGrid, 'Something went wrong.', 'Please try searching again.');
    }
  }
};

const fetchIngredients = (meal) => {
  let ingredientsList = '';
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient) {
      const measure = meal[`strMeasure${i}`] || '';
      ingredientsList += `<li>${measure} ${ingredient}</li>`;
    } else {
      break;
    }
  }
  return ingredientsList;
};

if (recipeCloseBtn) recipeCloseBtn.addEventListener('click', closeRecipePopup);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeRecipePopup);

const triggerSurpriseMeal = async () => {
  showToast('Finding an exquisite chef recommendation...', 'info', 'fa-dice');
  try {
    const randomMeal = await API.getRandom();
    if (randomMeal) {
      openRecipePopup(randomMeal);
    }
  } catch (e) {
    console.error('Random recipe error:', e);
  }
};

if (headerRandomBtn) headerRandomBtn.addEventListener('click', triggerSurpriseMeal);
if (heroSurpriseBtn) heroSurpriseBtn.addEventListener('click', triggerSurpriseMeal);

if (headerPantryBtn) {
  headerPantryBtn.addEventListener('click', () => {
    navigateTo('pantry');
  });
}

// Footer search form
if (footerSearchForm && footerSearchInput) {
  footerSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = footerSearchInput.value.trim();
    if (val) {
      performHeroSearch(val);
      footerSearchInput.value = '';
    }
  });
}

// ==========================================================================
// ROUTING & VIEW CONTROLLER
// ==========================================================================

const navigateTo = (viewName) => {
  const cleanView = viewName === 'inspiration' ? 'categories' : viewName;
  AppState.currentView = cleanView;
  window.location.hash = cleanView;

  document.querySelectorAll('.page-view').forEach(view => {
    if (view.id === `view-${cleanView}`) {
      view.classList.add('active');
      view.style.display = 'block';
    } else {
      view.classList.remove('active');
      view.style.display = 'none';
    }
  });

  document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
    if (link.dataset.view === cleanView || (link.dataset.view === 'categories' && cleanView === 'inspiration')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (cleanView === 'favorites') {
    renderFavoritesView();
  } else if (cleanView === 'planner') {
    renderWeeklyPlanner();
  } else if (cleanView === 'explore') {
    if (!exploreRecipeGrid || !exploreRecipeGrid.children.length) {
      executeExploreSearch();
    }
  } else if (cleanView === 'pantry') {
    updatePantryChipsUI();
  }
};

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (['home', 'explore', 'categories', 'favorites', 'planner', 'pantry'].includes(hash)) {
    navigateTo(hash);
  } else if (hash === 'inspiration') {
    navigateTo('categories');
  } else if (hash.startsWith('recipe-')) {
    const id = hash.replace('recipe-', '');
    API.lookupById(id).then(m => { if (m) openRecipePopup(m); });
  }
});

document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
  link.addEventListener('click', (e) => {
    const view = link.dataset.view;
    if (view) {
      e.preventDefault();
      navigateTo(view);
    }
  });
});

document.querySelectorAll('.footer-filter-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const cuisine = link.dataset.cuisine;
    navigateTo('explore');
    AppState.activeFilters.cuisine = cuisine;
    setCustomDropdownValue('dropdown-cuisine', cuisine);
    executeExploreSearch();
  });
});

// ==========================================================================
// INITIALIZATION
// ==========================================================================

const initApp = async () => {
  initStorage();
  initCustomDropdowns();
  updatePantryChipsUI();

  // Load trending recipes on home page
  fetchRecipes('chicken');

  // Load Featured Recipe of the Day
  try {
    const featured = await API.lookupById('52772');
    if (featured) {
      const card = document.getElementById('featured-recipe-card');
      if (card) {
        card.addEventListener('click', () => openRecipePopup(featured));
      }
    }
  } catch (e) {}

  // Handle direct hash navigation
  const currentHash = window.location.hash.replace('#', '');
  if (['explore', 'categories', 'favorites', 'planner', 'pantry'].includes(currentHash)) {
    navigateTo(currentHash);
  } else if (currentHash === 'inspiration') {
    navigateTo('categories');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
