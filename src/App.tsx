import React, {useMemo, useRef, useState} from 'react'
import JSZip from 'jszip'
import {
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Tabs,
  Text,
} from '@radix-ui/themes'
import {
  Cross2Icon,
  DownloadIcon,
  ImageIcon,
  TrashIcon,
  UploadIcon,
} from '@radix-ui/react-icons'
import {composeGrid, createGridCanvas, fileToImage, ComposeOptions} from './utils'

type ImgFile = { id: string; file: File; previewUrl: string; img?: HTMLImageElement }
type Notice = { type: 'info' | 'warning' | 'error' | 'success'; text: string }

const DEFAULT_OPTIONS: ComposeOptions = {
  rotate90: false,
  gapPx: 8,
  separatorColor: '#ffffff',
  output: 'image/jpeg',
  quality: 0.92,
  rows: 1,
  cols: 2,
  widthCm: 15,
  heightCm: 10,
  dpi: 300,
  cropToFill: false,
}

type NumericFieldKey = 'rows' | 'cols' | 'widthCm' | 'heightCm' | 'dpi'

const TAB_TRIGGER_CLASS =
    'flex-1 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-800/80 ' +
    'hover:text-slate-100 data-[state=active]:bg-violet-600 data-[state=active]:text-white ' +
    'data-[state=active]:hover:bg-violet-600 data-[state=active]:hover:text-white cursor-pointer before:bg-transparent hover:*:bg-transparent data-[state=active]:hover:*:bg-transparent'

function formatNumberInput(value: number) {
  return Number.isInteger(value) ? String(value) : value.toString()
}

function describeError(err: unknown) {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message?: unknown }).message)
  return 'Unexpected error while processing images.'
}

export default function App() {
  const [files, setFiles] = useState<ImgFile[]>([])
  const [opts, setOpts] = useState<ComposeOptions>({...DEFAULT_OPTIONS})
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const filesRef = useRef<ImgFile[]>([])
  const [inputValues, setInputValues] = useState<Record<NumericFieldKey, string>>({
    rows: String(DEFAULT_OPTIONS.rows),
    cols: String(DEFAULT_OPTIONS.cols),
    widthCm: formatNumberInput(DEFAULT_OPTIONS.widthCm),
    heightCm: formatNumberInput(DEFAULT_OPTIONS.heightCm),
    dpi: String(DEFAULT_OPTIONS.dpi),
  })

  const updateInputValue = (key: NumericFieldKey, value: string) => {
    setInputValues((prev) => ({...prev, [key]: value}))
  }

  const revertInputValue = (key: NumericFieldKey) => {
    setInputValues((prev) => {
      const fallback = {
        rows: String(opts.rows),
        cols: String(opts.cols),
        widthCm: formatNumberInput(opts.widthCm),
        heightCm: formatNumberInput(opts.heightCm),
        dpi: String(opts.dpi),
      }[key]
      if (prev[key] === fallback) return prev
      return {...prev, [key]: fallback}
    })
  }

  const commitNumericValue = (key: NumericFieldKey) => {
    const raw = inputValues[key].trim()
    if (raw === '') {
      revertInputValue(key)
      return
    }

    if (key === 'widthCm' || key === 'heightCm') {
      const parsed = Number.parseFloat(raw.replace(',', '.'))
      if (!Number.isFinite(parsed)) {
        revertInputValue(key)
        return
      }
      const sanitized = Math.max(1, parsed)
      setOpts((prev) => {
        if (prev[key] === sanitized) return prev
        return {...prev, [key]: sanitized}
      })
      setInputValues((prev) => ({...prev, [key]: formatNumberInput(sanitized)}))
      return
    }

    const parsedInt = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsedInt)) {
      revertInputValue(key)
      return
    }

    if (key === 'rows' || key === 'cols') {
      const sanitized = Math.max(1, Math.min(6, parsedInt))
      setOpts((prev) => {
        if (prev[key] === sanitized) return prev
        return {...prev, [key]: sanitized}
      })
      setInputValues((prev) => ({...prev, [key]: String(sanitized)}))
      return
    }

    if (key === 'dpi') {
      const sanitized = Math.max(72, Math.min(1200, parsedInt))
      setOpts((prev) => {
        if (prev.dpi === sanitized) return prev
        return {...prev, dpi: sanitized}
      })
      setInputValues((prev) => ({...prev, dpi: String(sanitized)}))
    }
  }

  const handleNumericKeyDown = (key: NumericFieldKey) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitNumericValue(key)
      event.currentTarget.blur()
    }
  }

  React.useEffect(() => {
    setInputValues((prev) => {
      const next: Record<NumericFieldKey, string> = {
        rows: String(opts.rows),
        cols: String(opts.cols),
        widthCm: formatNumberInput(opts.widthCm),
        heightCm: formatNumberInput(opts.heightCm),
        dpi: String(opts.dpi),
      }
      for (const key of Object.keys(next) as NumericFieldKey[]) {
        if (prev[key] !== next[key]) {
          return next
        }
      }
      return prev
    })
  }, [opts.cols, opts.dpi, opts.heightCm, opts.rows, opts.widthCm])

  function makePreviewUrl(file: File) {
    return URL.createObjectURL(file)
  }

  function onFilesAdded(list: FileList | File[]) {
    const imgs = Array.from(list).filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    setFiles(prev => [
      ...prev,
      ...imgs.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: makePreviewUrl(file),
      })),
    ])
    setNotice(null)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    onFilesAdded(e.dataTransfer.files)
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onFilesAdded(e.target.files)
  }

  function revokePreviews(targets: ImgFile[]) {
    targets.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    })
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((item) => {
      if (item.id === id) URL.revokeObjectURL(item.previewUrl)
      return item.id !== id
    }))
    setNotice(null)
  }

  function removeAll() {
    revokePreviews(files)
    setFiles([])
    setNotice(null)
  }

  React.useEffect(() => {
    filesRef.current = files
  }, [files])

  React.useEffect(() => {
    return () => {
      revokePreviews(filesRef.current)
    }
  }, [])

  const groupSize = Math.max(1, opts.rows * opts.cols)
  const remainder = files.length % groupSize
  const firstGroup = useMemo<ImgFile[] | undefined>(() => (
      files.length >= groupSize ? files.slice(0, groupSize) : undefined
  ), [files, groupSize])

  const outputWidthPx = useMemo(() => Math.round(Math.max(8, (opts.widthCm / 2.54) * opts.dpi)), [opts.widthCm, opts.dpi])
  const outputHeightPx = useMemo(() => Math.round(Math.max(8, (opts.heightCm / 2.54) * opts.dpi)), [opts.heightCm, opts.dpi])

  async function ensureImages(frames: ImgFile[]) {
    await Promise.all(frames.map(async f => {
      if (!f.img) f.img = await fileToImage(f.file)
    }))
  }

  const readyForPreview = firstGroup && firstGroup.length === groupSize
  const readyForDownload = files.length >= groupSize && remainder === 0
  const previewShortfall = groupSize - (firstGroup?.length ?? 0)
  const downloadShortfall = remainder === 0 ? 0 : groupSize - remainder

  const singleFileResult = files.length <= groupSize;

  async function download() {
    if (files.length < groupSize) {
      setNotice({
        type: 'warning',
        text: `Please add at least ${groupSize} photo${groupSize === 1 ? '' : 's'} before exporting.`
      })
      return
    }
    if (files.length % groupSize !== 0) {
      const missing = groupSize - (files.length % groupSize)
      setNotice({
        type: 'warning',
        text: `Add ${missing} more photo${missing === 1 ? '' : 's'} to complete the next grid.`
      })
      return
    }
    setBusy(true)
    try {
      const groups: ImgFile[][] = []
      for (let i = 0; i < files.length; i += groupSize) {
        const chunk = files.slice(i, i + groupSize)
        if (chunk.length === groupSize) groups.push(chunk)
      }
      await ensureImages(groups.flat())
      if (groups.length === 1) {
        try {
          const blob = await composeGrid(groups[0].map(item => item.img!), opts)
          const ext = opts.output === 'image/png' ? 'png' : 'jpg'
          const name = `grid.${ext}`
          const url = URL.createObjectURL(blob)
          const aEl = document.createElement('a')
          aEl.href = url
          aEl.download = name
          document.body.appendChild(aEl)
          aEl.click()
          aEl.remove()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          setNotice({type: 'success', text: 'Exported 1 grid image.'})
        } catch (err) {
          setNotice({type: 'error', text: describeError(err)})
        }
        return
      }
      const zip = new JSZip()
      let idx = 1
      for (const group of groups) {
        let blob: Blob
        try {
          blob = await composeGrid(group.map(item => item.img!), opts)
        } catch (err) {
          setNotice({type: 'error', text: describeError(err)})
          return
        }
        const ext = opts.output === 'image/png' ? 'png' : 'jpg'
        const name = `grid-${String(idx).padStart(2, '0')}.${ext}`
        zip.file(name, blob)
        idx++
      }
      const zipBlob = await zip.generateAsync({type: 'blob'})
      const url = URL.createObjectURL(zipBlob)
      const aEl = document.createElement('a')
      aEl.href = url;
      aEl.download = 'photo-grids.zip'
      document.body.appendChild(aEl);
      aEl.click();
      aEl.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice({type: 'success', text: `Exported ${files.length / groupSize} grids as a ZIP.`})
    } finally {
      setBusy(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-4">
              <img src="/logo-dark.svg" alt="GridPhoto" className="h-16"/>
              <p className="text-sm text-slate-300 sm:text-base">
                Arrange photo grids in seconds. Upload your shots, adjust layout, and export high-resolution sheets
                without leaving the browser.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <Card className="border border-slate-800/70 bg-slate-900/60 p-4 sm:p-6">
              <Flex direction="column" gap="4">
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault()
                    }}
                    className="relative flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/70 p-6 text-center transition hover:border-violet-400/70 hover:bg-slate-900"
                >
                  <input id="file-input" type="file" accept="image/*" multiple onChange={handleBrowse}
                         className="hidden"/>
                  <Button variant="soft" color="violet" asChild>
                    <label htmlFor="file-input"
                           className="flex cursor-pointer items-center gap-2 text-base font-medium">
                      <UploadIcon/>
                      Browse images
                    </label>
                  </Button>
                  <Text size="2" className="text-slate-300">…or drag & drop files here</Text>
                  <Text size="1"
                        className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-slate-400">
                    {files.length} selected · {groupSize} per grid
                  </Text>
                </div>

                {(notice || !readyForDownload || !readyForPreview) && (
                    <Flex direction="column" gap="2">
                      {notice && (
                          <Callout.Root
                              color={notice.type === 'error' ? 'red' : notice.type === 'warning' ? 'amber' : notice.type === 'success' ? 'green' : 'blue'}>
                            <Callout.Icon>
                              <ImageIcon/>
                            </Callout.Icon>
                            <Callout.Text>{notice.text}</Callout.Text>
                          </Callout.Root>
                      )}
                      {!notice && !readyForPreview && files.length > 0 && (
                          <Callout.Root color="amber">
                            <Callout.Icon>
                              <ImageIcon/>
                            </Callout.Icon>
                            <Callout.Text>
                              Add {previewShortfall} more photo{previewShortfall === 1 ? '' : 's'} to render the first
                              grid preview.
                            </Callout.Text>
                          </Callout.Root>
                      )}
                      {!notice && readyForPreview && !readyForDownload && (
                          <Callout.Root color="amber">
                            <Callout.Icon>
                              <ImageIcon/>
                            </Callout.Icon>
                            <Callout.Text>
                              Add {downloadShortfall} more photo{downloadShortfall === 1 ? '' : 's'} to complete the
                              next export batch.
                            </Callout.Text>
                          </Callout.Root>
                      )}
                    </Flex>
                )}

                <div className="space-y-3">
                  <Flex align="center" justify="between">
                    <Heading as="h2" size="3" className="text-slate-200">Selected photos</Heading>
                    {files.length > 0 && (
                        <Button variant="ghost" color="gray" onClick={removeAll} className="gap-2 cursor-pointer">
                          <TrashIcon/>
                          Clear all
                        </Button>
                    )}
                  </Flex>
                  {files.length === 0 ? (
                      <div
                          className="flex items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-900/50 py-12 text-sm text-slate-400">
                        Drop images to start building your grid.
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {files.map((item) => (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/70 shadow-inner"
                            >
                              <img
                                  src={item.previewUrl}
                                  alt={item.file.name}
                                  className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                              <button
                                  type="button"
                                  onClick={() => removeFile(item.id)}
                                  className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-slate-900/90 text-slate-200 opacity-0 shadow-lg transition group-hover:opacity-100 hover:bg-red-500"
                                  aria-label={`Remove ${item.file.name}`}
                              >
                                <Cross2Icon/>
                              </button>
                              <div
                                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2">
                                <p className="truncate text-xs text-slate-200">{item.file.name}</p>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </Flex>
            </Card>

            <Card className="border border-slate-800/70 bg-slate-900/60 p-4 sm:p-6">
              <Flex direction="column" gap="5">
                <div className="space-y-4">
                  <Heading as="h2" size="3" className="text-slate-200">Composition settings</Heading>
                  <Tabs.Root defaultValue="layout" className="w-full">
                    <Tabs.List
                        className="mb-4 flex flex-wrap gap-2 rounded-xl border border-slate-800/60 bg-slate-900/60 p-1">
                      <Tabs.Trigger value="layout" className={TAB_TRIGGER_CLASS}>
                        Layout
                      </Tabs.Trigger>
                      <Tabs.Trigger value="dimensions" className={TAB_TRIGGER_CLASS}>
                        Dimensions
                      </Tabs.Trigger>
                      <Tabs.Trigger value="output" className={TAB_TRIGGER_CLASS}>
                        Output
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="layout" className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label
                            className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="text-xs uppercase tracking-wide text-slate-400">Rows</span>
                          <input
                              type="text"
                              inputMode="numeric"
                              value={inputValues.rows}
                              onChange={(e) => {
                                const filtered = e.target.value.replace(/[^\d]/g, '')
                                updateInputValue('rows', filtered)
                              }}
                              onBlur={() => commitNumericValue('rows')}
                              onKeyDown={handleNumericKeyDown('rows')}
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                          />
                        </label>
                        <label
                            className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="text-xs uppercase tracking-wide text-slate-400">Columns</span>
                          <input
                              type="text"
                              inputMode="numeric"
                              value={inputValues.cols}
                              onChange={(e) => {
                                const filtered = e.target.value.replace(/[^\d]/g, '')
                                updateInputValue('cols', filtered)
                              }}
                              onBlur={() => commitNumericValue('cols')}
                              onKeyDown={handleNumericKeyDown('cols')}
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                          />
                        </label>
                      </div>
                      <Text size="2" className="text-slate-400">
                        Generates grids with {groupSize} photo{groupSize === 1 ? '' : 's'}.
                      </Text>
                      <label
                          className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                        <input
                            id="rot"
                            type="checkbox"
                            className="h-4 w-4 rounded border border-slate-600 bg-slate-950 text-violet-500 focus:ring-violet-500"
                            checked={opts.rotate90}
                            onChange={(e) => setOpts({...opts, rotate90: e.target.checked})}
                        />
                        <span>Rotate source photos 90°</span>
                      </label>
                      <label
                          className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                        <input
                            id="crop"
                            type="checkbox"
                            className="h-4 w-4 rounded border border-slate-600 bg-slate-950 text-violet-500 focus:ring-violet-500"
                            checked={Boolean(opts.cropToFill)}
                            onChange={(e) => setOpts({...opts, cropToFill: e.target.checked})}
                        />
                        <span>Fill entire cell (crop photos)</span>
                      </label>
                      <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                        <div className="flex flex-col gap-3">
                          <Text size="2" className="uppercase tracking-wide text-slate-400">Separator</Text>
                          <div className="flex flex-col gap-1">
                            <input
                                type="range"
                                min={0}
                                max={120}
                                value={opts.gapPx}
                                onChange={(e) => {
                                  const parsed = Number.parseInt(e.target.value, 10)
                                  const next = Number.isFinite(parsed) ? Math.max(0, Math.min(120, parsed)) : opts.gapPx
                                  setOpts((prev) => (prev.gapPx === next ? prev : {...prev, gapPx: next}))
                                }}
                                className="accent-violet-500"
                            />
                            <Text size="1" className="text-slate-400">{opts.gapPx}px</Text>
                          </div>
                          <div className="flex items-center gap-3">
                            <Text size="1" className="uppercase tracking-wide text-slate-400">Color</Text>
                            <input
                                type="color"
                                value={opts.separatorColor}
                                onChange={(e) => setOpts({...opts, separatorColor: e.target.value})}
                                className="h-10 w-14 cursor-pointer overflow-hidden rounded border border-slate-700 bg-slate-950"
                            />
                          </div>
                        </div>
                      </div>
                    </Tabs.Content>

                    <Tabs.Content value="dimensions" className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <label
                            className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="text-xs uppercase tracking-wide text-slate-400">Width</span>
                          <div className="flex items-center gap-2">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={inputValues.widthCm}
                                onChange={(e) => {
                                  const raw = e.target.value
                                  let decimalSeen = false
                                  let result = ''
                                  for (const ch of raw) {
                                    if (/\d/.test(ch)) {
                                      result += ch
                                      continue
                                    }
                                    if ((ch === '.' || ch === ',') && !decimalSeen) {
                                      result += ch
                                      decimalSeen = true
                                    }
                                  }
                                  updateInputValue('widthCm', result)
                                }}
                                onBlur={() => commitNumericValue('widthCm')}
                                onKeyDown={handleNumericKeyDown('widthCm')}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                            />
                            <span className="text-xs text-slate-400">cm</span>
                          </div>
                        </label>
                        <label
                            className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="text-xs uppercase tracking-wide text-slate-400">Height</span>
                          <div className="flex items-center gap-2">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={inputValues.heightCm}
                                onChange={(e) => {
                                  const raw = e.target.value
                                  let decimalSeen = false
                                  let result = ''
                                  for (const ch of raw) {
                                    if (/\d/.test(ch)) {
                                      result += ch
                                      continue
                                    }
                                    if ((ch === '.' || ch === ',') && !decimalSeen) {
                                      result += ch
                                      decimalSeen = true
                                    }
                                  }
                                  updateInputValue('heightCm', result)
                                }}
                                onBlur={() => commitNumericValue('heightCm')}
                                onKeyDown={handleNumericKeyDown('heightCm')}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                            />
                            <span className="text-xs text-slate-400">cm</span>
                          </div>
                        </label>
                        <label
                            className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span className="text-xs uppercase tracking-wide text-slate-400">DPI</span>
                          <div className="flex items-center gap-2">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={inputValues.dpi}
                                onChange={(e) => {
                                  const filtered = e.target.value.replace(/[^\d]/g, '')
                                  updateInputValue('dpi', filtered)
                                }}
                                onBlur={() => commitNumericValue('dpi')}
                                onKeyDown={handleNumericKeyDown('dpi')}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 focus:border-violet-500 focus:outline-none"
                            />
                            <span className="text-xs text-slate-400">dpi</span>
                          </div>
                        </label>
                      </div>
                      <Text size="2" className="text-slate-400">
                        Output preview: {outputWidthPx} × {outputHeightPx} px
                      </Text>
                    </Tabs.Content>

                    <Tabs.Content value="output" className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span>JPEG</span>
                          <input
                              type="radio"
                              name="fmt"
                              checked={opts.output === 'image/jpeg'}
                              onChange={() => setOpts({...opts, output: 'image/jpeg'})}
                              className="h-4 w-4 border border-slate-600 text-violet-500 focus:ring-violet-500"
                          />
                        </label>
                        <label
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
                          <span>PNG</span>
                          <input
                              type="radio"
                              name="fmt"
                              checked={opts.output === 'image/png'}
                              onChange={() => setOpts({...opts, output: 'image/png'})}
                              className="h-4 w-4 border border-slate-600 text-violet-500 focus:ring-violet-500"
                          />
                        </label>
                      </div>
                      {opts.output === 'image/jpeg' && (
                          <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4">
                            <Text size="1" className="uppercase tracking-wide text-slate-400">JPEG quality</Text>
                            <div className="mt-3 flex items-center gap-4">
                              <input
                                  type="range"
                                  min={0.6}
                                  max={1}
                                  step={0.02}
                                  value={opts.quality}
                                  onChange={(e) => setOpts({...opts, quality: parseFloat(e.target.value)})}
                                  className="flex-1 accent-violet-500"
                              />
                              <Text size="2" className="w-16 text-right text-slate-200">{opts.quality.toFixed(2)}</Text>
                            </div>
                          </div>
                      )}
                    </Tabs.Content>
                  </Tabs.Root>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Heading as="h2" size="3" className="text-slate-200">Live preview</Heading>
                    <Text size="2" className="text-slate-400">{outputWidthPx} × {outputHeightPx} px</Text>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60">
                    <PreviewCanvas group={firstGroup} opts={opts} ready={Boolean(readyForPreview)}/>
                  </div>
                </div>

                <Flex gap="3" wrap="wrap">
                  <Button
                      onClick={download}
                      disabled={busy || !readyForDownload}
                      className="gap-2 cursor-pointer bg-violet-600 text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
                  >
                    <DownloadIcon/>
                    {busy ? 'Processing…' : singleFileResult ? 'Download' : 'Download all (zip)'}
                  </Button>
                  <Button
                      variant="surface"
                      color="gray"
                      onClick={removeAll}
                      disabled={files.length === 0}
                      className="gap-2 cursor-pointer"
                  >
                    <TrashIcon/>
                    Reset
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </div>

          <footer className="mt-12 text-center text-xs text-slate-500">
            All processing happens locally in your browser. No uploads.
          </footer>
        </div>
      </div>
  )
}

function PreviewCanvas({group, opts, ready}: { group?: ImgFile[]; opts: ComposeOptions; ready: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const expected = opts.rows * opts.cols

      const primeCanvas = () => {
        canvas.width = 480
        canvas.height = 360
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, '#0f172a')
        gradient.addColorStop(1, '#020617')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
        ctx.lineWidth = 2
        ctx.setLineDash([10, 8])
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
        ctx.setLineDash([])
      }

      if (!ready || !group || group.length < expected) {
        primeCanvas()
        return
      }

      primeCanvas()
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
  }, [group, opts, ready])

  return <canvas ref={canvasRef} className="h-auto w-full"/>
}
