import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Website, Wallet, TerminalCommand } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Terminal as TerminalIcon } from '@phosphor-icons/react'

interface TerminalViewProps {
  websites: Website[]
  wallet: Wallet | null
  onBack: () => void
  onNavigate: (view: string) => void
}

function buildHelp(): string {
  return `
┌─────────────────────────────────────────────────┐
│           INFINITY SPARK TERMINAL v1.0          │
└─────────────────────────────────────────────────┘

NAVIGATION
  hub             → Open Infinity Hub (world builder)
  market          → Open Marketplace
  trade           → Open Trading
  music           → Open Music Hub
  dash            → Open Spark Dashboard
  profile         → Open User Profile
  wallet          → Open Wallet

WORLDS
  ls / list       → List all your worlds
  ls --all        → List all worlds in ecosystem
  show <id>       → Show world details
  top             → Show top 5 worlds by value
  
WALLET
  balance         → Show your balance
  tokens          → List your tokens
  address         → Show your wallet address

SYSTEM
  status          → Show system status
  sparks          → Show spark network status
  clear           → Clear terminal
  help            → Show this help

EXAMPLES
  > ls
  > top
  > balance
  > navigate market
`.trim()
}

function processCommand(
  input: string,
  websites: Website[],
  wallet: Wallet | null,
  onNavigate: (view: string) => void
): { output: string; type: TerminalCommand['type']; navigate?: string } {
  const cmd = input.trim().toLowerCase()
  const parts = cmd.split(/\s+/)
  const base = parts[0]

  if (!cmd) return { output: '', type: 'info' }

  if (cmd === 'help' || cmd === '?') {
    return { output: buildHelp(), type: 'info' }
  }

  if (cmd === 'clear') {
    return { output: '__CLEAR__', type: 'info' }
  }

  if (cmd === 'hub' || cmd === 'navigate hub' || cmd === 'go hub') {
    onNavigate('builder')
    return { output: '→ Navigating to Infinity Hub...', type: 'success' }
  }
  if (cmd === 'market' || cmd === 'marketplace' || cmd === 'navigate market') {
    onNavigate('marketplace')
    return { output: '→ Navigating to Marketplace...', type: 'success' }
  }
  if (cmd === 'trade' || cmd === 'trading' || cmd === 'navigate trade') {
    onNavigate('trading')
    return { output: '→ Navigating to Trading...', type: 'success' }
  }
  if (cmd === 'music' || cmd === 'navigate music') {
    onNavigate('music')
    return { output: '→ Navigating to Music Hub...', type: 'success' }
  }
  if (cmd === 'dash' || cmd === 'dashboard' || cmd === 'navigate dash') {
    onNavigate('dashboard')
    return { output: '→ Navigating to Spark Dashboard...', type: 'success' }
  }
  if (cmd === 'profile' || cmd === 'navigate profile') {
    onNavigate('profile')
    return { output: '→ Navigating to Profile...', type: 'success' }
  }
  if (cmd === 'wallet' || cmd === 'navigate wallet') {
    onNavigate('wallet')
    return { output: '→ Navigating to Wallet...', type: 'success' }
  }
  if (cmd === 'home' || cmd === 'back' || cmd === 'exit') {
    onNavigate('home')
    return { output: '→ Returning to entry...', type: 'success' }
  }

  if (cmd === 'ls' || cmd === 'list') {
    const mine = websites.filter(w => w.ownerWallet === wallet?.address)
    if (mine.length === 0) return { output: 'No worlds found. Create one from the Hub.', type: 'warning' }
    const lines = mine.map(w =>
      `  ${w.id.slice(0, 8)}  ${w.title.padEnd(28)} ${w.value.toLocaleString().padStart(8)} ∞  ${w.tools?.length || 0} tools`
    )
    return {
      output: `YOUR WORLDS (${mine.length})\n${'─'.repeat(60)}\n  ID        TITLE                         VALUE     TOOLS\n${'─'.repeat(60)}\n${lines.join('\n')}`,
      type: 'info'
    }
  }

  if (cmd === 'ls --all' || cmd === 'list --all') {
    if (websites.length === 0) return { output: 'No worlds in ecosystem yet.', type: 'warning' }
    const lines = websites.map(w =>
      `  ${w.id.slice(0, 8)}  ${w.title.padEnd(28)} ${w.value.toLocaleString().padStart(8)} ∞  ${w.isListedForSale ? '🏷️ FOR SALE' : ''}`
    )
    return {
      output: `ALL WORLDS (${websites.length})\n${'─'.repeat(60)}\n${lines.join('\n')}`,
      type: 'info'
    }
  }

  if (cmd === 'top') {
    const sorted = [...websites].sort((a, b) => b.value - a.value).slice(0, 5)
    if (sorted.length === 0) return { output: 'No worlds yet.', type: 'warning' }
    const medals = ['🥇', '🥈', '🥉', '4.', '5.']
    const lines = sorted.map((w, i) =>
      `  ${medals[i]} ${w.title.padEnd(30)} ${w.value.toLocaleString()} ∞`
    )
    return { output: `TOP WORLDS BY VALUE\n${'─'.repeat(50)}\n${lines.join('\n')}`, type: 'info' }
  }

  if (base === 'show' && parts[1]) {
    const id = parts[1]
    const site = websites.find(w => w.id.startsWith(id) || w.id === id)
    if (!site) return { output: `World "${id}" not found.`, type: 'error' }
    return {
      output: [
        `WORLD: ${site.title}`,
        `${'─'.repeat(40)}`,
        `ID:          ${site.id}`,
        `Description: ${site.description}`,
        `Value:       ${site.value.toLocaleString()} ∞`,
        `Tools:       ${site.tools?.length || 0}`,
        `Pages:       ${site.pages?.length || 0}`,
        `Owner:       ${site.ownerWallet.slice(0, 12)}...`,
        `For Sale:    ${site.isListedForSale ? `Yes (${site.salePrice} ∞)` : 'No'}`,
        `Created:     ${new Date(site.createdAt).toLocaleDateString()}`,
      ].join('\n'),
      type: 'info'
    }
  }

  if (cmd === 'balance') {
    if (!wallet) return { output: 'No wallet found. Create a world to initialize your wallet.', type: 'warning' }
    return {
      output: [
        `WALLET BALANCE`,
        `${'─'.repeat(30)}`,
        `Infinity:  ${wallet.infinityBalance?.toLocaleString() || 0} ∞`,
        `Portfolio: ${wallet.balance?.toLocaleString() || 0}`,
        `Tokens:    ${wallet.tokens?.length || 0}`,
      ].join('\n'),
      type: 'info'
    }
  }

  if (cmd === 'address') {
    if (!wallet) return { output: 'No wallet initialized.', type: 'warning' }
    return { output: `Wallet: ${wallet.address}`, type: 'info' }
  }

  if (cmd === 'tokens') {
    if (!wallet || !wallet.tokens?.length) return { output: 'No tokens in wallet.', type: 'warning' }
    const lines = wallet.tokens.slice(0, 10).map(t =>
      `  ${t.id.slice(0, 8)}  ${t.metadata?.title?.padEnd(28) || ''.padEnd(28)} ${t.value.toLocaleString().padStart(8)}`
    )
    return {
      output: `TOKENS (${wallet.tokens.length})\n${'─'.repeat(50)}\n${lines.join('\n')}${wallet.tokens.length > 10 ? `\n  ...and ${wallet.tokens.length - 10} more` : ''}`,
      type: 'info'
    }
  }

  if (cmd === 'status') {
    const onlineNodes = 9
    return {
      output: [
        `⚡ INFINITY SPARK STATUS`,
        `${'─'.repeat(35)}`,
        `Portal:    ✅ ONLINE`,
        `Hub:       ✅ ONLINE`,
        `Market:    ✅ ONLINE`,
        `Trading:   ✅ ONLINE`,
        `Music Hub: ✅ ONLINE`,
        `Dashboard: ✅ ONLINE`,
        `Terminal:  ✅ ONLINE`,
        `${'─'.repeat(35)}`,
        `Network:   ${onlineNodes}/12 nodes active`,
        `Worlds:    ${websites.length} in ecosystem`,
        ``,
        `All systems operational.`,
      ].join('\n'),
      type: 'success'
    }
  }

  if (cmd === 'sparks') {
    return {
      output: [
        `SPARK NETWORK`,
        `${'─'.repeat(40)}`,
        `  💎 core      ✅ 8 connections`,
        `  🌐 hub       ✅ 12 connections`,
        `  💰 market    ✅ 6 connections`,
        `  🌀 portal    ✅ 9 connections`,
        `  🖥️  terminal  ✅ 4 connections`,
        `  🔐 vault     ✅ 5 connections`,
        `  📡 relay     ✅ 7 connections`,
        `  🔗 nexus     ✅ 10 connections`,
        `  🔥 forge     💤 idle`,
        `  🏭 mint      💤 idle`,
        `  🎨 studio    💤 idle`,
        `  🗼 beacon    ✅ 6 connections`,
        `${'─'.repeat(40)}`,
        `9/12 nodes online`,
      ].join('\n'),
      type: 'info'
    }
  }

  if (cmd === 'whoami') {
    if (!wallet) return { output: 'guest@infinity-spark', type: 'info' }
    return { output: `${wallet.address.slice(0, 8)}@infinity-spark`, type: 'info' }
  }

  if (cmd === 'date' || cmd === 'time') {
    return { output: new Date().toLocaleString(), type: 'info' }
  }

  if (cmd === 'echo' || base === 'echo') {
    return { output: parts.slice(1).join(' ') || '', type: 'info' }
  }

  return {
    output: `Command not found: "${base}". Type "help" for available commands.`,
    type: 'error'
  }
}

const AUTOCOMPLETE_COMMANDS = ['help', 'ls', 'ls --all', 'top', 'balance', 'tokens', 'address', 'status', 'sparks', 'hub', 'market', 'trade', 'music', 'dash', 'profile', 'wallet', 'clear']
const QUICK_COMMANDS = ['help', 'status', 'ls', 'top', 'balance', 'hub', 'market', 'music', 'clear']

export function TerminalView({ websites, wallet, onBack, onNavigate }: TerminalViewProps) {
  const [history, setHistory] = useKV<TerminalCommand[]>('infinity-terminal-history', [])
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = history || []

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [commands])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const result = processCommand(trimmed, websites, wallet, onNavigate)

    if (result.output === '__CLEAR__') {
      setHistory([])
      setInput('')
      setHistoryIndex(-1)
      return
    }

    const newCmd: TerminalCommand = {
      input: trimmed,
      output: result.output,
      timestamp: Date.now(),
      type: result.type,
    }

    setHistory(prev => [...(prev || []), newCmd])
    setInput('')
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, commands.length - 1)
      setHistoryIndex(newIndex)
      const cmd = commands[commands.length - 1 - newIndex]
      if (cmd) setInput(cmd.input)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      if (newIndex === -1) setInput('')
      else {
        const cmd = commands[commands.length - 1 - newIndex]
        if (cmd) setInput(cmd.input)
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const match = AUTOCOMPLETE_COMMANDS.find(c => c.startsWith(input.toLowerCase()))
      if (match) setInput(match)
    }
  }

  const typeColor: Record<TerminalCommand['type'], string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-muted-foreground',
    warning: 'text-yellow-400',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <TerminalIcon size={24} className="text-accent" />
            <span className="text-lg font-bold font-mono">Spark Terminal</span>
          </div>
          <div className="flex gap-2 text-xs font-mono text-muted-foreground">
            <span className="text-green-400">● connected</span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 flex flex-col"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex-1 bg-card/30 cosmic-border rounded-xl overflow-hidden flex flex-col">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b cosmic-border bg-card/50">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs font-mono text-muted-foreground">infinity-spark — terminal</span>
          </div>

          {/* Output area */}
          <div
            ref={bodyRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1 min-h-[400px] max-h-[60vh]"
          >
            <div className="text-accent font-bold">
              Welcome to Infinity Spark Terminal v1.0
            </div>
            <div className="text-muted-foreground text-xs">
              Type "help" for available commands. Use ↑↓ for history, Tab to autocomplete.
            </div>
            <div className="text-muted-foreground text-xs mb-4">
              ─────────────────────────────────────
            </div>

            {commands.map((cmd, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-accent">∞</span>
                  <span className="text-foreground/90">{cmd.input}</span>
                </div>
                {cmd.output && (
                  <pre className={`text-xs whitespace-pre-wrap pl-4 ${typeColor[cmd.type]}`}>
                    {cmd.output}
                  </pre>
                )}
              </div>
            ))}

            {/* Current input line */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-accent">∞</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-foreground font-mono text-sm caret-accent"
                placeholder="type a command..."
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Quick commands */}
          <div className="border-t cosmic-border px-4 py-3 flex flex-wrap gap-2">
            {QUICK_COMMANDS.map(cmd => (
              <button
                key={cmd}
                onClick={() => {
                  setInput(cmd)
                  setTimeout(() => {
                    const result = processCommand(cmd, websites, wallet, onNavigate)
                    if (result.output === '__CLEAR__') {
                      setHistory([])
                    } else {
                      setHistory(prev => [...(prev || []), {
                        input: cmd,
                        output: result.output,
                        timestamp: Date.now(),
                        type: result.type,
                      }])
                    }
                    setInput('')
                    inputRef.current?.focus()
                  }, 50)
                }}
                className="px-3 py-1 rounded font-mono text-xs cosmic-border bg-card/60 text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
