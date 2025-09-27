// Текущее состояние приложения
let state = {
    currentDate: new Date(), // Текущая отображаемая дата
    dailyTarget: {
        calories: 2000,
        protein: 150,
        fat: 70,
        carbs: 250
    },
    meals: {
        breakfast: { items: [], totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
        lunch: { items: [], totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
        dinner: { items: [], totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
        snack: { items: [], totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 }
    },
    selectedMeal: null // Какой прием пищи выбран для добавления продукта
};

// Элементы DOM
const elements = {
    currentDate: document.getElementById('currentDate'),
    profileButton: document.getElementById('profileButton'),
    
    // Сводка
    caloriesProgress: document.getElementById('caloriesProgress'),
    consumedCalories: document.getElementById('consumedCalories'),
    targetCalories: document.getElementById('targetCalories'),
    consumedProtein: document.getElementById('consumedProtein'),
    targetProtein: document.getElementById('targetProtein'),
    consumedFat: document.getElementById('consumedFat'),
    targetFat: document.getElementById('targetFat'),
    consumedCarbs: document.getElementById('consumedCarbs'),
    targetCarbs: document.getElementById('targetCarbs'),
    
    // Модальное окно
    searchModal: document.getElementById('searchModal'),
    closeSearchModal: document.getElementById('closeSearchModal'),
    productSearch: document.getElementById('productSearch'),
    searchButton: document.getElementById('searchButton'),
    searchResults: document.getElementById('searchResults')
};

// Инициализация приложения
function initApp() {
    updateDateDisplay();
    renderSummary();
    renderMeals();
    setupEventListeners();
    loadDataFromStorage(); // В будущем можно добавить сохранение в localStorage
}

// Обновление отображения даты
function updateDateDisplay() {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    elements.currentDate.textContent = state.currentDate.toLocaleDateString('ru-RU', options);
}

// Расчет общих показателей за день
function calculateDailyTotals() {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    Object.values(state.meals).forEach(meal => {
        totalCalories += meal.totalCalories;
        totalProtein += meal.totalProtein;
        totalFat += meal.totalFat;
        totalCarbs += meal.totalCarbs;
    });
    
    return { totalCalories, totalProtein, totalFat, totalCarbs };
}

// Отрисовка сводки
function renderSummary() {
    const totals = calculateDailyTotals();
    
    // Обновляем цифры
    elements.consumedCalories.textContent = totals.totalCalories;
    elements.targetCalories.textContent = state.dailyTarget.calories;
    elements.consumedProtein.textContent = totals.totalProtein;
    elements.targetProtein.textContent = state.dailyTarget.protein;
    elements.consumedFat.textContent = totals.totalFat;
    elements.targetFat.textContent = state.dailyTarget.fat;
    elements.consumedCarbs.textContent = totals.totalCarbs;
    elements.targetCarbs.textContent = state.dailyTarget.carbs;
    
    // Обновляем прогресс-бар
    const caloriesPercent = Math.min((totals.totalCalories / state.dailyTarget.calories) * 100, 100);
    elements.caloriesProgress.style.width = `${caloriesPercent}%`;
}

// Отрисовка приемов пищи
function renderMeals() {
    Object.entries(state.meals).forEach(([mealType, mealData]) => {
        const mealCard = document.querySelector(`.meal-card[data-meal="${mealType}"]`);
        const caloriesEl = mealCard.querySelector('.meal-calories');
        const itemsList = mealCard.querySelector('.meal-items');
        
        // Обновляем калории
        caloriesEl.textContent = `${mealData.totalCalories} ккал`;
        
        // Очищаем список
        itemsList.innerHTML = '';
        
        // Добавляем продукты или сообщение о пустом состоянии
        if (mealData.items.length === 0) {
            itemsList.innerHTML = '<li class="empty-state">Нажмите, чтобы добавить продукт</li>';
        } else {
            mealData.items.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <span>${item.calories} ккал</span>
                `;
                itemsList.appendChild(li);
            });
        }
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация по дням (свайпы)
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    // Клики по приемам пищи
    document.querySelectorAll('.meal-card').forEach(card => {
        card.addEventListener('click', () => {
            const mealType = card.getAttribute('data-meal');
            openSearchModal(mealType);
        });
    });
    
    // Кнопка закрытия модального окна
    elements.closeSearchModal.addEventListener('click', closeSearchModal);
    
    // Клик по оверлею для закрытия
    elements.searchModal.addEventListener('click', (e) => {
        if (e.target === elements.searchModal) {
            closeSearchModal();
        }
    });
    
    // Поиск продуктов (заглушка)
    elements.searchButton.addEventListener('click', performSearch);
    elements.productSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Обработка свайпов
function handleSwipe() {
    const swipeThreshold = 50; // Минимальная дистанция свайпа
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) < swipeThreshold) return;
    
    if (diff > 0) {
        // Свайп влево -> следующий день
        navigateToDay(1);
    } else {
        // Свайп вправо -> предыдущий день
        navigateToDay(-1);
    }
}

// Навигация по дням
function navigateToDay(days) {
    state.currentDate.setDate(state.currentDate.getDate() + days);
    updateDateDisplay();
    // Здесь будет загрузка данных для новой даты
    loadDataForCurrentDate();
}

// Открытие модального окна поиска
function openSearchModal(mealType) {
    state.selectedMeal = mealType;
    elements.searchModal.classList.add('active');
    elements.productSearch.focus();
}

// Закрытие модального окна
function closeSearchModal() {
    elements.searchModal.classList.remove('active');
    state.selectedMeal = null;
    elements.productSearch.value = '';
    elements.searchResults.innerHTML = '<p class="placeholder-text">Результаты поиска появятся здесь</p>';
}

// Заглушка для поиска (будет заменена на работу с API)
function performSearch() {
    const query = elements.productSearch.value.trim();
    if (!query) return;
    
    elements.searchResults.innerHTML = '<p>Поиск... (здесь будет интеграция с FatSecret API)</p>';
    
    // Временная заглушка с примерными результатами
    setTimeout(() => {
        elements.searchResults.innerHTML = `
            <div class="search-result-item">
                <p><strong>${query}</strong> (пример)</p>
                <p>100 г: 150 ккал, 10г белка, 5г жиров, 20г углеводов</p>
                <button onclick="addProductToMeal('${query}', 150, 10, 5, 20, 100)">Добавить 100г</button>
            </div>
        `;
    }, 1000);
}

// Добавление продукта в прием пищи
function addProductToMeal(name, calories, protein, fat, carbs, quantity) {
    if (!state.selectedMeal) return;
    
    const meal = state.meals[state.selectedMeal];
    meal.items.push({
        name,
        calories,
        protein,
        fat,
        carbs,
        quantity
    });
    
    // Пересчитываем итоги для приема пищи
    meal.totalCalories += calories;
    meal.totalProtein += protein;
    meal.totalFat += fat;
    meal.totalCarbs += carbs;
    
    // Обновляем интерфейс
    renderSummary();
    renderMeals();
    
    // Закрываем модальное окно
    closeSearchModal();
    
    // Здесь можно добавить сохранение в localStorage
}

// Загрузка данных для текущей даты (заглушка)
function loadDataForCurrentDate() {
    // В реальном приложении здесь будет загрузка из базы данных или localStorage
    console.log('Загрузка данных для:', state.currentDate);
    
    // Сброс к пустым данным для демонстрации
    Object.values(state.meals).forEach(meal => {
        meal.items = [];
        meal.totalCalories = 0;
        meal.totalProtein = 0;
        meal.totalFat = 0;
        meal.totalCarbs = 0;
    });
    
    renderSummary();
    renderMeals();
}

// Загрузка данных из хранилища (заглушка)
function loadDataFromStorage() {
    // В будущем можно реализовать сохранение в localStorage
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);
