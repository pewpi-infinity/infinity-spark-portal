import { WorldArchetype } from './worldTypes'

export type WebsiteTheme = 'cosmic' | 'minimal' | 'editorial' | 'technical' | 'vibrant'

export type ToolPrimitive = 
  | 'video-player'
  | 'chart'
  | 'gallery'
  | 'timeline'
  | 'map'
  | 'dashboard'
  | 'store'
  | 'calculator'
  | 'text-editor'
  | 'calendar'
  | 'feed'
  | 'chat'
  | 'form'
  | 'table'
  | 'audio-player'
  | 'code-editor'
  | 'kanban'
  | 'search'
  | 'analytics'
  | 'content-hub'
  | 'time-travel-lab'
  | 'emotion-visualizer'
  | 'world-trading'

export interface ToolComponent {
  id: string
  type: ToolPrimitive
  title: string
  description: string
  config: Record<string, any>
  addedAt: number
  addedBy: string
}

export interface Collaborator {
  wallet: string
  role: 'owner' | 'editor' | 'viewer'
  addedAt: number
  addedBy: string
}

export interface Website {
  id: string
  tokenId: string
  title: string
  description: string
  query: string
  content: string
  url: string
  ownerWallet: string
  value: number
  createdAt: number
  lastModified: number
  pages: Page[]
  tools: ToolComponent[]
  theme: WebsiteTheme
  collaborators: Collaborator[]
  isListedForSale: boolean
  salePrice?: number
  worldArchetype?: WorldArchetype
  rarityMultiplier?: number
  slotCombination?: string
  uniquenessScore?: number
  activeBuildTime?: number
}

export interface Page {
  id: string
  title: string
  content: string
  tools: ToolComponent[]
  createdAt: number
  author: string
}

export interface Token {
  id: string
  websiteId: string
  websiteUrl: string
  ownerWallet: string
  value: number
  createdAt: number
  toolType?: string
  metadata: {
    title: string
    description: string
    query: string
    toolCount?: number
    worldArchetype?: WorldArchetype
    rarityMultiplier?: number
    uniquenessScore?: number
  }
}

export interface Wallet {
  address: string
  balance: number
  tokens: Token[]
  createdAt: number
  infinityBalance: number
}

export interface MarketplaceListing {
  id: string
  website: Website
  token: Token
  price: number
  seller: string
  listedAt: number
}

export interface Transaction {
  id: string
  type: 'purchase' | 'sale' | 'listing' | 'delisting' | 'trade'
  websiteId: string
  from: string
  to: string
  amount: number
  timestamp: number
  tradeDetails?: {
    offeredWebsiteId: string
    requestedWebsiteId: string
  }
}

export interface TradeOffer {
  id: string
  offeredWebsiteId: string
  requestedWebsiteId: string
  offerorWallet: string
  recipientWallet: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: number
  respondedAt?: number
  expiresAt: number
}

export type ViewMode = 'home' | 'website' | 'wallet' | 'marketplace' | 'builder' | 'trading' | 'music' | 'dashboard' | 'terminal' | 'profile'

export interface MusicTrack {
  id: string
  title: string
  artist: string
  album: string
  source: string
  duration: number
  genre: string
  addedAt: number
  addedBy?: string
}

export interface UserProfile {
  walletAddress: string
  displayName: string
  bio: string
  avatar: string
  joinedAt: number
  stats: {
    worldsCreated: number
    worldsPurchased: number
    tradesCompleted: number
    totalEarned: number
  }
}

export interface CartItem {
  websiteId: string
  price: number
  addedAt: number
}

export interface TerminalCommand {
  input: string
  output: string
  timestamp: number
  type: 'success' | 'error' | 'info' | 'warning'
}
