/* eslint-disable no-restricted-syntax */
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

    filterBlacklistedWords: (searchWords) => {
        const filteredWords = [];
        for (const word of searchWords) {
            let isBlacklisted = false;
            for (const blacklistedWord of BLACKLIST) {
                if (word === blacklistedWord) isBlacklisted = true;
            }
            if (!isBlacklisted) filteredWords.push(word);
        }
        return filteredWords;
    },

    filterByWord: (stack, word) => {
        const results = [];
        for (const item of stack) {
            const element =
                item.name + item.ingredientList + item.description || item;
            const matchFound = element
                .toLowerCase()
                .includes(word.toLowerCase());
            if (matchFound) results.push(item);
        }
        return results;
    },

    filterBySearch: (stack, needle) => {
        const sanitizedNeedle = SearchHandler.sanitize(needle);
        let searchWords = sanitizedNeedle.split(' ');
        searchWords = SearchHandler.filterBlacklistedWords(searchWords);
        let results = stack;

        for (const word of searchWords) {
            results = SearchHandler.filterByWord(results, word);
        }
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
        const inputHasValue = value.length > 2;

        if (inputHasValue)
            results = SearchHandler.filterBySearch(results, value);
        return results;
    },
};
