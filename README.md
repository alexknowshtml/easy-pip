# easy-pip

A draggable, snap-to-corner floating video widget. Zero dependencies. ~155 lines.

**[Demo →](./demo.html)**

## Features

- Drag to reposition, snaps to nearest corner on release
- Touch support (iOS + Android)
- Autoplay on open, stops on close (no background audio)
- Auto-injects a trigger button if you don't supply one
- Works with any YouTube video ID

## Install

```html
<script type="module">
  import FloatPlayer from 'https://cdn.jsdelivr.net/gh/alexknowshtml/easy-pip/float-player.js'
</script>
```

Or clone/download `float-player.js` — no build step required.

## Usage

```js
import FloatPlayer from './float-player.js'

const player = new FloatPlayer({
  videoId: 'dQw4w9WgXcQ', // YouTube video ID
  trigger: '#watch-btn',  // CSS selector, DOM element, or omit for auto-button
  padding: 16,            // corner padding in px (default: 16)
  snap: true,             // snap to nearest corner on drag end (default: true)
})
```

### Methods

```js
player.open('videoId')  // open (optionally change video)
player.close()          // close and stop playback
player.toggle()         // toggle open/closed
player.destroy()        // remove from DOM
```

### Trigger options

```js
// CSS selector
new FloatPlayer({ trigger: '#my-button', videoId: '...' })

// DOM element
new FloatPlayer({ trigger: document.querySelector('#my-button'), videoId: '...' })

// No trigger — auto-injects a ▶ Watch button
new FloatPlayer({ videoId: '...' })
```

## How it works

- Drag start: reads `getBoundingClientRect()`, writes `left`/`top` in px, clears `right`/`bottom`
- `pointer-events: none` on iframe during drag (prevents iframe stealing mouse)
- Snap: calculates target corner in `left`/`top` space, animates with `cubic-bezier(.4,0,.2,1)`
- Autoplay: `iframe.src` is injected on open, cleared on close (respects browser autoplay policy)
- Touch: full parity via `touchstart`/`touchmove`/`touchend`, `touchmove` non-passive for scroll prevention

## License

MIT
