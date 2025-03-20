// Helper functions
const getCoordinatesForRadius = (center, angle, radius) => {
    const x = center[0] + Math.cos(angle) * radius;
    const y = center[1] + Math.sin(angle) * radius;
    return [x, y];
};

export const drawTreeOfLife = (ctx, rect, { height, radiusSephira = 4, selected = [], pathwayColor = "#666" }) => {
    // Third of circle radius
    const r_3 = height / 3 / 2;

    console.log("selected", selected);

    const hexagramAngle = 2 * Math.PI / 6.0;
    const sidePillarXOffset = Math.sin(hexagramAngle) * r_3;
    const sidePillarYOffset = r_3 - Math.cos(hexagramAngle) * r_3;

    // Define sephirot positions and colors
    const sephirot = {
        // pillar of future
        3: { cx: height/2 - sidePillarXOffset, cy: r_3 + sidePillarYOffset, fillColor: '#fff' },
        5: { cx: height/2 - sidePillarXOffset, cy: r_3*2 + sidePillarYOffset, fillColor: '#fff' },
        8: { cx: height/2 - sidePillarXOffset, cy: r_3*3 + sidePillarYOffset, fillColor: '#fff' },

        // pillar of now
        1: { cx: height/2, cy: r_3, fillColor: 'white' },
        6: { cx: height/2, cy: height/2, fillColor: '#fff' },
        9: { cx: height/2, cy: height-r_3*2, fillColor: '#fff' },
        10: { cx: height/2, cy: height-r_3, fillColor: '#fff' },

        // pillar of past
        2: { cx: height/2 + sidePillarXOffset, cy: r_3 + sidePillarYOffset, fillColor: '#fff' },
        4: { cx: height/2 + sidePillarXOffset, cy: r_3*2 + sidePillarYOffset, fillColor: '#fff' },
        7: { cx: height/2 + sidePillarXOffset, cy: r_3*3 + sidePillarYOffset, fillColor: '#fff' },
    };

    // Define pathways
    const pathways = {
        11: { from: 1, to: 2 }, 12: { from: 1, to: 3 }, 13: { from: 1, to: 6 },
        14: { from: 2, to: 3 }, 15: { from: 2, to: 4 }, 16: { from: 2, to: 6 },
        17: { from: 3, to: 6 }, 18: { from: 3, to: 5 }, 19: { from: 4, to: 5 },
        20: { from: 4, to: 6 }, 21: { from: 4, to: 7 }, 22: { from: 5, to: 6 },
        23: { from: 5, to: 8 }, 24: { from: 6, to: 7 }, 25: { from: 6, to: 9 },
        26: { from: 6, to: 8 }, 27: { from: 7, to: 8 }, 28: { from: 7, to: 9 },
        29: { from: 7, to: 10 }, 30: { from: 8, to: 9 }, 31: { from: 8, to: 10 },
        32: { from: 9, to: 10 }
    };

    // Create a Set to track which sephirot should be highlighted
    const highlightedSephirot = new Set();
    
    // Add sephirot to highlight based on selected paths and direct sephirot selections
    selected.forEach(num => {
        if (num <= 10) {
            // Direct sephirot selection
            highlightedSephirot.add(num);
        } else if (num <= 32 && pathways[num]) {
            // Path selection - add both connected sephirot
            highlightedSephirot.add(pathways[num].from);
            highlightedSephirot.add(pathways[num].to);
        }
    });

    // Save context state
    ctx.save();

    // Translate context to center of header cell
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    ctx.translate(centerX - height/2, centerY - height/2);

    // Draw selected paths
    selected.forEach(num => {
        if (num > 10 && num <= 32 && pathways[num]) {
            const { from, to } = pathways[num];
            ctx.beginPath();
            ctx.moveTo(sephirot[from].cx, sephirot[from].cy);
            ctx.lineTo(sephirot[to].cx, sephirot[to].cy);
            ctx.strokeStyle = pathwayColor;
            ctx.lineWidth = radiusSephira/2;
            ctx.stroke();
        }
    });

    // Draw sephirot
    Object.entries(sephirot).forEach(([name, s]) => {
        const nameNum = parseInt(name);
        const isHighlighted = highlightedSephirot.has(nameNum);

        ctx.beginPath();
        ctx.arc(s.cx, s.cy, radiusSephira, 0, 2 * Math.PI);
        
        if (isHighlighted) {
            ctx.fillStyle = s.fillColor;
            ctx.fill();
        } else {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    });

    // Restore context state
    ctx.restore();
}; 