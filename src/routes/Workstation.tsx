import { Link } from 'react-router-dom';
import { useOpen777 } from '../state/useOpen777';
import NavRail from '../components/NavRail';
import BrowseColumn from '../components/BrowseColumn';
import Workspace from '../components/workspace';
import Toast from '../components/common/Toast';

export default function Workstation() {
  const mode = useOpen777((s) => s.mode);
  const fullBleed = mode === 'grid' || mode === 'texts' || mode === 'journey';

  return (
    <>
      {/* Desktop-only gate — the three-pane shell is designed for ≥1100px. */}
      <div className="o7-root o7-small-screen-notice">
        <div style={{ fontSize: 38, color: 'var(--purple)', filter: 'drop-shadow(0 0 14px var(--purple))', animation: 'o7glow 5s ease-in-out infinite' }}>✷</div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 28, color: 'var(--cream)' }}>Open 777 is a desktop workstation</div>
        <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 16, color: 'var(--muted)', maxWidth: 380, lineHeight: 1.5 }}>
          The three-pane workstation is built for screens 1100px and wider. Visit on a larger display to enter the chamber.
        </div>
        <Link to="/" style={{ fontSize: 14, padding: '12px 24px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', textDecoration: 'none', marginTop: 8 }}>
          ← Back to the overview
        </Link>
      </div>

      <div
        className="o7-root o7-workstation"
        style={{
          display: 'grid',
          gridTemplateColumns: fullBleed ? '72px 1fr' : '72px 372px 1fr',
          height: '100vh',
          minWidth: 1100,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
      <NavRail />
      {!fullBleed && <BrowseColumn />}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <Workspace />
        <Toast />
      </div>
      </div>
    </>
  );
}
