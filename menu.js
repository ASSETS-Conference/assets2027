// https://www.w3.org/WAI/tutorials/menus/flyout/#use-button-as-toggle

var menuItems = document.querySelectorAll('li.has-submenu')
var allTopMenuItems = document.querySelectorAll('.main-menu > li')

// Close other submenus immediately when mouse enters any top-level menu item
Array.prototype.forEach.call(allTopMenuItems, function (topItem) {
  topItem.addEventListener('mouseenter', function () {
    Array.prototype.forEach.call(menuItems, function (subItem) {
      if (subItem !== topItem) {
        subItem.classList.remove('open')
        if (subItem.timer) {
          clearTimeout(subItem.timer)
          subItem.timer = null
        }
      }
    })
  })
})

// Iterate through each submenu item
Array.prototype.forEach.call(menuItems, function (el, i) {
  el.addEventListener('mouseenter', function (event) {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.classList.add('open')
  })

  el.addEventListener('mouseleave', function (event) {
    this.timer = setTimeout(() => {
      this.classList.remove('open')
    }, 120)
  })

  // Add an event listener to the <a> element to toggle submenu visibility when clicked
  el.querySelector('a').addEventListener('click', function (event) {
    const parent = this.parentNode
    if (parent.classList.contains('open')) {
      // If submenu is already open, close it and update the aria-expanded attribute
      parent.classList.remove('open')
      this.setAttribute('aria-expanded', 'false')
    } else {
      // If submenu is closed, open it and update the aria-expanded attribute
      parent.classList.add('open')
      this.setAttribute('aria-expanded', 'true')
    }
  })

  // Insert a button to have a keyboard selectable toggle submenu after the <a> element for accessibility purposes
  let activatingA = el.querySelector('a')
  let btn = `<button class="submenu-toggle" aria-label="${activatingA.text}">
        <span>
          <span class="visually-hidden">show submenu for “${activatingA.text}”</span>
        </span>
      </button>`
  activatingA.insertAdjacentHTML('afterend', btn)

  // Add an event listener to the newly added button to toggle submenu
  el.querySelector('button').addEventListener('click', function (event) {
    if (this.parentNode.className == 'has-submenu') {
      // Open the submenu and update aria-expanded attributes
      this.parentNode.className = 'has-submenu open'
      this.parentNode.querySelector('a').setAttribute('aria-expanded', 'true')
      this.parentNode.querySelector('button').setAttribute('aria-expanded', 'true')
    } else {
      // Close the submenu and update aria-expanded attributes
      this.parentNode.className = 'has-submenu'
      this.parentNode.querySelector('a').setAttribute('aria-expanded', 'false')
      this.parentNode.querySelector('button').setAttribute('aria-expanded', 'false')
    }
    event.preventDefault() // Prevent default button action
  })
})

var menuToggle = document.getElementById('menu-toggle')
if (menuToggle) {
  menuToggle.addEventListener('click', function () {
    const menuContainer = document.getElementById('menu-container')
    const isOpen = menuContainer.classList.toggle('open')
    this.classList.toggle('active', isOpen)
    this.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    document.body.classList.toggle('menu-open', isOpen)
    document.body.style.overflow = isOpen ? 'hidden' : ''
  })

  menuToggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      this.click()
    }
  })
}

// Closes open submenus on escape key press
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const toggleBtn = document.getElementById('menu-toggle')
    const menuCont = document.getElementById('menu-container')
    if (menuCont && menuCont.classList.contains('open')) {
      menuCont.classList.remove('open')
      if (toggleBtn) {
        toggleBtn.classList.remove('active')
        toggleBtn.setAttribute('aria-expanded', 'false')
        toggleBtn.focus()
      }
      document.body.classList.remove('menu-open')
      document.body.style.overflow = ''
    }
    document.querySelectorAll('.has-submenu.open').forEach(function (menu) {
      menu.classList.remove('open')
      const link = menu.querySelector('a')
      const toggle = menu.querySelector('.submenu-toggle')
      if (link) link.setAttribute('aria-expanded', 'false')
      if (toggle) toggle.setAttribute('aria-expanded', 'false')
    })
  }
})

// Automatically sync navigation state with 1200px breakpoint:
// Close open mobile menu when expanding to desktop viewport (> 1200px)
const desktopNavQuery = window.matchMedia('(min-width: 1201px)')
function handleNavBreakpointChange(e) {
  if (e.matches) {
    const toggleBtn = document.getElementById('menu-toggle')
    const menuCont = document.getElementById('menu-container')
    if (menuCont && menuCont.classList.contains('open')) {
      menuCont.classList.remove('open')
      if (toggleBtn) {
        toggleBtn.classList.remove('active')
        toggleBtn.setAttribute('aria-expanded', 'false')
      }
      document.body.classList.remove('menu-open')
      document.body.style.overflow = ''
    }
  }
}
if (desktopNavQuery.addEventListener) {
  desktopNavQuery.addEventListener('change', handleNavBreakpointChange)
} else if (desktopNavQuery.addListener) {
  desktopNavQuery.addListener(handleNavBreakpointChange)
}

