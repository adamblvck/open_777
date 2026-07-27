// Ritual preparation knowledge base — ported verbatim from open777Native.
// Short, actionable entries for in-app display (scrying chamber + journey).
export type ContentEntry = { title: string; body: string };

export const ritualContent: Record<string, ContentEntry> = {
  Asana: {
    title: 'Asana',
    body: 'A steady, comfortable posture from Liber E. Hold for ~30 minutes without moving. Stabilizes the body and quiets nervous activity to enable imaginal work and the Body of Light.',
  },
  LBRP: {
    title: 'Lesser Banishing Ritual of the Pentagram',
    body: 'Core hygiene ritual. Perform Qabalistic Cross, draw banishing Earth pentagrams in four quarters while vibrating divine names, visualize archangels. Use to clear space physically or astrally before and after workings. Practice until it is second nature.',
  },
  'Qabalistic Cross': {
    title: 'Qabalistic Cross',
    body: 'A centering act that establishes vertical axis and authority. Touch forehead/solar plexus/shoulders while vibrating the divine names. Use at the start and end of pentagram/hexagram work to “bookend” the operation and stabilize the sphere of sensation.',
  },
  'Greater Invoking Ritual of the Pentagram': {
    title: 'Greater Invoking Ritual of the Pentagram (GRP)',
    body: 'Opened with the Qabalistic Cross, then invoke Spirit and the element of each quarter using the appropriate pentagrams and portal signs. Use when you need fine elemental focus (e.g., invoking Fire for Path 31 or the quarter corresponding to a sign). Close with the Cross. See also: banishing form to seal.',
  },
  'Greater Banishing Pentagram': {
    title: 'Greater Banishing Ritual of the Pentagram',
    body: 'Same structure as GRP but with banishing forms in all quarters. Use to shut down previously invoked forces and to return the temple to neutral. Often followed by a final LBRP.',
  },
  'Invoking Hexagram': {
    title: 'Invoking Hexagram (Unicursal)',
    body: 'Used to call planetary forces. Trace the Unicursal hexagram starting at the planet’s point and move clockwise to return; for Sol, work from the center. Bookend with Analysis of the Keyword. Aim the figure at the actual body in the sky when practical.',
  },
  'Banishing Hexagram': {
    title: 'Banishing Hexagram (Unicursal)',
    body: 'Banishing form traces counterclockwise from the planet point (Sol from center). Used to close planetary work or to test/banish spirits that claim a planetary nature.',
  },
  'Analysis of the Keyword': {
    title: 'Analysis of the Keyword (LVX Signs)',
    body: 'INRI formula with LVX signs: Osiris Slain, Mourning of Isis, Apophis & Typhon, Osiris Risen; conclude with “L.V.X., Lux, the Light of the Cross.” Use as opener/closer around Greater Hexagram operations.',
  },
  'Body of Light': {
    title: 'Body of Light (Astral Double)',
    body: 'Exteriorize a vivid image of yourself in perfect health before you. Transfer the seat of consciousness into it. Practice rising, testing with pentagrams/hexagrams, and returning with the Sign of Silence. Keep meticulous records.',
  },
  'Ascend Above Earth': {
    title: 'Ascend Above Earth',
    body: 'After transferring into the Body of Light, rise above the room → the city → the atmosphere, until you perceive the Earth beneath you. This “lift” stabilizes the imaginal scene and helps the coming Gate feel cosmic rather than dreamlike.',
  },
  'Enter into Gate': {
    title: 'Enter into Gate',
    body: 'Construct a vivid doorway floating in space. Place the Hebrew letter of the path prominently on the door, and add the appropriate sigil beside it (planet / zodiac sign / element). Treat the door as the single intentional “click” that takes you into the path.',
  },
  'Close the Gate': {
    title: 'Close the Gate (Behind You)',
    body: 'After stepping through, close the door behind you as a deliberate act. This creates focus: you’re not half in the temple and half in the vision. Once the gate is closed, commit to exploring the space fully before returning.',
  },
  'Pentagram Testing': {
    title: 'Pentagram Testing (Testing the Spirits)',
    body: 'Test the truth of the vision. Use pentagrams (or hexagrams for planetary claims) as needed. Demand clarity. Any presence that resists testing, flatters you, or tries to distract you should be banished or ignored.',
  },
  'Image Streaming': {
    title: 'Image Streaming (Voice Recording Recommended)',
    body: 'Narrate aloud what you see into a recorder as it unfolds. This trains visualization, deepens stability, and creates a timestamped record. Keep your voice calm, descriptive, and sensory (“colors, shapes, textures, motion”).',
  },
  'Sign of Silence': {
    title: 'Sign of Silence (Harpocrates)',
    body: 'After re-merging with the physical, assume the god-form of Harpocrates and place the forefinger to the lips. Locks the Body of Light back into the body and seals the work.',
  },
  Journal: {
    title: 'Magical Record',
    body: 'Write everything: date, time, methods, sequences, results, and after-thoughts. Verify visions later by correspondences, gematria, repeatability, and pentagram/hexagram tests.',
  },
};

/** The prep sequence, in ritual order. */
export const RITUAL_PREP: string[] = Object.keys(ritualContent);

export function lookupContent(key?: string): ContentEntry | undefined {
  return key ? ritualContent[key] : undefined;
}
