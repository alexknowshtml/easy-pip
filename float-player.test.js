import { describe, it, expect, afterEach } from 'vitest'
import FloatPlayer from './float-player.js'

function cleanup() {
  document.querySelectorAll('.yt-float, .yt-float-trigger').forEach(el => el.remove())
}

afterEach(cleanup)

describe('construction', () => {
  it('appends widget to body', () => {
    new FloatPlayer()
    expect(document.querySelector('.yt-float')).not.toBeNull()
  })

  it('starts hidden', () => {
    new FloatPlayer()
    expect(document.querySelector('.yt-float').style.display).toBe('none')
  })

  it('applies default CSS custom properties', () => {
    new FloatPlayer()
    const el = document.querySelector('.yt-float')
    expect(el.style.getPropertyValue('--fp-bg')).toBe('#1a1a1a')
    expect(el.style.getPropertyValue('--fp-width')).toBe('340px')
    expect(el.style.getPropertyValue('--fp-aspect-ratio')).toBe('16/9')
  })

  it('applies theme overrides', () => {
    new FloatPlayer({ theme: { '--fp-bg': '#fff', '--fp-aspect-ratio': '4/1' } })
    const el = document.querySelector('.yt-float')
    expect(el.style.getPropertyValue('--fp-bg')).toBe('#fff')
    expect(el.style.getPropertyValue('--fp-aspect-ratio')).toBe('4/1')
  })

  it('uses default padding', () => {
    new FloatPlayer()
    const el = document.querySelector('.yt-float')
    expect(el.style.right).toBe('16px')
    expect(el.style.bottom).toBe('16px')
  })

  it('respects custom padding', () => {
    new FloatPlayer({ padding: 32 })
    const el = document.querySelector('.yt-float')
    expect(el.style.right).toBe('32px')
    expect(el.style.bottom).toBe('32px')
  })

  it('media container starts empty', () => {
    new FloatPlayer()
    expect(document.querySelector('.yt-float-media').children.length).toBe(0)
  })
})

describe('trigger', () => {
  it('auto-injects a trigger button when none supplied', () => {
    new FloatPlayer()
    expect(document.querySelector('.yt-float-trigger')).not.toBeNull()
  })

  it('binds to an existing element by CSS selector — no auto-inject', () => {
    const btn = document.createElement('button')
    btn.id = 'test-trigger'
    document.body.appendChild(btn)
    new FloatPlayer({ trigger: '#test-trigger' })
    expect(document.querySelector('.yt-float-trigger')).toBeNull()
    btn.remove()
  })

  it('binds to a DOM element directly — no auto-inject', () => {
    const btn = document.createElement('button')
    document.body.appendChild(btn)
    new FloatPlayer({ trigger: btn })
    expect(document.querySelector('.yt-float-trigger')).toBeNull()
    btn.remove()
  })
})

describe('open / close / toggle — video', () => {
  it('open() shows the widget', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    expect(document.querySelector('.yt-float').style.display).toBe('block')
  })

  it('open() mounts an iframe for YouTube videoId', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    expect(document.querySelector('.yt-float-media iframe')).not.toBeNull()
    expect(document.querySelector('.yt-float-media audio')).toBeNull()
  })

  it('open() builds YouTube embed src from videoId', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    expect(document.querySelector('.yt-float-media iframe').src).toContain('youtube.com/embed/abc123')
  })

  it('open() uses raw src for provider-agnostic URLs', () => {
    const p = new FloatPlayer({ src: 'https://player.vimeo.com/video/999?autoplay=1' })
    p.open()
    expect(document.querySelector('.yt-float-media iframe').src).toBe('https://player.vimeo.com/video/999?autoplay=1')
  })

  it('open(url) switches to src mode', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open('https://player.vimeo.com/video/999?autoplay=1')
    expect(document.querySelector('.yt-float-media iframe').src).toBe('https://player.vimeo.com/video/999?autoplay=1')
  })

  it('open(videoId) swaps videoId', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open('xyz789')
    expect(document.querySelector('.yt-float-media iframe').src).toContain('xyz789')
  })

  it('handle label shows ▶ Video for video src', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    expect(document.querySelector('.yt-float-label').textContent).toBe('▶ Video')
  })

  it('close() hides the widget', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    p.close()
    expect(document.querySelector('.yt-float').style.display).toBe('none')
  })

  it('close() clears iframe src', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    p.close()
    expect(document.querySelector('.yt-float-media iframe').src).not.toContain('youtube.com')
  })

  it('toggle() opens when closed', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.toggle()
    expect(document.querySelector('.yt-float').style.display).toBe('block')
  })

  it('toggle() closes when open', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    p.toggle()
    expect(document.querySelector('.yt-float').style.display).toBe('none')
  })
})

describe('open / close — audio', () => {
  it('open() mounts an <audio> element for .mp3 src', () => {
    const p = new FloatPlayer({ src: 'https://example.com/track.mp3' })
    p.open()
    expect(document.querySelector('.yt-float-media audio')).not.toBeNull()
    expect(document.querySelector('.yt-float-media iframe')).toBeNull()
  })

  it('open() mounts an <audio> element for .m4a src', () => {
    const p = new FloatPlayer({ src: 'https://example.com/memo.m4a' })
    p.open()
    expect(document.querySelector('.yt-float-media audio')).not.toBeNull()
  })

  it('open() sets audio src', () => {
    const p = new FloatPlayer({ src: 'https://example.com/track.mp3' })
    p.open()
    expect(document.querySelector('.yt-float-media audio').src).toBe('https://example.com/track.mp3')
  })

  it('handle label shows ♪ Audio for audio src', () => {
    const p = new FloatPlayer({ src: 'https://example.com/track.mp3' })
    p.open()
    expect(document.querySelector('.yt-float-label').textContent).toBe('♪ Audio')
  })

  it('switching from video to audio replaces the iframe with audio element', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    expect(document.querySelector('.yt-float-media iframe')).not.toBeNull()
    p.open('https://example.com/track.mp3')
    expect(document.querySelector('.yt-float-media audio')).not.toBeNull()
    expect(document.querySelector('.yt-float-media iframe')).toBeNull()
  })

  it('switching from audio to video replaces audio element with iframe', () => {
    const p = new FloatPlayer({ src: 'https://example.com/track.mp3' })
    p.open()
    p.open('abc123')
    expect(document.querySelector('.yt-float-media iframe')).not.toBeNull()
    expect(document.querySelector('.yt-float-media audio')).toBeNull()
  })
})

describe('minimize', () => {
  it('minimize() hides the media element', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    p.minimize()
    expect(document.querySelector('.yt-float-media iframe').style.display).toBe('none')
  })

  it('minimize() twice restores media element', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    p.minimize()
    p.minimize()
    expect(document.querySelector('.yt-float-media iframe').style.display).toBe('block')
  })

  it('minimize button label toggles', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    const btn = document.querySelector('.yt-float-minimize')
    expect(btn.textContent).toBe('▼')
    p.minimize()
    expect(btn.textContent).toBe('▲')
    p.minimize()
    expect(btn.textContent).toBe('▼')
  })

  it('open() auto-expands if minimized', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    p.minimize()
    p.open()
    expect(document.querySelector('.yt-float-media iframe').style.display).toBe('block')
  })

  it('close() resets minimize state so next open is not minimized', () => {
    const p = new FloatPlayer({ videoId: 'abc123' })
    p.open()
    p.minimize()
    p.close()
    p.open()
    expect(document.querySelector('.yt-float-media iframe').style.display).toBe('block')
  })
})

describe('destroy', () => {
  it('removes widget from DOM', () => {
    const p = new FloatPlayer()
    p.destroy()
    expect(document.querySelector('.yt-float')).toBeNull()
  })
})
