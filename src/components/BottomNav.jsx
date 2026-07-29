import React from 'react';
import { Home, Flame, Bot, Heart } from 'lucide-react';

export default function BottomNav({
  activeCategory,
  setActiveCategory,
  onOpenAiDrawer,
  onOpenWishlist,
  wishlistCount
}) {
  return (
    <div className="glass-panel" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 90,
      borderTop: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '8px 0',
      background: 'rgba(13, 15, 18, 0.92)',
      backdropFilter: 'blur(16px)'
    }}>
      
      {/* Home Button */}
      <button
        onClick={() => setActiveCategory('All Deals 🔥')}
        style={{
          background: 'none',
          border: 'none',
          color: activeCategory === 'All Deals 🔥' ? 'var(--primary-red)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          fontSize: '0.7rem',
          fontWeight: activeCategory === 'All Deals 🔥' ? 700 : 500,
          cursor: 'pointer'
        }}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      {/* Price Glitches Button */}
      <button
        onClick={() => setActiveCategory('🚨 Price Glitches')}
        style={{
          background: 'none',
          border: 'none',
          color: activeCategory === '🚨 Price Glitches' ? 'var(--primary-red)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          fontSize: '0.7rem',
          fontWeight: activeCategory === '🚨 Price Glitches' ? 700 : 500,
          cursor: 'pointer'
        }}
      >
        <Flame size={20} />
        <span>Glitches</span>
      </button>

      {/* AI Copilot Button */}
      <button
        onClick={onOpenAiDrawer}
        style={{
          background: 'none',
          border: 'none',
          color: '#AF52DE',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          fontSize: '0.7rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        <Bot size={20} />
        <span>StealBot AI</span>
      </button>

      {/* Wishlist Button */}
      <button
        onClick={onOpenWishlist}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          fontSize: '0.7rem',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        <Heart size={20} />
        <span>Wishlist</span>
        {wishlistCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '12px',
            background: 'var(--primary-red)',
            color: '#FFF',
            fontSize: '0.6rem',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {wishlistCount}
          </span>
        )}
      </button>

    </div>
  );
}
