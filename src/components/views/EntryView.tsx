import { InfinitySearch } from '@/components/InfinitySearch'
import { Infinity, MusicNote, ChartBar, Terminal, User, Storefront } from '@phosphor-icons/react'

interface EntryViewProps {
  onSearch: (query: string) => Promise<void>
  onEnterInfinity: () => void
  isSearching: boolean
  onNavigateMusic?: () => void
  onNavigateDashboard?: () => void
  onNavigateTerminal?: () => void
  onNavigateMarketplace?: () => void
}

export function EntryView({ onSearch, onEnterInfinity, isSearching, onNavigateMusic, onNavigateDashboard, onNavigateTerminal, onNavigateMarketplace }: EntryViewProps) {
  const quickLinks = [
    { label: 'Music Hub', icon: <MusicNote size={18} weight="fill" />, onClick: onNavigateMusic, color: 'hover:border-violet-400/50 hover:text-violet-300' },
    { label: 'Dashboard', icon: <ChartBar size={18} weight="fill" />, onClick: onNavigateDashboard, color: 'hover:border-blue-400/50 hover:text-blue-300' },
    { label: 'Terminal', icon: <Terminal size={18} weight="fill" />, onClick: onNavigateTerminal, color: 'hover:border-green-400/50 hover:text-green-300' },
    { label: 'Marketplace', icon: <Storefront size={18} weight="fill" />, onClick: onNavigateMarketplace, color: 'hover:border-accent/50 hover:text-accent' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <button
        onClick={onEnterInfinity}
        className="absolute top-8 left-1/2 -translate-x-1/2 group transition-all duration-300 hover:scale-105"
        aria-label="Enter Infinity Hub"
      >
        <div className="flex items-center gap-3">
          <Infinity size={48} weight="bold" className="text-accent group-hover:animate-spin" />
          <span className="text-2xl font-bold tracking-tight text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            INFINITY
          </span>
        </div>
      </button>

      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center space-y-8">
          <InfinitySearch
            onSearch={onSearch}
            isLoading={isSearching}
            placeholder="Search to create..."
            size="large"
          />
          
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Search to create a world, or explore the ecosystem below
          </p>

          {/* Quick navigation to functional sections */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {quickLinks.map(({ label, icon, onClick, color }) => (
              <button
                key={label}
                onClick={onClick}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl cosmic-border bg-card/40 backdrop-blur-sm transition-all hover:bg-card/60 ${color} text-muted-foreground`}
              >
                {icon}
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onEnterInfinity}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent/10 cosmic-border border-accent/30 text-accent hover:bg-accent/20 transition-all text-sm font-medium"
          >
            <User size={16} />
            Enter Infinity Hub — Build Worlds
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
        Nothing up front — everything behind intent.
      </div>
    </div>
  )
}
