const dropdowns = document.querySelectorAll('[data-dropdown]');

function openDropdown(dropdownElement) {
  dropdowns.forEach((d) => {
    d.querySelector('[data-content]').classList.remove('show');
    d.querySelector('button').classList.remove('hide');
  });
  dropdownElement.querySelector('[data-content]').classList.add('show');
  dropdownElement.querySelector('button').classList.add('hide');
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

dropdowns.forEach((dropdown) => {
  const btn = dropdown.querySelector('button');
  btn.addEventListener('click', () => {
    openDropdown(dropdown);
  });

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const dropdownOptions = dropdown.querySelectorAll('li');
  dropdownOptions.forEach((option) => {
    option.addEventListener('click', () => {
      closeDropdown(dropdown);
      document.querySelector('.search__tags').append(option.innerText);
    });
  });
});
