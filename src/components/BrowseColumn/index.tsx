import { useOpen777, type Mode } from '../../state/useOpen777';
import ReferenceBrowse from './ReferenceBrowse';
import GematriaBrowse from './GematriaBrowse';
import ScryingBrowse from './ScryingBrowse';
import QueQueBrowse from './QueQueBrowse';
import GlossaryBrowse from './GlossaryBrowse';
import MyRecordsBrowse from './MyRecordsBrowse';

// kicker / title / subtitle per mode (grid + texts have no browse column).
const HEADS: Partial<Record<Mode, [string, string, string]>> = {
  reference: ['Look-up & reference', 'Correspondences', 'The 32 paths · backed by real Liber 777'],
  gematria: ['Number & name', 'Gematria', 'English → Hebrew → value · Strong’s lexicon'],
  scrying: ['Vision & record', 'Scrying chamber', 'Capture, analyse, integrate'],
  queque: ['Your own corpus', 'Ask QueQue', 'Vector search across your library'],
  glossary: ['Reference library', 'Glossary', '2,300+ correspondences, described'],
  myrecords: ['Cloud library', 'My records', 'Your recorded scryings & readings'],
};

export default function BrowseColumn() {
  const mode = useOpen777((s) => s.mode);
  const head = HEADS[mode];
  if (!head) return null;
  const [kicker, title, sub] = head;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--void)', borderRight: '1px solid var(--line)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontWeight: 300, letterSpacing: '.34em', textTransform: 'uppercase', fontSize: 10, color: 'var(--faint)', marginBottom: 7 }}>{kicker}</div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 27, lineHeight: 1, color: 'var(--cream)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 14, color: 'var(--dim)', marginTop: 5 }}>{sub}</div>
      </div>
      {mode === 'reference' && <ReferenceBrowse />}
      {mode === 'gematria' && <GematriaBrowse />}
      {mode === 'scrying' && <ScryingBrowse />}
      {mode === 'queque' && <QueQueBrowse />}
      {mode === 'glossary' && <GlossaryBrowse />}
      {mode === 'myrecords' && <MyRecordsBrowse />}
    </div>
  );
}
