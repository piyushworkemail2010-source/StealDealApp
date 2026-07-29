import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LootRadarHero from './components/LootRadarHero';
import DealCard from './components/DealCard';
import AffiliateModal from './components/AffiliateModal';
import StealBotDrawer from './components/StealBotDrawer';
import BottomNav from './components/BottomNav';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { INITIAL_DEALS } from './data/dealsData';
import { sanitizeInput } from './utils/security';
import { fetchLiveDeals } from './services/aiService';
import { Tag, Sparkles } from 'lucide-react';

export default function App() {
  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem('stealdeal_deals');
    let loaded = saved ? JSON.parse(saved) : INITIAL_DEALS;
    
    // Purge old cached deal items containing outdated test ASINs
    const seenTitles = new Set();
    const cleanDeals = [];

    for (const d of loaded) {
      if (d.id && d.id.startsWith('deal-')) continue;
      if (d.productUrl && (d.productUrl.includes('B0CX58C56K') || d.productUrl.includes('B0CY5N6G1P') || d.productUrl.includes('B0CY5Q2C46'))) {
        console.log('🧹 [App Cache Purge] Dropping stale deal card:', d.title, d.productUrl);
        continue; // Purge outdated ASIN cards
      }

      const titleSlug = d.title ? d.title.toLowerCase().trim() : '';
      if (!titleSlug || seenTitles.has(titleSlug)) continue;

      seenTitles.add(titleSlug);
      cleanDeals.push(d);
    }

    console.log('🏁 [App Initialized Deals State]', cleanDeals);
    return cleanDeals;
  });

  const [activeCategory, setActiveCategory] = useState('All Deals 🔥');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('stealdeal_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDealModal, setSelectedDealModal] = useState(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isWishlistOnlyView, setIsWishlistOnlyView] = useState(false);

  // Live Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);

  // Listen for PWA Install Prompt event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Sync live AI deals on initial load
  useEffect(() => {
    handleSyncLiveDeals();
  }, []);

  // Save deals and wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('stealdeal_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('stealdeal_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Live Deal Sync Handler (Deduplicated by title and id)
  const handleSyncLiveDeals = async () => {
    setIsSyncing(true);
    try {
      console.log('🔄 [App Syncing Live Deals...]');
      const liveDeals = await fetchLiveDeals();
      console.log('✨ [App Live Deals Received]', liveDeals);

      if (liveDeals && liveDeals.length > 0) {
        setDeals(prev => {
          const existingTitles = new Set(prev.map(d => d.title.toLowerCase().trim()));
          const existingIds = new Set(prev.map(d => d.id));
          const newItems = liveDeals.filter(d => {
            const titleKey = d.title ? d.title.toLowerCase().trim() : '';
            return !existingIds.has(d.id) && !existingTitles.has(titleKey);
          });
          console.log(`➕ [App Prepending ${newItems.length} New Live Deals]`, newItems);
          return [...newItems, ...prev];
        });
      }
    } catch (e) {
      console.warn('Failed to sync live deals', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Install PWA Handler
  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPwaPrompt(false);
    }
    setDeferredPrompt(null);
  };

  // Upvote deal handler
  const handleUpvote = (id) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, upvotes: d.upvotes + 1 } : d));
  };

  // Report expired deal handler
  const handleReportExpired = (id) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, expiredVotes: d.expiredVotes + 1 } : d));
  };

  // Toggle wishlist handler
  const handleToggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Filter deals based on Search, Category, and Wishlist mode
  const filteredDeals = deals.filter(deal => {
    if (isWishlistOnlyView && !wishlist.includes(deal.id)) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = deal.title.toLowerCase().includes(q);
      const storeMatch = deal.store.toLowerCase().includes(q);
      const categoryMatch = deal.category.toLowerCase().includes(q);
      if (!titleMatch && !storeMatch && !categoryMatch) return false;
    }

    // Category filter
    if (activeCategory === '🚨 Price Glitches') return deal.isPriceGlitch;
    if (activeCategory === 'Under ₹999') return deal.glitchPrice <= 999;
    if (activeCategory !== 'All Deals 🔥' && !activeCategory.startsWith('🚨')) {
      return deal.category.toLowerCase() === activeCategory.toLowerCase();
    }

    return true;
  });

  return (
    <div>
      {/* Schema.org Product JSON-LD for Google SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": deals.map((d, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": d.title,
              "image": d.imageUrl,
              "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "price": d.glitchPrice,
                "availability": "https://schema.org/InStock"
              }
            }
          }))
        })}
      </script>

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onOpenWishlist={() => setIsWishlistOnlyView(!isWishlistOnlyView)}
        wishlistCount={wishlist.length}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={!!deferredPrompt}
      />

      {/* App Body Container */}
      <main className="app-container">
        
        {/* Hero Section */}
        {!isWishlistOnlyView && (
          <LootRadarHero
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onSyncLiveDeals={handleSyncLiveDeals}
            isSyncing={isSyncing}
          />
        )}

        {/* Section Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isWishlistOnlyView ? '❤️ Saved Wishlist Deals' : activeCategory}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              ({filteredDeals.length} items)
            </span>
          </h2>

          {isWishlistOnlyView && (
            <button onClick={() => setIsWishlistOnlyView(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              View All Deals
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--radius-lg)' }}>
            <Sparkles size={48} color="var(--accent-amber)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#FFF' }}>No deals found for this filter</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Try searching for "headphones", "laptops", or switch back to "All Deals 🔥".
            </p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('All Deals 🔥'); setIsWishlistOnlyView(false); }} className="btn-primary" style={{ marginTop: '16px' }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Deal Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredDeals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              onOpenDealModal={(d) => {
                console.log('📌 [User Clicked Deal Modal]', d);
                setSelectedDealModal(d);
              }}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlist.includes(deal.id)}
              onUpvote={handleUpvote}
              onReportExpired={handleReportExpired}
            />
          ))}
        </div>

      </main>

      {/* Affiliate Link Popup Modal */}
      {selectedDealModal && (
        <AffiliateModal
          deal={selectedDealModal}
          onClose={() => setSelectedDealModal(null)}
        />
      )}

      {/* StealBot AI Drawer */}
      <StealBotDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        deals={deals}
        onSelectDeal={(d) => setSelectedDealModal(d)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeCategory={activeCategory}
        setActiveCategory={(cat) => { setActiveCategory(cat); setIsWishlistOnlyView(false); }}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onOpenWishlist={() => setIsWishlistOnlyView(true)}
        wishlistCount={wishlist.length}
      />

      {/* PWA Install Floating Banner */}
      {showPwaPrompt && (
        <PwaInstallPrompt
          onInstall={handleInstallPwa}
          onDismiss={() => setShowPwaPrompt(false)}
        />
      )}

    </div>
  );
}
