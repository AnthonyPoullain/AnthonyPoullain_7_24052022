/* global Tag */
/* global refreshResults */
/* global DOMHandler */

const dropdowns = document.querySelectorAll('[data-dropdown]');

function closeAllDropdowns() {
    dropdowns.forEach((d) => {
        // const input = d.querySelector('input');
        // input.value = '';
        d.querySelector('[data-content]').classList.remove('show');
        d.querySelector('button').classList.remove('hide');
    });
}

function openDropdown(dropdownElement) {
    closeAllDropdowns();
    dropdownElement.querySelector('[data-content]').classList.add('show');
    dropdownElement.querySelector('button').classList.add('hide');
    dropdownElement.querySelector('input').focus();
}

function closeDropdown(dropdownElement) {
    dropdownElement.querySelector('[data-content]').classList.remove('show');
    dropdownElement.querySelector('button').classList.remove('hide');
}

['click', 'keydown'].forEach((evtType) => {
    document.addEventListener(evtType, (e) => {
        if (e.type === 'click' || e.code === 'Escape') {
            dropdowns.forEach((d) => closeDropdown(d));
        }
    });
});

function toggleStrikeThrough(element) {
    return element.hasAttribute('style')
        ? element.removeAttribute('style')
        : element.setAttribute('style', 'text-decoration: line-through;');
}

dropdowns.forEach((dropdown) => {
    const btn = dropdown.querySelector('button');
    btn.addEventListener('click', () => {
        openDropdown(dropdown);
    });

    dropdown.addEventListener('click', (e) => {
        if (e.target.nodeName !== 'I') e.stopPropagation();
    });

    const dropdownList = dropdown.querySelector('[data-list]');
    dropdownList.addEventListener('click', (e) => {
        const listItem = e.target;
        const isListItem = listItem.nodeName === 'P';
        if (isListItem) {
            const { value, type } = listItem.dataset;
            const alreadySelected = document.querySelector(
                `[data-tags] [data-value="${value}"]`
            );
            if (alreadySelected) return;
            closeDropdown(dropdown);
            DOMHandler.displayTag(value, type);
            toggleStrikeThrough(listItem);
            refreshResults();
        }
    });
});
