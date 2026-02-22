import { useMemo } from 'react'
import { Website, Wallet, Transaction } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ArrowLeft,
  ChartBar,
  Globe,
  Storefront,
  ArrowsLeftRight,
  Coin,
  Users,
  TrendUp,
  Lightning,
  Star,
  Clock
} from '@phosphor-icons/react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const SPARK_NODES = [
  { id: 'core', label: 'Core', icon: '💎', status: 'online', connections: 8 },
  { id: 'hub', label: 'Hub', icon: '🌐', status: 'online', connections: 12 },
  { id: 'market', label: 'Market', icon: '💰', status: 'online', connections: 6 },
  { id: 'portal', label: 'Portal', icon: '🌀', status: 'online', connections: 9 },
  { id: 'terminal', label: 'Terminal', icon: '🖥️', status: 'online', connections: 4 },
  { id: 'mint', label: 'Mint', icon: '🏭', status: 'idle', connections: 3 },
  { id: 'vault', label: 'Vault', icon: '🔐', status: 'online', connections: 5 },
  { id: 'relay', label: 'Relay', icon: '📡', status: 'online', connections: 7 },
  { id: 'forge', label: 'Forge', icon: '🔥', status: 'idle', connections: 2 },
  { id: 'beacon', label: 'Beacon', icon: '🗼', status: 'online', connections: 6 },
  { id: 'nexus', label: 'Nexus', icon: '🔗', status: 'online', connections: 10 },
  { id: 'studio', label: 'Studio', icon: '🎨', status: 'idle', connections: 3 },
]

const PIE_COLORS = ['#7c6af7', '#c084fc', '#f59e0b', '#34d399', '#60a5fa', '#f87171']

interface SparkDashboardViewProps {
  websites: Website[]
  wallet: Wallet | null
  transactions: Transaction[]
  onBack: () => void
  onNavigateMarketplace: () => void
  onNavigateTrading: () => void
}

export function SparkDashboardView({
  websites,
  wallet,
  transactions,
  onBack,
  onNavigateMarketplace,
  onNavigateTrading
}: SparkDashboardViewProps) {
  const stats = useMemo(() => {
    const total = websites.length
    const owned = websites.filter(w => w.ownerWallet === wallet?.address).length
    const forSale = websites.filter(w => w.isListedForSale).length
    const totalValue = websites.reduce((sum, w) => sum + w.value, 0)
    const totalTools = websites.reduce((sum, w) => sum + (w.tools?.length || 0), 0)
    const txVolume = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0)
    return { total, owned, forSale, totalValue, totalTools, txVolume }
  }, [websites, wallet, transactions])

  const toolDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    websites.forEach(w => {
      w.tools?.forEach(t => {
        counts[t.type] = (counts[t.type] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [websites])

  const activityData = useMemo(() => {
    const days: Record<string, number> = {}
    const now = Date.now()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      days[d.toLocaleDateString('en', { weekday: 'short' })] = 0
    }
    websites.forEach(w => {
      const d = new Date(w.createdAt)
      const key = d.toLocaleDateString('en', { weekday: 'short' })
      if (key in days) days[key]++
    })
    return Object.entries(days).map(([day, count]) => ({ day, count }))
  }, [websites])

  const recentActivity = useMemo(() => {
    const items: Array<{ label: string; time: number; icon: string; type: string }> = []
    websites.slice(0, 3).forEach(w => items.push({
      label: `World "${w.title}" created`,
      time: w.createdAt,
      icon: '🌐',
      type: 'create'
    }))
    transactions.slice(0, 3).forEach(t => items.push({
      label: t.type === 'purchase' ? `Purchase: ${t.amount} ∞` : t.type === 'trade' ? 'Trade completed' : `Listed for ${t.amount} ∞`,
      time: t.timestamp,
      icon: t.type === 'purchase' ? '💰' : t.type === 'trade' ? '🔄' : '🏷️',
      type: t.type
    }))
    return items.sort((a, b) => b.time - a.time).slice(0, 6)
  }, [websites, transactions])

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <div className="min-h-screen">
      <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <ChartBar size={24} className="text-accent" />
            <span className="text-lg font-bold">Spark Dashboard</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onNavigateMarketplace} className="gap-2 cosmic-border" size="sm">
              <Storefront size={16} />
              Market
            </Button>
            <Button variant="outline" onClick={onNavigateTrading} className="gap-2 cosmic-border" size="sm">
              <ArrowsLeftRight size={16} />
              Trade
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Worlds', value: stats.total, icon: <Globe size={20} />, color: 'text-violet-400' },
            { label: 'Your Worlds', value: stats.owned, icon: <Star size={20} />, color: 'text-accent' },
            { label: 'For Sale', value: stats.forSale, icon: <Storefront size={20} />, color: 'text-green-400' },
            { label: 'Total Value', value: `${(stats.totalValue / 1000).toFixed(1)}k`, icon: <Coin size={20} />, color: 'text-yellow-400' },
            { label: 'Tools Live', value: stats.totalTools, icon: <Lightning size={20} />, color: 'text-blue-400' },
            { label: 'Traded ∞', value: `${(stats.txVolume / 1000).toFixed(1)}k`, icon: <TrendUp size={20} />, color: 'text-pink-400' },
          ].map(({ label, value, icon, color }) => (
            <Card key={label} className="cosmic-border">
              <CardContent className="p-4 text-center space-y-1">
                <div className={`flex justify-center ${color}`}>{icon}</div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card className="cosmic-border">
            <CardHeader>
              <CardTitle className="text-sm">World Creation (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData}>
                  <XAxis dataKey="day" tick={{ fill: '#8b8b9e', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8b8b9e', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.04 270)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#e6e6f0' }}
                    itemStyle={{ color: '#c4b5fd' }}
                  />
                  <Bar dataKey="count" fill="oklch(0.55 0.2 285)" radius={[4, 4, 0, 0]} name="Worlds" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tool Distribution */}
          <Card className="cosmic-border">
            <CardHeader>
              <CardTitle className="text-sm">Tool Distribution</CardTitle>
              <CardDescription className="text-xs">Most used tool types across all worlds</CardDescription>
            </CardHeader>
            <CardContent>
              {toolDistribution.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  No tools created yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={toolDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {toolDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'oklch(0.18 0.02 260)', border: '1px solid oklch(0.25 0.04 270)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#e6e6f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {toolDistribution.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {toolDistribution.map(({ name }, i) => (
                    <div key={name} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spark Network */}
          <Card className="cosmic-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users size={16} />
                Spark Network
              </CardTitle>
              <CardDescription className="text-xs">{SPARK_NODES.filter(n => n.status === 'online').length} nodes online</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SPARK_NODES.map(node => (
                  <div
                    key={node.id}
                    className={`p-2 rounded-lg text-center transition-all cursor-default ${
                      node.status === 'online'
                        ? 'cosmic-border bg-card/60 hover:border-accent/50'
                        : 'opacity-40 cosmic-border'
                    }`}
                  >
                    <div className="text-lg">{node.icon}</div>
                    <div className="text-xs font-medium mt-1">{node.label}</div>
                    <div className={`text-xs mt-0.5 ${node.status === 'online' ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {node.status === 'online' ? `${node.connections} conn` : 'idle'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="cosmic-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={16} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No activity yet — create your first world!</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(item.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wallet Summary */}
        {wallet && (
          <Card className="cosmic-border bg-gradient-to-r from-primary/20 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Your Infinity Balance</p>
                  <p className="text-4xl font-bold text-accent">{wallet.infinityBalance?.toLocaleString() || 0} ∞</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{wallet.tokens?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Tokens</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{wallet.balance?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
