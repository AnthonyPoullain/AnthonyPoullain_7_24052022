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
        `<p data-type='${itemType}' data-value='${item}' tabindex="0">${item}</li>`
    );
    return itemElements;
  },

  displayCards: (cards) => {
    const cardSection = document.querySelector('[data-cards]');
    cardSection.innerHTML = '';
    cards.forEach((card) => {
      cardSection.appendChild(card);
    });
  },

  displayDropdownItems: (items, dropdownEl) => {
    items.forEach((item) => dropdownEl.insertAdjacentHTML('beforeend', item));
  },
};

const SearchHandler = {
  sanitize: (input) => {
    return input.toLowerCase().replace(/\s+/g, ' ').replace('.', '').trim();
  },

  filterResults: (stack, needle) => {
    const filteredRecipes = stack.filter((recipe) => {
      const sanitizedNeedle = SearchHandler.sanitize(needle);
      if (BLACKLIST.includes(sanitizedNeedle)) return false;

      let criterias = [recipe.name];
      if (SEARCH_INCLUDES.ingredients) criterias.push(recipe.ingredients);
      if (SEARCH_INCLUDES.ustensils) criterias.push(recipe.ustensils);
      if (SEARCH_INCLUDES.description) criterias.push(recipe.description);
      criterias = criterias.toString().trim().toLowerCase();

      return criterias.includes(sanitizedNeedle);
    });
    return filteredRecipes;
  },
};

function normalizeString(str) {
  const capitalizedStr =
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return capitalizedStr.replace(/\([^)]*\)/, '');
}

function getRecipes() {
  return recipes;
}

function getIngredients(data) {
  const ingredientList = [];
  data.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      if (!ingredientList.includes(normalizeString(ingredient.ingredient))) {
        ingredientList.push(normalizeString(ingredient.ingredient));
      }
    });
  });
  return ingredientList;
}

function getAppliances(data) {
  const applianceList = [
    ...new Set(data.map((item) => normalizeString(item.appliance))),
  ];
  return applianceList;
}

function getUstensils(data) {
  const ustensilsList = [];
  data.forEach((recipe) => {
    recipe.ustensils.forEach((ustensil) => {
      ustensilsList.push(normalizeString(ustensil));
    });
  });
  return [...new Set(ustensilsList)];
}

function generateTagElement(tagType, tagValue) {
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
}

function init() {
  let data = getRecipes();

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
    if (value && value.length > 0) {
      value.split(' ').forEach((word) => {
        if (BLACKLIST.includes(word)) return;
        const filteredData = SearchHandler.filterResults(data, word);
        const filteredCardElements = DOMHandler.generateCardsHTML(filteredData);
        DOMHandler.displayCards(filteredCardElements);
        data = filteredData;
      });
    } else {
      DOMHandler.displayCards(cardElements);
    }
  });
}

init();
