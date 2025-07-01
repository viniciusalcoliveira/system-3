function toggleDropdown(id, event) {
  event.stopPropagation();
  const allDropdowns = document.querySelectorAll('.dropdown-content');
  allDropdowns.forEach(dropdown => {
    if (dropdown.id !== id && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  });
  const currentDropdown = document.getElementById(id);
  if (currentDropdown) {
    currentDropdown.classList.toggle('show');
  }
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn') && !event.target.closest('.dropdown-content')) {
    const dropdowns = document.querySelectorAll('.dropdown-content.show');
    dropdowns.forEach(dd => dd.classList.remove('show'));
  }
};
