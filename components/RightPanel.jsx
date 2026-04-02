import React, { useState } from 'react';

const STAGES = ['Interphase', 'Prophase', 'Metaphase', 'Anaphase', 'Telophase'];
const STAGE_EMOJIS = ['🌑', '🔵', '🟢', '🟠', '🔴'];

const RightPanel = () => {
  const [stage, setStage] = useState('Prophase');
  const [notes, setNotes] = useState('');
  const [observations, setObservations] = useState([]);
  const canObserve = true; // Always unlocked in free-flow simulation

  const handleSave = () => {
    if (!notes.trim()) return;
    setObservations(prev => [...prev, {
      id: Date.now(),
      number: prev.length + 1,
      stage,
      notes: notes.trim(),
      time: new Date().toLocaleTimeString(),
    }]);
    setNotes('');
  };

  return (
    <div style={{
      width: '230px', minWidth: '230px', height: '100%',
      background: 'rgba(10,15,20,0.75)', backdropFilter: 'blur(16px)',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,109,0,0.15)', flexShrink: 0,
      }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#ff9800', marginBottom: '4px', fontWeight: 600 }}>
          LAB RECORD
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
          📓 Observation Table
        </div>
      </div>

      <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>

        <label style={{ display: 'block', fontSize: '11px', color: '#ffb74d', marginBottom: '5px', fontWeight: 600 }}>
          Observed Stage
        </label>
        <select value={stage} onChange={(e) => setStage(e.target.value)} disabled={!canObserve}
          style={{
            width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
            color: 'white', fontSize: '13px', marginBottom: '10px', outline: 'none',
            cursor: canObserve ? 'pointer' : 'not-allowed', opacity: canObserve ? 1 : 0.5,
          }}
        >
          {STAGES.map((s, i) => (
            <option key={s} value={s} style={{ background: '#1a1a2e' }}>
              {STAGE_EMOJIS[i]} {s}
            </option>
          ))}
        </select>

        <label style={{ display: 'block', fontSize: '11px', color: '#ffb74d', marginBottom: '5px', fontWeight: 600 }}>
          Notes
        </label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder={'Describe what you see...'}
          rows={3}
          style={{
            width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
            color: 'white', fontSize: '12px', resize: 'none', outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
            opacity: canObserve ? 1 : 0.5, cursor: canObserve ? 'text' : 'not-allowed',
          }}
        />

        <button onClick={handleSave} disabled={!canObserve || !notes.trim()}
          style={{
            width: '100%', marginTop: '10px', padding: '10px',
            background: canObserve && notes.trim() ? 'linear-gradient(135deg, #ff6d00, #ff9100)' : 'rgba(255,255,255,0.07)',
            border: 'none', borderRadius: '8px',
            color: canObserve && notes.trim() ? 'white' : 'rgba(255,255,255,0.3)',
            fontSize: '12px', fontWeight: 700,
            cursor: canObserve && notes.trim() ? 'pointer' : 'not-allowed',
            letterSpacing: '1px', transition: 'all 0.2s',
          }}
        >
          💾 SAVE OBSERVATION
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', scrollbarWidth: 'none' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', letterSpacing: '1px' }}>
          RECORDED ({observations.length})
        </div>

        {observations.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '20px' }}>
            No observations yet
          </div>
        ) : (
          [...observations].reverse().map((obs) => (
            <div key={obs.id} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
              padding: '10px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffb74d' }}>#{obs.number} {obs.stage}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{obs.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{obs.notes}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RightPanel;
