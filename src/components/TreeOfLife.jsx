import React from 'react';
import _ from 'lodash';

const TreeOfLife = ({ height, radiusSephira, selected = [], pathwayColor = "#FFFFFF" }) => {
    // Third of circle radius
    const r_3 = height / 3 / 2;

    const hexagramAngle = 2 * Math.PI / 6.0;
    const sidePillarXOffset = Math.sin(hexagramAngle) * r_3;
    const sidePillarYOffset = r_3 - Math.cos(hexagramAngle) * r_3;

    // Define pathways between sephirot (Hebrew letter paths)
    const pathways = {
        11: { from: 1, to: 2 },  // א Aleph
        12: { from: 1, to: 3 },  // ב Beth
        13: { from: 1, to: 6 },  // ג Gimel
        14: { from: 2, to: 3 },  // ד Daleth
        15: { from: 2, to: 4 },  // ה Heh (swapped with Tzaddi)
        16: { from: 2, to: 6 },  // ו Vav
        17: { from: 3, to: 6 },  // ז Zayin
        18: { from: 3, to: 5 },  // ח Cheth
        19: { from: 4, to: 5 },  // ט Teth
        20: { from: 4, to: 6 },  // י Yod
        21: { from: 4, to: 7 },  // כ Kaph
        22: { from: 5, to: 6 },  // ל Lamed
        23: { from: 5, to: 8 },  // מ Mem
        24: { from: 6, to: 7 },  // נ Nun
        25: { from: 6, to: 9 },  // ס Samekh
        26: { from: 6, to: 8 },  // ע Ayin
        27: { from: 7, to: 8 },  // פ Peh
        28: { from: 7, to: 9 },  // צ Tzaddi (swapped with Heh)
        29: { from: 7, to: 10 }, // ק Qoph
        30: { from: 8, to: 9 },  // ר Resh
        31: { from: 8, to: 10 }, // ש Shin
        32: { from: 9, to: 10 }, // ת Tav
    };

    const sephirot = {
        // pillar of future
        3: { // binah
            cx: height/2 - sidePillarXOffset,
            cy: r_3 + sidePillarYOffset,
            fillColor: 'black'
        },
        5: { // geburah
            cx: height/2 - sidePillarXOffset,
            cy: r_3*2 + sidePillarYOffset,
            fillColor: '#FF0000'
        },
        8: { // hod
            cx: height/2 - sidePillarXOffset,
            cy: r_3*3 + sidePillarYOffset,
            fillColor: '#FF9900'
        },

        // pillar of now
        1: { // kether
            cx: height/2,
            cy: r_3,
            fillColor: 'white'
        },
        6: { // tipareth
            cx: height/2,
            cy: height/2,
            fillColor: '#FFff00'
        },
        9: { // yesod
            cx: height/2,
            cy: height-r_3*2,
            fillColor: '#CC00CC'
        },
        10: { // malkuth
            cx: height/2,
            cy: height-r_3,
            fillColor: '#CC6633'
        },

        // pillar of past
        2: { // chokmah
            cx: height/2 + sidePillarXOffset,
            cy: r_3 + sidePillarYOffset,
            fillColor: '#999999'
        },
        4: { // chesed
            cx: height/2 + sidePillarXOffset,
            cy: r_3*2 + sidePillarYOffset,
            fillColor: '#0000FF'
        },
        7: { // netzach
            cx: height/2 + sidePillarXOffset,
            cy: r_3*3 + sidePillarYOffset,
            fillColor: '#00CC00'
        },
    };

    const malkuthElements = {
        air: {
            startAngle: -Math.PI/4 - Math.PI/2,
            endAngle: Math.PI/4 - Math.PI/2,
            color: '#FFFF66',
        },
        fire: {
            startAngle: -Math.PI/4 + Math.PI,
            endAngle: Math.PI/4 + Math.PI,
            color: '#CC6633',
        },
        water: {
            startAngle: -Math.PI/4,
            endAngle: Math.PI/4,
            color: '#669900',
        },
        earth: {
            startAngle: -Math.PI/4 + Math.PI/2,
            endAngle: Math.PI/4 + Math.PI/2,
            color: '#000000',
        },
    };

    const getCoordinatesForRadius = (center, angle, radius) => {
        const x = center[0] + Math.cos(angle) * radius;
        const y = center[1] + Math.sin(angle) * radius;
        return [x, y];
    };

    const drawSlice = (center, angleStart, angleStop, radius, color) => {
        const [startX, startY] = getCoordinatesForRadius(center, angleStart, radius);
        const [endX, endY] = getCoordinatesForRadius(center, angleStop, radius);
        const largeArcFlag = Math.abs(angleStop - angleStart) > Math.PI ? 1 : 0;
        const pathData = [
            `M ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L ${center[0]} ${center[1]}`,
        ].join(' ');

        return <path d={pathData} fill={color} key={pathData} />;
    };

    // Function to draw a path between two sephirot
    const drawPath = (from, to) => {
        const x1 = sephirot[from].cx;
        const y1 = sephirot[from].cy;
        const x2 = sephirot[to].cx;
        const y2 = sephirot[to].cy;

        return (
            <path
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                stroke={pathwayColor}
                strokeWidth={radiusSephira/2}
                key={`path-${from}-${to}`}
            />
        );
    };

    // Function to get all affected sephirot (direct and from paths)
    const getAffectedSephirot = () => {
        const affectedSephirot = new Set();
        
        selected.forEach(num => {
            if (num <= 10) {
                // Direct sephirot selection
                affectedSephirot.add(num);
            } else if (num <= 32 && pathways[num]) {
                // Path selection - add both connected sephirot
                affectedSephirot.add(pathways[num].from);
                affectedSephirot.add(pathways[num].to);
            }
        });

        return affectedSephirot;
    };

    const affectedSephirot = getAffectedSephirot();
    const isMalkuthAffected = affectedSephirot.has(10);

    return (
        <svg 
            height={height} 
            width={height} 
            viewBox={`0 0 ${height} ${height}`}
            className="tree-of-life"
        >
            {/* Draw Paths */}
            {selected.map(num => {
                if (num > 10 && num <= 32 && pathways[num]) {
                    return drawPath(pathways[num].from, pathways[num].to);
                }
                return null;
            })}

            {/* Draw Main Sephirot */}
            {_.map(sephirot, (s, name) => {
                const nameNum = parseInt(name);
                const isSelected = affectedSephirot.has(nameNum);
                const stroke = isSelected ? null : "white";
                const fill = isSelected 
                    ? s.fillColor 
                    : 'transparent';

                return (
                    <circle
                        cx={s.cx}
                        cy={s.cy}
                        r={radiusSephira}
                        stroke={stroke}
                        strokeWidth="0.5"
                        fill={fill}
                        key={name}
                    />
                );
            })}

            {/* Draw Malkuth Slices */}
            {isMalkuthAffected && _.map(malkuthElements, (m, name) => 
                drawSlice(
                    [sephirot[10].cx, sephirot[10].cy],
                    m.startAngle,
                    m.endAngle,
                    radiusSephira,
                    m.color
                )
            )}
        </svg>
    );
};

export default TreeOfLife; 