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

  filterBySearch: (stack, needle) => {
    const sanitizedNeedle = SearchHandler.sanitize(needle);
    const searchWords = sanitizedNeedle
      .split(' ')
      .filter((word) => !BLACKLIST.includes(word));
    let results = stack;
    searchWords.forEach((searchWord) => {
      results = results.filter((item) => {
        const element = item.name ? item.name : item;
        return element.toLowerCase().includes(searchWord);
      });
    });
    return results;
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
  return { list: ingredientList, type: 'ingredient' };
}

function getAppliances(data) {
  const applianceList = [
    ...new Set(
      data.map((item) => SearchHandler.normalizeString(item.appliance))
    ),
  ];
  return { list: applianceList, type: 'appliance' };
}

function getUstensils(data) {
  const ustensilsList = [];
  data.forEach((recipe) => {
    recipe.ustensils.forEach((ustensil) => {
      ustensilsList.push(SearchHandler.normalizeString(ustensil));
    });
  });
  return { list: [...new Set(ustensilsList)], type: 'ustensil' };
}

function refreshResults() {
  const data = getRecipes();
  const tagSection = document.querySelector('[data-tags]');
  let results = data;

  if (tagSection.children.length > 0) {
    const ingredients = tagSection.querySelectorAll('[data-type="ingredient"]');
    const appliances = tagSection.querySelectorAll('[data-type="appliance"]');
    const ustensils = tagSection.querySelectorAll('[data-type="ustensil"]');
    const tags = [ingredients, appliances, ustensils];

    tags.forEach((tag) => {
      if (tag.length) {
        results = SearchHandler.filterByTags(results, tag);
      }
    });
  }

  const searchBar = document.querySelector('[data-search]');
  const { value } = searchBar;
  if (value) {
    results = SearchHandler.filterBySearch(results, value);
  }

  // const filteredCardElements = DOMHandler.generateCardsHTML(results);
  // DOMHandler.displayCards(filteredCardElements);

  return results;
}

(function init() {
  const data = getRecipes();

  const ingredients = getIngredients(data);
  const appliances = getAppliances(data);
  const ustensils = getUstensils(data);
  const categories = [ingredients, appliances, ustensils];

  // Generate dropdown list items
  const dropdownLists = document.querySelectorAll('[data-list]');
  categories.forEach((category, i) => {
    const elements = DOMHandler.generateDropdownItems(
      category.list,
      category.type
    );
    DOMHandler.displayDropdownItems(elements, dropdownLists[i]);
  });

  // Display cards
  const cardElements = DOMHandler.generateCardsHTML(data);
  DOMHandler.displayCards(cardElements);

  // Listen for search
  const searchInput = document.querySelector('[data-search]');
  searchInput.addEventListener('input', () => {
    const filteredData = refreshResults();
    const filteredCardElements = DOMHandler.generateCardsHTML(filteredData);
    DOMHandler.displayCards(filteredCardElements);
  });

  // Listen for search in tag dropdowns
  const tagSearchInputs = document.querySelectorAll('[data-search-tags]');
  tagSearchInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      const { value } = e.target;
      const inputCategory = e.target.dataset.searchTags;
      let tags;
      switch (inputCategory) {
        case 'ingredient':
          tags = getIngredients(data).list;
          break;
        case 'appliance':
          tags = getAppliances(data).list;
          break;
        case 'ustensil':
          tags = getUstensils(data).list;
          break;
        default:
          console.error('Dropdown error: invalid category');
      }
      const filteredTags = SearchHandler.filterBySearch(tags, value);
      const filteredTagElements = DOMHandler.generateDropdownItems(
        filteredTags,
        inputCategory
      );
      DOMHandler.displayDropdownItems(filteredTagElements, input.parentNode);
    });
  });
})();
