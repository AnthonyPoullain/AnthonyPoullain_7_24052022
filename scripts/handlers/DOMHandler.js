/* global getIngredients */
/* global getAppliances */
/* global getUstensils */
/* global SearchHandler */
/* global Recipe */
/* global Tag */

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

    refreshDropdownItems: (data) => {
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
    },

    displayTag: (value, type) => {
        const tagSection = document.querySelector('[data-tags]');
        const newTag = new Tag(value, type);
        tagSection.appendChild(newTag.HTML);
    },

    displayNoResults: () => {
        const resultSection = document.querySelector('[data-cards]');
        resultSection.innerHTML = '';
        const noResultsFoundEl = document.createElement('p');
        noResultsFoundEl.classList.add('cards__no-results');
        noResultsFoundEl.innerHTML =
            'Aucune recette ne correspond à votre critère…<br>Vous pouvez chercher « tarte aux pommes », « poisson », etc';
        resultSection.appendChild(noResultsFoundEl);
    },

    refreshResults: () => {
        const results = SearchHandler.filterResults();
        if (results.length < 1) {
            DOMHandler.displayNoResults();
            return;
        }
        DOMHandler.displayRecipeCards(results);
        DOMHandler.refreshDropdownItems(results);
    },
};
