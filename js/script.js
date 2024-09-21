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
  // Модальные окна
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

  function isValidName(name) {
    const namePattern = /^[a-zA-Zа-яА-ЯЁё\s\-]+$/;
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
        "Фамилия должна содержать только буквы и пробелы и быть не менее 2 символов."
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
    }, 3000);
  }

  // Функция отображения контактов в таблице
  function displayContacts() {
    const contactTableElement = document.getElementById("contactTable");
    contactTableElement.innerHTML = "";

    // Получаем отсортированные ключи (буквы)
    const sortedLetters = Object.keys(contactsByLetter).sort();

    sortedLetters.forEach((letter) => {
      if (contactsByLetter[letter].length > 0) {
        const columnElement = document.createElement("div");
        columnElement.classList.add("contact-table__column", "column");

        const letterElement = document.createElement("div");
        letterElement.classList.add("column__element", "element");
        letterElement.dataset.id = letter;

        const letterTextElement = document.createElement("div");
        letterTextElement.classList.add("element__letter", "js-column-letter");
        letterTextElement.textContent = letter.toUpperCase();

        // Создание кружка с количеством контактов
        const countCircle = document.createElement("span");
        countCircle.classList.add("contact-count-circle");
        countCircle.textContent = contactsByLetter[letter].length; // Количество контактов

        letterTextElement.appendChild(countCircle); // Добавляем кружок к тексту буквы

        // Добавляем обработчик события для переключения видимости контактов
        letterTextElement.addEventListener("click", function () {
          contactsElement.classList.toggle("hidden"); // Переключаем класс 'hidden'
          contactsElement.classList.toggle("visible");

          if (contactsElement.classList.contains("visible")) {
            contactsElement.style.maxHeight =
              contactsElement.scrollHeight + "px";
          } else {
            contactsElement.style.maxHeight = "0";
          }
        });

        letterElement.appendChild(letterTextElement);
        columnElement.appendChild(letterElement);

        const contactsElement = document.createElement("div");
        contactsElement.classList.add("column__element", "contacts", "hidden");
        contactsElement.dataset.id = `contacts-${letter}`;

        contactsByLetter[letter].forEach((contact) => {
          const contactItemElement = document.createElement("div");
          contactItemElement.classList.add("contact-item");
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
  function clearContacts() {
    const confirmation = confirm(
      "Вы уверены, что хотите удалить все контакты?"
    );
    if (confirmation) {
      contactsByLetter = {}; // Оъект с контактами очистка

      // Очищаем элемент таблицы на странице
      const contactTableElement = document.getElementById("contactTable");
      contactTableElement.innerHTML = "";

      localStorage.removeItem("contacts");
      console.log("Все контакты были удалены."); // Отладка
    } else {
      console.log("Удаление контактов отменено."); // Отладка
    }
  }

  // Обработчик события отправки формы
  const userForm = document.getElementById("user-form");
  userForm.addEventListener("submit", addContact);

  // Обработчик события для кнопки "Очистить список"
  const clearButton = document.querySelector(".js-clear-btn");
  clearButton.addEventListener("click", clearContacts);

  // Маска ввода для номера телефона
  document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("phone");

    phoneInput.addEventListener("phone", function (e) {
      let input = e.target.value.replace(/\D/g, ""); // Удаляем все нецифровые символы

      if (input.length > 11) {
        input = input.slice(0, 11); // Ограничиваем длину до 11 цифр
      }

      let formattedNumber = "+7 ";
      if (input.length > 1) {
        formattedNumber += `(${input.slice(1, 4)}) `;
      }
      if (input.length >= 5) {
        formattedNumber += `${input.slice(4, 7)} `;
      }
      if (input.length >= 8) {
        formattedNumber += `${input.slice(7, 9)}-`;
      }
      if (input.length >= 10) {
        formattedNumber += `${input.slice(9, 11)}`;
      }

      e.target.value = formattedNumber; // Обновляем значение поля
    });
  });

  //Попап модальные окна
  const modals = () => {
    function closeModal(modal) {
      modal.style.display = "none";
      modalOverlay.style.display = "none";
      document.body.style.overflow = "";
      modal.setAttribute("aria-hidden", "true");
    }

    function bindModal(trigger, modal, close) {
      trigger.addEventListener("click", (e) => {
        if (e.target) {
          e.preventDefault();
        }

        modal.style.display = "block";
        modalOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
        modal.setAttribute("aria-hidden", "false");
      });

      close.addEventListener("click", () => {
        closeModal(modal);
      });

      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          closeModal(modal);
        }
      });
    }

    const callModalBtn = document.querySelector(".js-search-btn");
    const modalWindow = document.querySelector(".search-popup");
    const closeBtn = document.querySelector(".js-popup-close");
    const modalOverlay = document.querySelector(".modalOverlay");

    if (
      callModalBtn &&
      modalWindow &&
      closeBtn &&
      modalWindow &&
      modalOverlay
    ) {
      bindModal(callModalBtn, modalWindow, closeBtn);
    } else {
      console.error(
        "Не удалось найти необходимые элементы для модального окна."
      );
    }
  };

  modals();

  // Загрузка контактов из localStorage при загрузке страницы
  loadContacts();
};
