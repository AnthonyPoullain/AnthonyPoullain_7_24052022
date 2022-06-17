/* global DOMHandler */
/* global SearchHandler */
/* global refreshResults */

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
  // .closest()
  refreshResults();
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

  const dropdownList = dropdown.querySelector('[data-list]');
  dropdownList.addEventListener('click', (e) => {
    const listItem = e.target;
    const isListItem = listItem.nodeName === 'P';
    if (isListItem) {
      const tagSection = document.querySelector('[data-tags]');
      const { value, type } = listItem.dataset;
      const alreadySelected = tagSection.querySelector(
        `[data-value="${value}"]`
      );
      if (alreadySelected) return;
      closeDropdown(dropdown);
      const newTag = DOMHandler.createTagElement(type, value);
      tagSection.appendChild(newTag);
      refreshResults();
    }
  });
});
