import _ from 'lodash';

interface TreeOfLifeProps {
  height: number;
  radiusSephira: number;
  selected?: number[];
  pathwayColor?: string;
  /** Draw every path faintly, so the glyph reads as a whole map. */
  showAllPaths?: boolean;
  /** Per-path stroke colour, keyed by path number (11-32). */
  pathColors?: Record<number, string>;
  /** Per-path opacity — used to encode how often a path has been walked. */
  pathOpacity?: Record<number, number>;
  /** Per-sephira fill override. */
  sephiraColors?: Record<number, string>;
  onSelectPath?: (pathNumber: number) => void;
  onSelectSephira?: (n: number) => void;
  /** Tooltip text per path. */
  pathTitle?: (pathNumber: number) => string;
}

interface Node {
  cx: number;
  cy: number;
  fillColor: string;
}

const TreeOfLife = ({
  height,
  radiusSephira,
  selected = [],
  pathwayColor = '#FFFFFF',
  showAllPaths = false,
  pathColors,
  pathOpacity,
  sephiraColors,
  onSelectPath,
  onSelectSephira,
  pathTitle,
}: TreeOfLifeProps) => {
  // Third of circle radius
  const r_3 = height / 3 / 2;

  const hexagramAngle = (2 * Math.PI) / 6.0;
  const sidePillarXOffset = Math.sin(hexagramAngle) * r_3;
  const sidePillarYOffset = r_3 - Math.cos(hexagramAngle) * r_3;

  // Define pathways between sephirot (Hebrew letter paths)
  const pathways: Record<number, { from: number; to: number }> = {
    11: { from: 1, to: 2 }, // א Aleph
    12: { from: 1, to: 3 }, // ב Beth
    13: { from: 1, to: 6 }, // ג Gimel
    14: { from: 2, to: 3 }, // ד Daleth
    15: { from: 2, to: 4 }, // ה Heh (swapped with Tzaddi)
    16: { from: 2, to: 6 }, // ו Vav
    17: { from: 3, to: 6 }, // ז Zayin
    18: { from: 3, to: 5 }, // ח Cheth
    19: { from: 4, to: 5 }, // ט Teth
    20: { from: 4, to: 6 }, // י Yod
    21: { from: 4, to: 7 }, // כ Kaph
    22: { from: 5, to: 6 }, // ל Lamed
    23: { from: 5, to: 8 }, // מ Mem
    24: { from: 6, to: 7 }, // נ Nun
    25: { from: 6, to: 9 }, // ס Samekh
    26: { from: 6, to: 8 }, // ע Ayin
    27: { from: 7, to: 8 }, // פ Peh
    28: { from: 7, to: 9 }, // צ Tzaddi (swapped with Heh)
    29: { from: 7, to: 10 }, // ק Qoph
    30: { from: 8, to: 9 }, // ר Resh
    31: { from: 8, to: 10 }, // ש Shin
    32: { from: 9, to: 10 }, // ת Tav
  };

  const sephirot: Record<number, Node> = {
    // pillar of future
    3: { cx: height / 2 - sidePillarXOffset, cy: r_3 + sidePillarYOffset, fillColor: 'black' }, // binah
    5: { cx: height / 2 - sidePillarXOffset, cy: r_3 * 2 + sidePillarYOffset, fillColor: '#FF0000' }, // geburah
    8: { cx: height / 2 - sidePillarXOffset, cy: r_3 * 3 + sidePillarYOffset, fillColor: '#FF9900' }, // hod
    // pillar of now
    1: { cx: height / 2, cy: r_3, fillColor: 'white' }, // kether
    6: { cx: height / 2, cy: height / 2, fillColor: '#FFff00' }, // tipareth
    9: { cx: height / 2, cy: height - r_3 * 2, fillColor: '#CC00CC' }, // yesod
    10: { cx: height / 2, cy: height - r_3, fillColor: '#CC6633' }, // malkuth
    // pillar of past
    2: { cx: height / 2 + sidePillarXOffset, cy: r_3 + sidePillarYOffset, fillColor: '#999999' }, // chokmah
    4: { cx: height / 2 + sidePillarXOffset, cy: r_3 * 2 + sidePillarYOffset, fillColor: '#0000FF' }, // chesed
    7: { cx: height / 2 + sidePillarXOffset, cy: r_3 * 3 + sidePillarYOffset, fillColor: '#00CC00' }, // netzach
  };

  const malkuthElements: Record<string, { startAngle: number; endAngle: number; color: string }> = {
    air: { startAngle: -Math.PI / 4 - Math.PI / 2, endAngle: Math.PI / 4 - Math.PI / 2, color: '#FFFF66' },
    fire: { startAngle: -Math.PI / 4 + Math.PI, endAngle: Math.PI / 4 + Math.PI, color: '#CC6633' },
    water: { startAngle: -Math.PI / 4, endAngle: Math.PI / 4, color: '#669900' },
    earth: { startAngle: -Math.PI / 4 + Math.PI / 2, endAngle: Math.PI / 4 + Math.PI / 2, color: '#000000' },
  };

  const getCoordinatesForRadius = (center: number[], angle: number, radius: number): [number, number] => {
    const x = center[0] + Math.cos(angle) * radius;
    const y = center[1] + Math.sin(angle) * radius;
    return [x, y];
  };

  const drawSlice = (center: number[], angleStart: number, angleStop: number, radius: number, color: string) => {
    const [startX, startY] = getCoordinatesForRadius(center, angleStart, radius);
    const [endX, endY] = getCoordinatesForRadius(center, angleStop, radius);
    const largeArcFlag = Math.abs(angleStop - angleStart) > Math.PI ? 1 : 0;
    const pathData = [`M ${startX} ${startY}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, `L ${center[0]} ${center[1]}`].join(' ');
    return <path d={pathData} fill={color} key={pathData} />;
  };

  const drawPath = (pathNumber: number, from: number, to: number) => {
    const x1 = sephirot[from].cx;
    const y1 = sephirot[from].cy;
    const x2 = sephirot[to].cx;
    const y2 = sephirot[to].cy;
    const d = `M ${x1} ${y1} L ${x2} ${y2}`;
    const stroke = pathColors?.[pathNumber] ?? pathwayColor;
    const opacity = pathOpacity?.[pathNumber];
    return (
      <g key={`path-${pathNumber}`}>
        <path d={d} stroke={stroke} strokeWidth={radiusSephira / 2} strokeOpacity={opacity} fill="none" />
        {/* A radiusSephira/2 stroke is far too thin to hit reliably, so every
            path also carries a wide transparent line for pointer events. */}
        {onSelectPath || pathTitle ? (
          <path
            d={d}
            stroke="transparent"
            strokeWidth={Math.max(radiusSephira * 1.8, 10)}
            fill="none"
            style={{ cursor: onSelectPath ? 'pointer' : undefined }}
            onClick={onSelectPath ? () => onSelectPath(pathNumber) : undefined}
          >
            {pathTitle ? <title>{pathTitle(pathNumber)}</title> : null}
          </path>
        ) : null}
      </g>
    );
  };

  const getAffectedSephirot = (): Set<number> => {
    const affected = new Set<number>();
    selected.forEach((num) => {
      if (num <= 10) {
        affected.add(num);
      } else if (num <= 32 && pathways[num]) {
        affected.add(pathways[num].from);
        affected.add(pathways[num].to);
      }
    });
    return affected;
  };

  const affectedSephirot = getAffectedSephirot();
  const isMalkuthAffected = affectedSephirot.has(10);

  return (
    <svg height={height} width={height} viewBox={`0 0 ${height} ${height}`} className="tree-of-life">
      {/* Paths */}
      {(showAllPaths ? Object.keys(pathways).map(Number) : selected).map((num) => {
        if (num > 10 && num <= 32 && pathways[num]) {
          return drawPath(num, pathways[num].from, pathways[num].to);
        }
        return null;
      })}

      {/* Sephirot */}
      {_.map(sephirot, (s: Node, name) => {
        const nameNum = parseInt(name);
        const isSelected = affectedSephirot.has(nameNum);
        const stroke = isSelected ? undefined : 'white';
        const override = sephiraColors?.[nameNum];
        const fill = override ?? (isSelected ? s.fillColor : 'transparent');
        return (
          <circle
            cx={s.cx}
            cy={s.cy}
            r={radiusSephira}
            stroke={stroke}
            strokeWidth="0.5"
            fill={fill}
            key={name}
            style={{ cursor: onSelectSephira ? 'pointer' : undefined }}
            onClick={onSelectSephira ? () => onSelectSephira(nameNum) : undefined}
          />
        );
      })}

      {/* Malkuth elemental slices */}
      {isMalkuthAffected &&
        _.map(malkuthElements, (m) => drawSlice([sephirot[10].cx, sephirot[10].cy], m.startAngle, m.endAngle, radiusSephira, m.color))}
    </svg>
  );
};

/**
 * Path geometry, exported so callers can derive which paths touch a sephira
 * without duplicating the table. Path number -> the two sephiroth it joins.
 */
export const PATHWAYS: Record<number, { from: number; to: number }> = {
  11: { from: 1, to: 2 }, 12: { from: 1, to: 3 }, 13: { from: 1, to: 6 },
  14: { from: 2, to: 3 }, 15: { from: 2, to: 4 }, 16: { from: 2, to: 6 },
  17: { from: 3, to: 6 }, 18: { from: 3, to: 5 }, 19: { from: 4, to: 5 },
  20: { from: 4, to: 6 }, 21: { from: 4, to: 7 }, 22: { from: 5, to: 6 },
  23: { from: 5, to: 8 }, 24: { from: 6, to: 7 }, 25: { from: 6, to: 9 },
  26: { from: 6, to: 8 }, 27: { from: 7, to: 8 }, 28: { from: 7, to: 9 },
  29: { from: 7, to: 10 }, 30: { from: 8, to: 9 }, 31: { from: 8, to: 10 },
  32: { from: 9, to: 10 },
};

export default TreeOfLife;
