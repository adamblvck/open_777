import { useMemo } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { analyzeGematria, reduceToDigit, BASE_LETTERS } from '../../lib/gematriaEngine';

const EXAMPLES = ['אהבה', 'יהוה', 'אמת', 'love', 'truth', 'אור'];

function StatCell({ label, hint, value, accent }: { label: string; hint?: string; value: number; accent?: boolean }) {
  return (
    <div style={{ flex: '1 1 120px', minWidth: 118, padding: '14px 18px', borderRadius: 14, background: 'var(--card2)', boxShadow: `inset 0 0 0 1px ${accent ? 'var(--purple)' : 'var(--line)'}` }}>
      <div style={{ fontFamily: 'var(--serif2)', fontSize: 26, color: accent ? 'var(--purple2)' : 'var(--cream)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--faint)', marginTop: 5 }}>{label}</div>
      {hint ? <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 1 }}>{hint}</div> : null}
    </div>
  );
}

const sectionLabel: React.CSSProperties = { fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 11 };

export default function GematriaWorkspace() {
  const gemInput = useOpen777((s) => s.gemInput);
  const setGemInput = useOpen777((s) => s.setGemInput);
  const jumpToReference = useOpen777((s) => s.jumpToReference);

  const analysis = useMemo(() => (gemInput.trim() ? analyzeGematria(gemInput) : null), [gemInput]);
  const hc = analysis?.hebrewCiphers;
  const ec = analysis?.englishCiphers;
  const dir = analysis?.isHebrew ? 'rtl' : 'ltr';
  const singleLetterCol = analysis && analysis.letters.length === 1 ? BASE_LETTERS.indexOf(analysis.letters[0].glyph) : -1;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '46px 52px 52px' }}>
      <div style={{ fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: 'var(--purpledim)', marginBottom: 8 }}>Gematria · isopsephy</div>
      <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 40, color: 'var(--cream)', marginBottom: 4 }}>The number behind the name</div>
      <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 17, color: 'var(--dim)', marginBottom: 26 }}>
        Type a word in English or עברית — the chamber returns its value across every cipher, plus every word in the lexicon that answers to the same number.
      </div>

      {/* input */}
      <input
        value={gemInput}
        onChange={(e) => setGemInput(e.target.value)}
        placeholder="Type a word — English or עברית"
        style={{
          width: '100%', height: 64, borderRadius: 16, background: 'var(--card)', boxShadow: `inset 0 0 0 1px ${gemInput ? 'var(--purple)' : 'var(--line2)'}`,
          padding: '0 22px', color: 'var(--cream)', fontFamily: 'var(--serif2)', fontSize: 28, border: 'none', outline: 'none', direction: dir, marginBottom: 12,
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 30 }}>
        {EXAMPLES.map((ex) => (
          <span key={ex} onClick={() => setGemInput(ex)} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 999, cursor: 'pointer', background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)', color: 'var(--muted)' }}>{ex}</span>
        ))}
      </div>

      {analysis && analysis.primaryValue > 0 ? (
        <div style={{ animation: 'o7rise .25s ease both' }}>
          {/* hero */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '26px 22px', borderRadius: 18, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)', marginBottom: 26 }}>
            {analysis.transliterated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--dim)' }}>{analysis.input.toLowerCase()}</span>
                <span style={{ fontSize: 13, color: 'var(--dim)' }}>→</span>
                <span style={{ fontFamily: 'var(--serif2)', fontSize: 24, color: 'var(--cream)', direction: 'rtl' }}>{analysis.hebrew}</span>
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--serif2)', fontSize: 32, color: 'var(--cream)', direction: 'rtl', marginBottom: 6 }}>{analysis.hebrew}</div>
            )}
            <div style={{ fontFamily: 'var(--serif2)', fontSize: 52, lineHeight: 1.05, color: 'var(--purple2)', filter: 'drop-shadow(0 0 14px rgba(157,107,255,.4))' }}>{analysis.primaryValue}</div>
            <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 4 }}>Standard · Mispar Hechrachi</div>
            <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>reduces to {reduceToDigit(analysis.primaryValue)}</div>
            {singleLetterCol >= 0 ? (
              <span onClick={() => jumpToReference('path' + (11 + singleLetterCol))} style={{ marginTop: 12, fontSize: 13, color: 'var(--purple)', cursor: 'pointer' }}>
                Path of {analysis.letters[0].name} →
              </span>
            ) : null}
          </div>

          {/* cipher grid */}
          <div style={sectionLabel}>Hebrew systems</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
            <StatCell label="Standard" hint="Hechrachi" value={hc!.standard} accent />
            <StatCell label="Ordinal" hint="Siduri" value={hc!.ordinal} />
            <StatCell label="Reduced" hint="Katan" value={hc!.reduced} />
            <StatCell label="Large" hint="Gadol / Sofit" value={hc!.gadol} />
          </div>
          {ec ? (
            <>
              <div style={sectionLabel}>English / Latin systems</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
                <StatCell label="Simple" hint="a=1…z=26" value={ec.ordinal} />
                <StatCell label="English" hint="×6" value={ec.sixfold} />
                <StatCell label="Agrippa" hint="Latin" value={ec.agrippa} />
              </div>
            </>
          ) : null}

          {/* letters */}
          {analysis.letters.length > 0 ? (
            <>
              <div style={sectionLabel}>Letters</div>
              <div style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                {analysis.letters.map((l, i) => (
                  <div key={`${l.glyph}-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56, padding: '8px 12px', borderRadius: 12, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                    <span style={{ fontFamily: 'var(--serif2)', fontSize: 22, color: 'var(--cream)' }}>{l.glyph}</span>
                    <span style={{ fontFamily: 'var(--serif2)', fontSize: 16, color: 'var(--purple2)' }}>{l.standard}</span>
                    <span style={{ fontSize: 10, color: 'var(--dim)' }}>{l.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : gemInput.trim() ? (
        <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 16, color: 'var(--muted)', textAlign: 'center', padding: '28px 0' }}>No Hebrew letters to score yet — try a word with letters.</div>
      ) : (
        <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 16, color: 'var(--dim)', textAlign: 'center', padding: '28px 0' }}>Type or tap an example to see its gematria across Hebrew and Latin ciphers.</div>
      )}
    </div>
  );
}
