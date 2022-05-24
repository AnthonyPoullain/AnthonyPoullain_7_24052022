/* global recipes */

// By default, main search bar only matches recipe names
// Set below values to true to broaden the search
const SEARCH_INCLUDES = {
  description: false,
  ingredients: false,
  ustensils: false,
};

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

      // Display recipe
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
  filterResults: (input) => {
    const filteredRecipes = recipes.filter((recipe) => {
      const criterias = [recipe.name];
      if (SEARCH_INCLUDES.ingredients) criterias.push(recipe.ingredients);
      if (SEARCH_INCLUDES.ustensils) criterias.push(recipe.ustensils);
      if (SEARCH_INCLUDES.description) criterias.push(recipe.description);
      return criterias.toString().toLowerCase().includes(input.toLowerCase());
    });
    return filteredRecipes;
  },
};

function init() {
  // Display cards
  const cardElements = DOMHandler.generateCardsHTML(recipes);
  DOMHandler.displayCards(cardElements);

  // Listen for search
  const searchInput = document.querySelector('[data-search]');
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    DOMHandler.displayCards(
      DOMHandler.generateCardsHTML(SearchHandler.filterResults(value))
    );
  });
}

init();
