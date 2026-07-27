import { lazy, Suspense } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import ReferenceWorkspace from './ReferenceWorkspace';
import GematriaWorkspace from './GematriaWorkspace';
import ScryingWorkspace from './ScryingWorkspace';
import QueQueWorkspace from './QueQueWorkspace';

// Heavy islands (Glide data-grid · Liber text constants · 2.3 MB glossary) load on demand.
const GridWorkspace = lazy(() => import('./GridWorkspace'));
const TextsWorkspace = lazy(() => import('./TextsWorkspace'));
const GlossaryWorkspace = lazy(() => import('./GlossaryWorkspace'));
const JourneyWorkspace = lazy(() => import('./JourneyWorkspace'));
const MyRecordsWorkspace = lazy(() => import('./MyRecordsWorkspace'));
const TreeWorkspace = lazy(() => import('./TreeWorkspace'));
const SearchWorkspace = lazy(() => import('./SearchWorkspace'));

function Loading() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 32, color: 'var(--purpledim)', filter: 'drop-shadow(0 0 14px var(--purple))', animation: 'o7glow 5s ease-in-out infinite' }}>✷</span>
    </div>
  );
}

export default function Workspace() {
  const mode = useOpen777((s) => s.mode);
  switch (mode) {
    case 'reference':
      return <ReferenceWorkspace />;
    case 'gematria':
      return <GematriaWorkspace />;
    case 'tree':
      return (
        <Suspense fallback={<Loading />}>
          <TreeWorkspace />
        </Suspense>
      );
    case 'search':
      return (
        <Suspense fallback={<Loading />}>
          <SearchWorkspace />
        </Suspense>
      );
    case 'scrying':
      return <ScryingWorkspace />;
    case 'queque':
      return <QueQueWorkspace />;
    case 'glossary':
      return (
        <Suspense fallback={<Loading />}>
          <GlossaryWorkspace />
        </Suspense>
      );
    case 'journey':
      return (
        <Suspense fallback={<Loading />}>
          <JourneyWorkspace />
        </Suspense>
      );
    case 'myrecords':
      return (
        <Suspense fallback={<Loading />}>
          <MyRecordsWorkspace />
        </Suspense>
      );
    case 'grid':
      return (
        <Suspense fallback={<Loading />}>
          <GridWorkspace />
        </Suspense>
      );
    case 'texts':
      return (
        <Suspense fallback={<Loading />}>
          <TextsWorkspace />
        </Suspense>
      );
    default:
      return null;
  }
}
