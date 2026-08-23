import { useCallback, useEffect, useRef, useState } from 'react';
import { useUploadQueue, type QueueItem, type QueueStage } from '../../hooks/useUploadQueue';
import { pathLabel } from '../../lib/pathMapping';
import { paths } from '../../data/paths';

const TRUMP: Record<number, string> = Object.fromEntries(paths.map((p) => [p.num, p.trump]));

const STAGE_COPY: Record<QueueStage, string> = {
  pending: 'Ready',
  reading: 'Reading audio…',
  uploading: 'Uploading',
  queued: 'Queued for transcription',
  transcribing: 'Transcribing',
  analyzing: 'Analysing',
  complete: 'Complete',
  failed: 'Failed',
  blocked: 'Needs a path',
};

const STAGE_COLOR: Record<QueueStage, string> = {
  pending: 'var(--muted)',
  reading: 'var(--purple2)',
  uploading: 'var(--purple)',
  queued: 'var(--purple2)',
  transcribing: 'var(--purple)',
  analyzing: 'var(--purple)',
  complete: '#4ade80',
  failed: '#e0464b',
  blocked: '#f0b232',
};

/** Stages where the server is working and we cannot show a real percentage. */
const INDETERMINATE = new Set<QueueStage>(['queued', 'transcribing', 'analyzing', 'reading']);

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const mmss = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Live elapsed clock so a long stage never looks frozen. */
function useTicker(active: boolean) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [active]);
}

function Row({
  item,
  onSetPath,
  onRemove,
}: {
  item: QueueItem;
  onSetPath: (id: string, n: number | null) => void;
  onRemove: (id: string) => void;
}) {
  const active = !['complete', 'failed', 'pending', 'blocked'].includes(item.stage);
  const elapsed = item.startedAt ? Date.now() - item.startedAt : 0;
  const total = item.startedAt && item.finishedAt ? item.finishedAt - item.startedAt : null;

  return (
    <div
      style={{
        borderRadius: 12,
        background: 'var(--card2)',
        boxShadow: `inset 0 0 0 1px ${item.stage === 'blocked' ? '#f0b23255' : 'var(--line)'}`,
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--cream)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.filename}
        </span>
        <span style={{ fontSize: 11, color: 'var(--faint)', flex: 'none' }}>{mb(item.sizeBytes)}</span>
        {item.durationMs ? (
          <span style={{ fontSize: 11, color: 'var(--faint)', flex: 'none' }}>{mmss(item.durationMs)}</span>
        ) : null}
        {item.stage === 'pending' || item.stage === 'blocked' || item.stage === 'failed' ? (
          <span
            onClick={() => onRemove(item.id)}
            title="Remove from tray"
            style={{ fontSize: 13, color: 'var(--faint)', cursor: 'pointer', flex: 'none', padding: '0 2px' }}
          >
            ×
          </span>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <select
          value={item.pathNumber ?? ''}
          disabled={active || item.stage === 'complete'}
          onChange={(e) => onSetPath(item.id, e.target.value === '' ? null : Number(e.target.value))}
          style={{
            background: 'var(--panel)',
            color: item.pathNumber === null ? '#f0b232' : 'var(--cream)',
            border: 'none',
            boxShadow: `inset 0 0 0 1px ${item.pathNumber === null ? '#f0b23288' : 'var(--line2)'}`,
            borderRadius: 8,
            padding: '5px 8px',
            fontSize: 12,
            flex: 'none',
          }}
        >
          <option value="">— set a path —</option>
          {Array.from({ length: 35 }, (_, i) => i).map((n) => (
            <option key={n} value={n}>
              {n === 0 ? 'General (0)' : `${pathLabel(n)}${TRUMP[n] ? ` · ${TRUMP[n]}` : ''}`}
            </option>
          ))}
        </select>

        <span style={{ fontSize: 11.5, color: STAGE_COLOR[item.stage], flex: 1 }}>
          {STAGE_COPY[item.stage]}
          {item.stage === 'uploading' ? ` · ${Math.round(item.progress * 100)}%` : ''}
          {active ? ` · ${mmss(elapsed)}` : ''}
          {total !== null && item.stage === 'complete' ? ` · took ${mmss(total)}` : ''}
        </span>
      </div>

      {/* progress rail — determinate for the PUT, marching stripes for server work */}
      {active ? (
        <div style={{ height: 3, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: INDETERMINATE.has(item.stage) ? '100%' : `${item.progress * 100}%`,
              background: INDETERMINATE.has(item.stage)
                ? 'repeating-linear-gradient(90deg, var(--purple) 0 12px, transparent 12px 24px)'
                : 'var(--purple)',
              backgroundSize: INDETERMINATE.has(item.stage) ? '24px 100%' : undefined,
              animation: INDETERMINATE.has(item.stage) ? 'o7march 1s linear infinite' : undefined,
              transition: INDETERMINATE.has(item.stage) ? undefined : 'width .2s linear',
            }}
          />
        </div>
      ) : null}

      {item.error ? <div style={{ fontSize: 11, color: '#e0464b' }}>{item.error}</div> : null}
      {item.guess.conflict && !item.pathTouchedByUser ? (
        <div style={{ fontSize: 11, color: '#f0b232', lineHeight: 1.45 }}>⚠ {item.guess.conflict}</div>
      ) : null}
      {item.stage === 'blocked' ? (
        <div style={{ fontSize: 11, color: 'var(--faint)', lineHeight: 1.45 }}>{item.guess.reason}</div>
      ) : null}
    </div>
  );
}

export default function UploadTray({ onDone }: { onDone?: () => void }) {
  const q = useUploadQueue();
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);

  const anyActive = q.items.some((i) => !['complete', 'failed', 'pending', 'blocked'].includes(i.stage));
  useTicker(anyActive);

  const take = useCallback(
    (files: FileList | File[]) => {
      const { added, rejected } = q.addFiles(files);
      setNotice(
        rejected.length
          ? `Added ${added}. Skipped ${rejected.length} non-audio file${rejected.length > 1 ? 's' : ''}: ${rejected.slice(0, 3).join(', ')}`
          : added
            ? `Added ${added} file${added > 1 ? 's' : ''}.`
            : 'Nothing new to add.'
      );
    },
    [q]
  );

  // dragenter/leave fire for every child element — count depth so the
  // highlight does not flicker as the pointer crosses inner nodes.
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    depth.current += 1;
    setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    if (e.dataTransfer?.files?.length) take(e.dataTransfer.files);
  };

  const readyCount = q.items.filter((i) => i.stage === 'pending' && i.pathNumber !== null).length;
  const blockedCount = q.items.filter((i) => i.stage === 'blocked').length;
  const doneCount = q.items.filter((i) => i.stage === 'complete').length;
  const failedCount = q.items.filter((i) => i.stage === 'failed').length;

  const prevDone = useRef(doneCount);
  useEffect(() => {
    if (doneCount > prevDone.current) onDone?.();
    prevDone.current = doneCount;
  }, [doneCount, onDone]);

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        borderRadius: 18,
        background: dragging ? 'rgba(157,107,255,.10)' : 'var(--card)',
        boxShadow: `inset 0 0 0 ${dragging ? 2 : 1}px ${dragging ? 'var(--purple)' : 'var(--line2)'}`,
        padding: '18px 20px',
        marginBottom: 16,
        transition: 'background .15s, box-shadow .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: q.items.length ? 14 : 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: 'var(--cream)', fontWeight: 500 }}>
            {dragging ? 'Release to add the recordings' : 'Drop recordings here'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>
            m4a · mp3 · wav · webm — the path is read from the filename, e.g. “Path 27 – The Tower”.
          </div>
        </div>
        <span
          onClick={() => inputRef.current?.click()}
          style={{
            fontSize: 12.5,
            padding: '8px 15px',
            borderRadius: 999,
            boxShadow: 'inset 0 0 0 1px var(--line2)',
            color: 'var(--muted)',
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          Choose files
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg,.aac,.flac"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) take(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {q.items.length ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 340, overflowY: 'auto' }}>
            {q.items.map((it) => (
              <Row key={it.id} item={it} onSetPath={q.setPath} onRemove={q.remove} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
            <span style={{ fontSize: 11.5, color: 'var(--faint)', flex: 1 }}>
              {q.items.length} in tray · {readyCount} ready
              {blockedCount ? ` · ${blockedCount} need a path` : ''}
              {doneCount ? ` · ${doneCount} done` : ''}
              {failedCount ? ` · ${failedCount} failed` : ''}
            </span>
            {doneCount || failedCount ? (
              <span
                onClick={q.clearFinished}
                style={{ fontSize: 11.5, padding: '7px 13px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}
              >
                Clear finished
              </span>
            ) : null}
            <span
              onClick={readyCount && !q.running ? q.start : undefined}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '9px 18px',
                borderRadius: 999,
                cursor: readyCount && !q.running ? 'pointer' : 'not-allowed',
                background: readyCount && !q.running ? 'var(--purple)' : 'var(--card2)',
                color: readyCount && !q.running ? '#0a0810' : 'var(--faint)',
                boxShadow: readyCount && !q.running ? '0 0 20px rgba(157,107,255,.4)' : 'inset 0 0 0 1px var(--line2)',
              }}
            >
              {q.running ? 'Uploading…' : `Upload ${readyCount || ''} & analyse ✷`}
            </span>
          </div>
        </>
      ) : null}

      {notice ? <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 10 }}>{notice}</div> : null}
    </div>
  );
}
