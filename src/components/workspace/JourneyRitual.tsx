import { useEffect, useState } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { usePrefs } from '../../state/usePrefs';
import { getPathHeaderMeta } from '../../lib/pathGroups';
import { pathsData } from '../../lib/pathsData';
import TreeOfLife from '../TreeOfLife';
import { Liber777 } from '../../constants/liber_777';

const ROWS = Liber777 as unknown as Array<Record<string, string> & { index: string }>;
const mapDisplayPath = (colId: number): number =>
  colId >= 11 && colId <= 32 ? colId : colId === 33 ? 32 : colId === 34 ? 31 : colId;

function kingHexFor(colId: number): string {
  const row = ROWS.find((r) => String(r.index || '').includes('XV. King Scale Colors (HEX)'));
  return String(row?.[String(colId)] || '').trim() || '#9d6bff';
}

const PLANETS: { name: string; glyph: string }[] = [
  { name: 'Saturn', glyph: '♄' }, { name: 'Jupiter', glyph: '♃' }, { name: 'Mars', glyph: '♂' },
  { name: 'Sol', glyph: '☉' }, { name: 'Venus', glyph: '♀' }, { name: 'Mercury', glyph: '☿' }, { name: 'Luna', glyph: '☽' },
];

// Unicursal hexagram — 6 points at 60° intervals traced in a single stroke.
function hexagramPath(cx: number, cy: number, r: number): string {
  const pt = (deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
  const P = [pt(90), pt(30), pt(-30), pt(-90), pt(-150), pt(150)]; // top, ur, lr, bottom, ll, ul
  const order = [0, 3, 1, 4, 2, 5];
  return order.map((i, idx) => `${idx === 0 ? 'M' : 'L'} ${P[i][0].toFixed(1)} ${P[i][1].toFixed(1)}`).join(' ') + ' Z';
}

export default function JourneyRitual() {
  const screen = useOpen777((s) => s.journeyScreen);
  const colId = useOpen777((s) => s.journeyPath) ?? 11;
  const setJourneyScreen = useOpen777((s) => s.setJourneyScreen);
  const flash = useOpen777((s) => s.flash);
  const completed = usePrefs((s) => s.journeyCompleted);
  const setJourneyCompleted = usePrefs((s) => s.setJourneyCompleted);

  const displayPath = mapDisplayPath(colId);
  const meta = getPathHeaderMeta(displayPath);
  const lore = pathsData[String(displayPath)];
  const color = kingHexFor(colId);
  const isDone = !!completed[colId];

  const witnessKey = `open777_witness_${colId}`;
  const [witness, setWitness] = useState('');
  useEffect(() => {
    setWitness(localStorage.getItem(witnessKey) || '');
  }, [witnessKey]);
  const saveWitness = (v: string) => {
    setWitness(v);
    try { localStorage.setItem(witnessKey, v); } catch { /* ignore */ }
  };

  // hexagram state
  const [planet, setPlanet] = useState(PLANETS[2]);
  const [castKey, setCastKey] = useState(0);

  const Back = (
    <span onClick={() => (screen === 'hexagram' ? setJourneyScreen('ritual', colId) : setJourneyScreen('map'))} style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
      ‹ {screen === 'hexagram' ? 'Ritual' : 'Map'}
    </span>
  );

  if (screen === 'hexagram') {
    const size = 360, cx = size / 2, cy = size / 2, r = size * 0.38;
    const d = hexagramPath(cx, cy, r);
    return (
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '24px 40px 60px' }}>
        {Back}
        <div style={{ maxWidth: 560, margin: '12px auto 0', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 30, color: 'var(--cream)' }}>The Unicursal Hexagram</div>
          <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 15, color: 'var(--dim)', marginTop: 6 }}>Invoke the planetary force of {planet.name} {planet.glyph} for {meta.name}.</div>

          <svg width={size} height={size} style={{ margin: '24px auto 0', display: 'block' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={1} />
            <path key={castKey} d={d} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${color})`, strokeDasharray: 1400, strokeDashoffset: 1400, animation: 'o7hexdraw 1.6s ease forwards' }} />
            <circle cx={cx} cy={cy} r={5} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
            <text x={cx} y={cy - r - 6} textAnchor="middle" fill="var(--purple2)" fontSize={22}>{planet.glyph}</text>
          </svg>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 20 }}>
            {PLANETS.map((p) => (
              <span key={p.name} onClick={() => { setPlanet(p); setCastKey((k) => k + 1); }} style={{ fontSize: 13, padding: '7px 13px', borderRadius: 999, cursor: 'pointer', background: planet.name === p.name ? 'var(--purple)' : 'transparent', color: planet.name === p.name ? '#0a0810' : 'var(--muted)', boxShadow: planet.name === p.name ? 'none' : 'inset 0 0 0 1px var(--line2)' }}>{p.glyph} {p.name}</span>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <span onClick={() => setCastKey((k) => k + 1)} style={{ fontSize: 14, fontWeight: 600, padding: '11px 26px', borderRadius: 999, background: 'var(--purple)', color: '#0a0810', boxShadow: '0 0 24px rgba(157,107,255,.4)', cursor: 'pointer' }}>Cast ✷</span>
          </div>
        </div>
      </div>
    );
  }

  // ritual screen
  return (
    <div style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '24px 40px 60px' }}>
      {Back}
      <div style={{ maxWidth: 720, margin: '12px auto 0' }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <div style={{ flex: 'none', filter: `drop-shadow(0 0 14px ${color}66)` }}>
            <TreeOfLife height={150} radiusSephira={5} selected={[displayPath]} pathwayColor={color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: 'var(--purpledim)', marginBottom: 8 }}>Pathwork · column {colId}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 46, color: 'var(--cream)', lineHeight: 0.95 }}>{meta.name}</span>
              <span style={{ fontFamily: 'var(--serif2)', fontSize: 32, color, direction: 'rtl' }}>{meta.hebrewLetter}</span>
              {meta.glyph ? <span style={{ fontSize: 26, color: 'var(--purple2)' }}>{meta.glyph}</span> : null}
            </div>
            {meta.subtitle ? <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginTop: 6 }}>{meta.subtitle}</div> : null}
          </div>
        </div>

        {lore?.description ? (
          <div style={{ fontFamily: 'var(--serif2)', fontSize: 16, color: 'var(--cream)', lineHeight: 1.6, margin: '22px 0', padding: '18px 20px', borderRadius: 14, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>{lore.description}</div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <span onClick={() => setJourneyScreen('hexagram', colId)} style={{ fontSize: 13, padding: '10px 18px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}>✶ Open the hexagram</span>
        </div>

        <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Witness account</div>
        <textarea
          value={witness}
          onChange={(e) => saveWitness(e.target.value)}
          placeholder="Record your witness account in as much detail as needed — names, letters, feelings, the room, the vision as it returns to you…"
          style={{ width: '100%', minHeight: 220, resize: 'vertical', background: 'var(--panel)', border: 'none', outline: 'none', boxShadow: 'inset 0 0 0 1px var(--line2)', borderRadius: 16, padding: 18, color: 'var(--cream)', fontFamily: 'var(--serif2)', fontSize: 16, lineHeight: 1.6 }}
        />
        <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 8 }}>Auto-saved · the cloud recording pipeline lives in the Scrying chamber.</div>

        <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
          {isDone ? (
            <span onClick={() => { setJourneyCompleted(colId, false); flash('Pathwork re-opened.'); }} style={{ fontSize: 14, padding: '12px 24px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}>Re-open pathwork</span>
          ) : (
            <span onClick={() => { setJourneyCompleted(colId, true); flash('Pathwork confirmed — the next gate is open.'); setJourneyScreen('map'); }} style={{ fontSize: 14, fontWeight: 600, padding: '12px 28px', borderRadius: 999, background: 'var(--purple)', color: '#0a0810', boxShadow: '0 0 24px rgba(157,107,255,.4)', cursor: 'pointer' }}>Confirm pathwork complete →</span>
          )}
          <span onClick={() => setJourneyScreen('map')} style={{ fontSize: 14, padding: '12px 24px', borderRadius: 999, color: 'var(--muted)', cursor: 'pointer' }}>Back to map</span>
        </div>
      </div>
    </div>
  );
}
