class Recipe {
    constructor(recipeData) {
        this.id = recipeData.id;
        this.name = recipeData.name;
        this.servings = recipeData.servings;
        this.time = recipeData.time;
        this.description = recipeData.description;
        this.ingredients = recipeData.ingredients;
        this.ingredientList = this.getIngredientList();
        this.appliance = recipeData.appliance;
        this.ustensils = recipeData.ustensils.map((ustensil) =>
            Recipe.normalizeString(ustensil)
        );
        this.HTML = this.createCard();
    }

    getIngredientList() {
        return [
            ...this.ingredients.map((ingredient) =>
                Recipe.normalizeString(ingredient.ingredient)
            ),
        ];
    }

    static normalizeString(str) {
        const capitalizedStr =
            str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        return capitalizedStr.replace(/\([^)]*\)/, '').trim();
    }

    createCard() {
        const cardTemplate = document.querySelector(
            '[data-recipe-card-template]'
        );
        const card = cardTemplate.content.cloneNode(true).children[0];
        const title = card.querySelector('[data-title]');
        const time = card.querySelector('[data-time]');
        const ingredients = card.querySelector('[data-ingredients]');
        const description = card.querySelector('[data-description]');

        title.textContent = this.name;
        time.textContent = `${this.time} min`;
        ingredients.innerHTML = this.ingredients
            .map(
                (item) =>
                    `<li><span>${item.ingredient} ${
                        Object.keys(item).length > 1 ? ':' : ''
                    }</span> ${item.quantity ? item.quantity : ''} ${
                        item.unit ? item.unit : ''
                    }</li>`
            )
            .join('');
        description.textContent = this.description;
        return card;
    }
}
