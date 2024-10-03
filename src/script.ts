window.onload = function (): void {

  // Структура данных для контакта
      class Contact {
        name: string;
        surname: string;
        vacancy: string;
        phone: string;
        Id: string;

        constructor(name: string, surname: string, vacancy: string, phone: string) {
          this.name = name;
          this.surname = surname;
          this.vacancy = vacancy;
          this.phone = phone;
          this.Id = `${surname[0].toLowerCase()}-${new Date().getTime()}`
        }
      }

      // Объект для хранения контактов по первой букве фамилии
      let contactsByLetter: {[key: string]: Contact[] } = {};

// Шаблоны для валидации номеров телефонов
      interface PhonePattern {
        pattern: RegExp;
        example: string;
      }

      interface PhonePatterns {
        [key: string]: PhonePattern;
      }

      const phonePatterns: PhonePatterns  = {
        'RU': {
          pattern: /^\+7\s*\(?(\d{3})\)?\s*(\d{3})(?:-?\s*(\d{2}))?(?:-?\s*(\d{2}))?$/,
          example: '+7 (999) 111-22-33'
        },
        'US': {
          pattern: /^\+1\s*\(?(\d{3})\)?\s*(\d{3})-?(\d{4})$/,
          example: '+1 (999) 111-2222'
        },
        'GB': {
          pattern: /^\+44\s*\(?(\d{4}|\d{3})\)?\s*(\d{3,4})-?(\d{3,4})$/,
          example: '+44 20 1234 5678'
        }
      };

// Функция для очистки и форматирования номера телефона
      function formatPhoneNumber(phone: string): string {
        const cleaned = phone.replace(/\D/g, ''); // Удаляем все нецифровые символы

        let formatted: any;

        // Обработка номера для России
        if (cleaned.length === 11 && cleaned.startsWith('7')) {
          formatted = `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
        } else if (cleaned.length === 10) {
          formatted = `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)}-${cleaned.slice(8)}`;
        } else if (cleaned.length === 12 && cleaned.startsWith('8')) {
          formatted = `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
        } else if (cleaned.length === 12 && cleaned.startsWith('79')) {
          formatted = `+7 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)}-${cleaned.slice(10)}`;
        } else if (cleaned.length === 11 && cleaned.startsWith('1')) { // Для номеров США
          formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10 && cleaned.startsWith('1')) { // Для номеров США без кода страны
          formatted = `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 12 && cleaned.startsWith('44')) { // Для номеров Великобритании
          formatted = `+44 ${cleaned.slice(2, cleaned.length - 10)} ${cleaned.slice(-10).replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3')}`;
        } else {
          return phone; // Если номер не соответствует ожидаемым форматам, возвращаем исходный номер
        }

        console.log(`Отформатированный номер: ${formatted}`); // Отладка
        return formatted || phone;
      }

      // Функция для нахождения контакта по ID
      function findContactById(contactId: any): Contact | null {
        for (const letter in contactsByLetter) {
          const contact = contactsByLetter[letter].find((c: Contact ): boolean => c.Id === contactId);
          if (contact) return contact;
        }
        return null; // Возвращаем null, если контакт не найден
      }

      //Функция для загрузки контактов из localStorage

      function loadContacts(): void {
        console.log("Функция loadContacts вызвана"); // Отладка
        const storedContacts = localStorage.getItem("contacts");
        console.log("Загружаемые данные из localStorage:", storedContacts); // Отладка

        if (storedContacts) {
          contactsByLetter = JSON.parse(storedContacts);
          displayContacts(); // Отображаем загруженные контакты
        }
      }

      // Функция проверки имени и фамилии
      function isValidName(name: string): boolean {
        const namePattern = /^[a-zA-Zа-яА-ЯЁё\s'-]+$/;
        return name.length >= 2 && namePattern.test(name.trim());
      }

// Функция проверки номера телефона
      function isValidPhone(phone: any, countryCode: keyof typeof phonePatterns): boolean {
        const {pattern} = phonePatterns[countryCode] || {};

        if (!pattern) {
          return false;
        }

        console.log(`Проверка номера: ${phone} на соответствие шаблону для страны ${countryCode}`);

        // Проверяем отформатированный номер на соответствие шаблону
        return pattern.test(phone);
      }

      // Функция добавления контакта
      function addContact(e: Event): void {
        e.preventDefault();

        // Получение значений из полей ввода
        const nameInput = document.getElementById("name") as HTMLInputElement;
        const surnameInput = document.getElementById("surname") as HTMLInputElement;
        const vacancyInput = document.getElementById("vacancy") as HTMLInputElement;
        const phoneInput = document.getElementById("phone") as HTMLInputElement;

        // Получаем код страны из выпадающего списка
        const countryCodeSelect = document.getElementById("country-code") as HTMLInputElement;

        const name: any = nameInput.value.trim();
        const surname: any = surnameInput.value.trim();
        const vacancy: any = vacancyInput.value.trim();
        const phone: any = phoneInput.value.trim();
        const countryCode: any = countryCodeSelect.value;

        // Форматируем номер телефона перед проверкой валидности
        let formattedPhone: any;
        try {
          formattedPhone = formatPhoneNumber(phone);
        } catch (error) {
          showError((error as Error).message);
          return;
        }

        // Валидация данных
        if (!isValidName(surname)) {
          showError("Фамилия должна содержать только буквы и быть не менее двух символов.");
          return;
        }

        if (!isValidName(name)) {
          showError("Имя должно содержать только буквы и быть не менее двух символов.");
          return;
        }

        // Проверяем валидность отформатированного номера
        if (!isValidPhone(formattedPhone, countryCode)) {
          showError(`Номер телефона должен соответствовать формату: ${phonePatterns[countryCode].example}`);
          return;
        }

        // Создание нового контакта
        const newContact = new Contact(name, surname, vacancy, formattedPhone);

        // Получение первой буквы фамилии в нижнем регистре
        const firstLetter: any = surname[0].toLowerCase();

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
      function showError(message: string): void {
        const errorHolderL: HTMLElement | null = document.querySelector(".error.js-error");
        if (errorHolderL) {
          errorHolderL.textContent = message;
          errorHolderL.style.display = "block";
      setTimeout(() => {
        errorHolderL.style.display = "none";
      }, 5000);
    } else {
      console.error("Элемент для отображения ошибки не найден.")
    }
  }

// Функция отображения контактов в таблице
  function displayContacts(): void {
    const contactTableElement = document.getElementById("contactTable") as HTMLElement | null;
    if (!contactTableElement) {
      console.error("Таблица контактов не найдена.");
      return;
    }

    contactTableElement.innerHTML = "";

    Object.keys(contactsByLetter).forEach((letter) => {
      if (contactsByLetter[letter].length > 0) {
        const columnElement = document.createElement("div");
        columnElement.classList.add("contact-table__column", "column");

        const letterElement = document.createElement("div");
        letterElement.classList.add("column__element", "element");
        letterElement.dataset.id = letter;

        const letterTextElement = document.createElement("div");
        letterTextElement.classList.add("element__letter", "js-column-letter");
        letterTextElement.textContent = `${letter.toUpperCase()} (${contactsByLetter[letter].length})`;

        // Обработчик клика для переключения видимости контактов
        letterTextElement.addEventListener("click", () => {
          const contactsElement = columnElement.querySelector('.contacts') as HTMLElement | null;
          if (contactsElement) {
            contactsElement.classList.toggle('visible'); // Переключаем класс visible
          }
        });

        letterElement.appendChild(letterTextElement);
        columnElement.appendChild(letterElement);

        const contactsElement = document.createElement("div");
        contactsElement.classList.add("column__element", "contacts"); // Убираем класс hidden
        contactsElement.dataset.id = `contacts-${letter}`;

        contactsByLetter[letter].forEach((contact: Contact) => {
          const contactItemElement = document.createElement("div");
          contactItemElement.classList.add("contact-item");

          contactItemElement.innerHTML = `
                    <strong>Фамилия:</strong> ${contact.surname} <br>
                    <strong>Имя:</strong> ${contact.name} <br>
                    <strong>Должность:</strong> ${contact.vacancy} <br>
                    <strong>Телефон:</strong> ${contact.phone}
                `;

          contactsElement.appendChild(contactItemElement);
        });

        columnElement.appendChild(contactsElement);
        contactTableElement.appendChild(columnElement);
      }
    });
  }

  // Функция очистки таблицы
  function clearContacts() {
    const confirmation: boolean = confirm("Вы уверены, что хотите удалить все контакты?");
    if (confirmation) {
      contactsByLetter = {};
      localStorage.removeItem("contacts");
      displayContacts();
      const output = document.querySelector(".js-popup-output") as HTMLElement | null;
      if (output) {
        output.innerHTML = ""; // Очищаем текущий вывод в модальном окне
        output.style.display = 'none'; // Скрываем контейнер вывода,
      } else {
        console.error("Элемент для вывода не найден."); // Обработка случая, когда элемент не найден
      }
    }
  }

  // Обработчик события отправки формы
  const userForm = document.getElementById("user-form") as HTMLElement | null;
  if (userForm) {
    userForm.addEventListener("submit", addContact);
  } else {
    console.error("Форма не найдена.");
  }


  // Обработчик события для кнопки "Очистить список"
  const clearButton = document.querySelector(".js-clear-btn") as HTMLElement | null;
  if (clearButton) {
    clearButton.addEventListener("click", clearContacts);
  } else {
    console.error("Кнопка не найдена.");
  }


  // Модальные окна
  const modals = () => {
    const modalOverlay = document.querySelector(".modalOverlay") as HTMLElement | null;

    function closeModal(modal: HTMLElement): void {
      modal.style.display = "none";
      if (modalOverlay) {
        modalOverlay.style.display = "none";
      }
      document.body.style.overflow = "";
      modal.setAttribute("aria-hidden", "true");
    }

    function bindModal(trigger: HTMLElement, modal: HTMLElement, close: HTMLElement): void {

      trigger.addEventListener("click", (e: MouseEvent) => {

        e.preventDefault();
        modal.style.display = "block";
        if (modalOverlay) {
          modalOverlay.style.display = "block";
        }
        document.body.style.overflow = "hidden";
        modal.setAttribute("aria-hidden", "false");
      });

      close.addEventListener("click", () => {
        closeModal(modal);
      });

      const overlay = modal.previousElementSibling as HTMLElement;
      if (overlay) {

        overlay.addEventListener("click", (e: MouseEvent) => {
          if (e.target === overlay) {
            closeModal(modal);
          }
        });
      }
    }

    const callModalBtn = document.querySelector(".js-search-btn") as HTMLElement | null;
    const modalWindow = document.querySelector(".search-popup") as HTMLElement | null;
    const closeBtn = document.querySelector(".js-popup-close") as HTMLElement | null;

    if (callModalBtn && modalWindow && closeBtn && modalOverlay) {
      bindModal(callModalBtn, modalWindow, closeBtn);
    } else {
      console.error("Не удалось найти необходимые элементы для модального окна.");
    }

    // Добавляем обработчик для поля ввода поиска
    const searchInput = document.querySelector('.js-search-input') as HTMLInputElement | null;

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        filterContacts(searchTerm);
      });
    }

    // Добавляем обработчик для кнопки "Показать все"
    const showAllBtn = document.querySelector('.js-show-all-btn') as HTMLElement | null;

    if (showAllBtn) {
      showAllBtn.addEventListener('click', function () {
        showAllContacts(document.querySelector('.js-popup-output') as HTMLElement);
      });
    }


    // Функция для удаления контакта
    function deleteContact(contactId: any): void {
      let found: boolean = false; // Флаг для проверки, был ли найден контакт

      for (let letter in contactsByLetter) {
        const initialLength: number = contactsByLetter[letter].length; // Сохраняем длину массива перед удалением
        contactsByLetter[letter] = contactsByLetter[letter].filter((contact: Contact) => {
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

        const output = document.querySelector('.js-popup-output') as HTMLElement | null;
        if (output) {
          showAllContacts(output);
        } else {
          console.error('Контакт не найден для удаления:', contactId);
        }
      }
    }

// Функция для отображения всех контактов в модальном окне
    function showAllContacts(output: HTMLElement): void {
      output.innerHTML = ''; // Очищаем текущее содержимое

      let hasContacts: boolean = false; // Флаг для проверки наличия контактов

      Object.keys(contactsByLetter).forEach(letter => {
        contactsByLetter[letter].forEach((contact: Contact) => {
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
    function addDeleteButtonHandlers(output: HTMLElement): void {
      const deleteButtons = output.querySelectorAll('.delete-btn') as NodeListOf<HTMLElement>;

      deleteButtons.forEach(button => {
        button.addEventListener('click', (event: MouseEvent) => {
          const target = event.currentTarget as HTMLElement;
          const contactId: string = target.dataset.id || '';
          console.log("Кнопка удаления нажата для ID:", contactId);
          deleteContact(contactId); // Вызов функции удаления контакта
        });
      });
    }


    // Функция для заполнения полей редактирования
    function populateEditFields(contact: Contact): void {
      (document.querySelector('.js-edit-name-input') as HTMLInputElement).value = contact.name;
      (document.querySelector('.js-edit-surname-input') as HTMLInputElement).value = contact.surname;
      (document.querySelector('.js-edit-vacancy-input') as HTMLInputElement).value = contact.vacancy;
      (document.querySelector('.js-edit-phone-input') as HTMLInputElement).value = contact.phone;
    }

// Функция для добавления обработчиков событий на кнопки редактирования
    function addEditButtonHandlers(output: HTMLElement): void {
      const editButtons = output.querySelectorAll('.edit-btn') as NodeListOf<HTMLElement>;
      editButtons.forEach(button => {
        button.addEventListener('click', (event: MouseEvent) => {
          const target = event.currentTarget as HTMLElement;
          const contactId = target.dataset.id || '';

          // Находим контакт по уникальному идентификатору
          const contactToEdit: Contact | null = findContactById(contactId);

          if (contactToEdit) {
            // Заполняем поля редактирования
            populateEditFields(contactToEdit);

            // Открываем модальное окно редактирования
            openEditPopup(contactToEdit.Id);
          } else {
            console.error('Контакт не найден для редактирования:', contactId);
          }
        });
      });
    }

    // Функция открытия модального окна редактирования
    function openEditPopup(id: string): void {
      const editPopup = document.getElementById("editPopup") as HTMLElement | null;
      const overlay = document.getElementById("editPopupOverlay") as HTMLElement | null;

      if (editPopup && overlay) {
        // Сохраняем информацию о том, какой контакт редактируется
        editPopup.dataset.id = id;

        // Заполняем поля ввода данными контакта
        const contactToEdit = findContactById(id);
        if (contactToEdit) {
          (document.querySelector('.js-edit-name-input') as HTMLInputElement).value = contactToEdit.name;
          (document.querySelector('.js-edit-surname-input') as HTMLInputElement).value = contactToEdit.surname;
          (document.querySelector('.js-edit-vacancy-input') as HTMLInputElement).value = contactToEdit.vacancy;
          (document.querySelector('.js-edit-phone-input') as HTMLInputElement).value = contactToEdit.phone;

          // Очищаем поле вывода ошибок
          const editErrorHolder = document.querySelector('.js-edit-error') as HTMLElement | null;
          if (editErrorHolder) {
            editErrorHolder.textContent = '';
          }

          editPopup.style.display = "block";
          overlay.style.display = "block";
        } else {
          console.error("Контакт не найден для редактирования:", id);
        }
      }
    }


// Функция для фильтрации контактов
    function filterContacts(searchTerm: any): void {
      const output = document.querySelector('.js-popup-output') as HTMLElement | null;
      if (!output) {
        console.error('Контейнер для вывода контактов не найден.');
        return;
      }

      output.innerHTML = ''; // Очищаем текущее содержимое

      if (searchTerm.trim() === '') {
        output.style.display = 'none'; // Скрываем при пустом запросе
        return; // Если поисковый запрос пуст, ничего не выводим
      }

      let hasContacts: boolean = false; // Флаг для проверки наличия контактов

      Object.keys(contactsByLetter).forEach(letter => {
        contactsByLetter[letter].forEach((contact: Contact) => {
          if (
              contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              contact.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
              contact.vacancy.toLowerCase().includes(searchTerm.toLowerCase())
          ) {

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
      addDeleteButtonHandlers(output);

// Вызов функции модальных окон
      document.addEventListener("DOMContentLoaded", () => {
        modals();
      })

// Функция закрытия модального окна редактирования
      function closeEditPopup(): void {
        const editPopup = document.getElementById("editPopup") as HTMLElement | null;
        const overlay = document.getElementById("editPopupOverlay") as HTMLElement | null;

        if (editPopup && overlay) {
          editPopup.style.display = "none";
          overlay.style.display = "none";
        }
      }

// Обработчик события для закрытия модального окна без изменений
      const closeEditButton = document.querySelector(".js-edit-popup-close") as HTMLElement | null;
      if (closeEditButton) {
        closeEditButton.addEventListener("click", () => {
          closeEditPopup();
        });
      }

// Обработчик события для редактирования контакта
      const submitEditButton = document.querySelector('.js-submit-edit-btn') as HTMLElement | null;
      if (submitEditButton) {
        submitEditButton.addEventListener('click', function () {
          const editPopup = document.getElementById('editPopup') as HTMLElement | null;
          const contactId: any = editPopup?.dataset.id || '';

          // Получаем данные из полей ввода редактирования
          const nameInputValue: any = (document.querySelector('.js-edit-name-input') as HTMLInputElement).value.trim();
          const surnameInputValue: any = (document.querySelector('.js-edit-surname-input') as HTMLInputElement).value.trim();
          const vacancyInputValue: any = (document.querySelector('.js-edit-vacancy-input') as HTMLInputElement).value.trim();
          const phoneInputValue: any = (document.querySelector('.js-edit-phone-input') as HTMLInputElement).value.trim();

          // Валидация данных перед обновлением
          if (!isValidName(surnameInputValue)) {
            showEditError("Фамилия должна содержать только буквы и быть не менее двух символов.");
            return;
          }

          if (!isValidName(nameInputValue)) {
            showEditError("Имя должно содержать только буквы и быть не менее двух символов.");
            return;
          }

          // Форматируем номер телефона перед проверкой валидности
          let formattedPhone: any;
          try {
            formattedPhone = formatPhoneNumber(phoneInputValue);
            console.log(`Отформатированный номер: ${formattedPhone}`);
          } catch (error) {
            showEditError((error as Error).message);
            return;
          }

          // Проверяем валидность отформатированного номера
          if (!isValidPhone(formattedPhone, 'RU')) { // Предполагаем проверку для России
            showEditError(`Номер телефона должен соответствовать формату: ${phonePatterns['RU'].example}`);
            return;
          }

          let contactToEdit = findContactById(contactId);

          if (!contactToEdit) {
            console.error("Контакт не найден для редактирования:", contactId);
            return;
          }

          // Удаляем контакт из старого раздела
          const oldLetter: any = contactToEdit.Id[0]; // Используем первую букву ID для определения старого раздела
          contactsByLetter[oldLetter] = contactsByLetter[oldLetter].filter((contact: Contact) => contact.Id !== contactId);

          // Обновляем данные контакта
          contactToEdit.name = nameInputValue;
          contactToEdit.surname = surnameInputValue;
          contactToEdit.vacancy = vacancyInputValue;
          contactToEdit.phone = formattedPhone; // Используем отформатированный номер телефона

          // Определяем новую букву для фамилии
          const newLetter: any = surnameInputValue[0].toLowerCase();

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

          // Обновляем отображение контактов без перезагрузки страницы
          const output = document.querySelector(".js-popup-output") as HTMLElement | null;

          if (output) {
            output.innerHTML = ""; // Очищаем текущий вывод
            showAllContacts(output); // Отображаем обновленные контакты
          }
        });
      }

// Функция для отображения ошибок в модальном окне редактирования
      function showEditError(message: any): void {
        const editErrorHolder = document.querySelector('.js-edit-error') as HTMLElement | null;

        if (editErrorHolder) {
          editErrorHolder.textContent = message; // Отображаем сообщение об ошибке в модальном окне

          setTimeout(() => {
            editErrorHolder.textContent = ''; // Очищаем сообщение через 5 секунд
          }, 5000);
        }
      }

    }
  }
  loadContacts();
  modals();
}