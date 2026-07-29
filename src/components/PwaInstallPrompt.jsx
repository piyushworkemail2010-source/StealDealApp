import React from 'react';
import { Download, X, Zap } from 'lucide-react';

export default function PwaInstallPrompt({ onInstall, onDismiss }) {
  return (
    <div className="glass-panel" style={{
      position: 'fixed',
      bottom: '76px',
      left: '16px',
      right: '16px',
      maxWidth: '460px',
      margin: '0 auto',
      zIndex: 95,
      padding: '14px 18px',
      borderRadius: 'var(--radius-lg)',
      background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.25) 0%, rgba(13, 15, 18, 0.95) 100%)',
      border: '1px solid var(--primary-red)',
      boxShadow: 'var(--shadow-glow)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--primary-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF'
        }}>
          <Zap size={22} fill="#FFF" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: '#FFF' }}>
            Install StealDeal App
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Instant price error alerts on your home screen!
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={onInstall} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
          <Download size={14} /> Install
        </button>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
