// Liber O / E / Resh / Samekh / LXV / III reader.
// Preserved island — renders the existing ReadPage inside the workstation.
import ReadPage from '../../pages/ReadPage';

export default function TextsWorkspace() {
  return (
    <div style={{ flex: 1, height: '100vh', overflowY: 'auto', background: 'var(--void2)' }}>
      <ReadPage />
    </div>
  );
}
