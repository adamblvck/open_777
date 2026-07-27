import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { useJourneyProgress } from '../../hooks/useJourneyProgress';
import IsometricSection from '../isometric/IsometricSection';
import Road from '../isometric/tiles/Road';
import Building from '../isometric/tiles/Building';
import TreeOfLifeTile from '../isometric/tiles/TreeOfLifeTile';
import { Liber777 } from '../../constants/liber_777';
import { pathsData } from '../../lib/pathsData';

const JourneyRitual = lazy(() => import('./JourneyRitual'));

// Ordered column ids: 32 → 32bis(34) → 31 → 31bis(33) → 30 … → 1 (top of tree to bottom).
const ORDERED = [32, 34, 31, 33, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const mapDisplayPath = (colId: number): number | undefined =>
  colId >= 11 && colId <= 32 ? colId : colId === 33 ? 32 : colId === 34 ? 31 : colId >= 1 && colId <= 10 ? colId : undefined;

const GLYPH_MAP: Record<string, string> = {
  Aleph: 'א', Beth: 'ב', Gimel: 'ג', Daleth: 'ד', Heh: 'ה', Vav: 'ו', Zayin: 'ז', Cheth: 'ח', Teth: 'ט', Yod: 'י',
  Kaph: 'כ', Lamed: 'ל', Mem: 'מ', Nun: 'נ', Samekh: 'ס', Ayin: 'ע', Pe: 'פ', Tzaddi: 'צ', Qoph: 'ק', Resh: 'ר', Shin: 'ש', Tav: 'ת', Tau: 'ת',
};

const ROWS = Liber777 as unknown as Array<Record<string, string> & { index: string }>;
function iconographyFor(colId: number) {
  const row = (label: string) => ROWS.find((r) => String(r.index || '').includes(label));
  const v = (label: string) => String(row(label)?.[String(colId)] ?? '').trim();
  const letterName = v('II. Transliteration of the Hebrew Names of the Paths');
  const kingHex = v('XV. King Scale Colors (HEX)') || '#374151';
  const glyph = GLYPH_MAP[(letterName || '').split(/\s|\(|\)/)[0]] || '';
  return { kingHex, glyph };
}

export default function JourneyWorkspace() {
  const journeyScreen = useOpen777((s) => s.journeyScreen);
  const setJourneyScreen = useOpen777((s) => s.setJourneyScreen);
  const progress = useJourneyProgress(ORDERED);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  useLayoutEffect(() => {
    const measure = () => { if (wrapRef.current) setWidth(Math.min(760, wrapRef.current.clientWidth - 24)); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (journeyScreen !== 'map') {
    return (
      <Suspense fallback={<div style={{ flex: 1 }} />}>
        <JourneyRitual />
      </Suspense>
    );
  }

  const pct = Math.round((progress.completedCount / progress.total) * 100);
  const sectionHeight = 300;

  return (
    <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: '24px 40px 16px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: 'var(--purpledim)', marginBottom: 6 }}>The pathworking journey</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 30, color: 'var(--cream)', lineHeight: 1 }}>Journey</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--serif2)', fontSize: 30, color: 'var(--purple2)' }}>{progress.completedCount}<span style={{ fontSize: 16, color: 'var(--dim)' }}> / {progress.total}</span></div>
            <div style={{ fontSize: 11, color: 'var(--faint)' }}>paths walked</div>
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: 'var(--line)', marginTop: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--purple)', boxShadow: '0 0 12px rgba(157,107,255,.5)' }} />
        </div>
        <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--dim)', marginTop: 10 }}>
          Progress through the paths in order — top of the Tree downward. Enter any unlocked path to record the work; completing it opens the next gate.
        </div>
      </div>

      {/* isometric map */}
      <div ref={wrapRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, paddingBottom: 80 }}>
        {ORDERED.map((colId) => {
          const displayPath = mapDisplayPath(colId);
          const meta = displayPath ? pathsData[String(displayPath)] : undefined;
          const locked = !progress.unlockedMap[colId];
          const done = !!progress.completedMap[colId];
          const ic = iconographyFor(colId);
          const xSign = 6, ySign = 6;
          const roadPoints = [
            { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: ySign }, { x: xSign, y: ySign }, { x: 8, y: ySign }, { x: 8, y: 8 }, { x: 10, y: 10 },
          ];
          return (
            <div key={colId} style={{ width, position: 'relative' }}>
              <IsometricSection cols={10} rows={10} tileWidth={60} tileHeight={30} width={width} height={sectionHeight} dimmed={locked}>
                {({ originX, originY, tileWidth, tileHeight }) => (
                  <>
                    <Road width={width} height={sectionHeight} tileWidth={tileWidth} tileHeight={tileHeight} originX={originX} originY={originY} points={roadPoints} />
                    <Building width={width} height={sectionHeight} tileWidth={tileWidth} tileHeight={tileHeight} originX={originX} originY={originY} x={xSign} y={ySign} />
                    <TreeOfLifeTile tileWidth={tileWidth} tileHeight={tileHeight} originX={originX} originY={originY} x={xSign} y={ySign} selectedPath={displayPath} />
                  </>
                )}
              </IsometricSection>

              {meta ? (
                <div style={{ position: 'absolute', right: 18, top: '40%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {ic.glyph ? (
                    <div style={{ padding: '4px 14px', borderRadius: 999, boxShadow: `inset 0 0 0 1px ${ic.kingHex}`, background: 'rgba(12,11,17,0.7)', color: 'var(--purple2)', fontFamily: 'var(--serif2)', fontSize: 26 }}>{ic.glyph}</div>
                  ) : null}
                  <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 15, color: locked ? 'var(--faint)' : 'var(--cream)' }}>{meta.title}</div>
                  {locked ? (
                    <span style={{ fontSize: 12, padding: '7px 14px', borderRadius: 999, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)', color: 'var(--muted)' }}>🔒 Locked</span>
                  ) : (
                    <span onClick={() => setJourneyScreen('ritual', colId)} style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 999, background: done ? 'var(--card2)' : 'var(--purple)', color: done ? 'var(--purple2)' : '#0a0810', boxShadow: done ? 'inset 0 0 0 1px var(--line2)' : '0 0 20px rgba(157,107,255,.4)', cursor: 'pointer' }}>
                      {done ? 'Review ✓' : '▶ Enter pathway'}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
