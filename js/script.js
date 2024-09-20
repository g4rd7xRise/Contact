window.onload = function () {
    // const nameInput = document.querySelector('.js-name-input');
    // const surnameInput = document.querySelector('.js-surname-input');
    // const vacancyInput = document.querySelector('.js-vacancy-input');
    // const phoneInput = document.querySelector('.js-phone-input');
    // const submitButton = document.querySelector('.js-submit-btn');
    // const clearButton = document.querySelector('.js-clear-btn');
    // const searchButton = document.querySelector('.js-search-btn');
    // const searchInput = document.querySelector('.js-search-input');
    // const contactTable = document.querySelector('.contact-table__columns');
    //
    // // Модальные окна
    // const editPopup = document.querySelector('.edit-popup');
    // const editNameInput = document.querySelector('.js-edit-name-input');
    // const editVacancyInput = document.querySelector('.js-edit-vacancy-input');
    // const editPhoneInput = document.querySelector('.js-edit-phone-input');
    // const submitEditButton = document.querySelector('.js-submit-edit-btn')




    // Структура данных для контакта
    class Contact {
        constructor(name, surname, vacancy, phone) {
            this.name = name;
            this.surname = surname;
            this.vacancy = vacancy;
            this.phone = phone;
        }
    }



// Объект для хранения контактов по первой букве фамилии
    let contactsByLetter = {};

    //Функция для загрузки контактов из localStorage

    function loadContacts() {
        console.log("Функция loadContacts вызвана"); // Отладка
        const storedContacts = localStorage.getItem('contacts');
        console.log("Загружаемые данные из localStorage:", storedContacts); // Отладка

        if (storedContacts) {
            contactsByLetter = JSON.parse(storedContacts);
            console.log("Парсинг данных:", contactsByLetter); // Отладка
            displayContacts(); // Отображаем загруженные контакты
        } else {
            console.log("Нет сохраненных контактов."); // Отладка
        }
    }



    // Функция проверки имени и фамилии
    function isValidName(name) {
        const namePattern = /^[a-zA-Zа-яА-ЯЁё\s\-]+$/;
        return namePattern.test(name);
    }
    // Функция проверки номера телефона
    function isValidPhone(phone) {
        const phonePattern = /^\+?\d{1}\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/; // Пример: +7 123 456 78 90
        return phonePattern.test(phone);
    }


// Функция добавления контакта
    function addContact(e) {
        e.preventDefault();

        // Получение значений из полей ввода
        const nameInput = document.getElementById('name');
        const surnameInput = document.getElementById('surname');
        const vacancyInput = document.getElementById('vacancy');
        const phoneInput = document.getElementById('phone');

        const name = nameInput.value.trim();
        const surname = surnameInput.value.trim();
        const vacancy = vacancyInput.value.trim();
        const phone = phoneInput.value.trim();

        // Валидация данных
        if (!isValidName(surname)) {
            showError('Фамилия должна содержать только буквы и пробелы.');
            return;
        }
        if (!isValidName(name)) {
            showError('Имя должно содержать только буквы и пробелы.');
            return;
        }
        if (!isValidPhone(phone)) {
            showError('Номер телефона должен быть в формате: +X XXX XXX XX XX.');
            return;
        }


        // Создание нового контакта
        const newContact = new Contact(name, surname, vacancy, phone);

        // Получение первой буквы фамилии в нижнем регистре
        const firstLetter = surname[0].toLowerCase();

        // Если ключа не существует в объекте, создаем новый массив
        if (!contactsByLetter[firstLetter]) {
            contactsByLetter[firstLetter] = [];
        }

        // Добавление контакта в соответствующий массив
        contactsByLetter[firstLetter].push(newContact);

        // Сохранение обновленного списка LocalStorage
        localStorage.setItem("contacts", JSON.stringify(contactsByLetter));

        console.log("Сохраненные данные в localStorage:", localStorage.getItem('contacts')); // Отладка

        // Очистка полей ввода
        nameInput.value = '';
        surnameInput.value = '';
        vacancyInput.value = '';
        phoneInput.value = '';

        // Отображение контактов в таблице
        displayContacts();
    }

    // Функция для отображения ошибок
    function showError(message) {
        const errorHolder = document.querySelector('.error.js-error');
        errorHolder.textContent = message;
        errorHolder.style.display = 'block'; // Показываем ошибку

        // Скрываем ошибку через несколько секунд
        setTimeout(() => {
            errorHolder.style.display = 'none';
        }, 3000);
    }

// Функция отображения контактов в таблице
    function displayContacts() {
        const contactTableElement = document.getElementById('contactTable');
        contactTableElement.innerHTML = '';

        // Создание элементов таблицы на основе объекта contactsByLetter
        Object.keys(contactsByLetter).forEach(letter => {
            if (contactsByLetter[letter].length > 0) { // Проверяем наличие контактов
                // Создание элемента колонки
                const columnElement = document.createElement('div');
                columnElement.classList.add('contact-table__column', 'column');

                // Создание элемента буквы
                const letterElement = document.createElement('div');
                letterElement.classList.add('column__element', 'element');
                letterElement.dataset.id = letter;

                const letterTextElement = document.createElement('div');
                letterTextElement.classList.add('element__letter', 'js-column-letter');
                letterTextElement.textContent = letter.toUpperCase(); // Отображаем букву в верхнем регистре

                letterElement.appendChild(letterTextElement);
                columnElement.appendChild(letterElement);

                // Создание элемента для контактов
                const contactsElement = document.createElement('div');
                contactsElement.classList.add('column__element', 'contacts');
                contactsElement.dataset.id = `contacts-${letter}`;

                // Добавление контактов в элемент
                contactsByLetter[letter].forEach(contact => {
                    const contactItemElement = document.createElement('div');
                    contactItemElement.classList.add('contact-item');

                    contactsByLetter[letter].forEach(contact => {
                        const contactItemElement = document.createElement('div');
                    });

                    contactItemElement.classList.add('contact-item');
                    contactItemElement.innerHTML = `
                     <strong>Фамилия:</strong> ${contact.surname} <br>
                     <strong>Имя:</strong> ${contact.name} <br>
                     <strong>Должность:</strong> ${contact.vacancy} <br>
                     <strong>Телефон:</strong> ${contact.phone}
                     <hr>`;

                    contactsElement.appendChild(contactItemElement);
                });

                columnElement.appendChild(contactsElement);
                contactTableElement.appendChild(columnElement);
            }
        });
    }


    // Функция очистки таблицы
    function clearContacts () {
        contactsByLetter = {}; // Оъект с контактами очистка

        // Очищаем элемент таблицы на странице
        const contactTableElement = document.getElementById('contactTable');
        contactTableElement.innerHTML = '';

        localStorage.removeItem('contacts');
    }

// Обработчик события отправки формы
    const userForm = document.getElementById('user-form');
    userForm.addEventListener('submit', addContact);

// Обработчик события для кнопки "Очистить список"
    const clearButton = document.querySelector('.js-clear-btn');
    clearButton.addEventListener('click', clearContacts);



    //Попап модальные окна
    const modals = () => {
        function closeModal(modal) {
            modal.style.display = 'none';
            modalOverlay.style.display = 'none'
            document.body.style.overflow = '';
            modal.setAttribute('aria-hidden', 'true');
        }

        function bindModal (trigger, modal, close) {
            trigger.addEventListener('click', (e) => {
                if (e.target) {
                    e.preventDefault();
                }

                modal.style.display = 'block';
                modalOverlay.style.display = 'block';
                document.body.style.overflow = 'hidden';
                modal.setAttribute('aria-hidden', 'false');

            });

            close.addEventListener('click', () => {
                closeModal(modal);
            })

            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal(modal);
                }
            });
        }

        const callModalBtn = document.querySelector('.js-search-btn');
        const modalWindow = document.querySelector('.search-popup');
        const closeBtn = document.querySelector('.js-popup-close');
        const modalOverlay = document.querySelector('.modalOverlay');

        if (callModalBtn && modalWindow && closeBtn && modalWindow && modalOverlay) {
            bindModal(callModalBtn, modalWindow, closeBtn);
        } else {
            console.error('Не удалось найти необходимые элементы для модального окна.');
        }
    };

    modals();


// Загрузка контактов из localStorage при загрузке страницы
    loadContacts();
};