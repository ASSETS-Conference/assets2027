;(function () {
  const script = document.createElement('script')
  script.src = 'https://cloud.umami.is/script.js'
  script.defer = true
  script.setAttribute('data-website-id', 'e2f681f9-0ef5-4e7c-98b9-e3f2316e9125')

  document.head.appendChild(script) // Append the script to the head
})()

fetch('footer.html')
  .then((response) => response.text())
  .then((html) => {
    const fc = document.getElementById('footer-container');
    if (fc && !fc.children.length) {
      fc.innerHTML = html;
    }
  })

fetch('menu.html')
  .then((response) => response.text())
  .then((html) => {
    const menuEl = document.getElementById('nav-container')
    const activePage = menuEl.getAttribute('data-active')
    menuEl.innerHTML = html
    if (activePage) {
      const activeMenuItem = menuEl.querySelector(`[data-page="${activePage}"]`)
      if (activeMenuItem) {
        activeMenuItem.parentElement.classList.add('selected-link')
      }
    }
    const script = document.createElement('script')
    script.src = 'menu.js'
    document.body.appendChild(script)

    const patternScript = document.createElement('script')
    patternScript.src = 'pattern.js'
    document.body.appendChild(patternScript)
  })

/*
// Add small caps to all-caps words
document
  .querySelectorAll('div.text-block p, div.text-block li, .grid-item p')
  .forEach(function (element) {
    element.innerHTML = element.innerHTML.replace(/\b([A-Z]{2,})\b/g, function (match) {
      return `<span class="small-caps">${match}</span>`
    })
  })
*/
