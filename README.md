# easy-pip

A draggable, snap-to-corner floating video widget. Zero dependencies. ~175 lines.

**[Demo →](./demo.html)**

## Features

- Drag to reposition, snaps to nearest corner on release
- Minimize to title bar (audio keeps playing)
- Touch support (iOS + Android)
- Autoplay on open, stops on close
- Works with YouTube, Vimeo, Loom, or any iframe URL
- Themeable via CSS custom properties
- Auto-injects a trigger button if you don't supply one

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

// YouTube shorthand
const player = new FloatPlayer({
  videoId: 'dQw4w9WgXcQ',
  trigger: '#watch-btn',
  padding: 16,
  snap: true,
})

// Any provider via raw src
const player = new FloatPlayer({
  src: 'https://player.vimeo.com/video/123456?autoplay=1',
  trigger: '#watch-btn',
})
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `videoId` | string | `null` | YouTube video ID (builds embed URL automatically) |
| `src` | string | `null` | Raw iframe src — any provider (overrides `videoId`) |
| `trigger` | string \| Element | `null` | CSS selector, DOM element, or omit for auto-button |
| `padding` | number | `16` | Corner padding in px |
| `snap` | boolean | `true` | Snap to nearest corner on drag end |
| `theme` | object | `{}` | CSS variable overrides (see Theming) |

### Methods

```js
player.open('videoId')                          // YouTube ID
player.open('https://player.vimeo.com/...')     // raw src URL
player.close()                                  // close and stop playback
player.minimize()                               // toggle minimize (audio continues)
player.toggle()                                 // toggle open/closed
player.destroy()                                // remove from DOM
```

### Theming

Override CSS custom properties via the `theme` option or by targeting `.yt-float` in CSS:

```js
new FloatPlayer({
  videoId: '...',
  theme: {
    '--fp-bg': '#0f172a',      // handle background
    '--fp-color': '#94a3b8',   // handle text/icon color
    '--fp-radius': '12px',     // border radius
    '--fp-width': '400px',     // widget width
    '--fp-shadow': '0 8px 32px rgba(0,0,0,.6)',
  }
})
```

Or via CSS:

```css
.yt-float {
  --fp-bg: #0f172a;
  --fp-width: 400px;
}
```

## How it works

- Drag start: reads `getBoundingClientRect()`, writes `left`/`top` in px, clears `right`/`bottom`
- `pointer-events: none` on iframe during drag (prevents iframe stealing mouse)
- Snap: calculates target corner in `left`/`top` space, animates with `cubic-bezier(.4,0,.2,1)`
- Minimize: hides iframe via `display:none`; the iframe document keeps running (audio continues)
- Autoplay: `iframe.src` is injected on open, cleared on close (respects browser autoplay policy)
- Touch: full parity via `touchstart`/`touchmove`/`touchend`, `touchmove` non-passive for scroll prevention

## License

MIT
