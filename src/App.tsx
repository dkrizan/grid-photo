import React, { useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { composeGrid, createGridCanvas, fileToImage, ComposeOptions } from './utils'

type ImgFile = { file: File, img?: HTMLImageElement }

function describeError(err: unknown) {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message?: unknown }).message)
  return 'Unexpected error while processing images.'
}

export default function App() {
  const [files, setFiles] = useState<ImgFile[]>([])
  const [opts, setOpts] = useState<ComposeOptions>({
    rotate90: true,
    gapPx: 8,
    separatorColor: '#ffffff',
    output: 'image/jpeg',
    quality: 0.92,
    rows: 1,
    cols: 2,
    widthCm: 15,
    heightCm: 10,
    dpi: 300,
  })
  const [busy, setBusy] = useState(false)

  function onFilesAdded(list: FileList | File[]) {
    const imgs = Array.from(list).filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...imgs.map(f => ({ file: f }))])
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    onFilesAdded(e.dataTransfer.files)
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onFilesAdded(e.target.files)
  }

  function removeAll() { setFiles([]) }

  const groupSize = Math.max(1, opts.rows * opts.cols)
  const remainder = files.length % groupSize
  const firstGroup = useMemo<ImgFile[] | undefined>(() => (
    files.length >= groupSize ? files.slice(0, groupSize) : undefined
  ), [files, groupSize])

  const outputWidthPx = useMemo(() => Math.round(Math.max(8, (opts.widthCm / 2.54) * opts.dpi)), [opts.widthCm, opts.dpi])
  const outputHeightPx = useMemo(() => Math.round(Math.max(8, (opts.heightCm / 2.54) * opts.dpi)), [opts.heightCm, opts.dpi])

  async function ensureImages(frames: ImgFile[]) {
    await Promise.all(frames.map(async f => { if (!f.img) f.img = await fileToImage(f.file) }))
  }

  async function downloadAll() {
    if (files.length < groupSize) {
      alert(`Please add at least ${groupSize} photos.`);
      return;
    }
    if (files.length % groupSize !== 0) {
      const missing = groupSize - (files.length % groupSize);
      alert(`Please add ${missing} more photo${missing === 1 ? '' : 's'} to complete the grid.`);
      return;
    }
    setBusy(true)
    try {
      const zip = new JSZip()
      const groups: ImgFile[][] = []
      for (let i = 0; i < files.length; i += groupSize) {
        const chunk = files.slice(i, i + groupSize)
        if (chunk.length === groupSize) groups.push(chunk)
      }
      await ensureImages(groups.flat())
      let idx = 1
      for (const group of groups) {
        let blob: Blob
        try {
          blob = await composeGrid(group.map(item => item.img!), opts)
        } catch (err) {
          alert(describeError(err))
          return
        }
        const ext = opts.output === 'image/png' ? 'png' : 'jpg'
        const name = `grid-${String(idx).padStart(2,'0')}.${ext}`
        zip.file(name, blob)
        idx++
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const aEl = document.createElement('a')
      aEl.href = url; aEl.download = 'foto-grids.zip'
      document.body.appendChild(aEl); aEl.click(); aEl.remove()
      setTimeout(()=>URL.revokeObjectURL(url), 1000)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <header>
        <h1 className="text-xl font-bold">GridPhoto — Grid Stitcher</h1>
        <p className="text-slate-300">Drag & drop up to ~50 photos. Choose rows & columns, set a print size in cm with DPI, and we’ll build ready-to-print grids completely in your browser.</p>
      </header>

      <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
        <div
          onDrop={handleDrop}
          onDragOver={(e)=>{e.preventDefault()}}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 p-8 text-center hover:bg-slate-800 transition-colors"
        >
          <input id="file-input" type="file" accept="image/*" multiple onChange={handleBrowse} className="hidden" />
          <label htmlFor="file-input" className="cursor-pointer rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold hover:bg-slate-700">Browse files</label>
          <div className="text-slate-400 text-sm">…or drag & drop images here</div>
          <div className="text-xs text-slate-500">{files.length} selected · {groupSize} per grid</div>
          {files.length > 0 && remainder !== 0 && (
            <div className="text-xs text-amber-400">
              Add {groupSize - remainder} more photo{groupSize - remainder === 1 ? '' : 's'} to complete the next grid.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="col-span-1 space-y-2">
            <div>
              <label className="text-sm text-slate-300">Grid layout</label>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span>Rows</span>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={opts.rows}
                  onChange={(e)=>{
                    const next = Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 1))
                    setOpts({...opts, rows: next})
                  }}
                  className="w-16 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm"
                />
                <span>Columns</span>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={opts.cols}
                  onChange={(e)=>{
                    const next = Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 1))
                    setOpts({...opts, cols: next})
                  }}
                  className="w-16 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm"
                />
              </div>
              <div className="text-xs text-slate-400 mt-1">{groupSize} photo{groupSize === 1 ? '' : 's'} per grid</div>
            </div>
            <div>
              <label className="text-sm text-slate-300">Output size</label>
              <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <span className="w-16">Width</span>
                  <input
                    type="number"
                    min={2}
                    step={0.1}
                    value={opts.widthCm}
                    onChange={(e)=>{
                      const val = parseFloat(e.target.value)
                      setOpts({...opts, widthCm: Number.isFinite(val) ? Math.max(1, val) : opts.widthCm})
                    }}
                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-slate-500">cm</span>
                </label>
                <label className="flex items-center gap-2">
                  <span className="w-16">Height</span>
                  <input
                    type="number"
                    min={2}
                    step={0.1}
                    value={opts.heightCm}
                    onChange={(e)=>{
                      const val = parseFloat(e.target.value)
                      setOpts({...opts, heightCm: Number.isFinite(val) ? Math.max(1, val) : opts.heightCm})
                    }}
                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-slate-500">cm</span>
                </label>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="w-16">DPI</span>
                <input
                  type="number"
                  min={72}
                  max={1200}
                  value={opts.dpi}
                  onChange={(e)=>{
                    const val = parseInt(e.target.value, 10)
                    setOpts({...opts, dpi: Number.isFinite(val) ? Math.min(1200, Math.max(72, val)) : opts.dpi})
                  }}
                  className="w-24 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm"
                />
                <span className="text-xs text-slate-500">≈ {outputWidthPx}×{outputHeightPx} px</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="rot" type="checkbox" className="scale-125" checked={opts.rotate90} onChange={(e)=>setOpts({...opts, rotate90: e.target.checked})} />
              <label htmlFor="rot">Rotate sources 90°</label>
            </div>
            <div>
              <label className="text-sm text-slate-300">Separator width (px)</label>
              <input type="range" min={0} max={40} value={opts.gapPx} onChange={(e)=>setOpts({...opts, gapPx: parseInt(e.target.value)})} className="w-full" />
              <div className="text-xs text-slate-400">{opts.gapPx}px</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Separator color</label>
              <input type="color" value={opts.separatorColor} onChange={(e)=>setOpts({...opts, separatorColor: e.target.value})} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 text-sm"><input type="radio" name="fmt" checked={opts.output==='image/jpeg'} onChange={()=>setOpts({...opts, output:'image/jpeg'})} /> JPG</label>
              <label className="flex items-center gap-1 text-sm"><input type="radio" name="fmt" checked={opts.output==='image/png'} onChange={()=>setOpts({...opts, output:'image/png'})} /> PNG</label>
            </div>
            {opts.output==='image/jpeg' && (
              <div>
                <label className="text-sm text-slate-300">JPG quality</label>
                <input type="range" min={0.6} max={1} step={0.02} value={opts.quality} onChange={(e)=>setOpts({...opts, quality: parseFloat(e.target.value)})} className="w-full" />
                <div className="text-xs text-slate-400">{opts.quality.toFixed(2)}</div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-slate-300 font-semibold mb-2">Preview (first grid) — {outputWidthPx}×{outputHeightPx} px</div>
            <PreviewCanvas group={firstGroup} opts={opts} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={downloadAll} disabled={busy || files.length < groupSize || remainder !== 0} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-50">{busy ? 'Processing…' : 'Download all (ZIP)'}</button>
          <button onClick={removeAll} className="rounded-lg border border-slate-600 px-4 py-2 hover:bg-slate-700">Clear</button>
        </div>
      </section>

      <footer className="text-center text-xs text-slate-500">All processing happens locally in your browser. No uploads.</footer>
    </div>
  )
}

function PreviewCanvas({ group, opts }: { group?: ImgFile[]; opts: ComposeOptions }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    let cancelled = false

    ;(async () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const expected = opts.rows * opts.cols

      const primeCanvas = (message: string) => {
        canvas.width = 360
        canvas.height = 200
        ctx.fillStyle = '#0b0c10'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#64748b'
        ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto'
        ctx.fillText(message, 12, 24)
      }

      if (!group || group.length < expected) {
        primeCanvas(`Add at least ${expected} photo${expected === 1 ? '' : 's'} to see preview`)
        return
      }

      primeCanvas('Rendering preview…')
      await Promise.all(group.map(async (item) => {
        if (!item.img) item.img = await fileToImage(item.file)
      }))

      if (cancelled) return

      const gridCanvas = createGridCanvas(group.map((item) => item.img!), opts)
      if (cancelled) return

      const srcWidth = gridCanvas.width || 1
      const srcHeight = gridCanvas.height || 1
      const maxWidth = 480
      const maxHeight = 360
      const scale = Math.min(maxWidth / srcWidth, maxHeight / srcHeight, 1)
      const drawWidth = Math.max(1, Math.round(srcWidth * scale))
      const drawHeight = Math.max(1, Math.round(srcHeight * scale))
      canvas.width = Math.max(320, drawWidth)
      canvas.height = Math.max(240, drawHeight)
      ctx.fillStyle = '#0b0c10'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const offsetX = Math.round((canvas.width - drawWidth) / 2)
      const offsetY = Math.round((canvas.height - drawHeight) / 2)
      ctx.drawImage(gridCanvas, offsetX, offsetY, drawWidth, drawHeight)
    })().catch((err) => {
      console.error(err)
    })

    return () => {
      cancelled = true
    }
  }, [group, opts.cols, opts.dpi, opts.gapPx, opts.heightCm, opts.rotate90, opts.rows, opts.separatorColor, opts.widthCm])

  return <canvas ref={canvasRef} className="w-full h-auto rounded border border-slate-700 bg-black/50" />
}
