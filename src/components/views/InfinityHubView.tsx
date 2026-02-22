import { Website, Wallet } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Sparkle, Wallet as WalletIcon, Trophy, ArrowsLeftRight, Storefront, MusicNote, ChartBar, Terminal, User } from '@phosphor-icons/react'
import { WebsiteCard } from '@/components/WebsiteCard'
import { SlotMachine } from '@/components/SlotMachine'
import { Leaderboard } from '@/components/Leaderboard'
import { WorldArchetype } from '@/lib/worldTypes'

interface InfinityHubViewProps {
  websites: Website[]
  wallet: Wallet | null
  onBack: () => void
  onViewWebsite: (websiteId: string) => void
  onCreateWithSlot: (archetype: WorldArchetype, rarityMultiplier: number, slotCombination: string) => Promise<void>
  isCreating: boolean
  onNavigateTrading?: () => void
  onNavigateMarketplace?: () => void
  onNavigateMusic?: () => void
  onNavigateDashboard?: () => void
  onNavigateTerminal?: () => void
  onNavigateProfile?: () => void
}

export function InfinityHubView({ 
  websites, 
  wallet, 
  onBack, 
  onViewWebsite, 
  onCreateWithSlot,
  isCreating,
  onNavigateTrading,
  onNavigateMarketplace,
  onNavigateMusic,
  onNavigateDashboard,
  onNavigateTerminal,
  onNavigateProfile
}: InfinityHubViewProps) {
  const myWebsites = websites.filter(w => w.ownerWallet === wallet?.address)
  const sortedByValue = [...myWebsites].sort((a, b) => b.value - a.value)
  const topWebsites = sortedByValue.slice(0, 5)

  const handleSlotSpin = async (archetype: string, rarityMultiplier: number, combination: string) => {
    await onCreateWithSlot(archetype as WorldArchetype, rarityMultiplier, combination)
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft size={20} />
            Back to Entry
          </Button>

          <div className="flex items-center gap-3 flex-wrap">
            {onNavigateMarketplace && (
              <Button
                variant="outline"
                onClick={onNavigateMarketplace}
                className="gap-2 cosmic-border"
              >
                <Storefront size={20} />
                Marketplace
              </Button>
            )}
            {onNavigateTrading && (
              <Button
                variant="outline"
                onClick={onNavigateTrading}
                className="gap-2 cosmic-border"
              >
                <ArrowsLeftRight size={20} />
                World Trading
              </Button>
            )}
            {onNavigateMusic && (
              <Button
                variant="outline"
                onClick={onNavigateMusic}
                className="gap-2 cosmic-border"
              >
                <MusicNote size={20} />
                Music Hub
              </Button>
            )}
            {onNavigateDashboard && (
              <Button
                variant="outline"
                onClick={onNavigateDashboard}
                className="gap-2 cosmic-border"
              >
                <ChartBar size={20} />
                Dashboard
              </Button>
            )}
            {onNavigateTerminal && (
              <Button
                variant="outline"
                onClick={onNavigateTerminal}
                className="gap-2 cosmic-border"
              >
                <Terminal size={20} />
                Terminal
              </Button>
            )}
            {onNavigateProfile && (
              <Button
                variant="outline"
                onClick={onNavigateProfile}
                className="gap-2 cosmic-border"
              >
                <User size={20} />
                Profile
              </Button>
            )}
            {wallet && wallet.infinityBalance !== undefined && (
              <div className="flex items-center gap-4 px-4 py-2 cosmic-border rounded-lg bg-card/50">
                <WalletIcon size={24} className="text-accent" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="text-lg font-bold">{wallet.infinityBalance.toLocaleString()} ∞</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent">
              INFINITY HUB
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your created worlds, tokens minted, and neural creation tools
          </p>
        </div>

        <Tabs defaultValue="worlds" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="worlds">
              <Sparkle size={20} className="mr-2" />
              Worlds
            </TabsTrigger>
            <TabsTrigger value="tokens">
              <WalletIcon size={20} className="mr-2" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy size={20} className="mr-2" />
              Leaders
            </TabsTrigger>
            <TabsTrigger value="create">
              <Sparkle size={20} className="mr-2" />
              Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="worlds" className="mt-8">
            {myWebsites.length === 0 ? (
              <Card className="cosmic-border">
                <CardHeader>
                  <CardTitle>No Worlds Created Yet</CardTitle>
                  <CardDescription>
                    Return to the entry screen to search and create your first world, or use the Neural Slot Machine in the Create tab
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myWebsites.map(website => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    isOwned={true}
                    onView={() => onViewWebsite(website.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tokens" className="mt-8">
            <div className="grid gap-6">
              <Card className="cosmic-border">
                <CardHeader>
                  <CardTitle>Wallet Overview</CardTitle>
                  <CardDescription>Your token portfolio and total value</CardDescription>
                </CardHeader>
                <CardContent>
                  {wallet && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Total Tokens</div>
                          <div className="text-2xl font-bold">{wallet.tokens.length}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Total Value</div>
                          <div className="text-2xl font-bold">{wallet.balance.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Infinity Balance</div>
                          <div className="text-2xl font-bold">{wallet.infinityBalance.toLocaleString()} ∞</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Worlds Owned</div>
                          <div className="text-2xl font-bold">{myWebsites.length}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Top Value Worlds</h3>
                        {topWebsites.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No worlds created yet</p>
                        ) : (
                          <div className="space-y-2">
                            {topWebsites.map((website, index) => (
                              <div
                                key={website.id}
                                className="flex items-center justify-between p-3 cosmic-border rounded-lg cursor-pointer hover:bg-accent/10 transition-colors"
                                onClick={() => onViewWebsite(website.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}</div>
                                  <div>
                                    <div className="font-semibold">{website.title}</div>
                                    <div className="text-sm text-muted-foreground">{website.tools.length} tools</div>
                                  </div>
                                </div>
                                <div className="text-lg font-bold text-accent">
                                  {website.value.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-8">
            <Leaderboard websites={websites} onSelectWebsite={onViewWebsite} />
          </TabsContent>

          <TabsContent value="create" className="mt-8">
            <div className="flex flex-col items-center space-y-8">
              <Card className="cosmic-border max-w-2xl w-full">
                <CardHeader>
                  <CardTitle>Neural Slot Machine</CardTitle>
                  <CardDescription>
                    Your behavior influences the outcome - hover time, hesitation, and timing combine with emoji reels to create unique educational worlds
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <SlotMachine onSpin={handleSlotSpin} isSpinning={isCreating} />
                </CardContent>
              </Card>

              <div className="text-center space-y-2 max-w-md">
                <p className="text-sm text-muted-foreground">
                  Triple matches create the rarest worlds (3x value multiplier)
                </p>
                <p className="text-sm text-muted-foreground">
                  Paired matches create enhanced worlds (1.8x value multiplier)
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
