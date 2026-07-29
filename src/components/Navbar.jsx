import React from 'react';
import { Zap, Search, Bot, Download, Heart, ShieldCheck } from 'lucide-react';
import { sanitizeInput } from '../utils/security';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onOpenAiDrawer,
  onOpenWishlist,
  wishlistCount,
  onInstallPwa,
  canInstallPwa
}) {
  return (
    <nav className="glass-panel sticky-top" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-glass)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setSearchQuery('')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF3B30, #FF9500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255,59,48,0.4)'
          }}>
            <Zap size={24} color="#FFF" fill="#FFF" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Steal<span style={{ color: 'var(--primary-red)' }}>Deal</span>
              <span className="badge-glitch" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>PWA</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={11} color="var(--accent-green)" /> Zero Spam • Verified Glitches
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search deals, laptops, shoes, bank offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* AI StealBot Button */}
          <button
            onClick={onOpenAiDrawer}
            className="btn-secondary"
            style={{ borderColor: 'rgba(175, 82, 222, 0.4)', background: 'rgba(175, 82, 222, 0.1)', color: '#D084FF' }}
          >
            <Bot size={18} />
            <span style={{ display: 'none', md: 'inline' }}>StealBot AI</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="btn-secondary"
            style={{ position: 'relative', padding: '10px 12px' }}
            title="Wishlist"
          >
            <Heart size={18} color={wishlistCount > 0 ? '#FF3B30' : 'var(--text-muted)'} fill={wishlistCount > 0 ? '#FF3B30' : 'none'} />
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--primary-red)',
                color: '#FFF',
                fontSize: '0.68rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Install PWA Button */}
          {canInstallPwa && (
            <button onClick={onInstallPwa} className="btn-primary">
              <Download size={16} />
              <span>Install App</span>
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
