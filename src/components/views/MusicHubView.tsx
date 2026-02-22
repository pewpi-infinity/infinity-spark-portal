import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { MusicTrack } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerLow,
  SpeakerNone,
  Shuffle,
  Repeat,
  MusicNote,
  Plus,
  Upload,
  Queue,
  Heart
} from '@phosphor-icons/react'
import { toast } from 'sonner'

const DEFAULT_TRACKS: MusicTrack[] = [
  { id: 'track-1', title: 'Cosmic Drift', artist: 'Octave System', album: 'Neural Waves', source: 'octave', duration: 187, genre: 'Ambient', addedAt: Date.now() - 86400000 * 7 },
  { id: 'track-2', title: 'Mario Overworld Remix', artist: 'MARIO-TOKENS', album: 'Pixel Legends', source: 'mario', duration: 142, genre: 'Chiptune', addedAt: Date.now() - 86400000 * 5 },
  { id: 'track-3', title: 'Infinity Pulse', artist: 'Spark Engine', album: 'Portal Sessions', source: 'portal', duration: 234, genre: 'Electronic', addedAt: Date.now() - 86400000 * 4 },
  { id: 'track-4', title: 'Underground Groove', artist: 'Jukebox Core', album: 'Deep Cuts', source: 'jukebox', duration: 198, genre: 'Hip-Hop', addedAt: Date.now() - 86400000 * 3 },
  { id: 'track-5', title: 'Nebula Rain', artist: 'Octave System', album: 'Neural Waves', source: 'octave', duration: 213, genre: 'Ambient', addedAt: Date.now() - 86400000 * 2 },
  { id: 'track-6', title: 'Crown Anthem', artist: 'Infinity Crown', album: 'Royal Sessions', source: 'crown', duration: 167, genre: 'Orchestral', addedAt: Date.now() - 86400000 },
  { id: 'track-7', title: 'Token Rush', artist: 'MARIO-TOKENS', album: 'Pixel Legends', source: 'mario', duration: 156, genre: 'Chiptune', addedAt: Date.now() - 3600000 * 12 },
  { id: 'track-8', title: 'Quantum Bass', artist: 'Jukebox Core', album: 'Deep Cuts', source: 'jukebox', duration: 221, genre: 'Electronic', addedAt: Date.now() - 3600000 * 6 },
]

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SOURCE_COLORS: Record<string, string> = {
  octave: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  mario: 'bg-red-500/20 text-red-300 border-red-500/30',
  jukebox: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  portal: 'bg-accent/20 text-accent border-accent/30',
  crown: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

const SOURCE_LABELS: Record<string, string> = {
  octave: '🧱 Octave',
  mario: '🎮 Mario',
  jukebox: '🎵 Jukebox',
  portal: '🌀 Portal',
  crown: '👑 Crown',
}

interface MusicHubViewProps {
  onBack: () => void
  walletAddress?: string
}

export function MusicHubView({ onBack, walletAddress }: MusicHubViewProps) {
  const [tracks, setTracks] = useKV<MusicTrack[]>('infinity-music-tracks', DEFAULT_TRACKS)
  const [likedTracks, setLikedTracks] = useKV<string[]>('infinity-liked-tracks', [])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'liked' | 'upload'>('library')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadArtist, setUploadArtist] = useState('')
  const [uploadGenre, setUploadGenre] = useState('')
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const trackList = tracks || DEFAULT_TRACKS
  const currentTrack = trackList[currentTrackIndex]
  const liked = likedTracks || []

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext()
            return 0
          }
          return prev + (100 / (currentTrack?.duration || 200))
        })
      }, 1000)
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [isPlaying, currentTrackIndex])

  const handlePlayPause = () => setIsPlaying(p => !p)

  const handleNext = () => {
    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * trackList.length))
    } else {
      setCurrentTrackIndex(i => (i + 1) % trackList.length)
    }
    setProgress(0)
  }

  const handlePrev = () => {
    if (progress > 10) {
      setProgress(0)
    } else {
      setCurrentTrackIndex(i => (i - 1 + trackList.length) % trackList.length)
      setProgress(0)
    }
  }

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index)
    setProgress(0)
    setIsPlaying(true)
  }

  const handleLike = (trackId: string) => {
    setLikedTracks(prev => {
      const current = prev || []
      if (current.includes(trackId)) {
        return current.filter(id => id !== trackId)
      }
      return [...current, trackId]
    })
  }

  const handleUpload = () => {
    if (!uploadTitle.trim() || !uploadArtist.trim()) {
      toast.error('Title and artist are required')
      return
    }
    const newTrack: MusicTrack = {
      id: `track-${Date.now()}`,
      title: uploadTitle.trim(),
      artist: uploadArtist.trim(),
      album: 'My Uploads',
      source: 'portal',
      duration: Math.floor(Math.random() * 180) + 120,
      genre: uploadGenre.trim() || 'Unknown',
      addedAt: Date.now(),
      addedBy: walletAddress,
    }
    setTracks(prev => [...(prev || DEFAULT_TRACKS), newTrack])
    setUploadTitle('')
    setUploadArtist('')
    setUploadGenre('')
    toast.success(`"${newTrack.title}" added to library!`)
  }

  const displayTracks = activeTab === 'liked'
    ? trackList.filter(t => liked.includes(t.id))
    : trackList

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b cosmic-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <MusicNote size={24} className="text-accent" />
            <span className="text-lg font-bold">Music Hub</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Now Playing */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="cosmic-border cosmic-glow">
            <CardContent className="p-6 space-y-6">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-secondary via-primary to-card flex items-center justify-center">
                <MusicNote size={80} weight="duotone" className="text-accent/60" />
              </div>

              {currentTrack && (
                <div className="text-center space-y-1">
                  <p className="text-lg font-bold truncate">{currentTrack.title}</p>
                  <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                  <Badge variant="outline" className={`text-xs ${SOURCE_COLORS[currentTrack.source] || ''}`}>
                    {SOURCE_LABELS[currentTrack.source] || currentTrack.source}
                  </Badge>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-1">
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  onValueChange={([val]) => setProgress(val)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(Math.floor((progress / 100) * (currentTrack?.duration || 0)))}</span>
                  <span>{formatDuration(currentTrack?.duration || 0)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsShuffle(s => !s)}
                  className={`p-2 rounded-lg transition-colors ${isShuffle ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Shuffle size={20} />
                </button>
                <button onClick={handlePrev} className="p-2 rounded-lg text-foreground hover:text-accent transition-colors">
                  <SkipBack size={24} weight="fill" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-4 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors cosmic-glow"
                >
                  {isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
                </button>
                <button onClick={handleNext} className="p-2 rounded-lg text-foreground hover:text-accent transition-colors">
                  <SkipForward size={24} weight="fill" />
                </button>
                <button
                  onClick={() => setIsRepeat(r => !r)}
                  className={`p-2 rounded-lg transition-colors ${isRepeat ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Repeat size={20} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <button onClick={() => setVolume(v => v === 0 ? 80 : 0)} className="text-muted-foreground hover:text-foreground">
                  {volume === 0 ? <SpeakerNone size={18} /> : volume < 50 ? <SpeakerLow size={18} /> : <SpeakerHigh size={18} />}
                </button>
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={([val]) => setVolume(val)}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="cosmic-border">
            <CardContent className="p-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-accent">{trackList.length}</p>
                <p className="text-xs text-muted-foreground">Total Tracks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{liked.length}</p>
                <p className="text-xs text-muted-foreground">Liked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{new Set(trackList.map(t => t.source)).size}</p>
                <p className="text-xs text-muted-foreground">Sources</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{new Set(trackList.map(t => t.genre)).size}</p>
                <p className="text-xs text-muted-foreground">Genres</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Track Library */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Nav */}
          <div className="flex gap-2">
            {(['library', 'liked', 'upload'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card cosmic-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'library' && <Queue size={16} />}
                {tab === 'liked' && <Heart size={16} />}
                {tab === 'upload' && <Upload size={16} />}
                {tab === 'library' ? 'Library' : tab === 'liked' ? 'Liked' : 'Add Track'}
              </button>
            ))}
          </div>

          {activeTab === 'upload' ? (
            <Card className="cosmic-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} />
                  Submit Track to Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Track Title *</label>
                  <input
                    className="w-full bg-muted/30 cosmic-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Enter track title..."
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Artist Name *</label>
                  <input
                    className="w-full bg-muted/30 cosmic-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Enter artist name..."
                    value={uploadArtist}
                    onChange={e => setUploadArtist(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Genre</label>
                  <input
                    className="w-full bg-muted/30 cosmic-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Electronic, Ambient, Hip-Hop..."
                    value={uploadGenre}
                    onChange={e => setUploadGenre(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpload} className="w-full cosmic-glow gap-2">
                  <Upload size={16} />
                  Add to Music Hub
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Tracks you submit appear in the shared library for all users
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {displayTracks.length === 0 ? (
                <Card className="cosmic-border p-8 text-center">
                  <Heart size={40} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No liked tracks yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Heart tracks in the library to see them here</p>
                </Card>
              ) : (
                displayTracks.map((track, index) => {
                  const libIndex = trackList.indexOf(track)
                  const isActive = libIndex === currentTrackIndex
                  const isLiked = liked.includes(track.id)
                  return (
                    <div
                      key={track.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group ${
                        isActive
                          ? 'bg-accent/15 cosmic-border border-accent/30'
                          : 'hover:bg-card/60 cosmic-border'
                      }`}
                      onClick={() => handleSelectTrack(libIndex)}
                    >
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        {isActive && isPlaying ? (
                          <div className="flex gap-0.5 items-end h-5">
                            {[1, 2, 3].map(i => (
                              <div
                                key={i}
                                className="w-1 bg-accent rounded-full animate-bounce"
                                style={{ height: `${40 + i * 20}%`, animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground group-hover:hidden">
                            {libIndex + 1}
                          </span>
                        )}
                        {!isActive && (
                          <Play size={16} className="hidden group-hover:block text-accent" weight="fill" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-accent' : ''}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist} · {track.album}</p>
                      </div>

                      <Badge variant="outline" className={`text-xs hidden sm:flex flex-shrink-0 ${SOURCE_COLORS[track.source] || ''}`}>
                        {SOURCE_LABELS[track.source] || track.source}
                      </Badge>

                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDuration(track.duration)}
                      </span>

                      <button
                        onClick={e => { e.stopPropagation(); handleLike(track.id) }}
                        className={`p-1 rounded transition-colors flex-shrink-0 ${isLiked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'}`}
                      >
                        <Heart size={16} weight={isLiked ? 'fill' : 'regular'} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
