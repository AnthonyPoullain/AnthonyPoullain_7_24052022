/* global DOMHandler */
/* global SearchHandler */
/* global getRecipes() */

const dropdowns = document.querySelectorAll('[data-dropdown]');

function openDropdown(dropdownElement) {
  dropdowns.forEach((d) => {
    d.querySelector('[data-content]').classList.remove('show');
    d.querySelector('button').classList.remove('hide');
  });
  dropdownElement.querySelector('[data-content]').classList.add('show');
  dropdownElement.querySelector('button').classList.add('hide');
  dropdownElement.querySelector('input').focus();
}

function closeDropdown(dropdownElement) {
  dropdownElement.querySelector('[data-content]').classList.remove('show');
  dropdownElement.querySelector('button').classList.remove('hide');
}

function removeTag(tagValue) {
  const tag = document.querySelector(
    `.search__tags [data-value="${tagValue}"]`
  ).parentNode;
  tag.remove();
}

['click', 'keydown'].forEach((evtType) => {
  document.addEventListener(evtType, (e) => {
    if (e.type === 'click' || e.code === 'Escape') {
      dropdowns.forEach((d) => closeDropdown(d));
    }
  });
});

dropdowns.forEach((dropdown) => {
  const btn = dropdown.querySelector('button');
  btn.addEventListener('click', () => {
    openDropdown(dropdown);
  });

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const dropdownOptions = dropdown.querySelectorAll('p');
  dropdownOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const tagSection = document.querySelector('[data-tags]');
      const { value, type } = option.dataset;
      const alreadySelected = tagSection.querySelector(
        `[data-value="${value}"]`
      );
      if (alreadySelected) return;
      closeDropdown(dropdown);
      const newTag = DOMHandler.generateTagElement(type, value);
      tagSection.appendChild(newTag);

      const tags = tagSection.querySelectorAll('[data-type]');
      const filteredTags = SearchHandler.filterByTags(getRecipes(), tags);
      const tagElements = DOMHandler.generateCardsHTML(filteredTags);
      DOMHandler.displayCards(tagElements);
    });
  });
});
