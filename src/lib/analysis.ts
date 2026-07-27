// Scrying analysis pipeline — ported from the desktop prototype's runAnalysis().
// Keyword heuristic; swap for a real NLP/LLM call later (keep the Reading shape).
import { spheres } from '../data/spheres';
import { paths } from '../data/paths';
import { planets } from '../data/planets';
import { zodiac } from '../data/zodiac';
import { corpus } from '../data/corpus';
import { EL, elemDefault, type Element } from '../theme';
import type { Reading, ReadingTerm, ReadingHit } from '../data/models';

const EL_KEYS: Record<Exclude<Element, 'Spirit'>, string[]> = {
  Air: ['think', 'thought', 'clarity', 'mind', 'idea', 'word', 'speak', 'breath', 'air', 'mercury', 'hod'],
  Fire: ['will', 'want', 'desire', 'anger', 'passion', 'fire', 'mars', 'geburah', 'ambition', 'drive', 'courage'],
  Water: ['feel', 'feeling', 'grief', 'love', 'tear', 'water', 'moon', 'dream', 'emotion', 'yesod', 'tide'],
  Earth: ['body', 'ground', 'patience', 'work', 'earth', 'saturn', 'malkuth', 'slow', 'build', 'learned', 'solid'],
};

export function runAnalysis(text: string): Reading {
  const lower = (text || '').toLowerCase();

  // 1. dominant element by keyword weight
  let best: Element = 'Spirit';
  let bestN = 0;
  (Object.keys(EL_KEYS) as Array<keyof typeof EL_KEYS>).forEach((el) => {
    let n = 0;
    EL_KEYS[el].forEach((k) => { if (lower.includes(k)) n++; });
    if (n > bestN) { bestN = n; best = el; }
  });
  if (bestN === 0) best = 'Spirit';

  // 2. correspondences detected (deduped)
  const terms: ReadingTerm[] = [];
  const seen: Record<string, boolean> = {};
  const pushTerm = (label: string, glyph: string, color: string, id: string) => {
    const k = label.toLowerCase();
    if (seen[k]) return;
    seen[k] = true;
    terms.push({ label, glyph, color, id });
  };
  spheres.forEach((s) => {
    if (lower.includes(s.title.toLowerCase()) || lower.includes(s.meaning.toLowerCase()))
      pushTerm(s.title, s.glyph, s.color, s.id);
  });
  planets.forEach((p) => {
    if (lower.includes(p.title.toLowerCase())) pushTerm(p.title, p.glyph, '#9d6bff', p.id);
  });
  zodiac.forEach((z) => {
    if (lower.includes(z.title.toLowerCase()))
      pushTerm(z.title, z.glyph, EL[z.element as Element]?.c || '#9d6bff', z.id);
  });
  paths.forEach((p) => {
    if (lower.includes(p.trump.toLowerCase()) || lower.includes(p.letter.toLowerCase()))
      pushTerm(p.trump, p.he, '#9d6bff', p.id);
  });

  // 3. numeric resonance — Hebrew corpus translits mentioned
  const hits: ReadingHit[] = [];
  corpus.forEach((c) => {
    if (c.script === 'he' && lower.includes(c.translit.toLowerCase()))
      hits.push({ text: c.text + ' · ' + c.translit, value: c.value, gloss: c.gloss });
  });

  // 4. suggested sphere — first detected sphere, else element default
  const detectedSphere = terms.find((t) => spheres.some((s) => s.id === t.id));
  const sphereId = detectedSphere ? detectedSphere.id : elemDefault[best];
  const sphereObj = spheres.find((s) => s.id === sphereId) || spheres[5];

  const ec = EL[best] || EL.Spirit;
  const elGlyph = ec.g; // △ Air/Fire · ▽ Water/Earth · ✷ Spirit
  const tcount = terms.length;

  // 5. integration summary (exact template from the prototype)
  const summary =
    'This sitting reads ' + best + '-ward — ' +
    (bestN ? bestN + ' elemental currents surfaced' : 'no single element dominated, which itself is worth noting') + '. ' +
    (tcount
      ? 'You touched ' + tcount + ' named correspondence' + (tcount > 1 ? 's' : '') + ', and the spread settles on ' + sphereObj.title + ' (' + sphereObj.meaning + '). '
      : 'No canonical names surfaced yet — the vision is still pre-verbal, which often means it is closest to its source. ') +
    'Sit with ' + sphereObj.title + ' before your next working: ' + sphereObj.desc.toLowerCase().replace(/\.$/, '') + '. ' +
    (hits.length
      ? 'The numbers you spoke (' + hits.map((h) => h.value).join(', ') + ') are worth carrying into the gematria chamber.'
      : 'When a name or number returns, run it through gematria — the resonance is rarely an accident.');

  return {
    elem: best,
    elemColor: ec.c,
    elemGlyph: elGlyph,
    sphere: sphereObj.title,
    sphereId: sphereObj.id,
    terms,
    hits,
    summary,
  };
}

export function exportMd(a: Reading, scryText: string): string {
  let md = '# Scrying reading\n\n';
  md += '**Dominant element:** ' + a.elem + '  \n';
  md += '**Suggested sphere:** ' + a.sphere + '\n\n';
  if (a.terms.length) md += '**Correspondences:** ' + a.terms.map((t) => t.label).join(', ') + '\n\n';
  if (a.hits.length) md += '**Numeric resonance:** ' + a.hits.map((h) => h.value + ' (' + h.text + ')').join('; ') + '\n\n';
  md += '## Integration\n' + a.summary + '\n\n---\n## Write-up\n' + scryText + '\n';
  return md;
}

// Sample transcript stub (Transcribe button) — replace with a real STT service.
export const SAMPLE_TRANSCRIPT =
  'I sat with the moon on the water and an old grief surfaced — Yesod, the tide of feeling. I let the will soften. Death came up in the cards, and I felt relief rather than fear. Adonai. The body wanted to ground what the vision showed.';
