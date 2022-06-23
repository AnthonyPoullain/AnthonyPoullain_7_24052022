/* global toggleStrikeThrough */

class Tag {
    constructor(value, type) {
        this.id = (type + value).split(' ').join('');
        this.value = value;
        this.type = type;
        this.color = this.getColor();
        this.HTML = this.createTagElement();
        this.dropdownItem = this.createDropdownItem();
    }

    getColor() {
        let color;
        if (this.type === 'ingredient') color = 'blue';
        if (this.type === 'appliance') color = 'green';
        if (this.type === 'ustensil') color = 'orange';
        return color;
    }

    createTagElement() {
        const tagTemplate = document.querySelector('[data-tag-template]');
        const tagEl = tagTemplate.content.cloneNode(true).children[0];
        const tag = tagEl.querySelector('[data-value]');

        tagEl.classList.add(`btn--${this.color}`);
        tag.dataset.id = this.id;
        tag.dataset.type = this.type;
        tag.dataset.value = this.value;
        tag.innerText = this.value;
        return tagEl;
    }

    createDropdownItem() {
        const itemTemplate = document.querySelector(
            '[data-dropdown-item-template]'
        );
        const item = itemTemplate.content.cloneNode(true).children[0];

        item.dataset.id = this.id;
        item.dataset.type = this.type;
        item.dataset.value = this.value;
        item.innerText = this.value;

        // handleStrikethrough
        const selectedTags = document.querySelectorAll('[data-tags] [data-id]');
        const ids = [...selectedTags].map((tag) => tag.dataset.id);
        if (ids.includes(this.id.toString())) toggleStrikeThrough(item);

        return item;
    }
}
