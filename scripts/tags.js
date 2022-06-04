const dropdowns = document.querySelectorAll('.dropdown');
const myInput = document.querySelector('#myInput');

['click', 'keydown'].forEach((evtType) => {
  document.addEventListener(evtType, (e) => {
    if (e.type === 'click' || e.code === 'Escape') {
      dropdowns.forEach((d) =>
        d.querySelector('.dropdown-content').classList.remove('show')
      );
    }
  });
});

function openDropdown(dropdownElement) {
  dropdowns.forEach((d) =>
    d.querySelector('.dropdown-content').classList.remove('show')
  );
  dropdownElement.querySelector('.dropdown-content').classList.add('show');
}

function closeDropdown(dropdownElement) {
  dropdownElement.querySelector('.dropdown-content').classList.remove('show');
}

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

function filterFunction() {
  const input = document.getElementById('myInput');
  const filter = input.value.toUpperCase();
  const div = document.getElementById('myDropdown');
  const li = div.getElementsByTagName('li');
  for (let i = 0; i < li.length; i += 1) {
    const txtValue = li[i].textContent || li[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = '';
    } else {
      li[i].style.display = 'none';
    }
  }
}
