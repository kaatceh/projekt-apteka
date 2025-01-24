document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list"); // Контейнер для товаров
    const cartItems = document.getElementById("cart-items"); // Контейнер для корзины
    const clearCartBtn = document.getElementById("clear-cart"); // Кнопка очистки корзины

    let cart = []; // Хранилище для товаров в корзине
    const displayedProducts = new Set(); // Множество для уникальных товаров

    // Создание модального окна для инструкции
    const modal = document.createElement("div");
    modal.id = "instruction-modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3 id="modal-title"></h3>
            <p id="modal-instruction"></p>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = document.querySelector(".close-modal");
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Загрузка данных из файла CSV
    fetch("products.csv")
        .then(response => {
            if (!response.ok) {
                throw new Error("Не вдалося завантажити файл CSV");
            }
            return response.text();
        })
        .then(data => {
            const rows = data.split("\n").slice(1); // Пропускаем заголовок CSV
            rows.forEach(row => {
                const cells = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g); // Разделяем строки с учетом кавычек
                if (!cells || cells.length < 4) return; // Пропускаем некорректные строки

                const [name, price, image, instruction] = cells.map(cell => cell.replace(/(^"|"$)/g, "").trim()); // Убираем кавычки

                if (!name || !price || !image || !instruction) return; // Пропускаем некорректные данные

                // Добавляем товары в DOM
                const product = document.createElement("div");
                product.className = "product";
                product.innerHTML = `
                    <img src="images/${image}" alt="${name}">
                    <h3>${name}</h3>
                    <p>Ціна: ${price} грн</p>
                    <button class="show-instruction" data-instruction="${instruction}" data-name="${name}">Інструкція</button>
                    <button class="add-to-cart" data-name="${name}" data-price="${price}">Додати до кошика</button>
                `;
                productList.appendChild(product);
            });

            // Добавляем обработчики на кнопки "Інструкція"
            document.querySelectorAll(".show-instruction").forEach(button => {
                button.addEventListener("click", (e) => {
                    const instruction = e.target.dataset.instruction;
                    const name = e.target.dataset.name;

                    // Устанавливаем данные в модальное окно
                    document.getElementById("modal-title").textContent = `Інструкція для ${name}`;
                    document.getElementById("modal-instruction").textContent = instruction;

                    // Показываем модальное окно
                    modal.style.display = "block";
                });
            });

            // Добавляем обработчики на кнопки "Додати до кошика"
            document.querySelectorAll(".add-to-cart").forEach(button => {
                button.addEventListener("click", (e) => {
                    const name = e.target.dataset.name;
                    const price = e.target.dataset.price;

                    // Проверяем, есть ли товар уже в корзине
                    const existingItem = cart.find(item => item.name === name);
                    if (existingItem) {
                        alert(`${name} вже додано до кошика!`);
                    } else {
                        cart.push({ name, price }); // Добавляем товар в корзину
                        updateCart(); // Обновляем корзину
                    }
                });
            });
        })
        .catch(error => {
            console.error("Помилка завантаження CSV:", error.message);
        });

    // Функция обновления корзины
    function updateCart() {
        cartItems.innerHTML = ""; // Очищаем контейнер корзины
        if (cart.length === 0) {
            cartItems.innerHTML = "<p>Кошик порожній.</p>";
        } else {
            cart.forEach((item, index) => {
                const div = document.createElement("div");
                div.className = "cart-item";
                div.innerHTML = `
                    ${item.name} - ${item.price} грн
                    <button class="remove-item" data-index="${index}">Видалити</button>
                `;
                cartItems.appendChild(div);
            });

            // Добавляем обработчики для кнопок "Видалити"
            document.querySelectorAll(".remove-item").forEach(button => {
                button.addEventListener("click", (e) => {
                    const index = e.target.dataset.index;
                    cart.splice(index, 1); // Удаляем товар из корзины
                    updateCart(); // Обновляем корзину
                });
            });
        }
    }

    // Очистка корзины
    clearCartBtn.addEventListener("click", () => {
        cart = []; // Очищаем массив корзины
        updateCart(); // Обновляем отображение
    });
});
