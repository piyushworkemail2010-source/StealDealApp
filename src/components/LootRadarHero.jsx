import React, { useState, useEffect } from 'react';
import { Flame, Clock, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/dealsData';

export default function LootRadarHero({ activeCategory, setActiveCategory }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val) => String(val).padStart(2, '0');

  return (
    <div style={{ margin: '20px 0 28px 0' }}>
      
      {/* Hero Live Radar Banner */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.12) 0%, rgba(255, 149, 0, 0.08) 50%, rgba(13, 15, 18, 0.8) 100%)',
        border: '1px solid rgba(255, 59, 48, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-glitch">
                <Flame size={14} /> LIVE LOOT RADAR
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> 100% Spam-Free • Verified Glitches
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.15, color: '#FFF' }}>
              India's #1 Instant <span style={{ color: 'var(--primary-red)' }}>Price Error</span> Radar
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '580px' }}>
              We track stacked coupon errors, historical price drops & bank instant discounts across Amazon, Flipkart, Myntra & top Indian stores.
            </p>
          </div>

          {/* Countdown & Stats Box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Clock size={12} color="var(--accent-amber)" /> Flash Window Ends In
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '2px' }}>
                {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </div>
            </div>

            <div style={{ height: '32px', width: '1px', background: 'var(--border-glass)' }}></div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Savings Today
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px' }}>
                ₹4,82,500+
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="hide-scrollbar" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflowX: 'auto',
        padding: '16px 4px 4px 4px'
      }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.88rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--primary-red)' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#FFF' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--primary-red)' : '1px solid var(--border-glass)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 14px rgba(255,59,48,0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {cat.includes('Price Glitches') && <Sparkles size={14} color="#FFF" />}
              {cat}
            </button>
          );
        })}
      </div>

    </div>
  );
}
