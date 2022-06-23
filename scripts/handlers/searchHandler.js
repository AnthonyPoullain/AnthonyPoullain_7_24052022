/* gobal Recipe */
/* gobal getRecipes */

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
                    item.name + item.ingredientList + item.description || item;
                return element.toLowerCase().includes(searchWord);
            });
        });
        return results;
    },

    filterByTags: (data, tags) => {
        let result = data;
        [...tags].forEach((tag) => {
            const tagType = tag.dataset.type;
            const tagValue = tag.dataset.value;

            switch (tagType) {
                case 'ingredient':
                    result = result.filter((recipe) =>
                        recipe.ingredientList
                            .map((item) => item.toLowerCase())
                            .includes(tagValue.toLowerCase())
                    );
                    break;
                case 'appliance':
                    result = result.filter((recipe) =>
                        recipe.appliance
                            .toLowerCase()
                            .includes(tagValue.toLowerCase())
                    );
                    break;
                case 'ustensil':
                    result = result.filter((recipe) =>
                        recipe.ustensils
                            .map((ustensil) => ustensil.toLowerCase())
                            .includes(tagValue.toLowerCase())
                    );
                    break;
                default:
                    console.error('Invalid tag type');
                    break;
            }
        });
        return result;
    },

    filterResults: () => {
        // eslint-disable-next-line no-undef
        const data = getRecipes().map((item) => new Recipe(item));
        const tags = document.querySelectorAll('[data-tags] [data-value]');
        const hasTags = tags.length;
        let results = data;

        if (hasTags) {
            results = SearchHandler.filterByTags(results, tags);
        }

        const searchBar = document.querySelector('[data-search]');
        const { value } = searchBar;
        const inputHasValue = value.length > 3;

        if (inputHasValue)
            results = SearchHandler.filterBySearch(results, value);
        return results;
    },
};
