/* global Recipe */
/* global Tag */
/* global recipes */
/* global DOMHandler */
/* global toggleStrikeThrough */

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
    'pour',
];

function getRecipes() {
    return recipes;
}

function getIngredients(data) {
    const ingredientList = data.map((item) => item.ingredientList).flat();
    return { list: [...new Set(ingredientList)], type: 'ingredient' };
}

function getAppliances(data) {
    const applianceList = data.map((item) => item.appliance);
    return { list: [...new Set(applianceList)], type: 'appliance' };
}

function getUstensils(data) {
    const ustensilsList = data.map((item) => item.ustensils).flat();
    return { list: [...new Set(ustensilsList)], type: 'ustensil' };
}

const DOMHandler = {
    displayRecipeCards: (data) => {
        const cardSection = document.querySelector('[data-cards]');
        const cards = data.map((item) => new Recipe(item).HTML);
        cardSection.innerHTML = '';
        cards.forEach((card) => {
            cardSection.appendChild(card);
        });
    },

    displayDropdownItems: (items, dropdownEl) => {
        const listItems = dropdownEl.querySelectorAll('p');
        listItems.forEach((item) => item.remove());
        items.forEach((item) => dropdownEl.appendChild(item));
    },

    displayTag: (value, type) => {
        const tagSection = document.querySelector('[data-tags]');
        const newTag = new Tag(value, type);
        tagSection.appendChild(newTag.HTML);
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
                const element =
                    item.name +
                        item.ingredientList.toString() +
                        item.description || item;
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
                            .map((ingredient) =>
                                ingredient.ingredient.toLowerCase()
                            )
                            .flat(Infinity)
                            .includes(tagValue.toLowerCase())
                    );
                    break;
                case 'appliance':
                    result = data.filter((recipe) =>
                        recipe.appliance
                            .toLowerCase()
                            .includes(tagValue.toLowerCase())
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

function filterResults() {
    const data = getRecipes().map((item) => new Recipe(item));
    const tagSection = document.querySelector('[data-tags]');
    let results = data;
    const hasTags = tagSection.children.length > 0;

    if (hasTags) {
        const ingredients = tagSection.querySelectorAll(
            '[data-type="ingredient"]'
        );
        const appliances = tagSection.querySelectorAll(
            '[data-type="appliance"]'
        );
        const ustensils = tagSection.querySelectorAll('[data-type="ustensil"]');
        const categories = [ingredients, appliances, ustensils];

        categories.forEach((category) => {
            const categoryHasTags = category.length;
            if (categoryHasTags) {
                results = SearchHandler.filterByTags(results, category);
            }
        });
    }
    const searchBar = document.querySelector('[data-search]');
    const { value } = searchBar;
    const inputHasValue = value.length > 3;

    if (inputHasValue) results = SearchHandler.filterBySearch(results, value);
    return results;
}

function refreshResults() {
    const results = filterResults();
    DOMHandler.displayRecipeCards(results);
}

function init() {
    const data = getRecipes().map((item) => new Recipe(item));

    const ingredients = getIngredients(data);
    const appliances = getAppliances(data);
    const ustensils = getUstensils(data);

    const categories = [ingredients, appliances, ustensils];

    // Create dropdown list items
    const dropdownLists = document.querySelectorAll('[data-list]');
    categories.forEach((category, i) => {
        const elements = category.list.map(
            (value) => new Tag(value, category.type).dropdownItem
        );
        DOMHandler.displayDropdownItems(elements, dropdownLists[i]);
    });

    // Display cards
    DOMHandler.displayRecipeCards(data);

    // Listen for search
    const searchBar = document.querySelector('[data-search]');
    searchBar.addEventListener('input', () => {
        refreshResults();
    });

    // Listen for search in tag dropdowns
    const tagSearchBars = document.querySelectorAll('[data-search-tags]');
    tagSearchBars.forEach((input) => {
        input.addEventListener('input', (e) => {
            const { value } = e.target;
            const inputCategory = e.target.dataset.searchTags;
            let tags;
            switch (inputCategory) {
                case 'ingredient':
                    tags = ingredients.list;
                    break;
                case 'appliance':
                    tags = appliances.list;
                    break;
                case 'ustensil':
                    tags = ustensils.list;
                    break;
                default:
                    console.error('Dropdown error: invalid category');
            }
            const filteredTags = SearchHandler.filterBySearch(tags, value);
            const filteredTagElements = filteredTags.map(
                (tagValue) => new Tag(tagValue, inputCategory).dropdownItem
            );
            DOMHandler.displayDropdownItems(
                filteredTagElements,
                input.parentNode
            );
        });
    });

    // Listen for clicks on close tags
    const tags = document.querySelector('[data-tags]');
    tags.addEventListener('click', (e) => {
        const clickRemoveTag = e.target.nodeName === 'I';
        if (clickRemoveTag) {
            const tag = e.target.closest('div');
            const { id } = tag.children[0].dataset;
            const correspondingDropdownItem = document.querySelector(
                `[data-dropdown] [data-id="${id}"]`
            );
            tag.remove();
            toggleStrikeThrough(correspondingDropdownItem);
            refreshResults();
        }
    });
}

init();
