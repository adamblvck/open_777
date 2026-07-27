// Full 35-column Liber 777 explorer (Glide data-grid + card view).
// Preserved island — renders the existing ExplorePage inside the workstation.
import ExplorePage from '../../pages/ExplorePage';

export default function GridWorkspace() {
  return (
    <div style={{ flex: 1, height: '100vh', overflowY: 'auto', background: 'var(--void2)' }}>
      <ExplorePage />
    </div>
  );
}
