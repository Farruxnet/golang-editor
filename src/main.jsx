import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const initialCode = `package main

import "fmt"

func main() {
    message := "Hello from GoForge"
    fmt.Println(message)
}`

const files = [
  { name: 'main.go', type: 'go', active: true },
  { name: 'go.mod', type: 'mod' },
  { name: 'README.md', type: 'md' },
]

function Icon({ name, size = 18 }) {
  const paths = {
    logo: <><path d="M4 5.5 12 3l8 2.5v13L12 21l-8-2.5z"/><path d="m4 5.5 8 3 8-3M12 8.5V21"/></>,
    files: <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3h6.4L17 8.1v11.4A1.5 1.5 0 0 1 15.5 21h-10A1.5 1.5 0 0 1 4 19.5z"/><path d="M11.5 3v5.5H17"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    git: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 6h8M6 8v6a4 4 0 0 0 4 4h0M18 8v2a4 4 0 0 1-4 4h-2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.4h.8a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1z"/></>,
    play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>,
    stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <path d="M20.3 15.2A8.6 8.6 0 0 1 8.8 3.7 8.6 8.6 0 1 0 20.3 15.2z"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    terminal: <><path d="m4 6 6 6-6 6M12 18h8"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function FileIcon({ type }) {
  return <span className={`file-icon ${type}`}>{type === 'go' ? 'Go' : type === 'mod' ? 'M' : '#'} </span>
}

function App() {
  const [code, setCode] = useState(initialCode)
  const [dark, setDark] = useState(true)
  const [output, setOutput] = useState({ status: 'idle', text: 'Ready when you are. Run your Go program to see the output here.' })
  const [bottomOpen, setBottomOpen] = useState(true)
  const [activeFile, setActiveFile] = useState('main.go')
  const [saved, setSaved] = useState(true)
  const [cursor, setCursor] = useState({ line: 7, col: 1 })
  const editorRef = useRef(null)

  const lines = useMemo(() => code.split('\n'), [code])
  const runCode = async () => {
    setBottomOpen(true)
    setOutput({ status: 'running', text: 'Compiling with Go Playground…' })
    const endpoints = [
      { url: 'https://go.dev/_/playground', body: { Body: code, WithVet: true } },
      { url: 'https://play.golang.org/compile', body: { body: code, withVet: true } },
    ]
    let lastError = 'No compiler response.'
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(endpoint.body) })
        if (!response.ok) { lastError = `${endpoint.url} returned ${response.status}`; continue }
        const data = await response.json()
        const text = data.Errors || (data.Events || []).map((event) => event.Message || '').join('') || 'Program finished with no output.'
        setOutput({ status: data.Errors ? 'error' : 'success', text: text.trim() })
        return
      } catch (error) { lastError = error.message }
    }
    setOutput({ status: 'error', text: `Unable to reach the Go compiler service.\n\n${lastError}\n\nCheck your connection or run the local Go toolchain.` })
  }

  const onEditorChange = (event) => { setCode(event.target.value); setSaved(false) }
  const onEditorKeyDown = (event) => {
    if (event.key === 'Tab') { event.preventDefault(); const el = event.currentTarget; const start = el.selectionStart; setCode(code.slice(0, start) + '    ' + code.slice(el.selectionEnd)); requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4 }) }
    if ((event.metaKey || event.ctrlKey) && event.key === 's') { event.preventDefault(); setSaved(true) }
  }
  const syncCursor = (event) => { const before = code.slice(0, event.target.selectionStart); setCursor({ line: before.split('\n').length, col: before.split('\n').at(-1).length + 1 }) }

  return <div className={`app ${dark ? 'dark' : 'light'}`}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Icon name="logo" size={20} /></span><span>GoForge</span><span className="beta">BETA</span></div>
      <div className="project-path"><span className="muted">WORKSPACE</span><span className="slash">/</span><span>hello-go</span><span className="branch"><Icon name="git" size={13} /> main</span></div>
      <div className="top-actions"><button className="icon-button" title="Toggle theme" onClick={() => setDark(!dark)}><Icon name={dark ? 'sun' : 'moon'} size={17} /></button><button className="avatar">F</button></div>
    </header>
    <div className="workspace">
      <aside className="activitybar">
        <button className="activity active"><Icon name="files" /></button><button className="activity"><Icon name="search" /></button><button className="activity"><Icon name="git" /></button><div className="activity-spacer" /><button className="activity"><Icon name="settings" /></button>
      </aside>
      <aside className="sidebar">
        <div className="sidebar-header"><span>EXPLORER</span><button className="ghost-icon"><Icon name="close" size={15} /></button></div>
        <div className="workspace-label"><Icon name="chevron" size={13} /><span>HELLO-GO</span></div>
        <nav className="file-list">{files.map(file => <button key={file.name} className={`file-row ${activeFile === file.name ? 'selected' : ''}`} onClick={() => setActiveFile(file.name)}><FileIcon type={file.type} /><span>{file.name}</span>{file.name === activeFile && !saved && <i className="unsaved" />}</button>)}</nav>
        <div className="sidebar-footer"><span className="dot green" />Go 1.22.4</div>
      </aside>
      <main className="main-area">
        <div className="editor-tabs"><button className="tab active"><FileIcon type="go" /><span>{activeFile}</span>{!saved && <i className="unsaved" />}<Icon name="close" size={14} /></button><div className="tab-spacer" /><button className="action-button" onClick={runCode}><Icon name={output.status === 'running' ? 'stop' : 'play'} size={14} />{output.status === 'running' ? 'Running' : 'Run'}<kbd>⌘ ↵</kbd></button></div>
        <div className="breadcrumb"><span>hello-go</span><span>/</span><b>{activeFile}</b><span className="editor-info">Go · UTF-8 · LF</span></div>
        <section className="editor-wrap">
          <div className="line-numbers">{lines.map((_, i) => <span key={i} className={cursor.line === i + 1 ? 'current' : ''}>{i + 1}</span>)}</div>
          <textarea ref={editorRef} value={code} onChange={onEditorChange} onKeyDown={onEditorKeyDown} onClick={syncCursor} onKeyUp={syncCursor} spellCheck="false" aria-label="Go source editor" />
        </section>
        {bottomOpen && <section className="output-panel"><div className="panel-tabs"><button className="panel-tab active"><Icon name="terminal" size={14} />TERMINAL</button><button className="panel-tab">PROBLEMS <span className="count">{output.status === 'error' ? 1 : 0}</span></button><div className="panel-actions"><span className="compile-status"><span className={`dot ${output.status === 'error' ? 'red' : output.status === 'running' ? 'yellow' : 'green'}`} />{output.status === 'running' ? 'Compiling' : output.status === 'error' ? 'Failed' : 'Ready'}</span><button className="ghost-icon" onClick={() => setBottomOpen(false)}><Icon name="close" size={15} /></button></div></div><pre className={`output ${output.status}`}>{output.status === 'success' && <span className="output-label">OUTPUT  ·  go.dev playground</span>}{output.text}</pre></section>}
        <footer className="statusbar"><span><span className="dot green" />Connected</span><span>Go 1.22.4</span><span>Ln {cursor.line}, Col {cursor.col}</span><span className="status-spacer" /><span>{saved ? 'Saved' : 'Unsaved changes'}</span><span>UTF-8</span><span>LF</span></footer>
      </main>
    </div>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
