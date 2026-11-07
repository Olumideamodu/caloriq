/**
 * CaloriQ - Vanilla Calorie & Macro Tracker
 * Pure Vanilla JavaScript - No dependencies, No backend
 * LocalStorage persistent data store
 */

(function () {
  'use strict';

  // --- STORAGE KEYS ---
  const STORAGE_KEYS = {
    GOALS: 'caloriq_user_goals',
    LOGS: 'caloriq_food_logs',
    WATER: 'caloriq_water_logs',
    INITIALIZED: 'caloriq_initialized_flag'
  };

  // --- DEFAULT GOALS ---
  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65
  };

  // --- QUICK PRESET FOODS ---
  const PRESET_FOODS = [
    { name: 'Boiled Egg (2)', icon: '🥚', cal: 155, p: 13, c: 1, f: 11, defaultMeal: 'Breakfast' },
    { name: 'Oatmeal & Berries', icon: '🥣', cal: 260, p: 9, c: 45, f: 5, defaultMeal: 'Breakfast' },
    { name: 'Banana', icon: '🍌', cal: 105, p: 1.3, c: 27, f: 0.3, defaultMeal: 'Snacks' },
    { name: 'Grilled Chicken Breast', icon: '🍗', cal: 245, p: 46, c: 0, f: 5, defaultMeal: 'Lunch' },
    { name: 'Cooked White Rice (1 cup)', icon: '🍚', cal: 205, p: 4.2, c: 45, f: 0.4, defaultMeal: 'Lunch' },
    { name: 'Greek Salad w/ Feta', icon: '🥗', cal: 230, p: 7, c: 12, f: 18, defaultMeal: 'Lunch' },
    { name: 'Salmon Fillet (180g)', icon: '🐟', cal: 360, p: 39, c: 0, f: 22, defaultMeal: 'Dinner' },
    { name: 'Steamed Broccoli & Olive Oil', icon: '🥦', cal: 110, p: 4, c: 10, f: 7, defaultMeal: 'Dinner' },
    { name: 'Turkey Avocado Sandwich', icon: '🥪', cal: 420, p: 32, c: 38, f: 15, defaultMeal: 'Lunch' },
    { name: 'Whey Protein Shake', icon: '🥛', cal: 160, p: 30, c: 4, f: 2, defaultMeal: 'Snacks' },
    { name: 'Apple w/ Peanut Butter', icon: '🍎', cal: 210, p: 5, c: 29, f: 10, defaultMeal: 'Snacks' },
    { name: 'Cafe Latte (Skim)', icon: '☕', cal: 110, p: 7, c: 12, f: 3, defaultMeal: 'Breakfast' }
  ];

  // --- APPLICATION STATE ---
  let selectedDate = getTodayDateString();
  let goals = loadStoredGoals();
  let foodLogs = loadStoredLogs();
  let waterLogs = loadStoredWater();
  let editingItemId = null;

  // --- INITIAL SEEDING (FOR FIRST VISIT) ---
  checkInitialSeed();

  // --- DOM ELEMENTS ---
  const el = {
    // Date navigation
    prevDayBtn: document.getElementById('prev-day-btn'),
    nextDayBtn: document.getElementById('next-day-btn'),
    todayShortcutBtn: document.getElementById('today-shortcut-btn'),
    currentDateLabel: document.getElementById('current-date-label'),
    dateDisplayTrigger: document.getElementById('date-display-trigger'),
    datePickerInput: document.getElementById('date-picker-input'),

    // Calorie card
    calorieProgressCircle: document.getElementById('calorie-progress-circle'),
    caloriesConsumedVal: document.getElementById('calories-consumed-val'),
    calorieGoalVal: document.getElementById('calorie-goal-val'),
    calorieEatenSubval: document.getElementById('calorie-eaten-subval'),
    calorieRemainingVal: document.getElementById('calorie-remaining-val'),
    remainingLabelText: document.getElementById('remaining-label-text'),
    calorieStatusBadge: document.getElementById('calorie-status-badge'),
    remainingIndicatorDot: document.getElementById('remaining-indicator-dot'),

    // Macros card
    proteinCur: document.getElementById('protein-cur'),
    proteinMax: document.getElementById('protein-max'),
    proteinFillBar: document.getElementById('protein-fill-bar'),
    proteinPct: document.getElementById('protein-pct'),
    proteinCal: document.getElementById('protein-cal'),

    carbsCur: document.getElementById('carbs-cur'),
    carbsMax: document.getElementById('carbs-max'),
    carbsFillBar: document.getElementById('carbs-fill-bar'),
    carbsPct: document.getElementById('carbs-pct'),
    carbsCal: document.getElementById('carbs-cal'),

    fatCur: document.getElementById('fat-cur'),
    fatMax: document.getElementById('fat-max'),
    fatFillBar: document.getElementById('fat-fill-bar'),
    fatPct: document.getElementById('fat-pct'),
    fatCal: document.getElementById('fat-cal'),

    // Water tracker
    waterDisplay: document.getElementById('water-display'),
    waterDotsContainer: document.getElementById('water-dots-container'),
    waterPlusBtn: document.getElementById('water-plus-btn'),
    waterMinusBtn: document.getElementById('water-minus-btn'),

    // Presets
    presetChipsContainer: document.getElementById('preset-chips-container'),

    // Form
    foodFormCard: document.getElementById('food-form-section'),
    formHeading: document.getElementById('form-heading'),
    addFoodForm: document.getElementById('add-food-form'),
    editingItemIdInput: document.getElementById('editing-item-id'),
    mealTabButtons: document.querySelectorAll('.meal-tab'),
    selectedMealInput: document.getElementById('selected-meal-input'),
    foodNameInput: document.getElementById('food-name-input'),
    foodCalInput: document.getElementById('food-cal-input'),
    foodProteinInput: document.getElementById('food-protein-input'),
    foodCarbsInput: document.getElementById('food-carbs-input'),
    foodFatInput: document.getElementById('food-fat-input'),
    submitFoodBtn: document.getElementById('submit-food-btn'),
    submitBtnText: document.getElementById('submit-btn-text'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),

    // Meal group lists & totals
    totalItemsCount: document.getElementById('total-items-count'),
    clearDayBtn: document.getElementById('clear-day-btn'),
    emptyDayState: document.getElementById('empty-day-state'),

    breakfastList: document.getElementById('breakfast-items-list'),
    lunchList: document.getElementById('lunch-items-list'),
    dinnerList: document.getElementById('dinner-items-list'),
    snacksList: document.getElementById('snacks-items-list'),

    breakfastCalTotal: document.getElementById('breakfast-cal-total'),
    lunchCalTotal: document.getElementById('lunch-cal-total'),
    dinnerCalTotal: document.getElementById('dinner-cal-total'),
    snacksCalTotal: document.getElementById('snacks-cal-total'),

    breakfastMacrosSummary: document.getElementById('breakfast-macros-summary'),
    lunchMacrosSummary: document.getElementById('lunch-macros-summary'),
    dinnerMacrosSummary: document.getElementById('dinner-macros-summary'),
    snacksMacrosSummary: document.getElementById('snacks-macros-summary'),

    // Chart
    weeklyChartCanvas: document.getElementById('weekly-chart'),
    chartTargetDisplay: document.getElementById('chart-target-display'),

    // Settings Modal
    openSettingsBtn: document.getElementById('open-settings-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    settingCalGoal: document.getElementById('setting-cal-goal'),
    settingProteinGoal: document.getElementById('setting-protein-goal'),
    settingCarbsGoal: document.getElementById('setting-carbs-goal'),
    settingFatGoal: document.getElementById('setting-fat-goal'),
    saveTargetsBtn: document.getElementById('save-targets-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    importJsonFile: document.getElementById('import-json-file'),
    resetAllDataBtn: document.getElementById('reset-all-data-btn'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // --- INITIALIZATION ---
  initApp();

  function initApp() {
    renderPresetChips();
    bindEventListeners();
    refreshAllUI();
  }

  // --- EVENT LISTENERS ---
  function bindEventListeners() {
    // Date switcher
    el.prevDayBtn.addEventListener('click', () => changeDateByOffset(-1));
    el.nextDayBtn.addEventListener('click', () => changeDateByOffset(1));
    el.todayShortcutBtn.addEventListener('click', () => setDate(getTodayDateString()));

    el.dateDisplayTrigger.addEventListener('click', () => {
      if (typeof el.datePickerInput.showPicker === 'function') {
        try {
          el.datePickerInput.showPicker();
        } catch (err) {
          // Fallback to native input focus
          el.datePickerInput.focus();
        }
      }
    });

    el.datePickerInput.addEventListener('change', (e) => {
      if (e.target.value) {
        setDate(e.target.value);
      }
    });

    // Meal selection tabs
    el.mealTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setFormMealCategory(btn.dataset.meal);
      });
    });

    // Food form submission
    el.addFoodForm.addEventListener('submit', handleFoodFormSubmit);
    el.cancelEditBtn.addEventListener('click', resetFoodForm);

    // Quick add to specific meal buttons (+)
    document.querySelectorAll('.quick-add-to-meal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const meal = btn.dataset.meal;
        setFormMealCategory(meal);
        el.foodNameInput.focus();
        el.foodFormCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    // Clear day button
    el.clearDayBtn.addEventListener('click', handleClearDay);

    // Water tracker buttons
    el.waterPlusBtn.addEventListener('click', () => changeWater(250));
    el.waterMinusBtn.addEventListener('click', () => changeWater(-250));

    // Settings modal open/close
    el.openSettingsBtn.addEventListener('click', openSettingsModal);
    el.closeSettingsBtn.addEventListener('click', closeSettingsModal);
    el.settingsModal.addEventListener('click', (e) => {
      if (e.target === el.settingsModal) closeSettingsModal();
    });

    // Settings actions
    el.saveTargetsBtn.addEventListener('click', handleSaveTargets);
    el.exportJsonBtn.addEventListener('click', handleExportJSON);
    el.importJsonFile.addEventListener('change', handleImportJSON);
    el.resetAllDataBtn.addEventListener('click', handleResetAllData);

    // Canvas click to select day
    el.weeklyChartCanvas.addEventListener('click', handleChartClick);

    // Window resize redraw chart
    window.addEventListener('resize', debounce(() => renderWeeklyChart(), 150));
  }

  // --- DATE HELPERS ---
  function getTodayDateString() {
    const today = new Date();
    return formatDateKey(today);
  }

  function formatDateKey(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function changeDateByOffset(offsetDays) {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() + offsetDays);
    setDate(formatDateKey(d));
  }

  function setDate(dateStr) {
    selectedDate = dateStr;
    el.datePickerInput.value = dateStr;
    refreshAllUI();
  }

  function formatDisplayDate(dateStr) {
    const todayStr = getTodayDateString();
    const d = parseDateKey(dateStr);

    const todayDate = parseDateKey(todayStr);
    const diffTime = d.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  }

  // --- DATA STORAGE & SEEDING ---
  function loadStoredGoals() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (stored) return Object.assign({}, DEFAULT_GOALS, JSON.parse(stored));
    } catch (e) {
      console.warn('Error reading stored goals', e);
    }
    return Object.assign({}, DEFAULT_GOALS);
  }

  function saveStoredGoals() {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  function loadStoredLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored food logs', e);
    }
    return {};
  }

  function saveStoredLogs() {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(foodLogs));
  }

  function loadStoredWater() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored water logs', e);
    }
    return {};
  }

  function saveStoredWater() {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(waterLogs));
  }

  function checkInitialSeed() {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      const today = getTodayDateString();
      foodLogs[today] = [
        {
          id: 'item_sample_1',
          name: 'Oatmeal with Blueberries & Honey',
          meal: 'Breakfast',
          calories: 320,
          protein: 10,
          carbs: 58,
          fat: 6,
          time: '08:15 AM'
        },
        {
          id: 'item_sample_2',
          name: 'Black Coffee with Splash of Milk',
          meal: 'Breakfast',
          calories: 35,
          protein: 2,
          carbs: 3,
          fat: 1.5,
          time: '08:30 AM'
        },
        {
          id: 'item_sample_3',
          name: 'Grilled Chicken & Quinoa Salad',
          meal: 'Lunch',
          calories: 540,
          protein: 48,
          carbs: 45,
          fat: 14,
          time: '01:10 PM'
        }
      ];
      waterLogs[today] = 1250;
      saveStoredLogs();
      saveStoredWater();
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // --- RENDER MAIN UI ---
  function refreshAllUI() {
    updateDateDisplay();
    renderDaySummary();
    renderMealsList();
    renderWaterTracker();
    renderWeeklyChart();
  }

  function updateDateDisplay() {
    el.currentDateLabel.textContent = formatDisplayDate(selectedDate);
    el.datePickerInput.value = selectedDate;

    // Highlight or disable today shortcut
    const isToday = selectedDate === getTodayDateString();
    el.todayShortcutBtn.style.opacity = isToday ? '0.6' : '1';
    el.todayShortcutBtn.style.cursor = isToday ? 'default' : 'pointer';
  }

  function getDayItems(dateStr) {
    return foodLogs[dateStr] || [];
  }

  // --- DAY SUMMARY (DONUT & MACROS) ---
  function renderDaySummary() {
    const items = getDayItems(selectedDate);

    let totalCal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    items.forEach(item => {
      totalCal += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    const targetCal = goals.calories || 2000;
    const remainingCal = targetCal - totalCal;
    const isOver = remainingCal < 0;

    // 1. Update text displays
    el.caloriesConsumedVal.textContent = Math.round(totalCal).toLocaleString();
    el.calorieGoalVal.innerHTML = `${Math.round(targetCal).toLocaleString()} <small>kcal</small>`;
    el.calorieEatenSubval.innerHTML = `${Math.round(totalCal).toLocaleString()} <small>kcal</small>`;

    if (isOver) {
      el.remainingLabelText.textContent = 'Over Target';
      el.calorieRemainingVal.innerHTML = `+${Math.abs(Math.round(remainingCal)).toLocaleString()} <small>kcal</small>`;
      el.calorieStatusBadge.textContent = 'Over Budget';
      el.calorieStatusBadge.className = 'badge badge-over';
      el.remainingIndicatorDot.className = 'metric-indicator remaining-indicator over';
      el.calorieRemainingVal.closest('.metric-row').className = 'metric-row remaining-row over';
      el.calorieProgressCircle.classList.add('over-budget');
    } else {
      el.remainingLabelText.textContent = 'Remaining';
      el.calorieRemainingVal.innerHTML = `${Math.round(remainingCal).toLocaleString()} <small>kcal</small>`;
      el.calorieStatusBadge.textContent = remainingCal === 0 ? 'Goal Reached' : 'On Track';
      el.calorieStatusBadge.className = 'badge';
      el.remainingIndicatorDot.className = 'metric-indicator remaining-indicator';
      el.calorieRemainingVal.closest('.metric-row').className = 'metric-row remaining-row';
      el.calorieProgressCircle.classList.remove('over-budget');
    }

    // 2. Animate Donut Progress SVG
    // Circumference = 2 * PI * 74 ~= 464.95
    const circumference = 465;
    let pctConsumed = targetCal > 0 ? (totalCal / targetCal) : 0;
    if (pctConsumed > 1) pctConsumed = 1;
    const strokeOffset = circumference - (pctConsumed * circumference);
    el.calorieProgressCircle.style.strokeDashoffset = strokeOffset;

    // 3. Macro Bars
    renderMacroBar({
      current: totalProtein,
      target: goals.protein || 140,
      curEl: el.proteinCur,
      maxEl: el.proteinMax,
      barEl: el.proteinFillBar,
      pctEl: el.proteinPct,
      calEl: el.proteinCal,
      multiplier: 4 // 4 kcal per g protein
    });

    renderMacroBar({
      current: totalCarbs,
      target: goals.carbs || 220,
      curEl: el.carbsCur,
      maxEl: el.carbsMax,
      barEl: el.carbsFillBar,
      pctEl: el.carbsPct,
      calEl: el.carbsCal,
      multiplier: 4 // 4 kcal per g carbs
    });

    renderMacroBar({
      current: totalFat,
      target: goals.fat || 65,
      curEl: el.fatCur,
      maxEl: el.fatMax,
      barEl: el.fatFillBar,
      pctEl: el.fatPct,
      calEl: el.fatCal,
      multiplier: 9 // 9 kcal per g fat
    });

    el.chartTargetDisplay.textContent = Math.round(targetCal).toLocaleString();
  }

  function renderMacroBar({ current, target, curEl, maxEl, barEl, pctEl, calEl, multiplier }) {
    const curVal = Math.round(current * 10) / 10;
    const targetVal = Math.round(target);
    const pct = targetVal > 0 ? Math.round((curVal / targetVal) * 100) : 0;
    const calFromMacro = Math.round(curVal * multiplier);

    curEl.textContent = `${curVal}g`;
    maxEl.textContent = `${targetVal}g`;
    barEl.style.width = `${Math.min(pct, 100)}%`;
    pctEl.textContent = `${pct}% of target`;
    calEl.textContent = `${calFromMacro} kcal`;
  }

  // --- HYDRATION / WATER TRACKER ---
  function renderWaterTracker() {
    const currentMl = waterLogs[selectedDate] || 0;
    const goalMl = 2500;
    el.waterDisplay.textContent = `${currentMl} / ${goalMl} ml`;

    // Render 10 dots (each 250ml)
    const totalDots = 10;
    const filledDots = Math.floor(currentMl / 250);

    let dotsHtml = '';
    for (let i = 0; i < totalDots; i++) {
      const isFilled = i < filledDots;
      dotsHtml += `<span class="water-dot ${isFilled ? 'filled' : ''}"></span>`;
    }
    el.waterDotsContainer.innerHTML = dotsHtml;
  }

  function changeWater(deltaMl) {
    const currentMl = waterLogs[selectedDate] || 0;
    const newMl = Math.max(0, currentMl + deltaMl);
    waterLogs[selectedDate] = newMl;
    saveStoredWater();
    renderWaterTracker();
    showToast(deltaMl > 0 ? `+${deltaMl}ml logged 💧` : `${deltaMl}ml removed 💧`, 'info');
  }

  // --- PRESET CHIPS ---
  function renderPresetChips() {
    el.presetChipsContainer.innerHTML = '';
    PRESET_FOODS.forEach(preset => {
      const chip = document.createElement('div');
      chip.className = 'preset-chip';
      chip.innerHTML = `
        <span class="preset-icon">${preset.icon}</span>
        <span class="preset-name">${preset.name}</span>
        <span class="preset-cal">+${preset.cal} kcal</span>
      `;
      chip.addEventListener('click', () => {
        handleQuickAddPreset(preset);
      });
      el.presetChipsContainer.appendChild(chip);
    });
  }

  function handleQuickAddPreset(preset) {
    // Determine meal: current active tab in form, or preset's default meal
    const activeMeal = el.selectedMealInput.value || preset.defaultMeal;

    const newItem = {
      id: generateId(),
      name: preset.name,
      meal: activeMeal,
      calories: preset.cal,
      protein: preset.p,
      carbs: preset.c,
      fat: preset.f,
      time: getCurrentTimeFormatted()
    };

    if (!foodLogs[selectedDate]) {
      foodLogs[selectedDate] = [];
    }

    foodLogs[selectedDate].push(newItem);
    saveStoredLogs();
    refreshAllUI();
    showToast(`Added ${preset.name} to ${activeMeal}!`, 'success');
  }

  // --- FORM HANDLING (ADD / EDIT) ---
  function setFormMealCategory(mealName) {
    el.selectedMealInput.value = mealName;
    el.mealTabButtons.forEach(btn => {
      if (btn.dataset.meal === mealName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();

    const name = el.foodNameInput.value.trim();
    const calories = parseFloat(el.foodCalInput.value);
    const meal = el.selectedMealInput.value || 'Breakfast';
    const protein = parseFloat(el.foodProteinInput.value) || 0;
    const carbs = parseFloat(el.foodCarbsInput.value) || 0;
    const fat = parseFloat(el.foodFatInput.value) || 0;

    if (!name) {
      showToast('Please enter a food description.', 'danger');
      el.foodNameInput.focus();
      return;
    }

    if (isNaN(calories) || calories < 0) {
      showToast('Please enter valid calories.', 'danger');
      el.foodCalInput.focus();
      return;
    }

    if (!foodLogs[selectedDate]) {
      foodLogs[selectedDate] = [];
    }

    if (editingItemId) {
      // Update existing item
      const itemIndex = foodLogs[selectedDate].findIndex(item => item.id === editingItemId);
      if (itemIndex > -1) {
        foodLogs[selectedDate][itemIndex] = {
          ...foodLogs[selectedDate][itemIndex],
          name,
          meal,
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10
        };
        showToast(`Updated "${name}"`, 'success');
      }
    } else {
      // Add new item
      const newItem = {
        id: generateId(),
        name,
        meal,
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        time: getCurrentTimeFormatted()
      };
      foodLogs[selectedDate].push(newItem);
      showToast(`Added "${name}" to ${meal}`, 'success');
    }

    saveStoredLogs();
    resetFoodForm();
    refreshAllUI();
  }

  function startEditItem(itemId) {
    const items = getDayItems(selectedDate);
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    editingItemId = item.id;
    el.editingItemIdInput.value = item.id;
    el.foodNameInput.value = item.name;
    el.foodCalInput.value = item.calories;
    el.foodProteinInput.value = item.protein || '';
    el.foodCarbsInput.value = item.carbs || '';
    el.foodFatInput.value = item.fat || '';

    setFormMealCategory(item.meal);

    el.formHeading.textContent = 'Edit Food Item';
    el.submitBtnText.textContent = 'Update Item';
    el.cancelEditBtn.classList.remove('hidden');

    el.foodFormCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    el.foodNameInput.focus();
  }

  function resetFoodForm() {
    editingItemId = null;
    el.editingItemIdInput.value = '';
    el.addFoodForm.reset();
    el.formHeading.textContent = 'Log Food Item';
    el.submitBtnText.textContent = 'Add to Daily Log';
    el.cancelEditBtn.classList.add('hidden');
  }

  function deleteItem(itemId) {
    const items = getDayItems(selectedDate);
    const item = items.find(i => i.id === itemId);
    const itemName = item ? item.name : 'Food item';

    foodLogs[selectedDate] = items.filter(i => i.id !== itemId);
    saveStoredLogs();

    if (editingItemId === itemId) {
      resetFoodForm();
    }

    refreshAllUI();
    showToast(`Removed "${itemName}"`, 'info');
  }

  function handleClearDay() {
    const items = getDayItems(selectedDate);
    if (items.length === 0) {
      showToast('No logged items to clear on this day.', 'info');
      return;
    }

    const confirmClear = window.confirm(`Are you sure you want to delete all ${items.length} items logged for ${formatDisplayDate(selectedDate)}?`);
    if (!confirmClear) return;

    foodLogs[selectedDate] = [];
    waterLogs[selectedDate] = 0;
    saveStoredLogs();
    saveStoredWater();
    resetFoodForm();
    refreshAllUI();
    showToast(`Cleared all logs for ${formatDisplayDate(selectedDate)}.`, 'info');
  }

  // --- MEALS BREAKDOWN RENDERING ---
  function renderMealsList() {
    const items = getDayItems(selectedDate);
    el.totalItemsCount.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

    if (items.length === 0) {
      el.emptyDayState.classList.remove('hidden');
    } else {
      el.emptyDayState.classList.add('hidden');
    }

    const mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

    mealCategories.forEach(meal => {
      const mealItems = items.filter(item => item.meal === meal);
      const containerEl = getMealListElement(meal);
      const calTotalEl = getMealCalTotalElement(meal);
      const macroSummaryEl = getMealMacroSummaryElement(meal);

      let mealCal = 0;
      let mealP = 0;
      let mealC = 0;
      let mealF = 0;

      containerEl.innerHTML = '';

      if (mealItems.length === 0) {
        containerEl.innerHTML = `<div class="meal-empty-note">No items logged yet</div>`;
      } else {
        mealItems.forEach(item => {
          mealCal += Number(item.calories) || 0;
          mealP += Number(item.protein) || 0;
          mealC += Number(item.carbs) || 0;
          mealF += Number(item.fat) || 0;

          const row = document.createElement('div');
          row.className = 'meal-item-row';
          row.innerHTML = `
            <div class="item-left">
              <div class="item-name">${escapeHtml(item.name)}</div>
              <div class="item-macros-tags">
                ${item.protein ? `<span class="macro-tag macro-tag-p">P: ${item.protein}g</span>` : ''}
                ${item.carbs ? `<span class="macro-tag macro-tag-c">C: ${item.carbs}g</span>` : ''}
                ${item.fat ? `<span class="macro-tag macro-tag-f">F: ${item.fat}g</span>` : ''}
                ${item.time ? `<span class="item-time">&bull; ${escapeHtml(item.time)}</span>` : ''}
              </div>
            </div>
            <div class="item-right">
              <span class="item-cal-badge font-numeric">${item.calories} kcal</span>
              <div class="item-actions">
                <button class="item-action-btn edit-btn" title="Edit item" data-id="${item.id}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="item-action-btn delete-btn" title="Delete item" data-id="${item.id}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          `;

          // Row action listeners
          row.querySelector('.edit-btn').addEventListener('click', () => startEditItem(item.id));
          row.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item.id));

          containerEl.appendChild(row);
        });
      }

      calTotalEl.textContent = Math.round(mealCal).toLocaleString();
      macroSummaryEl.textContent = `${Math.round(mealP)}g P • ${Math.round(mealC)}g C • ${Math.round(mealF)}g F`;
    });
  }

  function getMealListElement(meal) {
    switch (meal) {
      case 'Breakfast': return el.breakfastList;
      case 'Lunch': return el.lunchList;
      case 'Dinner': return el.dinnerList;
      case 'Snacks': return el.snacksList;
    }
  }

  function getMealCalTotalElement(meal) {
    switch (meal) {
      case 'Breakfast': return el.breakfastCalTotal;
      case 'Lunch': return el.lunchCalTotal;
      case 'Dinner': return el.dinnerCalTotal;
      case 'Snacks': return el.snacksCalTotal;
    }
  }

  function getMealMacroSummaryElement(meal) {
    switch (meal) {
      case 'Breakfast': return el.breakfastMacrosSummary;
      case 'Lunch': return el.lunchMacrosSummary;
      case 'Dinner': return el.dinnerMacrosSummary;
      case 'Snacks': return el.snacksMacrosSummary;
    }
  }

  // --- 7-DAY TREND MINI CHART (CANVAS) ---
  let chartHitZones = [];

  function renderWeeklyChart() {
    const canvas = el.weeklyChartCanvas;
    if (!canvas) return;

    // Retina display resolution scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width > 0 ? rect.width : 380;
    const displayHeight = 190;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Build the 7 days window (selectedDate is in the middle/end)
    // Show 6 previous days + selectedDate (7 total days)
    const baseDate = parseDateKey(selectedDate);
    const daysData = [];
    chartHitZones = [];

    let maxCalFound = goals.calories || 2000;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateKey = formatDateKey(d);
      const items = foodLogs[dateKey] || [];
      const dayCal = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

      if (dayCal > maxCalFound) maxCalFound = dayCal;

      daysData.push({
        dateKey,
        dayName: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        dayNum: d.getDate(),
        calories: dayCal,
        isSelected: dateKey === selectedDate
      });
    }

    const targetCal = goals.calories || 2000;
    const chartMaxY = Math.max(maxCalFound * 1.2, targetCal * 1.25);

    // Margins
    const topPadding = 24;
    const bottomPadding = 32;
    const leftPadding = 12;
    const rightPadding = 12;

    const chartWidth = displayWidth - leftPadding - rightPadding;
    const chartHeight = displayHeight - topPadding - bottomPadding;

    // 1. Draw Target benchmark line (dashed)
    const targetY = topPadding + chartHeight - ((targetCal / chartMaxY) * chartHeight);

    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.moveTo(leftPadding, targetY);
    ctx.lineTo(displayWidth - rightPadding, targetY);
    ctx.stroke();

    // Target label on line
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${targetCal} goal`, displayWidth - rightPadding, targetY - 4);
    ctx.restore();

    // 2. Draw 7 Daily Bars
    const barCount = daysData.length;
    const barWidth = Math.min(32, (chartWidth / barCount) * 0.65);
    const step = chartWidth / barCount;

    daysData.forEach((day, index) => {
      const x = leftPadding + (index * step) + (step - barWidth) / 2;
      const barHeight = Math.max(4, (day.calories / chartMaxY) * chartHeight);
      const y = topPadding + chartHeight - barHeight;

      const isOver = day.calories > targetCal;

      // Register hit zone for canvas click
      chartHitZones.push({
        x: leftPadding + (index * step),
        width: step,
        dateKey: day.dateKey
      });

      // Background selection highlight pill
      if (day.isSelected) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
        roundRect(ctx, leftPadding + (index * step) + 2, topPadding - 14, step - 4, displayHeight - topPadding, 8);
        ctx.fill();
      }

      // Bar gradient/color
      ctx.save();
      if (day.calories === 0) {
        ctx.fillStyle = '#222d3f';
      } else if (isOver) {
        ctx.fillStyle = '#f43f5e'; // Rose over budget
      } else {
        ctx.fillStyle = '#10b981'; // Emerald
      }

      // Draw rounded top bar
      roundRect(ctx, x, y, barWidth, barHeight, 4);
      ctx.fill();
      ctx.restore();

      // Bar Calorie Value on top
      if (day.calories > 0) {
        ctx.fillStyle = day.isSelected ? '#ffffff' : '#94a3b8';
        ctx.font = day.isSelected ? '700 10px Plus Jakarta Sans, sans-serif' : '500 10px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(day.calories)}`, x + (barWidth / 2), Math.max(14, y - 5));
      }

      // Day of Week Label & Day of Month
      const labelY = displayHeight - 10;
      ctx.fillStyle = day.isSelected ? '#38bdf8' : '#64748b';
      ctx.font = day.isSelected ? '700 11px Plus Jakarta Sans, sans-serif' : '500 11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${day.dayName} ${day.dayNum}`, x + (barWidth / 2), labelY);
    });
  }

  function handleChartClick(e) {
    const canvas = el.weeklyChartCanvas;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    for (let zone of chartHitZones) {
      if (clickX >= zone.x && clickX <= zone.x + zone.width) {
        if (zone.dateKey !== selectedDate) {
          setDate(zone.dateKey);
          showToast(`Viewing ${formatDisplayDate(zone.dateKey)}`, 'info');
        }
        break;
      }
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  // --- SETTINGS MODAL & TARGETS ---
  function openSettingsModal() {
    el.settingCalGoal.value = goals.calories || 2000;
    el.settingProteinGoal.value = goals.protein || 140;
    el.settingCarbsGoal.value = goals.carbs || 220;
    el.settingFatGoal.value = goals.fat || 65;
    el.settingsModal.classList.remove('hidden');
  }

  function closeSettingsModal() {
    el.settingsModal.classList.add('hidden');
  }

  function handleSaveTargets() {
    const cal = parseInt(el.settingCalGoal.value, 10);
    const protein = parseFloat(el.settingProteinGoal.value);
    const carbs = parseFloat(el.settingCarbsGoal.value);
    const fat = parseFloat(el.settingFatGoal.value);

    if (isNaN(cal) || cal < 500) {
      showToast('Daily calories must be at least 500 kcal.', 'danger');
      return;
    }

    goals = {
      calories: cal,
      protein: isNaN(protein) ? 140 : protein,
      carbs: isNaN(carbs) ? 220 : carbs,
      fat: isNaN(fat) ? 65 : fat
    };

    saveStoredGoals();
    refreshAllUI();
    closeSettingsModal();
    showToast('Goals updated successfully!', 'success');
  }

  // --- BACKUP & RESTORE (EXPORT / IMPORT JSON) ---
  function handleExportJSON() {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      goals: goals,
      foodLogs: foodLogs,
      waterLogs: waterLogs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `caloriq-backup-${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Data exported successfully!', 'success');
  }

  function handleImportJSON(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || typeof imported !== 'object') {
          throw new Error('Invalid JSON format');
        }

        if (imported.goals) {
          goals = Object.assign({}, DEFAULT_GOALS, imported.goals);
          saveStoredGoals();
        }

        if (imported.foodLogs) {
          foodLogs = Object.assign({}, foodLogs, imported.foodLogs);
          saveStoredLogs();
        }

        if (imported.waterLogs) {
          waterLogs = Object.assign({}, waterLogs, imported.waterLogs);
          saveStoredWater();
        }

        refreshAllUI();
        closeSettingsModal();
        showToast('Backup restored successfully!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Failed to import file. Invalid backup JSON.', 'danger');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function handleResetAllData() {
    const confirmReset = window.confirm('⚠️ WARNING: This will permanently delete ALL recorded meals, hydration history, and restore default goals. Are you sure?');
    if (!confirmReset) return;

    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.WATER);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);

    goals = Object.assign({}, DEFAULT_GOALS);
    foodLogs = {};
    waterLogs = {};

    resetFoodForm();
    refreshAllUI();
    closeSettingsModal();
    showToast('All local data has been erased.', 'info');
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- GENERAL UTILITIES ---
  function generateId() {
    return 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }

  function getCurrentTimeFormatted() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

})();
