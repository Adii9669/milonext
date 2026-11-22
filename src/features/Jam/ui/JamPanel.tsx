'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  X,
  Radio,
  Search,
  Heart,
  Clock,
  Compass,
  Play,
  Pause,
  Loader2,
  Sparkles,
  Flame,
  ThumbsUp,
  Globe,
  Music2,
  ListMusic,
  ListPlus,
  SkipForward,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useJamStore } from '../store/useJamStore';
import { DEFAULT_STATIONS, POPULAR_TAGS } from '../data/defaultStations';
import { JamProviderId, Station } from '../types/jam';
import { EqualizerBars } from './EqualizerBars';
import { useJamStationSearch, useJamTrending, useJamTopVoted } from '../hooks/useJamQueries';
import { useProviderSearch, useProviderTrending } from '../hooks/useProviderQueries';
import { musicProviderRegistry } from '../providers/registry';
import { isJamEnabled } from '../utils/featureFlag';
import { filterPlayableStations, isHttpsPage } from '../utils/webPlayback';

function formatDuration(ms?: number): string | null {
  if (!ms || !Number.isFinite(ms)) return null;
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export const JamPanel: React.FC = () => {
  const isFeatureEnabled = isJamEnabled();

  const {
    isPanelOpen,
    closePanel,
    currentStation,
    playbackState,
    playQueue,
    playQueueIndex,
    playNext,
    addToQueue,
    removeFromQueue,
    queue,
    queueIndex,
    clearQueue,
    togglePlayPause,
    favorites,
    recentStations,
    toggleFavorite,
    isFavorite,
  } = useJamStore();

  const [activeTab, setActiveTab] = useState<'discover' | 'favorites' | 'recent'>('discover');
  const [discoverSection, setDiscoverSection] = useState<'curated' | 'trending' | 'top'>('curated');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [providerId, setProviderId] = useState<JamProviderId>('radio');
  const [isQueueExpanded, setIsQueueExpanded] = useState(false);

  const isRadio = providerId === 'radio';
  const activeProvider = isRadio ? undefined : musicProviderRegistry.get(providerId);
  const providers = useMemo(() => musicProviderRegistry.list(), []);

  const handleProviderChange = (id: JamProviderId) => {
    setProviderId(id);
    setSelectedTag('all');
    setSearchQuery('');
    setDebouncedQuery('');
    setDiscoverSection('curated');
  };

  // 300ms debounce on search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query parameters for live search. Provider catalogs search by text only.
  const isSearchActive = isRadio
    ? Boolean(debouncedQuery || (selectedTag !== 'all' && activeTab === 'discover'))
    : Boolean(debouncedQuery);

  const searchFilter = useMemo(
    () => ({
      name: debouncedQuery || undefined,
      tag: selectedTag !== 'all' ? selectedTag : undefined,
      limit: 30,
      order: 'clickcount' as const,
    }),
    [debouncedQuery, selectedTag]
  );

  // Queries
  const { data: searchResults, isLoading: isSearchLoading } = useJamStationSearch(
    searchFilter,
    isRadio && isPanelOpen && activeTab === 'discover' && isSearchActive
  );

  const { data: trendingStations, isLoading: isTrendingLoading } = useJamTrending(
    30,
    isRadio && isPanelOpen && activeTab === 'discover' && !isSearchActive && discoverSection === 'trending'
  );

  const { data: topVotedStations, isLoading: isTopVotedLoading } = useJamTopVoted(
    30,
    isRadio && isPanelOpen && activeTab === 'discover' && !isSearchActive && discoverSection === 'top'
  );

  // Phase 2 provider catalogs (Audius, Jamendo, ...)
  const providerEnabled =
    isPanelOpen && activeTab === 'discover' && !isRadio;

  const {
    data: providerSearchResults,
    isLoading: isProviderSearchLoading,
    error: providerSearchError,
  } = useProviderSearch(providerId, debouncedQuery, providerEnabled);

  const {
    data: providerTrending,
    isLoading: isProviderTrendingLoading,
    error: providerTrendingError,
  } = useProviderTrending(providerId, providerEnabled && !debouncedQuery);

  // Computed stations list — HTTP-only streams are hidden on HTTPS pages.
  const displayedStations = useMemo(() => {
    let stations: Station[];

    if (activeTab === 'favorites') {
      stations = favorites;
      if (debouncedQuery) {
        stations = stations.filter(
          (s) =>
            s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            (s.tags || []).some((t) => t.toLowerCase().includes(debouncedQuery.toLowerCase()))
        );
      }
    } else if (activeTab === 'recent') {
      stations = recentStations;
      if (debouncedQuery) {
        stations = stations.filter(
          (s) =>
            s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            (s.tags || []).some((t) => t.toLowerCase().includes(debouncedQuery.toLowerCase()))
        );
      }
    } else if (!isRadio) {
      // Provider catalogs (Phase 2) — no curated fallback, show real results only.
      stations = debouncedQuery
        ? providerSearchResults || []
        : providerTrending || [];
    } else if (isSearchActive) {
      stations = searchResults || DEFAULT_STATIONS;
    } else if (discoverSection === 'trending') {
      stations = trendingStations || DEFAULT_STATIONS;
    } else if (discoverSection === 'top') {
      stations = topVotedStations || DEFAULT_STATIONS;
    } else {
      stations = DEFAULT_STATIONS;
    }

    return filterPlayableStations(stations);
  }, [
    activeTab,
    debouncedQuery,
    favorites,
    recentStations,
    isSearchActive,
    isRadio,
    searchResults,
    discoverSection,
    trendingStations,
    topVotedStations,
    providerSearchResults,
    providerTrending,
  ]);

  const isDataLoading =
    activeTab === 'discover' &&
    (isRadio
      ? (isSearchActive && isSearchLoading) ||
        (!isSearchActive && discoverSection === 'trending' && isTrendingLoading) ||
        (!isSearchActive && discoverSection === 'top' && isTopVotedLoading)
      : debouncedQuery
        ? isProviderSearchLoading
        : isProviderTrendingLoading);

  const providerError = providerSearchError || providerTrendingError;

  if (!isFeatureEnabled || !isPanelOpen) {
    return null;
  }

  return (
    <>
      {/* Dimmed backdrop to focus attention and allow click-to-close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] transition-opacity cursor-pointer animate-in fade-in duration-200"
        onClick={closePanel}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Onechat Jam Radio Player"
        className="fixed inset-y-0 right-0 z-[100] w-full sm:w-[420px] bg-[#101012] border-l border-[#25252B] shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right"
      >
      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="h-14 px-3 sm:px-4 border-b border-[#25252B] flex items-center justify-between shrink-0 bg-[#17171B] pt-safe">
        <div className="flex items-center gap-2">
          {/* Mobile Back button */}
          <button
            type="button"
            onClick={closePanel}
            className="flex items-center gap-1 text-[#A78BFA] sm:hidden p-1.5 -ml-1 rounded-lg hover:bg-[#25252B] active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-[#242036] text-[#A78BFA] flex items-center justify-center border border-[#6E53CC]/30 shrink-0">
            <Radio size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#F4F4F5] tracking-tight">Onechat Jam</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#6E53CC]/15 text-[#A78BFA] border border-[#6E53CC]/30">
                {isRadio ? 'Radio' : activeProvider?.shortLabel || 'Music'}
              </span>
            </div>
            <p className="text-[11px] text-[#71717A] truncate max-w-[200px] sm:max-w-none">
              {isRadio
                ? 'Free background stations while chatting'
                : `Streaming the ${activeProvider?.name || 'provider'} catalog`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closePanel}
          className="w-8 h-8 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B] flex items-center justify-center transition-colors cursor-pointer"
          title="Close Jam Panel"
          aria-label="Close"
        >
          <X size={17} />
        </button>
      </div>

      {/* ── Search & Filter Controls ───────────────────────────── */}
      <div className="p-3 border-b border-[#25252B] space-y-2.5 bg-[#101012] shrink-0">
        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isRadio
                ? 'Search stations, genres, country...'
                : `Search ${activeProvider?.name || 'music'}...`
            }
            className="w-full pl-8.5 pr-8 py-2 rounded-lg bg-[#18181C] border border-[#25252B] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#6E53CC] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#71717A] hover:text-[#F4F4F5]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Catalog Providers (Radio + Phase 2 music services) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => handleProviderChange('radio')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
              isRadio
                ? 'bg-[#6E53CC] text-white'
                : 'bg-[#18181C] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#25252B]'
            }`}
            title="Internet radio stations"
          >
            <Radio size={11} />
            Radio
          </button>

          {providers.map((provider) => {
            const isActive = providerId === provider.id;
            return (
              <button
                key={provider.id}
                type="button"
                disabled={!provider.isAvailable}
                onClick={() => handleProviderChange(provider.id)}
                title={provider.unavailableReason || provider.name}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#6E53CC] text-white'
                    : provider.isAvailable
                      ? 'bg-[#18181C] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#25252B]'
                      : 'bg-[#141416] text-[#52525B] border border-[#25252B] cursor-not-allowed'
                }`}
              >
                <Music2 size={11} />
                {provider.shortLabel}
                {!provider.isAvailable && (
                  <span className="text-[9px] px-1 rounded bg-[#25252B] text-[#71717A]">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Tabs (Discover / Favorites / Recent) */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#17171B] border border-[#25252B]">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'discover'
                ? 'bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/30 shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <Compass size={13} />
            <span>Discover</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/30 shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <Heart size={13} />
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="text-[10px] px-1 rounded-full bg-[#6E53CC]/20 text-[#A78BFA]">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recent')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'recent'
                ? 'bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/30 shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
            }`}
          >
            <Clock size={13} />
            <span>Recent</span>
          </button>
        </div>

        {/* Discover Sub-Sections (Curated / Trending / Top Voted) — radio only */}
        {isRadio && activeTab === 'discover' && !isSearchActive && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDiscoverSection('curated')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                discoverSection === 'curated'
                  ? 'bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/30'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
              }`}
            >
              <Sparkles size={11} />
              Curated
            </button>

            <button
              type="button"
              onClick={() => setDiscoverSection('trending')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                discoverSection === 'trending'
                  ? 'bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/30'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
              }`}
            >
              <Flame size={11} />
              Trending
            </button>

            <button
              type="button"
              onClick={() => setDiscoverSection('top')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                discoverSection === 'top'
                  ? 'bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/30'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
              }`}
            >
              <ThumbsUp size={11} />
              Top Voted
            </button>
          </div>
        )}

        {/* Genre Tags Scrollable Chips — radio only */}
        {isRadio && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {POPULAR_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap capitalize transition-colors ${
                    isSelected
                      ? 'bg-[#6E53CC] text-white'
                      : 'bg-[#18181C] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#25252B]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Play Queue ─────────────────────────────────────────── */}
      {queue.length > 1 && (
        <>
          <div className="px-3 py-2 border-b border-[#25252B] bg-[#101012] flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setIsQueueExpanded((expanded) => !expanded)}
              className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
              title={isQueueExpanded ? 'Collapse queue' : 'Expand queue'}
              aria-expanded={isQueueExpanded}
            >
              <ListMusic size={13} className="text-[#A78BFA]" />
              <span>Up next</span>
              <span className="font-mono text-[#71717A]">
                {queueIndex + 1}/{queue.length}
              </span>
              {isQueueExpanded ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={playNext}
                className="px-2 py-1 rounded-md text-[11px] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B] transition-colors"
                title="Skip to next track"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => {
                  clearQueue();
                  setIsQueueExpanded(false);
                }}
                className="px-2 py-1 rounded-md text-[11px] text-[#71717A] hover:text-rose-400 hover:bg-[#25252B] transition-colors"
                title="Clear the play queue"
              >
                Clear
              </button>
            </div>
          </div>

          {isQueueExpanded && (
            <div className="px-2 py-1.5 border-b border-[#25252B] bg-[#101012] space-y-0.5 max-h-44 overflow-y-auto shrink-0 scrollbar-thin">
              {queue.map((station, index) => {
                const isCurrent = index === queueIndex;
                return (
                  <div
                    key={`${station.id}-${index}`}
                    className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md ${
                      isCurrent ? 'bg-[#242036]' : 'hover:bg-[#18181C]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => playQueueIndex(index)}
                      className="flex-1 min-w-0 flex items-center gap-2 text-left"
                      title={`Play ${station.name}`}
                    >
                      <span
                        className={`w-4 shrink-0 font-mono text-[10px] ${
                          isCurrent ? 'text-[#A78BFA]' : 'text-[#71717A]'
                        }`}
                      >
                        {isCurrent ? '▶' : index + 1}
                      </span>
                      <span
                        className={`truncate text-[11px] ${
                          isCurrent
                            ? 'font-semibold text-[#A78BFA]'
                            : 'text-[#D4D4D8]'
                        }`}
                      >
                        {station.name}
                      </span>
                      {station.artist && (
                        <span className="truncate text-[10px] text-[#71717A] hidden sm:inline">
                          {station.artist}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(station.id)}
                      className="p-1 rounded text-[#52525B] hover:text-rose-400 hover:bg-[#25252B] transition-colors"
                      title={`Remove ${station.name} from queue`}
                      aria-label="Remove from queue"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Station List ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0 scrollbar-thin">
        {isDataLoading ? (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <Loader2 size={24} className="text-[#A78BFA] animate-spin mb-2" />
            <p className="text-xs text-[#A1A1AA]">Finding stations...</p>
          </div>
        ) : displayedStations.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center px-4">
            {isRadio ? (
              <Radio size={28} className="text-[#3F3F46] mb-2" />
            ) : (
              <Music2 size={28} className="text-[#3F3F46] mb-2" />
            )}
            <p className="text-xs font-medium text-[#A1A1AA]">
              {isRadio ? 'No stations found' : `No ${activeProvider?.shortLabel} tracks found`}
            </p>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              {activeTab === 'favorites'
                ? 'Click the heart icon on any station to save it here.'
                : providerError
                  ? providerError instanceof Error
                    ? providerError.message
                    : 'The provider is unavailable right now.'
                  : isRadio
                    ? isHttpsPage()
                      ? 'Only HTTPS streams can play on this page. Try another search or a music provider.'
                      : 'Try adjusting your search query or genre filter.'
                    : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          displayedStations.map((station, index) => {
            const isCurrent = currentStation?.id === station.id;
            const isPlaying = isCurrent && playbackState === 'playing';
            const isLoading = isCurrent && playbackState === 'loading';
            const favorited = isFavorite(station.id);
            const isProviderTrack = Boolean(
              station.provider && station.provider !== 'radio'
            );
            const duration = formatDuration(station.durationMs);

            return (
              <div
                key={station.id}
                onClick={() => {
                  if (isCurrent) {
                    togglePlayPause();
                  } else {
                    playQueue(displayedStations, index);
                  }
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#242036]/80 border-[#6E53CC]/50 shadow-sm'
                    : 'bg-[#17171B]/70 border-[#25252B] hover:bg-[#18181C] hover:border-[#6E53CC]/30'
                }`}
              >
                {/* Station Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#18181C] border border-[#25252B] flex-shrink-0 flex items-center justify-center">
                    {station.favicon ? (
                      <img
                        src={station.favicon}
                        alt={station.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#242036] text-[#A78BFA] font-bold text-xs">
                        {station.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <EqualizerBars isPlaying={true} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-xs font-semibold truncate ${
                          isCurrent ? 'text-[#A78BFA]' : 'text-[#F4F4F5]'
                        }`}
                      >
                        {station.name}
                      </p>
                      {station.isDefault && (
                        <span className="shrink-0 text-[9px] px-1 py-0.2 rounded bg-[#25252B] text-[#A1A1AA]">
                          Curated
                        </span>
                      )}
                      {station.provider && station.provider !== 'radio' && (
                        <span className="shrink-0 text-[9px] px-1.5 py-0.2 rounded bg-[#242036] text-[#A78BFA] border border-[#6E53CC]/30 font-medium capitalize">
                          {station.provider}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#71717A] truncate">
                      {isProviderTrack ? (
                        <>
                          <span className="truncate">
                            {station.artist || 'Unknown artist'}
                          </span>
                          <span>•</span>
                          <span className="truncate text-[#A1A1AA]">
                            {(station.tags || [])[0] || 'Music'}
                          </span>
                          {duration && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px]">
                                {duration}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span>{station.country || 'Global'}</span>
                          <span>•</span>
                          <span className="truncate">
                            {(station.tags || []).slice(0, 2).join(', ') || 'Music'}
                          </span>
                          {station.bitrate ? (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-[#A1A1AA]">
                                {station.bitrate}k
                              </span>
                            </>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Heart + Play */}
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => toggleFavorite(station)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorited
                        ? 'text-rose-500 hover:text-rose-400'
                        : 'text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#25252B]'
                    }`}
                    title={favorited ? 'Remove favorite' : 'Add to favorites'}
                  >
                    <Heart size={15} fill={favorited ? 'currentColor' : 'none'} />
                  </button>

                  {isProviderTrack && (
                    <button
                      type="button"
                      onClick={() => addToQueue(station)}
                      className="p-2 rounded-lg text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#25252B] transition-colors"
                      title="Add to queue"
                      aria-label="Add to queue"
                    >
                      <ListPlus size={15} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (isCurrent) {
                        togglePlayPause();
                      } else {
                        playQueue(displayedStations, index);
                      }
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      isCurrent && isPlaying
                        ? 'bg-[#6E53CC] text-white shadow-md shadow-purple-500/20'
                        : 'bg-[#18181C] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#25252B] border border-[#25252B]'
                    }`}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isLoading ? (
                      <Loader2 size={15} className="animate-spin text-[#A78BFA]" />
                    ) : isPlaying ? (
                      <Pause size={15} />
                    ) : (
                      <Play size={15} className="ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="p-3 border-t border-[#25252B] bg-[#17171B] text-center shrink-0">
        <p className="text-[11px] text-[#71717A] flex items-center justify-center gap-1.5">
          <Globe size={12} className="text-[#A78BFA]" />
          {isRadio
            ? 'Powered by community Radio Browser API & verified streams'
            : `Streaming via the ${activeProvider?.name || 'provider'} public API`}
        </p>
      </div>
      </div>
    </>
  );
};
