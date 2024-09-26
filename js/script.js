window.onload = function () {
  // Структура данных для контакта
  class Contact {
    constructor(name, surname, vacancy, phone) {
      this.name = name;
      this.surname = surname;
      this.vacancy = vacancy;
      this.phone = phone;
      this.Id = `${surname[0].toLowerCase()}-${new Date().getTime()}`;
    }
  }

  // Объект для хранения контактов по первой букве фамилии
  let contactsByLetter = {};

  // Функция для нахождения контакта по ID
  function findContactById(contactId) {
    for (const letter in contactsByLetter) {
      const contact = contactsByLetter[letter].find(c => c.Id === contactId);
      if (contact) return contact;
    }
    return null; // Возвращаем null, если контакт не найден
  }

  //Функция для загрузки контактов из localStorage

  function loadContacts() {
    console.log("Функция loadContacts вызвана"); // Отладка
    const storedContacts = localStorage.getItem("contacts");
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
    const namePattern = /^[a-zA-Zа-яА-ЯЁё\s-]+$/;
    return name.length >= 2 && namePattern.test(name);
  }

  // Функция проверки номера телефона
  function isValidPhone(phone) {
    const cleanedPhone = phone.replace(/\D/g, ""); // Удаляем все нецифровые символы
    return cleanedPhone.length === 11 && cleanedPhone.startsWith("7"); // Проверяем на 11 цифр и код страны
  }

  // Функция добавления контакта
  function addContact(e) {
    e.preventDefault();

    // Получение значений из полей ввода
    const nameInput = document.getElementById("name");
    const surnameInput = document.getElementById("surname");
    const vacancyInput = document.getElementById("vacancy");
    const phoneInput = document.getElementById("phone");

    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    const vacancy = vacancyInput.value.trim();
    const phone = phoneInput.value.trim();

    // Валидация данных
    if (!isValidName(surname)) {
      showError(
        "Фамилия должна содержать только буквы и пробелы и быть не менее 2 символов"
      );
      return;
    }
    if (!isValidName(name)) {
      showError(
        "Имя должно содержать только буквы и пробелы и быть не менее 2 символов."
      );
      return;
    }
    if (!isValidPhone(phone)) {
      showError("Номер телефона должен быть в формате: +7 (XXX) XXX-XX-XX.");
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

    console.log(
      "Сохраненные данные в localStorage:",
      localStorage.getItem("contacts")
    ); // Отладка

    // Очистка полей ввода
    nameInput.value = "";
    surnameInput.value = "";
    vacancyInput.value = "";
    phoneInput.value = "";

    // Отображение контактов в таблице
    displayContacts();
  }

  // Функция для отображения ошибок
  function showError(message) {
    const errorHolder = document.querySelector(".error.js-error");
    errorHolder.textContent = message;
    errorHolder.style.display = "block"; // Показываем ошибку

    // Скрываем ошибку через несколько секунд
    setTimeout(() => {
      errorHolder.style.display = "none";
    }, 5000);
  }

  // Функция отображения контактов в таблице
  function displayContacts() {
    const contactTableElement = document.getElementById("contactTable");
    contactTableElement.innerHTML = "";

    // Создание элементов таблицы на основе объекта contactsByLetter
    Object.keys(contactsByLetter).forEach((letter) => {
      if (contactsByLetter[letter].length > 0) {
        // Проверяем наличие контактов
        // Создание элемента колонки
        const columnElement = document.createElement("div");
        columnElement.classList.add("contact-table__column", "column");

        // Создание элемента буквы
        const letterElement = document.createElement("div");
        letterElement.classList.add("column__element", "element");
        letterElement.dataset.id = letter;

        const letterTextElement = document.createElement("div");
        letterTextElement.classList.add("element__letter", "js-column-letter");
        letterTextElement.textContent = `${letter.toUpperCase()} (${
          contactsByLetter[letter].length
        })`; // Отображаем букву в верхнем регистре

        letterTextElement.addEventListener("click", () => {
          contactsElement.classList.toggle("hidden");
        });

        letterElement.appendChild(letterTextElement);
        columnElement.appendChild(letterElement);

        // Создание элемента для контактов
        const contactsElement = document.createElement("div");
        contactsElement.classList.add("column__element", "contacts", "hidden");
        contactsElement.dataset.id = `contacts-${letter}`;
        //Добавление контактов в элемент

        const contacts = contactsByLetter[letter];

        // Добавление контактов в элемент
        contacts.forEach((contact) => {
          // Создаем элемент для контакта
          const contactItemElement = document.createElement("div");
          contactItemElement.classList.add("contact-item");

          // Заполнение элемента информацией о контакте
          contactItemElement.innerHTML = `
        <strong>Фамилия:</strong> ${contact.surname} <br>
        <strong>Имя:</strong> ${contact.name} <br>
        <strong>Должность:</strong> ${contact.vacancy} <br>
        <strong>Телефон:</strong> ${contact.phone}
        <hr>
    `;

          // Добавление элемента в родительский элемент
          contactsElement.appendChild(contactItemElement);
        });

        columnElement.appendChild(contactsElement);
        contactTableElement.appendChild(columnElement);
      }
    });
  }

  // Функция очистки таблицы
  function clearContacts() {
    const confirmation = confirm("Вы уверены, что хотите удалить все контакт?");
    if (confirmation) {
      contactsByLetter = {};

      localStorage.removeItem("contacts");

      displayContacts();
      const output = document.querySelector(".js-popup-output");
      output.innerHTML = ""; // Очищаем текущий вывод в модальном окне
      output.style.display = 'none'; // Скрываем контейнер вывода,

    }
  }

  // Обработчик события отправки формы
  const userForm = document.getElementById("user-form");
  userForm.addEventListener("submit", addContact);

  // Обработчик события для кнопки "Очистить список"
  const clearButton = document.querySelector(".js-clear-btn");
  clearButton.addEventListener("click", clearContacts);


  // Модальные окна
  const modals = () => {
    function closeModal(modal) {
      modal.style.display = "none";
      modalOverlay.style.display = "none";
      document.body.style.overflow = "";
      modal.setAttribute("aria-hidden", "true");
    }

    function bindModal(trigger, modal, close) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "block";
        modalOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
        modal.setAttribute("aria-hidden", "false");
      });

      close.addEventListener("click", () => {
        closeModal(modal);
      });

      const overlay = modal.previousElementSibling; // Получаем оверлей перед модальным окном
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeModal(modal);
        }
      });
    }

    const callModalBtn = document.querySelector(".js-search-btn");
    const modalWindow = document.querySelector(".search-popup");
    const closeBtn = document.querySelector(".js-popup-close");
    const modalOverlay = document.querySelector(".modalOverlay");

    if (callModalBtn && modalWindow && closeBtn && modalOverlay) {
      bindModal(callModalBtn, modalWindow, closeBtn);

      // Добавляем обработчик для поля ввода
      const searchInput = document.querySelector('.js-search-input');
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterContacts(searchTerm);
      });

      // Добавляем обработчик для кнопки "Показать все"
      const showAllBtn = document.querySelector('.js-show-all-btn');
      if (showAllBtn) {
        showAllBtn.addEventListener('click', function () {
          showAllContacts(document.querySelector('.js-popup-output'));
        });
      }
    } else {
      console.error("Не удалось найти необходимые элементы для модального окна.");
    }
  };

  // Функция для удаления контакта
  function deleteContact(contactId) {
    console.log("Удаляем контакт с ID:", contactId); // Отладка: выводим ID контакта
    let found = false; // Флаг для проверки, был ли найден контакт

    for (let letter in contactsByLetter) {
      const initialLength = contactsByLetter[letter].length; // Сохраняем длину массива перед удалением
      contactsByLetter[letter] = contactsByLetter[letter].filter(contact => {
        return contact.Id !== contactId;
      });

      // Если длина массива изменилась, значит контакт был найден и удален
      if (contactsByLetter[letter].length < initialLength) {
        found = true;
      }
    }

    if (found) {
      // Сохраняем обновленный список в localStorage
      localStorage.setItem('contacts', JSON.stringify(contactsByLetter));
      console.log("Контакт успешно удален.");
      displayContacts();

      const output = document.querySelector('.js-popup-output');
      showAllContacts(output);
    } else {
      console.error('Контакт не найден для удаления:', contactId);
    }



  }

// Функция для отображения всех контактов в модальном окне
  function showAllContacts(output) {
    output.innerHTML = ''; // Очищаем текущее содержимое

    let hasContacts = false; // Флаг для проверки наличия контактов

    Object.keys(contactsByLetter).forEach(letter => {
      contactsByLetter[letter].forEach(contact => {
        hasContacts = true;
        const contactItemElement = document.createElement('div');
        contactItemElement.classList.add('contact-item');

        contactItemElement.innerHTML = `
                <strong>Фамилия:</strong> ${contact.surname} <br>
                <strong>Имя:</strong> ${contact.name} <br>
                <strong>Должность:</strong> ${contact.vacancy} <br>
                <strong>Телефон:</strong> ${contact.phone}
                <i class="fas fa-edit edit-btn" data-id="${contact.Id}" title="Редактировать"></i>
                <i class="fas fa-trash delete-btn" data-id="${contact.Id}" title="Удалить"></i>
                <hr>
            `;

        output.appendChild(contactItemElement);
      });
    });



    // Управляем видимостью контейнера
    output.style.display = hasContacts ? 'block' : 'none';

    // Добавляем обработчики событий на кнопки редактирования
    addEditButtonHandlers(output);
    addDeleteButtonHandlers(output);

  }
// Функция для добавления обработчиков событий на кнопки удаления
  function addDeleteButtonHandlers(output) {
    const deleteButtons = output.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const contactId = event.target.dataset.id;
        console.log("Кнопка удаления нажата для ID:", contactId);
        deleteContact(contactId); // Вызов функции удаления контакта
      });
    });
  }


// Функция для добавления обработчиков событий на кнопки редактирования
  function addEditButtonHandlers(output) {
    const editButtons = output.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const contactId = event.target.dataset.id;

        // Находим контакт по уникальному идентификатору
        const contactToEdit = findContactById(contactId);

        // Заполняем поля редактирования
        document.querySelector('.js-edit-name-input').value = contactToEdit.name;
        document.querySelector('.js-edit-surname-input').value = contactToEdit.surname;
        document.querySelector('.js-edit-vacancy-input').value = contactToEdit.vacancy;
        document.querySelector('.js-edit-phone-input').value = contactToEdit.phone;

        // Открываем модальное окно редактирования
        openEditPopup(contactToEdit.Id);
      });
    });
  }

// Функция для фильтрации контактов
  function filterContacts(searchTerm) {
    const output = document.querySelector('.js-popup-output');
    output.innerHTML = ''; // Очищаем текущее содержимое

    if (searchTerm.trim() === '') {
      output.style.display = 'none'; // Скрываем при пустом запросе
      return; // Если поисковый запрос пуст, ничего не выводим
    }

    let hasContacts = false; // Флаг для проверки наличия контактов

    Object.keys(contactsByLetter).forEach(letter => {
      contactsByLetter[letter].forEach(contact => {
        if (contact.name.toLowerCase().includes(searchTerm) ||
            contact.surname.toLowerCase().includes(searchTerm) ||
            contact.vacancy.toLowerCase().includes(searchTerm)) {

          hasContacts = true; // Устанавливаем флаг, если есть хотя бы один контакт


          const contactItemElement = document.createElement('div');
          contactItemElement.classList.add('contact-item');
          contactItemElement.innerHTML = `
                  <strong>Фамилия:</strong> ${contact.surname} <br>
                  <strong>Имя:</strong> ${contact.name} <br>
                  <strong>Должность:</strong> ${contact.vacancy} <br>
                  <strong>Телефон:</strong> ${contact.phone}
                  <i class="fas fa-edit edit-btn" data-id="${contact.Id}" title="Редактировать"></i>
                  <i class="fas fa-trash delete-btn" data-id="${contact.Id}" title="Удалить"></i>
                  <hr>
              `;
          output.appendChild(contactItemElement);
        }
      });
    });

    // Управляем видимостью контейнера
    output.style.display = hasContacts ? 'block' : 'none';

    // Добавляем обработчики событий на кнопки редактирования после фильтрации
    addEditButtonHandlers(output);

    addEditButtonHandlers(output);
    addDeleteButtonHandlers(output);

  }

// Вызов функции модальных окон
  modals();


  // Функция открытия модального окна редактирования
  function openEditPopup(id) {
    const editPopup = document.getElementById("editPopup");
    const overlay = document.getElementById("editPopupOverlay");

    // Сохраняем информацию о том, какой контакт редактируется
    editPopup.dataset.id = id;

    editPopup.style.display = "block";
    overlay.style.display = "block";
  }

  // Функция закрытия модального окна редактирования
  function closeEditPopup() {
    const editPopup = document.getElementById("editPopup");
    const overlay = document.getElementById("editPopupOverlay");

    editPopup.style.display = "none";
    overlay.style.display = "none";
  }

  // Обработчик события для закрытия модального окна без изменений
  const closeEditButton = document.querySelector(".js-edit-popup-close");
  closeEditButton.addEventListener("click", () => {
    closeEditPopup();
  });

  // Обработчик события для редактирования контакта
  const submitEditButton = document.querySelector('.js-submit-edit-btn');
  submitEditButton.addEventListener('click', function () {
    const editPopup = document.getElementById('editPopup');
    const contactId = editPopup.dataset.id;

    // Получаем данные из полей ввода редактирования
    const nameInputValue = document.querySelector('.js-edit-name-input').value;
    const surnameInputValue = document.querySelector('.js-edit-surname-input').value;
    const vacancyInputValue = document.querySelector('.js-edit-vacancy-input').value;
    const phoneInputValue = document.querySelector('.js-edit-phone-input').value;

    let contactToEdit = findContactById(contactId);

    // Удаляем контакт из старого раздела
    const oldLetter = contactToEdit.Id[0]; // Используем первую букву ID для определения старого раздела
    contactsByLetter[oldLetter] = contactsByLetter[oldLetter].filter(contact => contact.Id !== contactId);



    // Обновляем данные контакта
    contactToEdit.name = nameInputValue;
    contactToEdit.surname = surnameInputValue;
    contactToEdit.vacancy = vacancyInputValue;
    contactToEdit.phone = phoneInputValue;
    contactToEdit.Id = `${surnameInputValue[0].toLowerCase()}-${new Date().getTime()}`; // Обновляем ID контакта


    // Определяем новую букву для фамилии
    const newLetter = surnameInputValue[0].toLowerCase();

    // Если новый раздел отличается от старого, добавляем контакт в новый раздел
    if (newLetter !== oldLetter) {
      if (!contactsByLetter[newLetter]) {
        contactsByLetter[newLetter] = []; // Создаем новый раздел, если его нет
      }
      contactsByLetter[newLetter].push(contactToEdit);
    } else {
      // Если буква не изменилась, просто обновляем существующий массив
      contactsByLetter[oldLetter].push(contactToEdit);
    }

    // Сохраняем обновленный список в localStorage
    localStorage.setItem("contacts", JSON.stringify(contactsByLetter));

    // Закрываем окно редактирования и обновляем список в поисковом окне
    closeEditPopup();
    displayContacts()

    // Обновляем отображение контактов без перезагрузки страницы
    const output = document.querySelector(".js-popup-output"); // Получаем элемент вывода
    output.innerHTML = ""; // Очищаем текущий вывод
    showAllContacts(output); // Отображаем обновленные контакты

  });

  // Загрузка контактов из localStorage при загрузке страницы
  loadContacts();
};
