export default class FloatPlayer {
  constructor({
    videoId = null,
    src = null,
    trigger = null,
    padding = 16,
    snap = true,
    theme = {},
  } = {}) {
    this.videoId = videoId
    this.src = src
    this.padding = padding
    this.snapEnabled = snap
    this.theme = theme
    this._open = false
    this._minimized = false
    this._dragging = false
    this._dragOffset = { x: 0, y: 0 }
    this._el = null
    this._iframe = null
    this._build()
    this._bindTrigger(trigger)
  }

  _resolvedSrc() {
    if (this.src) return this.src
    if (this.videoId) return `https://www.youtube.com/embed/${this.videoId}?autoplay=1`
    return null
  }

  _build() {
    const el = document.createElement('div')
    el.className = 'yt-float'

    const defaults = {
      '--fp-bg': '#1a1a1a',
      '--fp-color': '#ccc',
      '--fp-radius': '8px',
      '--fp-width': 'min(340px, calc(100vw - 32px))',
      '--fp-shadow': '0 4px 24px rgba(0,0,0,.5)',
    }
    Object.entries({ ...defaults, ...this.theme }).forEach(([k, v]) => el.style.setProperty(k, v))

    el.innerHTML = `
      <div class="yt-float-handle" style="padding:8px 12px;background:var(--fp-bg);cursor:grab;display:flex;align-items:center;gap:8px;">
        <span style="font-size:13px;color:var(--fp-color);font-family:sans-serif;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">▶ Video</span>
        <button class="yt-float-minimize" aria-label="Minimize" style="background:none;border:none;color:var(--fp-color);font-size:13px;cursor:pointer;min-width:32px;min-height:32px;display:inline-flex;align-items:center;justify-content:center;opacity:.7;">▼</button>
        <button class="yt-float-close" aria-label="Close" style="background:none;border:none;color:var(--fp-color);font-size:16px;cursor:pointer;min-width:32px;min-height:32px;display:inline-flex;align-items:center;justify-content:center;opacity:.7;">✕</button>
      </div>
      <iframe class="yt-float-iframe" allowfullscreen allow="autoplay; encrypted-media"
        style="width:100%;aspect-ratio:16/9;display:block;border:none;"></iframe>
    `

    Object.assign(el.style, {
      position: 'fixed',
      right: this.padding + 'px',
      bottom: this.padding + 'px',
      width: 'var(--fp-width)',
      borderRadius: 'var(--fp-radius)',
      boxShadow: 'var(--fp-shadow)',
      overflow: 'hidden',
      display: 'none',
      zIndex: '9999',
      userSelect: 'none',
    })

    document.body.appendChild(el)
    this._el = el
    this._iframe = el.querySelector('.yt-float-iframe')

    el.querySelector('.yt-float-close').addEventListener('click', () => this.close())
    el.querySelector('.yt-float-minimize').addEventListener('click', () => this.minimize())

    this._bindDrag(el.querySelector('.yt-float-handle'))
  }

  _bindTrigger(trigger) {
    let btn
    if (typeof trigger === 'string') btn = document.querySelector(trigger)
    else if (trigger instanceof Element) btn = trigger
    if (!btn) {
      btn = document.createElement('button')
      btn.className = 'yt-float-trigger'
      btn.textContent = '▶ Watch'
      document.body.appendChild(btn)
    }
    btn.addEventListener('click', () => this.toggle())
  }

  _bindDrag(handle) {
    const onStart = (e) => {
      if (e.target.closest('button')) return
      const rect = this._el.getBoundingClientRect()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      this._dragOffset = { x: cx - rect.left, y: cy - rect.top }
      Object.assign(this._el.style, { left: rect.left + 'px', top: rect.top + 'px', right: 'auto', bottom: 'auto' })
      this._iframe.style.pointerEvents = 'none'
      handle.style.cursor = 'grabbing'
      this._dragging = true
    }

    const onMove = (e) => {
      if (!this._dragging) return
      if (e.cancelable) e.preventDefault()
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      const rect = this._el.getBoundingClientRect()
      const x = Math.min(Math.max(0, cx - this._dragOffset.x), window.innerWidth - rect.width)
      const y = Math.min(Math.max(0, cy - this._dragOffset.y), window.innerHeight - rect.height)
      this._el.style.left = x + 'px'
      this._el.style.top = y + 'px'
    }

    const onEnd = () => {
      if (!this._dragging) return
      this._dragging = false
      this._iframe.style.pointerEvents = ''
      handle.style.cursor = 'grab'
      if (this.snapEnabled) this._snapToCorner()
    }

    handle.addEventListener('mousedown', onStart)
    handle.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('mousemove', onMove)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchend', onEnd)
  }

  _snapToCorner() {
    const rect = this._el.getBoundingClientRect()
    const toRight = (rect.left + rect.width / 2) > window.innerWidth / 2
    const toBottom = (rect.top + rect.height / 2) > window.innerHeight / 2
    const p = this.padding
    const targetLeft = toRight ? window.innerWidth - rect.width - p : p
    const targetTop = toBottom ? window.innerHeight - rect.height - p : p
    this._el.style.transition = 'left .22s cubic-bezier(.4,0,.2,1), top .22s cubic-bezier(.4,0,.2,1)'
    this._el.style.left = targetLeft + 'px'
    this._el.style.top = targetTop + 'px'
    setTimeout(() => { this._el.style.transition = '' }, 250)
  }

  open(videoIdOrSrc) {
    if (videoIdOrSrc) {
      if (videoIdOrSrc.includes('://') || videoIdOrSrc.startsWith('//')) {
        this.src = videoIdOrSrc
        this.videoId = null
      } else {
        this.videoId = videoIdOrSrc
        this.src = null
      }
    }
    const resolved = this._resolvedSrc()
    if (resolved) this._iframe.src = resolved
    if (this._minimized) this.minimize()
    this._el.style.display = 'block'
    this._open = true
  }

  close() {
    this._el.style.display = 'none'
    this._iframe.src = ''
    this._open = false
    if (this._minimized) {
      this._minimized = false
      this._iframe.style.display = 'block'
      const btn = this._el.querySelector('.yt-float-minimize')
      btn.textContent = '▼'
      btn.setAttribute('aria-label', 'Minimize')
    }
  }

  minimize() {
    this._minimized = !this._minimized
    this._iframe.style.display = this._minimized ? 'none' : 'block'
    const btn = this._el.querySelector('.yt-float-minimize')
    btn.textContent = this._minimized ? '▲' : '▼'
    btn.setAttribute('aria-label', this._minimized ? 'Expand' : 'Minimize')
  }

  toggle(videoIdOrSrc) {
    this._open ? this.close() : this.open(videoIdOrSrc)
  }

  destroy() {
    this._el.remove()
  }
}
