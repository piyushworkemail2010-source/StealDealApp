import React from 'react';
import { Flame, ThumbsUp, AlertTriangle, ExternalLink, Heart, CheckCircle2, Shield } from 'lucide-react';
import { formatINR } from '../utils/affiliate';

export default function DealCard({
  deal,
  onOpenDealModal,
  onToggleWishlist,
  isWishlisted,
  onUpvote,
  onReportExpired
}) {
  const {
    id,
    title,
    store,
    storeLogo,
    originalPrice,
    glitchPrice,
    discountPercent,
    isPriceGlitch,
    bankOffer,
    verifiedCount,
    upvotes,
    expiredVotes,
    imageUrl,
    verifiedTime
  } = deal;

  const isExpired = expiredVotes >= 5;

  return (
    <div className="glass-card" style={{
      opacity: isExpired ? 0.6 : 1,
      filter: isExpired ? 'grayscale(0.8)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      
      {/* Top Media & Badges Overlay */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '58%', backgroundColor: '#000', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(13,15,18,0.9) 100%)'
        }}></div>

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Glitch or Discount Badge */}
          {isPriceGlitch ? (
            <span className="badge-glitch">
              <Flame size={12} /> PRICE ERROR {discountPercent}% OFF
            </span>
          ) : (
            <span className="badge-discount">
              {discountPercent}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(id); }}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Heart size={16} color={isWishlisted ? '#FF3B30' : '#FFF'} fill={isWishlisted ? '#FF3B30' : 'none'} />
          </button>
        </div>

        {/* Store Logo Tag */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(13, 15, 18, 0.85)',
          backdropFilter: 'blur(6px)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)' }}>{store}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>• {verifiedTime}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        
        <div>
          {/* Title */}
          <h3 style={{
            fontSize: '0.95rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            color: 'var(--text-main)',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            {title}
          </h3>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span className="price-current">{formatINR(glitchPrice)}</span>
            <span className="price-original">{formatINR(originalPrice)}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 700 }}>
              Save {formatINR(originalPrice - glitchPrice)}
            </span>
          </div>

          {/* Bank Offer Badge */}
          {bankOffer && (
            <div className="badge-bank" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={11} /> {bankOffer}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div>
          {/* Community Trust Counters */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginBottom: '12px',
            borderTop: '1px solid var(--border-glass)',
            paddingTop: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onUpvote(id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-green)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                <ThumbsUp size={13} /> {upvotes} Loot!
              </button>

              <span>•</span>

              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} color="var(--accent-green)" /> {verifiedCount} verified
              </span>
            </div>

            <button
              onClick={() => onReportExpired(id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '0.68rem'
              }}
              title="Flag if seller fixed the price"
            >
              Fixed? ({expiredVotes})
            </button>
          </div>

          {/* CTA Grab Deal Button */}
          {isExpired ? (
            <button disabled className="btn-secondary" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>
              Price Fixed by Seller
            </button>
          ) : (
            <button
              onClick={() => onOpenDealModal(deal)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              <span>GRAB DEAL</span>
              <ExternalLink size={15} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
