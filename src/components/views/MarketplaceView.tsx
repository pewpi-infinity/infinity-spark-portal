import { Website, Wallet, CartItem } from '@/lib/types'
import { WebsiteCard } from '@/components/WebsiteCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Storefront, Tag, ShoppingCart, Trash, CheckCircle } from '@phosphor-icons/react'

interface MarketplaceViewProps {
  websites: Website[]
  currentWallet: Wallet | null
  cart: CartItem[]
  onBack: () => void
  onViewWebsite: (websiteId: string) => void
  onPurchase: (websiteId: string) => void
  onAddToCart: (websiteId: string, price: number) => void
  onRemoveFromCart: (websiteId: string) => void
  onCheckoutCart: () => void
}

export function MarketplaceView({ websites, currentWallet, cart, onBack, onViewWebsite, onPurchase, onAddToCart, onRemoveFromCart, onCheckoutCart }: MarketplaceViewProps) {
  const forSaleWebsites = (websites || []).filter(w => w.isListedForSale && w.ownerWallet !== currentWallet?.address)
  const allOtherWebsites = (websites || []).filter(w => !w.isListedForSale && w.ownerWallet !== currentWallet?.address)
  const cartItems = cart || []
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const balance = currentWallet?.infinityBalance || 0
  const canAffordCart = balance >= cartTotal

  return (
    <div className="min-h-screen">
      <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          {cartItems.length > 0 && (
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-accent" />
              <Badge className="bg-accent text-accent-foreground">{cartItems.length}</Badge>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent via-secondary to-primary flex items-center justify-center">
              <Storefront size={32} weight="fill" className="text-background" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Trade ownership of live websites</p>
            </div>
          </div>

          <Card className="cosmic-border bg-primary/20 backdrop-blur-sm p-4">
            <p className="text-sm text-muted-foreground mb-1">
              Every website is a token backed by working tools. Trade using Infinity (∞). More tools = more value.
            </p>
            {currentWallet && currentWallet.infinityBalance !== undefined && (
              <p className="text-sm font-semibold text-accent">
                Your Balance: {currentWallet.infinityBalance.toLocaleString()} ∞
              </p>
            )}
          </Card>
        </div>

        {/* Cart Panel */}
        {cartItems.length > 0 && (
          <Card className="cosmic-border bg-accent/10 border-accent/30 mb-6 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-accent" />
                <span className="font-semibold text-sm">Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
              </div>
              <span className="text-sm font-bold text-accent">{cartTotal.toLocaleString()} ∞ total</span>
            </div>
            <div className="space-y-2 mb-3">
              {cartItems.map(item => {
                const site = websites.find(w => w.id === item.websiteId)
                return site ? (
                  <div key={item.websiteId} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{site.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-accent font-medium">{item.price.toLocaleString()} ∞</span>
                      <button onClick={() => onRemoveFromCart(item.websiteId)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ) : null
              })}
            </div>
            <Button
              onClick={onCheckoutCart}
              className="w-full gap-2 cosmic-glow"
              disabled={!canAffordCart}
            >
              <CheckCircle size={16} />
              {canAffordCart ? `Checkout — ${cartTotal.toLocaleString()} ∞` : `Insufficient Balance (need ${cartTotal.toLocaleString()} ∞)`}
            </Button>
          </Card>
        )}

        <Tabs defaultValue="for-sale" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="for-sale" className="gap-2">
              <Tag size={20} />
              For Sale ({forSaleWebsites.length})
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <Storefront size={20} />
              Browse All ({allOtherWebsites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="for-sale">
            {forSaleWebsites.length === 0 ? (
              <Card className="cosmic-border bg-card/80 backdrop-blur-sm p-12 text-center">
                <Tag size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No websites for sale</h3>
                <p className="text-muted-foreground mb-6">
                  Check back later or browse all websites
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forSaleWebsites.map((website) => {
                  const inCart = cartItems.some(i => i.websiteId === website.id)
                  return (
                    <div key={website.id} className="relative">
                      <WebsiteCard
                        website={website}
                        isOwned={false}
                        onView={() => onViewWebsite(website.id)}
                        onPurchase={() => onPurchase(website.id)}
                        showPurchase
                      />
                      <button
                        onClick={() => {
                          if (inCart) {
                            onRemoveFromCart(website.id)
                          } else if (website.salePrice != null && website.salePrice > 0) {
                            onAddToCart(website.id, website.salePrice)
                          }
                        }}
                        disabled={!inCart && (website.salePrice == null || website.salePrice <= 0)}
                        className={`absolute top-3 right-3 p-2 rounded-lg transition-all text-xs flex items-center gap-1 ${
                          inCart
                            ? 'bg-accent/20 border border-accent/50 text-accent'
                            : 'bg-card/80 cosmic-border text-muted-foreground hover:text-accent'
                        }`}
                      >
                        <ShoppingCart size={14} />
                        {inCart ? 'In Cart' : 'Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse">
            {allOtherWebsites.length === 0 ? (
              <Card className="cosmic-border bg-card/80 backdrop-blur-sm p-12 text-center">
                <Storefront size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No other websites yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to create and share a website
                </p>
                <Button onClick={onBack} className="cosmic-glow">
                  Create Your First Website
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allOtherWebsites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    isOwned={false}
                    onView={() => onViewWebsite(website.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
