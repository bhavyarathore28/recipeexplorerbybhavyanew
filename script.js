/**
 * RECIPE EXPLORER
 * Everyday recipe discovery, weekly meal planning, and pantry ingredient matching.
 */

// Application State
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

// Inline SVG Line Icons
const ICONS = {
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  star: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  heartOutline: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFilled: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  arrowRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  utensils: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  share: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  eye: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  play: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  pause: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  reset: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`
};

// ==========================================================================
// DOM ELEMENT SELECTION
// ==========================================================================

const searchBox = document.querySelector('.searchBox') || document.getElementById('hero-search-input');
const searchBtn = document.querySelector('.searchBtn') || document.getElementById('hero-search-submit');
const recipeContainer = document.querySelector('.recipe-container') || document.getElementById('home-recipe-grid');
const recipeDetailsContent = document.querySelector('.recipe-details-content') || document.getElementById('recipe-details-content');
const recipeCloseBtn = document.querySelector('.recipe-close-btn') || document.getElementById('modal-close-btn');

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

// Pantry Elements
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
// TOAST NOTIFICATION SYSTEM (CLEAN & MINIMAL)
// ==========================================================================

const showToast = (message, type = 'info') => {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast-item ${type === 'success' ? 'success' : ''}`;
  toast.innerHTML = `
    <span class="toast-check">${ICONS.check}</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 220);
  }, 2800);
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

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdowns.forEach(other => {
        if (other !== dropdown) other.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = item.dataset.value;
        const text = item.textContent.trim().replace(/^✓\s*/, '');

        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        if (triggerText) triggerText.textContent = text;
        dropdown.classList.remove('open');

        if (hiddenSelect) {
          hiddenSelect.value = value;
          hiddenSelect.dispatchEvent(new Event('change'));
        }

        if (filterKey && AppState.activeFilters) {
          AppState.activeFilters[filterKey] = value;
          executeExploreSearch();
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });

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
// RECIPE ENRICHMENT & PRACTICAL DESCRIPTIONS
// ==========================================================================

const enrichRecipe = (meal) => {
  if (!meal) return null;

  const idNum = parseInt(meal.idMeal || '52772', 10) || 52772;
  const rating = (4.6 + ((idNum % 4) / 10)).toFixed(1);
  const reviewsCount = 80 + (idNum % 220);

  const ingredientsList = parseIngredientsWithMeasures(meal);
  const ingredientCount = ingredientsList.length;

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
    difficulty = 'Advanced';
  }

  const tags = [];
  if (meal.strCategory === 'Vegetarian' || meal.strCategory === 'Vegan') {
    tags.push('Vegetarian');
  }
  if (meal.strCategory === 'Chicken' || meal.strCategory === 'Beef' || meal.strCategory === 'Seafood') {
    tags.push('High Protein');
  }
  if (cookTime <= 30) {
    tags.push('Under 30 Min');
  }

  // Extract top 3-4 key ingredients
  const keyIngredients = ingredientsList.slice(0, 4).map(i => i.ingredient).join(', ');

  // Extract a practical tip from the instructions
  let tip = '';
  if (meal.strInstructions) {
    const sentences = meal.strInstructions.replace(/[\r\n]+/g, ' ')
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 25);
    const actionSentence = sentences.find(s =>
      /(simmer|bake|brown|marinate|season|serve|roast|toss|rest|garnish|heat|boil|whisk)/i.test(s)
    );
    if (actionSentence) {
      tip = actionSentence.charAt(0).toUpperCase() + actionSentence.slice(1) + '.';
    }
  }
  if (!tip) {
    tip = `Serve hot with your preferred side dish or grains.`;
  }

  const snippet = `${prepTime} min prep · ${cookTime} min cook. Key ingredients: ${keyIngredients || 'Pantry staples'}. ${tip}`;

  return {
    ...meal,
    rating,
    reviewsCount,
    cookTime,
    prepTime,
    totalTime: cookTime + prepTime,
    difficulty,
    tags,
    keyIngredients,
    tip,
    snippet,
    calories: 380 + (idNum % 240)
  };
};

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

const renderEmptyState = (container, title, message, ctaText = 'Browse Recipes', ctaAction = () => navigateTo('explore')) => {
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        ${ICONS.utensils}
      </div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-desc">${message}</p>
      <button type="button" class="action-btn-primary empty-cta-btn">
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
      <img src="${enriched.strMealThumb}" alt="${enriched.strMeal} (${enriched.strCategory || 'Dish'})" class="recipe-card-img" loading="lazy">
      <div class="recipe-card-badges">
        ${enriched.strArea ? `<span class="recipe-badge">${enriched.strArea}</span>` : ''}
        ${enriched.strCategory ? `<span class="recipe-badge">${enriched.strCategory}</span>` : ''}
      </div>
      <button type="button" class="card-favorite-btn ${isFavorited ? 'favorited' : ''}" title="${isFavorited ? 'Remove from saved' : 'Save recipe'}" aria-label="Favorite recipe">
        ${isFavorited ? ICONS.heartFilled : ICONS.heartOutline}
      </button>
    </div>
    <div class="recipe-card-body">
      <div class="recipe-card-meta-top">
        <span class="card-time">${ICONS.clock} ${enriched.cookTime}m cook</span>
        <span class="card-difficulty">${enriched.difficulty}</span>
      </div>
      <h3 class="recipe-card-title">${enriched.strMeal}</h3>
      <p class="recipe-card-desc">${enriched.snippet}</p>
      <div class="recipe-card-footer">
        <div class="card-rating">
          ${ICONS.star}
          <span>${enriched.rating}</span>
          <span class="card-reviews">(${enriched.reviewsCount})</span>
        </div>
        <button type="button" class="card-cta-btn">
          <span>View recipe</span>
          ${ICONS.arrowRight}
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
    showToast(`Removed "${meal.strMeal}" from saved`);
    if (buttonEl) {
      buttonEl.classList.remove('favorited');
      buttonEl.innerHTML = ICONS.heartOutline;
    }
  } else {
    AppState.favorites.push(meal);
    showToast(`Saved "${meal.strMeal}"`, 'success');
    if (buttonEl) {
      buttonEl.classList.add('favorited');
      buttonEl.innerHTML = ICONS.heartFilled;
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

  if (favSummaryCount) {
    favSummaryCount.textContent = `${AppState.favorites.length} Saved Recipes`;
  }
  if (favClearAllBtn) {
    favClearAllBtn.style.display = AppState.favorites.length > 0 ? 'inline-flex' : 'none';
  }

  if (filtered.length === 0) {
    renderEmptyState(
      favoritesRecipeGrid,
      'No saved recipes yet',
      'Bookmark recipes you want to make again or cook this week.',
      'Browse recipes',
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
    if (confirm('Clear all saved recipes?')) {
      AppState.favorites = [];
      saveFavorites();
      renderFavoritesView();
      showToast('Saved recipes cleared');
    }
  });
}

// ==========================================================================
// RECIPE DETAIL MODAL
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
      <!-- Media Column -->
      <div class="recipe-detail-media">
        <div class="detail-hero-img-wrap">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="detail-hero-img">
        </div>

        <div class="detail-stats-grid">
          <div class="stat-box">
            <div class="stat-label">Prep time</div>
            <div class="stat-value">${meal.prepTime} min</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Cook time</div>
            <div class="stat-value">${meal.cookTime} min</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total time</div>
            <div class="stat-value">${meal.totalTime} min</div>
          </div>
        </div>

        <!-- Nutrition Summary -->
        <div class="detail-nutrition-bar">
          <span class="nutrition-title">Estimated per serving:</span>
          <span class="nutrition-items">${meal.calories} kcal · 28g protein · 34g carbs · 16g fat</span>
        </div>

        ${meal.strYoutube ? `
          <a href="${meal.strYoutube}" target="_blank" rel="noopener noreferrer" class="action-btn-secondary" style="justify-content:center; width:100%; margin-top:14px;">
            <span>Watch video demonstration</span>
            ${ICONS.arrowRight}
          </a>
        ` : ''}
      </div>

      <!-- Content Column -->
      <div class="recipe-detail-info">
        <div class="detail-tags">
          ${meal.strArea ? `<span class="detail-tag">${meal.strArea}</span>` : ''}
          ${meal.strCategory ? `<span class="detail-tag">${meal.strCategory}</span>` : ''}
          <span class="detail-tag" style="background:var(--accent-light); color:var(--accent);">${meal.difficulty}</span>
        </div>

        <h2 class="detail-title recipeName" id="modal-recipe-title">${meal.strMeal}</h2>

        <div class="detail-rating-row">
          <div class="rating-pill">
            ${ICONS.star}
            <span>${meal.rating}</span>
            <span style="color:var(--text-muted); font-weight:400;">(${meal.reviewsCount} reviews)</span>
          </div>
          <span>·</span>
          <span>${meal.tags.join(' · ') || 'Family recipe'}</span>
        </div>

        <p class="detail-practical-tip">
          <strong>Cook's tip:</strong> ${meal.tip}
        </p>

        <!-- Actions -->
        <div class="detail-actions-row">
          <button type="button" class="btn-cook-mode" id="modal-start-cook-btn">
            ${ICONS.utensils}
            <span>Start Cook Mode</span>
          </button>
          <button type="button" class="btn-detail-fav ${isFavorited ? 'favorited' : ''}" id="modal-fav-btn">
            ${isFavorited ? ICONS.heartFilled : ICONS.heartOutline}
            <span>${isFavorited ? 'Saved' : 'Save recipe'}</span>
          </button>
          <button type="button" class="btn-detail-share" id="modal-share-btn" title="Share recipe">
            ${ICONS.share}
            <span>Share</span>
          </button>
          <button type="button" class="btn-detail-plan" id="modal-plan-btn" title="Add to Meal Plan">
            ${ICONS.calendar}
            <span>Add to plan</span>
          </button>
        </div>

        <!-- Scalable Ingredients -->
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
        label.classList.toggle('checked', cb.checked);
      });
    });
  };
  setupCheckboxListeners();

  const favBtn = document.getElementById('modal-fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      toggleFavorite(meal, favBtn);
      const isFav = AppState.favorites.some(f => f.idMeal === meal.idMeal);
      favBtn.querySelector('span').textContent = isFav ? 'Saved' : 'Save recipe';
    });
  }

  const shareBtn = document.getElementById('modal-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: meal.strMeal,
        text: `Recipe for ${meal.strMeal}`,
        url: window.location.href
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {}
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Recipe link copied', 'success');
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
// COOK MODE
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
    cookModeStepTracker.textContent = `Step ${currentStepIndex + 1} of ${total} (${Math.round(((currentStepIndex + 1) / total) * 100)}%)`;
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
      cookNextStepBtn.innerHTML = `<span>Finish cooking</span> ${ICONS.check}`;
    } else {
      cookNextStepBtn.innerHTML = `<span>Next Step</span> ${ICONS.arrowRight}`;
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
      showToast(`Finished cooking ${recipe.strMeal}`, 'success');
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
// COOKING TIMER
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
    timerToggleBtn.innerHTML = 'Pause';
  }

  AppState.cookMode.timerInterval = setInterval(() => {
    if (AppState.cookMode.timerSeconds > 0) {
      AppState.cookMode.timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(AppState.cookMode.timerInterval);
      AppState.cookMode.isTimerRunning = false;
      if (timerToggleBtn) {
        timerToggleBtn.innerHTML = 'Start';
      }
      playTimerChime();
      showToast('Cooking timer finished', 'success');
    }
  }, 1000);
};

const pauseCookTimer = () => {
  clearInterval(AppState.cookMode.timerInterval);
  AppState.cookMode.isTimerRunning = false;
  if (timerToggleBtn) {
    timerToggleBtn.innerHTML = 'Start';
  }
};

const resetCookTimer = () => {
  clearInterval(AppState.cookMode.timerInterval);
  AppState.cookMode.isTimerRunning = false;
  AppState.cookMode.timerSeconds = AppState.cookMode.timerInitial || 0;
  updateTimerDisplay();
  if (timerToggleBtn) {
    timerToggleBtn.innerHTML = 'Start';
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
            showToast(`Removed from ${dayNames[idx]} ${mealType}`);
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
            showToast(`Pick a recipe and click "Add to plan" to slot into ${dayNames[idx]} ${mealType}`);
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
            <div class="slot-meta">${recipe.strCategory || 'Meal'} · 30m</div>
          </div>
          <div class="slot-actions">
            <button type="button" class="slot-btn slot-view-btn" title="View details" aria-label="View meal">${ICONS.eye}</button>
            <button type="button" class="slot-btn slot-remove-btn" title="Remove meal" aria-label="Remove meal">${ICONS.close}</button>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="meal-slot" data-day="${dayKey}" data-meal="${mealType}">
        <span class="meal-slot-label">${label}</span>
        <button type="button" class="slot-empty-btn">
          ${ICONS.plus}
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

    showToast(`Added "${targetRecipeForPlan.strMeal}" to ${day} ${meal}`, 'success');
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
    showToast('Generating 7-day meal plan...');
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
      showToast('Weekly meal plan generated', 'success');
    } catch (e) {
      console.error('Error auto-generating meal plan:', e);
      showToast('Could not generate plan. Please try again.');
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
      showToast('Weekly meal plan cleared.');
    }
  });
}

const openGroceryListModal = async () => {
  if (!groceryModal) return;
  groceryItemsContainer.innerHTML = '<div style="text-align:center; padding:30px;"><p>Compiling grocery list...</p></div>';
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
        <p style="font-weight:600; color:var(--text-dark);">No meals scheduled in your Weekly Planner yet.</p>
        <p style="font-size:0.88rem; color:var(--text-secondary); margin-top:4px;">Add recipes or click "Auto-Fill Week" to produce a combined shopping list.</p>
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
        <input type="checkbox" style="width:16px; height:16px; accent-color:var(--accent);">
        <span style="font-weight:600; color:var(--accent); min-width:80px;">${val.measures.filter(Boolean).join(' + ') || '1 portion'}</span>
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
    navigator.clipboard.writeText(`GROCERY LIST:\n\n${items}`);
    showToast('Grocery list copied to clipboard', 'success');
  });
}
if (groceryPrintBtn) {
  groceryPrintBtn.addEventListener('click', () => {
    window.print();
  });
}

// ==========================================================================
// PANTRY MATCHING & WORKBENCH
// ==========================================================================

const updatePantryChipsUI = () => {
  const count = AppState.pantryIngredients.length;

  if (pantryChipsContainer) {
    if (count === 0) {
      pantryChipsContainer.innerHTML = '<span class="pantry-empty-prompt" id="pantry-placeholder-text">Click staples above or type an ingredient to find matching recipes.</span>';
    } else {
      pantryChipsContainer.innerHTML = AppState.pantryIngredients.map(ing => `
        <span class="pantry-chip">
          <span>${ing}</span>
          <button type="button" class="pantry-remove-chip-btn" data-ingredient="${ing}" aria-label="Remove ${ing}">${ICONS.close}</button>
        </span>
      `).join('');
    }
  }

  if (pantryStudioChips) {
    if (count === 0) {
      pantryStudioChips.innerHTML = '<span class="pantry-studio-empty">No ingredients selected yet. Click staples to build your list.</span>';
    } else {
      pantryStudioChips.innerHTML = AppState.pantryIngredients.map(ing => `
        <span class="pantry-chip">
          <span>${ing}</span>
          <button type="button" class="pantry-remove-chip-btn" data-ingredient="${ing}" aria-label="Remove ${ing}">${ICONS.close}</button>
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
    showToast('Select or add at least one pantry ingredient first.');
    return;
  }

  navigateTo('explore');
  renderSkeletonCards(exploreRecipeGrid, 8);
  showToast(`Searching recipes with: ${AppState.pantryIngredients.join(', ')}...`);

  try {
    const mainIng = AppState.pantryIngredients[0];
    const meals = await API.filterByIngredient(mainIng);
    renderExploreRecipes(meals);
  } catch (e) {
    console.error('Error querying by ingredients:', e);
    renderEmptyState(exploreRecipeGrid, 'No recipes matched your pantry ingredients.', 'Try adding different staples or searching by recipe name.');
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

    if (sort === 'alpha') {
      results.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    } else if (sort === 'rating') {
      results.sort((a, b) => (parseInt(b.idMeal, 10) % 5) - (parseInt(a.idMeal, 10) % 5));
    }

    renderExploreRecipes(results);
  } catch (error) {
    console.error('Explore error:', error);
    renderEmptyState(exploreRecipeGrid, 'Unable to load recipes', 'Please check your connection and try again.');
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
      'Reset all filters',
      resetAllFilters
    );
    return;
  }

  if (exploreResultsCount) {
    exploreResultsCount.innerHTML = `Showing <strong>${meals.length}</strong> recipes`;
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
  }, 300);
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
// HERO SEARCH & SUGGESTIONS
// ==========================================================================

const renderRecentSearches = () => {
  if (!recentSearchChips || !recentSearchesGroup) return;
  if (AppState.recentSearches.length === 0) {
    recentSearchesGroup.style.display = 'none';
    return;
  }
  recentSearchesGroup.style.display = 'block';
  recentSearchChips.innerHTML = AppState.recentSearches.map(term => `
    <button type="button" class="dropdown-chip" data-search="${term}">${term}</button>
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
// LEGACY COMPATIBILITY & FETCHING
// ==========================================================================

const fetchRecipes = async (query) => {
  try {
    if (homeRecipeGrid) renderSkeletonCards(homeRecipeGrid, 6);
    const meals = await API.searchByName(query);
    if (homeRecipeGrid) {
      homeRecipeGrid.innerHTML = '';
      if (!meals || meals.length === 0) {
        renderEmptyState(homeRecipeGrid, 'No recipes found.', `Could not find recipes matching "${query}".`);
        return;
      }
      meals.forEach(meal => {
        homeRecipeGrid.appendChild(createRecipeCardElement(meal));
      });
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    if (homeRecipeGrid) {
      renderEmptyState(homeRecipeGrid, 'Unable to load recipes.', 'Please try searching again.');
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
  showToast('Finding a random recipe...');
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

  // Load popular recipes on home page
  fetchRecipes('chicken');

  // Wire spotlight recipe card on home page
  const featuredCard = document.getElementById('featured-recipe-card');
  if (featuredCard) {
    featuredCard.addEventListener('click', async () => {
      try {
        const meal = await API.lookupById('52772');
        if (meal) openRecipePopup(meal);
      } catch (e) {
        console.error(e);
      }
    });
    featuredCard.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        try {
          const meal = await API.lookupById('52772');
          if (meal) openRecipePopup(meal);
        } catch (err) {}
      }
    });
  }

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
