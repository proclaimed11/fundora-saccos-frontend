// 'a < b' -> 'a &lt; b', so text is safe inside printed HTML
export const escapeHtml = (v: string | number) =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const BASE_CSS = `
  @page { size: A4 portrait; margin: 15mm; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #111; font-size: 12px; }
  h1 { font-size: 18px; margin: 12px 0 4px; }
  h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; margin: 18px 0 4px; }
  p { margin: 0; line-height: 1.55; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border-bottom: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; color: #555; }
  td.k { width: 35%; color: #555; }
  .r { text-align: right; }
  .muted { color: #666; font-size: 11px; }
  .co { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #555; }
  .head { text-align: center; border-bottom: 1px solid #bbb; padding-bottom: 10px; }
  .sign { display: flex; gap: 40px; margin-top: 48px; }
  .sign div { flex: 1; border-top: 1px solid #555; padding-top: 4px; font-size: 11px; }
`

// prints a block of HTML from a hidden iframe, so no popup window is needed
export function printHtml(title: string, bodyHtml: string, extraCss = '') {
  const html = `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title><style>${BASE_CSS}${extraCss}</style></head><body>${bodyHtml}</body></html>`

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  win.onafterprint = () => iframe.remove()
  setTimeout(() => {
    win.focus()
    win.print()
  }, 100)
  setTimeout(() => iframe.remove(), 60000) // cleanup fallback
}