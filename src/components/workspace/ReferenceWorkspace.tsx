import { lazy, Suspense } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { findEntry } from '../../data/referenceAdapter';
import { gem } from '../../lib/gematria';
import TreeOfLifeMini from '../common/TreeOfLifeMini';
import type { Entry } from '../../data/models';

// Below-the-fold; splits categoryGlossary.json + paths.json out of the main bundle.
const CardDetail = lazy(() => import('./CardDetail'));

interface Attr { k: string; v: string }

function curatedAttrs(e: Entry): Attr[] {
  if (e.type === 'sphere')
    return [
      { k: 'Hebrew', v: `${e.he}  ·  ${e.title}` },
      { k: 'Number on the Tree', v: String(e.num) },
      { k: 'Meaning', v: e.meaning },
      { k: 'God-name', v: e.godname },
      { k: 'Archangel', v: e.archangel },
      { k: 'Angelic choir', v: e.choir },
      { k: 'Mundane sphere', v: e.sphere },
      { k: 'Colour (King scale)', v: e.colorName },
    ];
  if (e.type === 'path')
    return [
      { k: 'Path number', v: String(e.num) },
      { k: 'Hebrew letter', v: `${e.he}  ·  ${e.letter}` },
      { k: 'Tarot trump', v: e.trump },
      { k: 'Astrological attribution', v: e.attr },
      { k: 'Connects', v: `${e.from}  —  ${e.to}` },
      { k: 'Letter meaning', v: `${e.letter} carries the current of ${e.trump}` },
    ];
  if (e.type === 'planet')
    return [
      { k: 'Glyph', v: e.glyph },
      { k: 'Sephira', v: e.sphere },
      { k: 'Hebrew sphere', v: e.he },
      { k: 'Metal', v: e.metal },
      { k: 'Day', v: e.day },
    ];
  return [
    { k: 'Glyph', v: e.glyph },
    { k: 'Element', v: e.element },
    { k: 'Quality', v: e.quality },
    { k: 'Ruler', v: e.ruler },
    { k: 'Path', v: e.path },
    { k: 'Hebrew', v: e.he },
  ];
}

function heroMeta(e: Entry): { kicker: string; valNote: string } {
  if (e.type === 'sphere') return { kicker: `Sephira · ${e.sphere}`, valNote: `${e.he} standard` };
  if (e.type === 'path') return { kicker: `Path ${e.num} · ${e.from} ↔ ${e.to}`, valNote: `${e.letter} (letter value)` };
  if (e.type === 'planet') return { kicker: `Planet · ${e.sphere}`, valNote: `${e.he} standard` };
  return { kicker: `Zodiac · ${e.element}`, valNote: `${e.he} standard` };
}

function AttrRow({ k, v }: Attr) {
  return (
    <div style={{ display: 'flex', gap: 20, padding: '14px 0', borderBottom: '.5px solid var(--line)' }}>
      <div style={{ width: 158, flex: 'none', fontSize: 13, color: 'var(--dim)', paddingTop: 2 }}>{k}</div>
      <div style={{ flex: 1, fontFamily: 'var(--serif2)', fontSize: 18, color: 'var(--cream)' }}>{v}</div>
    </div>
  );
}

export default function ReferenceWorkspace() {
  const selectedId = useOpen777((s) => s.selectedId);
  const meaningDraft = useOpen777((s) => s.meaningDraft);
  const meanings = useOpen777((s) => s.meanings);
  const setMeaningDraft = useOpen777((s) => s.setMeaningDraft);
  const saveMeaning = useOpen777((s) => s.saveMeaning);
  const carryToScry = useOpen777((s) => s.carryToScry);

  const sel = findEntry(selectedId);
  const { kicker, valNote } = heroMeta(sel);
  const color = sel.type === 'sphere' ? sel.color : '#9d6bff';
  const glowSoft = sel.type === 'sphere' ? sel.color + '33' : 'rgba(157,107,255,.25)';
  const glyphBig = sel.type === 'sphere' ? sel.glyph : sel.type === 'path' ? sel.he : sel.glyph;
  const value = gem(sel.he, 'he');
  const saved = !!meanings[selectedId];

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* hero */}
      <div style={{ display: 'flex', gap: 34, alignItems: 'center', padding: '46px 52px 34px', borderBottom: '1px solid var(--line)' }}>
        {sel.type === 'sphere' ? (
          <TreeOfLifeMini nx={sel.nx} ny={sel.ny} color={sel.color} />
        ) : (
          <div
            style={{
              width: 104,
              height: 104,
              flex: 'none',
              borderRadius: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0810',
              boxShadow: `inset 0 0 0 1px var(--line2), 0 0 40px ${glowSoft}`,
              fontSize: 52,
              color,
              filter: `drop-shadow(0 0 12px ${glowSoft})`,
            }}
          >
            {glyphBig}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: 'var(--purpledim)', marginBottom: 8 }}>
            {kicker}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 52, lineHeight: 0.92, color: 'var(--cream)' }}>
              {sel.title}
            </span>
            <span style={{ fontFamily: 'var(--serif2)', fontSize: 34, color: 'var(--dim)', direction: 'rtl' }}>{sel.he}</span>
          </div>
          <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 18, color: 'var(--muted)', marginTop: 10, maxWidth: 560, lineHeight: 1.45 }}>
            {sel.desc}
          </div>
        </div>
        <div style={{ flex: 'none', textAlign: 'center', padding: '18px 22px', borderRadius: 18, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--faint)' }}>Gematria</div>
          <div style={{ fontFamily: 'var(--serif2)', fontSize: 40, color: 'var(--purple)', lineHeight: 1, marginTop: 6 }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>{valNote}</div>
        </div>
      </div>

      {/* two panes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 0 }}>
        <div style={{ padding: '34px 44px 44px', borderRight: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 20 }}>
            Canonical attributions · Liber 777
          </div>
          {curatedAttrs(sel).map((a) => (
            <AttrRow key={a.k} k={a.k} v={a.v} />
          ))}

          {(sel.type === 'sphere' || sel.type === 'path') && (
            <div style={{ marginTop: 30 }}>
              <div style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--purpledim)', marginBottom: 16 }}>
                Deeper correspondences · real 777
              </div>
              <Suspense fallback={<div style={{ color: 'var(--faint)', fontSize: 13, padding: '12px 0' }}>Loading correspondences…</div>}>
                <CardDetail column={sel.num} />
              </Suspense>
            </div>
          )}
        </div>

        <div style={{ padding: '34px 40px 44px', background: 'var(--panel2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>Your interpretation</div>
            <span style={{ fontSize: 11, color: saved ? '#34c08a' : 'var(--faint)' }}>{saved ? 'Saved' : 'Not yet written'}</span>
          </div>
          <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 14, color: 'var(--dim)', marginBottom: 16, lineHeight: 1.5 }}>
            What does {sel.title} mean in your own practice? Write the meaning you have lived, not the one you were given.
          </div>
          <textarea
            value={meaningDraft}
            onChange={(e) => setMeaningDraft(e.target.value)}
            placeholder="Write the durable pattern worth remembering…"
            style={{
              width: '100%',
              minHeight: 240,
              resize: 'vertical',
              background: 'var(--panel)',
              border: 'none',
              outline: 'none',
              boxShadow: 'inset 0 0 0 1px var(--line2)',
              borderRadius: 14,
              padding: 18,
              color: 'var(--cream)',
              fontFamily: 'var(--serif2)',
              fontSize: 16,
              lineHeight: 1.6,
            }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <span
              onClick={saveMeaning}
              style={{ fontSize: 13, padding: '11px 22px', borderRadius: 999, background: 'var(--purple)', color: '#0a0810', fontWeight: 600, cursor: 'pointer' }}
            >
              Save meaning
            </span>
            <span
              onClick={carryToScry}
              style={{ fontSize: 13, padding: '11px 22px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}
            >
              Carry into a scrying →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
