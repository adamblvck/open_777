// Compact Tree-of-Life for the Reference sphere hero — all 10 nodes drawn
// faintly, with a glowing coloured dot on the selected node. Ported from the
// prototype's inline hero SVG (60×100 space).
const NODES: Array<[number, number]> = [
  [30, 6], [52, 22], [8, 22], [52, 42], [8, 42],
  [30, 52], [52, 64], [8, 64], [30, 76], [30, 94],
];

export default function TreeOfLifeMini({ nx, ny, color }: { nx: number; ny: number; color: string }) {
  return (
    <svg width="92" height="152" viewBox="0 0 60 100" style={{ flex: 'none' }}>
      <g stroke="#211e2b" strokeWidth="1" fill="none">
        <path d="M30 6 52 22M30 6 8 22M30 6 30 52M52 22 8 22M52 22 52 42M52 22 30 52M8 22 8 42M8 22 30 52M52 42 8 42M52 42 30 52M52 42 52 64M8 42 30 52M8 42 8 64M30 52 52 64M30 52 8 64M30 52 30 76M52 64 8 64M52 64 30 76M8 64 30 76M30 76 30 94" />
      </g>
      <g fill="#0a0810" stroke="#2c2937" strokeWidth="1">
        {NODES.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="5" />
        ))}
      </g>
      <circle cx={nx} cy={ny} r="6.5" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
    </svg>
  );
}
