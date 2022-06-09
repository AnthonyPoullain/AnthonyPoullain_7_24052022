/* global recipes */

// By default, main search bar only matches recipe names
// Set below values to true to broaden the search
const SEARCH_INCLUDES = {
  description: false,
  ingredients: false,
  ustensils: false,
};

const BLACKLIST = [
  'de',
  'des',
  'à',
  'au',
  'aux',
  'un',
  'une',
  'le',
  'la',
  'avec',
  'son',
  'sa',
  'ce',
  'ces',
];

const DOMHandler = {
  generateCardsHTML: (recipesData) => {
    const cardElements = recipesData.map((recipe) => {
      // DOM Elements
      const cardTemplate = document.querySelector(
        '[data-recipe-card-template]'
      );
      const card = cardTemplate.content.cloneNode(true).children[0];
      const title = card.querySelector('[data-title]');
      const time = card.querySelector('[data-time]');
      const ingredients = card.querySelector('[data-ingredients]');
      const description = card.querySelector('[data-description]');

      title.textContent = recipe.name;
      time.textContent = `${recipe.time} min`;
      ingredients.innerHTML = recipe.ingredients
        .map(
          (item) =>
            `<li><span>${item.ingredient} ${
              Object.keys(item).length > 1 ? ':' : ''
            }</span> ${item.quantity ? item.quantity : ''} ${
              item.unit ? item.unit : ''
            }</li>`
        )
        .join('');
      description.textContent = recipe.description;
      return card;
    });
    return cardElements;
  },

  generateDropdownItems: (items, itemType) => {
    const itemElements = items.map(
      (item) =>
        `<p data-type='${itemType}' data-value='${item}' tabindex="0">${item}</p>`
    );
    return itemElements;
  },

  generateTagElement: (tagType, tagValue) => {
    const tagTemplate = document.querySelector('[data-tag-template]');
    const tagEl = tagTemplate.content.cloneNode(true).children[0];
    const tag = tagEl.querySelector('[data-value]');

    switch (tagType) {
      case 'appliance':
        tagEl.classList.add('btn--green');
        break;
      case 'ustensil':
        tagEl.classList.add('btn--orange');
        break;
      default:
        tagEl.classList.add('btn--blue');
        break;
    }
    tag.dataset.type = tagType;
    tag.dataset.value = tagValue;
    tag.innerText = tagValue;

    const closeBtn = tagEl.querySelector('[data-close]');
    closeBtn.setAttribute('onclick', `removeTag('${tagValue}')`);

    return tagEl;
  },

  displayCards: (cards) => {
    const cardSection = document.querySelector('[data-cards]');
    cardSection.innerHTML = '';
    cards.forEach((card) => {
      cardSection.appendChild(card);
    });
  },

  displayDropdownItems: (items, dropdownEl) => {
    const listItems = dropdownEl.querySelectorAll('p');
    listItems.forEach((item) => item.remove());
    items.forEach((item) => dropdownEl.insertAdjacentHTML('beforeend', item));
  },
};

const SearchHandler = {
  sanitize: (input) => {
    return input.toLowerCase().replace(/\s+/g, ' ').replace('.', '').trim();
  },

  normalizeString: (str) => {
    const capitalizedStr =
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return capitalizedStr.replace(/\([^)]*\)/, '');
  },

  filterResults: (stack, needle) => {
    const sanitizedNeedle = SearchHandler.sanitize(needle);
    const searchWords = sanitizedNeedle
      .split(' ')
      .map((word) => word)
      .filter((searchWord) => !BLACKLIST.includes(searchWord));
    const filteredStack = stack.filter(
      (recipe) =>
        searchWords.some((word) =>
          recipe.name.split(' ').includes(word.toLowerCase())
        ) || recipe.name.toLowerCase().includes(sanitizedNeedle)
    );
    return filteredStack.length > 0 ? filteredStack : stack;
  },

  filterTags: (stack, needle) => {
    const sanitizedNeedle = SearchHandler.sanitize(needle);
    const searchWords = sanitizedNeedle
      .split(' ')
      .map((word) => word)
      .filter((searchWord) => !BLACKLIST.includes(searchWord));
    const filteredStack = stack.filter(
      (tag) =>
        searchWords.some((word) =>
          tag.split(' ').includes(word.toLowerCase())
        ) || tag.toLowerCase().includes(sanitizedNeedle)
    );
    return filteredStack;
  },

  filterByTags: (data, tags) => {
    const filteredData = [...tags].map((tag) => {
      const tagType = tag.dataset.type;
      const tagValue = tag.dataset.value;
      let result = [];

      switch (tagType) {
        case 'ingredient':
          result = data.filter((recipe) =>
            recipe.ingredients
              .map((ingredient) => ingredient.ingredient.toLowerCase())
              .flat(Infinity)
              .includes(tagValue.toLowerCase())
          );
          break;
        case 'appliance':
          result = data.filter((recipe) =>
            recipe.appliance.toLowerCase().includes(tagValue.toLowerCase())
          );
          break;

        case 'ustensil':
          result = data.filter((recipe) =>
            recipe.ustensils
              .map((ustensil) => ustensil.toLowerCase())
              .includes(tagValue.toLowerCase())
          );
          break;
        default:
          console.error('Invalid tag type');
          break;
      }
      return result;
    });
    return [...new Set(filteredData.flat(Infinity))];
  },
};

function getRecipes() {
  return recipes;
}

function getIngredients(data) {
  const ingredientList = [];
  data.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      if (
        !ingredientList.includes(
          SearchHandler.normalizeString(ingredient.ingredient)
        )
      ) {
        ingredientList.push(
          SearchHandler.normalizeString(ingredient.ingredient)
        );
      }
    });
  });
  return ingredientList;
}

function getAppliances(data) {
  const applianceList = [
    ...new Set(
      data.map((item) => SearchHandler.normalizeString(item.appliance))
    ),
  ];
  return applianceList;
}

function getUstensils(data) {
  const ustensilsList = [];
  data.forEach((recipe) => {
    recipe.ustensils.forEach((ustensil) => {
      ustensilsList.push(SearchHandler.normalizeString(ustensil));
    });
  });
  return [...new Set(ustensilsList)];
}

function init() {
  const data = getRecipes();

  // Display cards
  const cardElements = DOMHandler.generateCardsHTML(data);
  DOMHandler.displayCards(cardElements);

  // Generate dropdown list items
  const dropdownLists = document.querySelectorAll('[data-list]');

  const ingredients = getIngredients(data);
  const ingredientsElements = DOMHandler.generateDropdownItems(
    ingredients,
    'ingredient'
  );
  DOMHandler.displayDropdownItems(ingredientsElements, dropdownLists[0]);

  const appliances = getAppliances(data);
  const appliancesElements = DOMHandler.generateDropdownItems(
    appliances,
    'appliance'
  );
  DOMHandler.displayDropdownItems(appliancesElements, dropdownLists[1]);

  const ustensils = getUstensils(data);
  const ustensilsElements = DOMHandler.generateDropdownItems(
    ustensils,
    'ustensil'
  );
  DOMHandler.displayDropdownItems(ustensilsElements, dropdownLists[2]);

  // Listen for search
  const searchInput = document.querySelector('[data-search]');
  searchInput.addEventListener('input', (e) => {
    const { value } = e.target;
    const filteredData = SearchHandler.filterResults(data, value);
    const filteredCardElements = DOMHandler.generateCardsHTML(filteredData);
    DOMHandler.displayCards(filteredCardElements);
  });

  const tagSearchInputs = document.querySelectorAll('[data-search-tags]');
  [...tagSearchInputs].forEach((input) => {
    input.addEventListener('input', (e) => {
      const { value } = e.target;
      const inputCategory = e.target.dataset.searchTags;
      let tags;
      switch (inputCategory) {
        case 'ingredient':
          tags = getIngredients(data);
          break;
        case 'appliance':
          tags = getAppliances(data);
          break;
        case 'ustensil':
          tags = getUstensils(data);
          break;
        default:
          console.error('Dropdown error: invalid category');
      }
      const filteredTags = SearchHandler.filterTags(tags, value);
      const filteredTagElements = DOMHandler.generateDropdownItems(
        filteredTags,
        inputCategory
      );
      DOMHandler.displayDropdownItems(filteredTagElements, input.parentNode);
    });
  });
}

init();
