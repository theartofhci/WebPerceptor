document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const chevron = header.querySelector('.chevron');
    content.classList.toggle('active');
    chevron.classList.toggle('rotate');
  });
});