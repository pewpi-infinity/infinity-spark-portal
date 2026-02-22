import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Website, Wallet, Transaction, UserProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  User,
  Globe,
  Coin,
  ArrowsLeftRight,
  Storefront,
  PencilSimple,
  Check,
  X,
  Star,
  Trophy,
  Clock
} from '@phosphor-icons/react'

function generateAvatar(address: string): string {
  const emojis = ['🌀', '⚡', '💎', '🔥', '🌊', '🧲', '🔮', '🌟', '🎯', '🦋', '🚀', '👑']
  const index = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % emojis.length
  return emojis[index]
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

interface ProfileViewProps {
  websites: Website[]
  wallet: Wallet | null
  transactions: Transaction[]
  onBack: () => void
  onViewWebsite: (id: string) => void
}

export function ProfileView({ websites, wallet, transactions, onBack, onViewWebsite }: ProfileViewProps) {
  const [profile, setProfile] = useKV<UserProfile | null>('infinity-user-profile', null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')

  const currentProfile = profile || (wallet ? {
    walletAddress: wallet.address,
    displayName: `Spark_${wallet.address.slice(0, 6)}`,
    bio: 'Exploring the Infinity ecosystem.',
    avatar: generateAvatar(wallet.address),
    joinedAt: wallet.createdAt,
    stats: {
      worldsCreated: 0,
      worldsPurchased: 0,
      tradesCompleted: 0,
      totalEarned: 0,
    }
  } : null)

  const myWebsites = websites.filter(w => w.ownerWallet === wallet?.address)
  const myPurchases = transactions.filter(t => t.type === 'purchase' && t.from === wallet?.address)
  const myTrades = transactions.filter(t => t.type === 'trade' && (t.from === wallet?.address || t.to === wallet?.address))
  const myListings = transactions.filter(t => t.type === 'listing' && t.from === wallet?.address)

  const achievements = [
    { id: 'first-world', label: 'World Builder', desc: 'Created your first world', icon: '🌐', unlocked: myWebsites.length >= 1 },
    { id: 'five-worlds', label: 'Architect', desc: 'Created 5 worlds', icon: '🏗️', unlocked: myWebsites.length >= 5 },
    { id: 'first-purchase', label: 'Buyer', desc: 'Made your first purchase', icon: '💰', unlocked: myPurchases.length >= 1 },
    { id: 'first-trade', label: 'Trader', desc: 'Completed your first trade', icon: '🔄', unlocked: myTrades.length >= 1 },
    { id: 'first-listing', label: 'Merchant', desc: 'Listed a world for sale', icon: '🏷️', unlocked: myListings.length >= 1 },
    { id: 'rich', label: 'Wealthy', desc: 'Accumulated 5,000 ∞', icon: '👑', unlocked: (wallet?.infinityBalance || 0) >= 5000 },
    { id: 'collector', label: 'Collector', desc: 'Own 3 or more worlds', icon: '🎭', unlocked: myWebsites.length >= 3 },
    { id: 'veteran', label: 'Veteran', desc: 'Complete 10 transactions', icon: '⚔️', unlocked: transactions.filter(t => t.from === wallet?.address).length >= 10 },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  const startEdit = () => {
    setEditName(currentProfile?.displayName || '')
    setEditBio(currentProfile?.bio || '')
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!wallet) return
    setProfile({
      walletAddress: wallet.address,
      displayName: editName.trim() || currentProfile?.displayName || '',
      bio: editBio.trim() || '',
      avatar: currentProfile?.avatar || generateAvatar(wallet.address),
      joinedAt: currentProfile?.joinedAt || wallet.createdAt,
      stats: currentProfile?.stats || { worldsCreated: 0, worldsPurchased: 0, tradesCompleted: 0, totalEarned: 0 }
    })
    setIsEditing(false)
  }

  if (!wallet) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft size={20} />
              Back
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <User size={64} className="mx-auto text-muted-foreground" />
            <p className="text-lg font-semibold">No Profile Yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">Create a world to initialize your wallet and profile.</p>
            <Button onClick={onBack}>Create Your First World</Button>
          </div>
        </div>
      </div>
    )
  }

  const allActivity = [
    ...myWebsites.map(w => ({ label: `Created "${w.title}"`, time: w.createdAt, icon: '🌐', type: 'create' })),
    ...transactions
      .filter(t => t.from === wallet.address || t.to === wallet.address)
      .map(t => ({
        label: t.type === 'purchase' ? `Purchased world for ${t.amount} ∞`
          : t.type === 'sale' ? `Sold world for ${t.amount} ∞`
          : t.type === 'trade' ? 'Completed a trade'
          : t.type === 'listing' ? `Listed world for ${t.amount} ∞`
          : 'Transaction',
        time: t.timestamp,
        icon: t.type === 'purchase' ? '💰' : t.type === 'sale' ? '📤' : t.type === 'trade' ? '🔄' : '🏷️',
        type: t.type
      }))
  ].sort((a, b) => b.time - a.time).slice(0, 20)

  return (
    <div className="min-h-screen">
      <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <User size={24} className="text-accent" />
            <span className="text-lg font-bold">Profile</span>
          </div>
          <div />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Header */}
        <Card className="cosmic-border">
          <CardContent className="p-6">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="text-6xl">{currentProfile?.avatar}</div>
              <div className="flex-1 min-w-0 space-y-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      className="w-full bg-muted/30 cosmic-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent text-foreground"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Display name"
                      maxLength={40}
                    />
                    <textarea
                      className="w-full bg-muted/30 cosmic-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent text-foreground resize-none"
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      placeholder="Bio..."
                      rows={2}
                      maxLength={200}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} className="gap-1">
                        <Check size={14} /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="gap-1">
                        <X size={14} /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{currentProfile?.displayName}</h1>
                      <button onClick={startEdit} className="text-muted-foreground hover:text-accent transition-colors">
                        <PencilSimple size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentProfile?.bio}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <span>{wallet.address}</span>
                    </div>
                    {currentProfile?.joinedAt && (
                      <p className="text-xs text-muted-foreground">
                        Member since {new Date(currentProfile.joinedAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t cosmic-border">
              {[
                { label: 'Worlds', value: myWebsites.length, icon: <Globe size={16} className="text-violet-400" /> },
                { label: 'Balance', value: `${(wallet.infinityBalance || 0).toLocaleString()} ∞`, icon: <Coin size={16} className="text-accent" /> },
                { label: 'Trades', value: myTrades.length, icon: <ArrowsLeftRight size={16} className="text-blue-400" /> },
                { label: 'Achievements', value: `${unlockedCount}/${achievements.length}`, icon: <Trophy size={16} className="text-yellow-400" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="text-center space-y-1">
                  <div className="flex justify-center">{icon}</div>
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="worlds" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="worlds" className="gap-1">
              <Globe size={14} /> Worlds
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1">
              <Star size={14} /> Achievements
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1">
              <Clock size={14} /> Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="worlds">
            {myWebsites.length === 0 ? (
              <Card className="cosmic-border p-8 text-center">
                <Globe size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No worlds created yet</p>
                <Button onClick={onBack} className="mt-4" size="sm">Create Your First World</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myWebsites.map(w => (
                  <Card key={w.id} className="cosmic-border hover:border-accent/40 transition-colors cursor-pointer" onClick={() => onViewWebsite(w.id)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{w.title}</h3>
                        {w.isListedForSale && (
                          <Badge variant="outline" className="text-xs text-green-400 border-green-400/30 flex-shrink-0">
                            <Storefront size={10} className="mr-1" /> For Sale
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{w.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{w.tools?.length || 0} tools · {w.pages?.length || 0} pages</span>
                        <span className="text-accent font-semibold">{w.value.toLocaleString()} ∞</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map(a => (
                <Card key={a.id} className={`cosmic-border transition-all ${a.unlocked ? 'bg-card/60' : 'opacity-40'}`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="text-3xl">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{a.label}</p>
                        {a.unlocked && <Badge className="text-xs bg-accent/20 text-accent border-accent/30">Unlocked</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            {allActivity.length === 0 ? (
              <Card className="cosmic-border p-8 text-center">
                <Clock size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No activity yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {allActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg cosmic-border bg-card/40">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(item.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
