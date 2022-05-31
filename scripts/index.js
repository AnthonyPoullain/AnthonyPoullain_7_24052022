/* global recipes */

// By default, main search bar only matches recipe names
// Set below values to true to broaden the search
const SEARCH_INCLUDES = {
  description: true,
  ingredients: false,
  ustensils: false,
};

// Words that don't affect search
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

  displayCards: (cards) => {
    const cardSection = document.querySelector('[data-cards]');
    cardSection.innerHTML = '';
    cards.forEach((card) => {
      cardSection.appendChild(card);
    });
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

function getRecipes() {
  return recipes;
}

function init() {
  // Display cards
  const cardElements = DOMHandler.generateCardsHTML(getRecipes());
  DOMHandler.displayCards(cardElements);

  // Listen for search
  const searchInput = document.querySelector('[data-search]');
  searchInput.addEventListener('input', (e) => {
    const { value } = e.target;

    if (value && value.length > 0) {
      let data = getRecipes();
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
