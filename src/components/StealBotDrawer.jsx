import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, ShieldCheck, ThumbsUp, ArrowRight, CornerDownRight } from 'lucide-react';
import { askStealBot } from '../services/aiService';
import { formatINR } from '../utils/affiliate';

export default function StealBotDrawer({ isOpen, onClose, deals, onSelectDeal }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  if (!isOpen) return null;

  const handleAskAi = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    const result = await askStealBot(prompt, deals);
    setAiResult(result);
    setLoading(false);
  };

  const samplePrompts = [
    'Find gaming accessories under ₹2,000',
    'Show me headphones with biggest price error',
    'Best deal for birthday gift under ₹5,000'
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          background: 'linear-gradient(180deg, #161A22 0%, #0D0F12 100%)',
          borderLeft: '1px solid var(--border-glow)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.6)',
          animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(175, 82, 222, 0.2)', border: '1px solid rgba(175, 82, 222, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D084FF' }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                StealBot AI <span className="badge-glitch" style={{ fontSize: '0.58rem', background: 'linear-gradient(135deg, #AF52DE, #0A84FF)' }}>NVIDIA NIM</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Natural Language Deal Filtering & Analysis</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          
          {/* Default Welcome Card */}
          {!aiResult && !loading && (
            <div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--accent-amber)" /> Ask StealBot Anything!
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Powered by NVIDIA NIM API models (Llama 3.1 70B & DeepSeek). StealBot cross-references live catalog prices against historical averages.
                </p>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Try these sample queries:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setPrompt(sp); }}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>"{sp}"</span>
                    <CornerDownRight size={14} color="var(--text-dim)" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="badge-glitch" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Sparkles className="spin" size={16} /> Analyzing with NVIDIA NIM Llama 3.1...
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Checking price history & calculating stacked bank offers
              </div>
            </div>
          )}

          {/* AI Output Result */}
          {aiResult && !loading && (
            <div>
              {/* Trust Score Banner */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> {aiResult.trustScore || 98}% Verified True Steal
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Historical Price Validated</span>
              </div>

              {/* Answer Text */}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '16px' }}>
                {aiResult.answer}
              </div>

              {/* Bullets */}
              {aiResult.summaryBullets && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                  {aiResult.summaryBullets.map((b, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--primary-red)' }}>•</span> {b}
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Deal Cards */}
              {aiResult.matchedDealIds && aiResult.matchedDealIds.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', uppercase: 'true', marginBottom: '10px' }}>
                    Matching Deals Found ({aiResult.matchedDealIds.length}):
                  </div>
                  {deals
                    .filter(d => aiResult.matchedDealIds.includes(d.id))
                    .map(deal => (
                      <div
                        key={deal.id}
                        onClick={() => { onSelectDeal(deal); onClose(); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          marginBottom: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={deal.imageUrl} alt={deal.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', width: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{deal.title}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-red)' }}>{formatINR(deal.glitchPrice)}</div>
                          </div>
                        </div>
                        <button className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.72rem' }}>
                          View <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Input Bar */}
        <form onSubmit={handleAskAi} style={{ padding: '16px', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-card)' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Ask StealBot (e.g. 'Find headphones under ₹2000')..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 48px 12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--primary-red)',
                border: 'none',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: prompt.trim() ? 1 : 0.5
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
