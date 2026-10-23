/**
 * Decorative Background Pattern Generator
 *
 * Renders a single seamless 2-row repeating canvas tile and applies it
 * to #bg-pattern as a background-image with background-repeat: repeat.
 *
 * - Uses img/pattern_1.png at natural size * var(--arch-scale)
 * - Fills in var(--bg-color)
 * - Seamless repeating tile: width = archWidth, height = 2 * rowStep
 * - Element styles: position: absolute; inset: 0; z-index: -1; pointer-events: none;
 * - No height measuring, no ResizeObserver
 * - Redraws on resize ONLY if --arch-scale changes at mobile breakpoint (debounced)
 */
;(function () {
  if (window.__bgPatternInitialized) return
  window.__bgPatternInitialized = true

  function initBgPattern() {
    let container = document.getElementById('bg-pattern')
    if (!container) {
      container = document.createElement('div')
      container.id = 'bg-pattern'
      container.setAttribute('aria-hidden', 'true')
      const pageWrapper = document.getElementById('page-wrapper') || document.body
      pageWrapper.prepend(container)
    }

    container.style.position = 'absolute'
    container.style.inset = '0'
    container.style.zIndex = '-1'
    container.style.pointerEvents = 'none'

    const baseImg = new Image()
    baseImg.src = 'img/pattern_1.png'

    let naturalWidth = 0
    let naturalHeight = 0
    let currentArchScale = null

    function renderTile() {
      if (!container || !naturalWidth || !naturalHeight) return

      const computed = window.getComputedStyle(document.documentElement)

      // Read --arch-scale (default 1, 0.6 under 700px)
      let archScale = parseFloat(computed.getPropertyValue('--arch-scale'))
      if (isNaN(archScale) || archScale <= 0) archScale = 1
      currentArchScale = archScale

      const archWidth = Math.round(naturalWidth * archScale)
      const archHeight = Math.round(naturalHeight * archScale)

      // Row step is half the arch height for overlapping arches
      const rowStep = Math.round(archHeight * 0.5)

      // 2-row seamless repeating tile dimensions
      const tileW = archWidth
      const tileH = rowStep * 2

      // --pattern-opacity (0.10 on pattern lines only, never on fill)
      let patternOpacity = parseFloat(computed.getPropertyValue('--pattern-opacity'))
      if (isNaN(patternOpacity) || patternOpacity <= 0) patternOpacity = 0.1

      // Background color
      const bgColor = computed.getPropertyValue('--bg-color').trim() || '#f6deb8'

      // Optional --pattern-line-color recolors the lines (e.g. light lines in dark mode)
      const lineColor = computed.getPropertyValue('--pattern-line-color').trim()
      let lineImg = baseImg
      if (lineColor) {
        lineImg = document.createElement('canvas')
        lineImg.width = naturalWidth
        lineImg.height = naturalHeight
        const lineCtx = lineImg.getContext('2d')
        lineCtx.drawImage(baseImg, 0, 0)
        lineCtx.globalCompositeOperation = 'source-in'
        lineCtx.fillStyle = lineColor
        lineCtx.fillRect(0, 0, naturalWidth, naturalHeight)
      }

      // Create offscreen canvas for the repeating tile
      const canvas = document.createElement('canvas')
      canvas.width = tileW
      canvas.height = tileH
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Solid background fill matching --bg-color
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, tileW, tileH)

      function drawArch(x, y) {
        ctx.save()
        // Half-ellipse dome path
        ctx.beginPath()
        ctx.ellipse(
          x + archWidth / 2,
          y + archHeight,
          archWidth / 2,
          archHeight,
          0,
          Math.PI,
          0,
          false
        )
        ctx.closePath()

        // 1. Solid fill behind lines (100% opaque, matching --bg-color)
        ctx.fillStyle = bgColor
        ctx.globalAlpha = 1.0
        ctx.fill()

        // 2. Clip strictly to dome shape
        ctx.clip()

        // 3. Draw pattern lines with reduced opacity
        ctx.globalAlpha = patternOpacity
        ctx.drawImage(lineImg, x, y, archWidth, archHeight)

        ctx.restore()
      }

      // Draw 3 rows so that top, middle, and bottom seamlessly tile across boundaries:
      // Row -1: apex at -rowStep, shifted by archWidth * 0.5 (covers bottom part of previous tile)
      // Row 0: apex at 0, unshifted
      // Row 1: apex at rowStep, shifted by archWidth * 0.5
      const shiftX = archWidth * 0.5

      // Row -1 (y = -rowStep)
      for (let col = -2; col <= 2; col++) {
        drawArch(col * archWidth + shiftX, -rowStep)
      }

      // Row 0 (y = 0)
      for (let col = -2; col <= 2; col++) {
        drawArch(col * archWidth, 0)
      }

      // Row 1 (y = rowStep)
      for (let col = -2; col <= 2; col++) {
        drawArch(col * archWidth + shiftX, rowStep)
      }

      try {
        const dataUrl = canvas.toDataURL('image/png')
        container.style.backgroundImage = 'url("' + dataUrl + '")'
        container.style.backgroundRepeat = 'repeat'
        container.style.backgroundSize = tileW + 'px ' + tileH + 'px'
        container.innerHTML = ''
      } catch (err) {
        console.warn('Could not generate background pattern canvas tile data URL:', err)
      }
    }

    function onImageLoaded() {
      naturalWidth = baseImg.naturalWidth
      naturalHeight = baseImg.naturalHeight
      renderTile()
    }

    if (baseImg.complete && baseImg.naturalWidth > 0) {
      onImageLoaded()
    } else {
      baseImg.onload = onImageLoaded
      baseImg.onerror = function () {
        baseImg.src = 'imgs/pattern_1.png'
        baseImg.onload = onImageLoaded
        baseImg.onerror = function () {
          baseImg.src = 'img/pattern.png'
          baseImg.onload = onImageLoaded
        }
      }
    }

    // Redraw tile on resize ONLY if --arch-scale changes at mobile breakpoint (debounced)
    // No ResizeObserver, no height measuring
    let resizeTimer = null
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        const computed = window.getComputedStyle(document.documentElement)
        let scale = parseFloat(computed.getPropertyValue('--arch-scale'))
        if (isNaN(scale) || scale <= 0) scale = 1
        if (scale !== currentArchScale) {
          renderTile()
        }
      }, 100)
    })

    // Re-render if system color scheme changes (light/dark mode)
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (darkModeMediaQuery && darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', renderTile)
    } else if (darkModeMediaQuery && darkModeMediaQuery.addListener) {
      darkModeMediaQuery.addListener(renderTile)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBgPattern)
  } else {
    initBgPattern()
  }
})()
