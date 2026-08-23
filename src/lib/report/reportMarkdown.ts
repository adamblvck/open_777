/**
 * A vision report as a portable Markdown document.
 *
 * Platform-agnostic on purpose (types-only imports, no DOM, no Node, no RN) so
 * the same serialiser produces the same file from the web app's download button
 * and the phone's share sheet. A reading someone exports from their laptop and
 * a reading they AirDrop off their phone should be the same document.
 *
 * The output is plain CommonMark: it opens in Obsidian, Bear, Notion, Ulysses
 * and any text editor, which is where this material actually gets kept. Nothing
 * here is lossy in the sense that matters — every field the renderer shows, the
 * export contains — but it is a *reading*, not a backup. `exportReportJson` is
 * the lossless form.
 */
import type {
  CorrespondenceObservation,
  ReportScene,
  ReportScenePiece,
  VisionReport,
} from '../apiTypes';

export interface ExportOptions {
  /** Prepended verbatim under the title. The raw transcript, when we have it. */
  transcript?: string | null;
  /** Overrides the "Path N" heading, e.g. "Path 27 · Pe · The Tower". */
  pathLabel?: string;
  /** ISO date used in the front matter. Defaults to the report's analysis date. */
  exportedAt?: string;
}

// ── helpers ────────────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/\r\n/g, '\n').trim();

/** Drops empty sections rather than emitting a heading with nothing under it. */
function section(heading: string, body: string | null | undefined): string[] {
  const text = (body ?? '').trim();
  return text ? [heading, '', text, ''] : [];
}

function list(items: (string | null | undefined)[] | null | undefined): string | null {
  const clean = (items ?? []).map((i) => (i ?? '').trim()).filter(Boolean);
  return clean.length ? clean.map((i) => `- ${i}`).join('\n') : null;
}

function timecode(ms: number | null): string {
  if (ms == null) return '';
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Seconds below a minute — a 23-second scrying is not "0 min recorded". */
function duration(seconds: number): string {
  return seconds < 60 ? `${Math.round(seconds)} sec recorded` : `${Math.round(seconds / 60)} min recorded`;
}

/**
 * Voice keys are storage identifiers, not headings. The renderers show them as
 * `voice.replace(/_/g, ' ')`, which leaves the unnamed default voice reading as
 * a section literally titled "default".
 */
function voiceHeading(voice: string): string {
  if (!voice || voice === 'default') return 'Reading';
  return voice
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * YAML front matter, so an export dropped into Obsidian is immediately
 * filterable by path and score instead of being an untagged wall of prose.
 */
function frontMatter(report: VisionReport, opts: ExportOptions): string[] {
  const meta = report.meta;
  const rows: [string, string | number | boolean | null][] = [
    ['title', `Path ${report.pathNumber} reading`],
    ['path', report.pathNumber],
    ['letter', meta?.letter ?? null],
    ['tarot', meta?.tarot ?? null],
    ['attribution', meta?.attribution ?? null],
    ['match_score', report.matchScore],
    ['verified', report.verified],
    ['recorded_seconds', meta?.recordedDurationSec ?? null],
    ['transcribed_words', meta?.transcribedWords ?? null],
    ['analysis_model', meta?.analysisModel ?? null],
    ['analysis_date', meta?.analysisDate ?? null],
    ['exported_at', opts.exportedAt ?? meta?.analysisDate ?? null],
    ['report_id', report.reportId],
    ['recording_id', report.recordingId],
    ['revision', report.revision],
  ];
  return [
    '---',
    ...rows
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'string' && /[:#]/.test(v) ? JSON.stringify(v) : v}`),
    '---',
    '',
  ];
}

function correspondenceTable(rows: CorrespondenceObservation[], showQuote: boolean): string | null {
  if (!rows.length) return null;
  const head = showQuote
    ? ['| Row | Expected | Witnessed | Confidence | Source |', '| --- | --- | --- | --- | --- |']
    : ['| Row | Expected | Note |', '| --- | --- | --- |'];
  const cell = (s: string | null) => (s ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const body = rows.map((r) =>
    showQuote
      ? `| ${cell(r.liber777Row)} | ${cell(r.expected)} | ${cell(r.witnessed)} | ${cell(r.confidence)} | ${cell(r.sourceQuote)} |`
      : `| ${cell(r.liber777Row)} | ${cell(r.expected)} | ${cell(r.explanation)} |`,
  );
  return [...head, ...body].join('\n');
}

function sceneBlock(scene: ReportScene, pieces: ReportScenePiece[]): string[] {
  const span = [timecode(scene.startMs), timecode(scene.endMs)].filter(Boolean).join('–');
  const out: string[] = [`### ${scene.sceneNumber}. ${scene.title}${span ? ` *(${span})*` : ''}`, ''];

  if (scene.summary) out.push(esc(scene.summary), '');

  const facts = [
    scene.mood ? `**Mood:** ${scene.mood}` : null,
    scene.keySymbols?.length ? `**Symbols:** ${scene.keySymbols.join(', ')}` : null,
    scene.dominantColors?.length ? `**Colours:** ${scene.dominantColors.join(', ')}` : null,
  ].filter(Boolean);
  if (facts.length) out.push(facts.join('  \n'), '');

  for (const piece of pieces.filter((p) => p.sceneNumber === scene.sceneNumber)) {
    if (piece.piece) out.push('> ' + esc(piece.piece).split('\n').join('\n> '), '');
    if (piece.archetypalNotes) out.push(esc(piece.archetypalNotes), '');

    for (const entity of piece.entities ?? []) {
      const desc = entity.description ? ` — ${entity.description}` : '';
      out.push(`**${entity.name}**${entity.kind ? ` *(${entity.kind})*` : ''}${desc}`, '');
      for (const d of entity.dialogues ?? []) {
        if (!d.text) continue;
        // "entity" is the being itself, so name it rather than printing the enum.
        const who = d.speaker === 'practitioner' ? 'Practitioner' : entity.name;
        out.push(`> **${who}:** ${esc(d.text)}`, '');
      }
    }

    const actions = (piece.ritualActions ?? [])
      .map((a) => [a.form, a.category, a.detail].filter(Boolean).join(' · '))
      .filter(Boolean);
    const actionList = list(actions);
    if (actionList) out.push('**Ritual actions**', '', actionList, '');
  }

  return out;
}

// ── the export ─────────────────────────────────────────────────────────────

export function reportToMarkdown(report: VisionReport, opts: ExportOptions = {}): string {
  const out: string[] = [];
  const meta = report.meta;

  out.push(...frontMatter(report, opts));

  const heading =
    opts.pathLabel ??
    ['Path ' + report.pathNumber, meta?.letter, meta?.tarot].filter(Boolean).join(' · ');
  out.push(`# ${heading}`, '');

  const stamp = [
    report.matchScore != null ? `Open777 ${report.matchScore}/100` : null,
    report.verified ? 'verified' : null,
    meta?.recordedDurationSec ? duration(meta.recordedDurationSec) : null,
    meta?.transcribedWords ? `${meta.transcribedWords} words` : null,
  ].filter(Boolean);
  if (stamp.length) out.push(`*${stamp.join(' · ')}*`, '');

  // The reading proper, first — it is what the practitioner came for.
  for (const voice of report.voiceReadings ?? []) {
    out.push(...section(`## ${voiceHeading(voice.voice)}`, voice.body));
  }

  const arche = report.archetypes;
  if (arche) {
    out.push(...section('## Jungian reading', arche.jungianReading));
    out.push(...section('## Hermetic reading', arche.hermeticReading));
    out.push(...section('## Integration', list(arche.integrationSuggestions)));

    if (arche.coreThemes?.length) {
      out.push('## Core themes', '');
      for (const t of arche.coreThemes) {
        out.push(`- **${t.name}**${t.description ? ` — ${t.description}` : ''}`);
        if (t.transcriptEvidence) out.push(`  > ${esc(t.transcriptEvidence)}`);
      }
      out.push('');
    }

    if (arche.personalMotifs?.length) {
      out.push('## Personal motifs', '');
      for (const m of arche.personalMotifs) {
        out.push(`- **${m.motif}**${m.note ? ` — ${m.note}` : ''}${m.recurrenceHint ? ` *(${m.recurrenceHint})*` : ''}`);
      }
      out.push('');
    }
  }

  const scenes = report.scenes ?? [];
  if (scenes.length) {
    out.push('## Scenes', '');
    for (const scene of [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber)) {
      out.push(...sceneBlock(scene, report.scenePieces ?? []));
    }
  }

  const xref = report.crossref;
  if (xref) {
    out.push('## Liber 777 cross-reference', '');
    if (xref.summary) out.push(esc(xref.summary), '');

    const rv = xref.ritualValidation;
    if (rv && (rv.expectedRitualForm || rv.actualRitualForm)) {
      out.push(
        [
          rv.pathCategory ? `**Path category:** ${rv.pathCategory}` : null,
          rv.expectedRitualForm ? `**Expected form:** ${rv.expectedRitualForm}` : null,
          rv.actualRitualForm ? `**Observed form:** ${rv.actualRitualForm}` : null,
          rv.isCorrect != null ? `**Correct:** ${rv.isCorrect ? 'yes' : 'no'}` : null,
          rv.notes ? `**Notes:** ${rv.notes}` : null,
        ]
          .filter(Boolean)
          .join('  \n'),
        '',
      );
    }

    const matched = correspondenceTable(xref.matchedCorrespondences ?? [], true);
    if (matched) out.push('### Witnessed', '', matched, '');
    const unexpected = correspondenceTable(xref.unexpectedElements ?? [], true);
    if (unexpected) out.push('### Unexpected', '', unexpected, '');
    const unmatched = correspondenceTable(xref.unmatchedCorrespondences ?? [], false);
    if (unmatched) out.push('### Not witnessed', '', unmatched, '');
  }

  const mood = report.moodboard;
  if (mood) {
    out.push(...section('## Atmosphere', mood.atmosphere));
    if (mood.palette?.length) {
      out.push('### Palette', '');
      for (const s of mood.palette) {
        out.push(`- ${s.hex ? `\`${s.hex}\` ` : ''}**${s.name}**${s.note ? ` — ${s.note}` : ''}`);
      }
      out.push('');
    }
    if (mood.items?.length) {
      out.push('### Moodboard', '');
      for (const i of mood.items) {
        out.push(`- **${i.name}**${i.description ? ` — ${i.description}` : ''}`);
      }
      out.push('');
    }
  }

  if (opts.transcript?.trim()) {
    out.push('---', '', '## Transcript', '', esc(opts.transcript), '');
  }

  // Collapse the runs of blank lines the optional sections leave behind.
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/** The lossless form — everything the server sent, for re-import or archiving. */
export function reportToJson(report: VisionReport, opts: ExportOptions = {}): string {
  return JSON.stringify(
    { exportedAt: opts.exportedAt ?? null, transcript: opts.transcript ?? null, report },
    null,
    2,
  );
}

/** `path-27-pe-the-tower-2026-07-30.md` — sorts sanely in a folder. */
export function exportFilename(
  report: VisionReport,
  ext: 'md' | 'json',
  opts: ExportOptions = {},
): string {
  const slug = (opts.pathLabel ?? `path-${report.pathNumber}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const date = (opts.exportedAt ?? report.meta?.analysisDate ?? '').slice(0, 10);
  return [slug || `path-${report.pathNumber}`, date].filter(Boolean).join('-') + '.' + ext;
}
