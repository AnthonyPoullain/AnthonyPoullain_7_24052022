/* global Recipe */
/* global Tag */
/* global recipes */
/* global DOMHandler */
/* global SearchHandler */
/* global toggleStrikeThrough */

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
    const ustensilList = data.map((item) => item.ustensils).flat();
    return { list: [...new Set(ustensilList)], type: 'ustensil' };
}

function init() {
    const data = getRecipes().map((item) => new Recipe(item));
    DOMHandler.refreshDropdownItems(data);
    DOMHandler.displayRecipeCards(data);

    // Listen for search
    const searchBar = document.querySelector('[data-search]');
    searchBar.addEventListener('input', () => {
        DOMHandler.refreshResults();
    });

    // Listen for search in tag dropdowns
    const tagSearchBars = document.querySelectorAll('[data-search-tags]');
    tagSearchBars.forEach((input) => {
        input.addEventListener('input', (e) => {
            const { value } = e.target;
            const inputCategory = e.target.dataset.searchTags;
            let tags;
            const displayedData = SearchHandler.filterResults();
            switch (inputCategory) {
                case 'ingredient':
                    tags = getIngredients(displayedData).list;
                    break;
                case 'appliance':
                    tags = getAppliances(displayedData).list;
                    break;
                case 'ustensil':
                    tags = getUstensils(displayedData).list;
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
            DOMHandler.refreshResults();
        }
    });
}

init();
