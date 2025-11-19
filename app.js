// ПРОВЕРКА
console.log('Запуск');

class CalorieTracker {
    constructor() {
        this.currentDate = new Date();
        this.currentMeal = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Обработчики для показа/скрытия списка продуктов
        document.querySelectorAll('.meal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-product-btn')) {
                    this.toggleMealDetails(card);
                }
            });
        });

        // Кнопки для продуктов
        document.querySelectorAll('.add-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const mealCard = e.target.closest('.meal-card');
                this.currentMeal = mealCard.dataset.meal;
                this.openProductModal();
            });
        });

        // Кнопки переключения дней
        document.getElementById('prevDay').addEventListener('click', () => this.changeDay(-1));
        document.getElementById('nextDay').addEventListener('click', () => this.changeDay(1));

        // Мод. окно
        document.querySelector('.close').addEventListener('click', () => this.closeProductModal());
        document.getElementById('addToMeal').addEventListener('click', () => this.addProductToMeal());
        
        // Закрытие через внешний клик
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('productModal')) {
                this.closeProductModal();
            }
        });
    }

    // Раскрытие/скрытие деталей приема пищи
    toggleMealDetails(mealCard) {
        const mealType = mealCard.dataset.meal;
        const detailsElement = document.getElementById(`${mealType}-details`);
        
        // Закрываем все другие открытые детали
        document.querySelectorAll('.meal-details').forEach(details => {
            if (details !== detailsElement) {
                details.classList.remove('active');
            }
        });
        
        // Переключ текущий элемент
        detailsElement.classList.toggle('active');
    }

    // Переключ дней
    changeDay(direction) {
        this.currentDate.setDate(this.currentDate.getDate() + direction);
        this.updateDisplay();
    }

    // Формат даты
    formatDate(date) {
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Получение данных дня
    getDayData() {
        const dateKey = this.currentDate.toISOString().split('T')[0];
        const savedData = localStorage.getItem('calorieTracker');
        const data = savedData ? JSON.parse(savedData) : { days: {} };
        
        if (!data.days[dateKey]) {
            data.days[dateKey] = {
                breakfast: [],
                lunch: [],
                dinner: []
            };
        }
        
        return data.days[dateKey];
    }

    // Сохранение данных дня
    saveDayData(dayData) {
        const dateKey = this.currentDate.toISOString().split('T')[0];
        const savedData = localStorage.getItem('calorieTracker');
        const data = savedData ? JSON.parse(savedData) : { days: {} };
        
        data.days[dateKey] = dayData;
        localStorage.setItem('calorieTracker', JSON.stringify(data));
    }

    // Открытие мод. окна
    openProductModal() {
        const mealTitles = {
            breakfast: 'завтрак',
            lunch: 'обед', 
            dinner: 'ужин'
        };
        
        document.getElementById('currentMealTitle').textContent = mealTitles[this.currentMeal];
        document.getElementById('productModal').style.display = 'block';
    }

    // Закрытие мод. окна
    closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
        this.clearForm();
    }

    // Очистка формы
    clearForm() {
        document.getElementById('productName').value = '';
        document.getElementById('productKcal').value = '';
        document.getElementById('productProtein').value = '';
        document.getElementById('productFat').value = '';
        document.getElementById('productCarbs').value = '';
        document.getElementById('productWeight').value = '100';
    }

    // Добавление продукта к приему пищи
    addProductToMeal() {
        const name = document.getElementById('productName').value;
        const kcal = parseInt(document.getElementById('productKcal').value);
        const protein = parseFloat(document.getElementById('productProtein').value) || 0;
        const fat = parseFloat(document.getElementById('productFat').value) || 0;
        const carbs = parseFloat(document.getElementById('productCarbs').value) || 0;
        const weight = parseInt(document.getElementById('productWeight').value);

        if (!name || isNaN(kcal) || isNaN(weight)) {
            alert('Заполните название, калории и вес продукта');
            return;
        }

        const coefficient = weight / 100;
        const product = {
            name: name,
            weight: weight,
            kcal: Math.round(kcal * coefficient),
            protein: Math.round(protein * coefficient * 10) / 10,
            fat: Math.round(fat * coefficient * 10) / 10,
            carbs: Math.round(carbs * coefficient * 10) / 10,
            id: Date.now() // Уникальный ID для удаления
        };

        const dayData = this.getDayData();
        dayData[this.currentMeal].push(product);
        this.saveDayData(dayData);
        
        this.updateDisplay();
        this.closeProductModal();
    }

    // Удаление продукта
    removeProduct(mealType, productId) {
        const dayData = this.getDayData();
        dayData[mealType] = dayData[mealType].filter(product => product.id !== productId);
        this.saveDayData(dayData);
        this.updateDisplay();
    }

    // Расчет статистики для приема пищи
    calculateMealStats(products) {
        return products.reduce((stats, product) => ({
            kcal: stats.kcal + product.kcal,
            protein: stats.protein + product.protein,
            fat: stats.fat + product.fat,
            carbs: stats.carbs + product.carbs
        }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });
    }

    // Обновление отображения деталей приема пищи
    updateMealDetails(mealType, products) {
        const detailsElement = document.getElementById(`${mealType}-details`);
        const productsList = document.getElementById(`${mealType}-products`);
        const emptyState = document.getElementById(`${mealType}-empty`);
        const productsCount = detailsElement.querySelector('.products-count');
        
        // Обновляем счетчик продуктов
        productsCount.textContent = `${products.length} продукт(ов)`;
        
        // Очищаем список
        productsList.innerHTML = '';
        
        if (products.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            
            // Добавляем каждый продукт в список
            products.forEach((product) => {
                const productElement = document.createElement('div');
                productElement.className = 'product-item';
                productElement.innerHTML = `
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-details">${product.weight}г • Б: ${product.protein}г • Ж: ${product.fat}г • У: ${product.carbs}г</div>
                    </div>
                    <div class="product-actions">
                        <div class="product-kcal">${product.kcal} ккал</div>
                        <button class="remove-product-btn" data-meal="${mealType}" data-product-id="${product.id}">×</button>
                    </div>
                `;
                productsList.appendChild(productElement);
            });

            // Добавляем обработчики для кнопок удаления
            productsList.querySelectorAll('.remove-product-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const mealType = btn.dataset.meal;
                    const productId = parseInt(btn.dataset.productId);
                    this.removeProduct(mealType, productId);
                });
            });
        }
    }

    // Обновление всего отображения
    updateDisplay() {
        // Обновляем дату
        document.getElementById('currentDate').textContent = this.formatDate(this.currentDate);
        
        const dayData = this.getDayData();

        // Обновляем каждый прием пищи
        ['breakfast', 'lunch', 'dinner'].forEach(meal => {
            const products = dayData[meal];
            const stats = this.calculateMealStats(products);

            // Обновление summary (главные цифры)
            const card = document.querySelector(`[data-meal="${meal}"]`);
            card.querySelector('.kcal-info').textContent = `${stats.kcal} ккал`;
            card.querySelector('.macro-info').textContent = 
                `Б: ${stats.protein}г, Ж: ${stats.fat}г, У: ${stats.carbs}г`;

            // Обновление деталей (выпадающее окно)
            this.updateMealDetails(meal, products);
        });
    }
}


// Запускаем приложение когда страница загрузится
document.addEventListener('DOMContentLoaded', function() {
    new CalorieTracker();
});
