import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import { formatINR, buildAffiliateUrl } from '../utils/affiliate';
import { safeRedirect } from '../utils/security';

export default function AffiliateModal({ deal, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!deal) return null;

  const {
    title,
    store,
    originalPrice,
    glitchPrice,
    discountPercent,
    promoCode,
    productUrl,
    bankOffer,
    imageUrl
  } = deal;

  const affiliateUrl = buildAffiliateUrl(productUrl, store);

  console.log('ℹ️ [StealDeal Modal Rendered]', {
    dealId: deal.id,
    title,
    store,
    rawProductUrl: productUrl,
    finalAffiliateUrl: affiliateUrl
  });

  const handleCopyCode = () => {
    if (promoCode) {
      navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleProceedToStore = () => {
    console.log('👆 [StealDeal User Clicked Proceed to Store]', {
      dealTitle: title,
      targetAffiliateUrl: affiliateUrl
    });
    if (promoCode && !copied) {
      navigator.clipboard.writeText(promoCode);
    }
    safeRedirect(affiliateUrl);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          background: 'linear-gradient(180deg, #1A1F2B 0%, #0D0F12 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-glow)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Store Verification Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span className="badge-glitch" style={{ fontSize: '0.68rem' }}>
            <ShieldCheck size={12} /> VERIFIED STEAL DEAL
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Redirecting to {store}</span>
        </div>

        {/* Product Snippet */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <img src={imageUrl} alt={title} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.3, color: 'var(--text-main)' }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontWeight: 800, color: 'var(--primary-red)', fontSize: '1.1rem' }}>{formatINR(glitchPrice)}</span>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{formatINR(originalPrice)}</span>
              <span style={{ color: 'var(--accent-green)', fontSize: '0.78rem', fontWeight: 700 }}>({discountPercent}% OFF)</span>
            </div>
          </div>
        </div>

        {/* Step 1: Copy Promo Code */}
        {promoCode && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={12} color="var(--accent-amber)" /> Step 1: Apply Promo Code at Checkout
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 149, 0, 0.1)',
              border: '1px dashed rgba(255, 149, 0, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px'
            }}>
              <code style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-amber)', letterSpacing: '1px' }}>
                {promoCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', background: copied ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', color: '#FFF' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'COPIED!' : 'COPY CODE'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Bank Offer Note */}
        {bankOffer && (
          <div className="badge-bank" style={{ width: '100%', padding: '8px 12px', marginBottom: '20px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            💳 {bankOffer}
          </div>
        )}

        {/* Step 2: Proceed to Store CTA */}
        <button
          onClick={handleProceedToStore}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
        >
          <span>OPEN STORE & CLAIM DEAL</span>
          <ArrowRight size={18} />
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          🔒 Opens official {store} site with verified affiliate link protection.
        </div>

      </div>
    </div>
  );
}
