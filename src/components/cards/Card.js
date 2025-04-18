import React from 'react';
import TreeOfLife from '../TreeOfLife';
import { Liber777 } from '../../constants/liber_777';
import { pathsData } from '../../constants/paths';
export const Card = ({
	key,
    column,
    colIndex,
    cardSize,
    selectedFilter,
    filterRanges,
    debouncedTerm,
    matchedFields,
    setSelectedCard
}) => {
    // const columnIndex = filterRanges[selectedFilter][colIndex];

	const columnIndex = parseInt(column.id);

    const values = Liber777	
        .map((row, rowIdx) => row?.[columnIndex])
        .filter(value => value && value !== '...');

    const matchedValues = debouncedTerm 
        ? Liber777
            .map((row, rowIdx) => {
				
				const matchKey = `${rowIdx}-${columnIndex}`;

				// if (matchedFields.has(test)) {
				// 	console.log("test", matchedFields, test);
				// }

				return {
					value: row?.[columnIndex],
					isMatch: matchedFields.has(matchKey),
					rowIdx
				}
			})
            .filter(({isMatch}) => isMatch)
        : [];

    let pathwayNumber = parseInt(column.title.replace(/\s*bis\s*/i, ''));
    let title = "Nowhere";

	if (column.title.includes("bis")) {
		title = `Pathway ${column.title}`;
	} else if (pathwayNumber <= 10) {
		title = `Sephira ${pathwayNumber}`;
	} else {
		title = `Pathway ${pathwayNumber}`;
	}
    pathwayNumber = isNaN(pathwayNumber) ? pathwayNumber : pathwayNumber;
    
    const kingScaleColor = Liber777[19]?.[columnIndex] || "#FFFFFF";
    const heavensOfAssiah = Liber777[7]?.[columnIndex] || "#FFFFFF";

    const cardStyles = {
        small: {
            container: "p-1 rounded-xl",
            title: "text-xs font-bold text-primary-300 mb-1",
            treeHeight: 80,
            radiusSephira: 4,
            showDetails: true,
            treeContainer: "flex justify-center items-center mb-1"
        },
        medium: {
            container: "p-2 rounded-2xl",
            title: "text-sm font-bold text-primary-300 mb-2",
            treeHeight: 150,
            radiusSephira: 8,
            showDetails: true,
            treeContainer: "flex justify-center items-center mb-2"
        },
        large: {
            container: "p-4 rounded-3xl",
            title: "text-xl font-bold text-primary-300 mb-2",
            treeHeight: 250,
            radiusSephira: 15,
            showDetails: true,
            treeContainer: "flex justify-center items-center mb-3"
        }
    };

    const style = cardStyles[cardSize];

	// const hasBis = /bis/i.test(column.title);
	// const cardNumber = parseInt(column.title.replace(/\s*bis\s*/i, '')) + (hasBis ? 0 : 1);
	// const cardName = pathsData[`${cardNumber}`]?.name;
	// const cardTitle = pathsData[`${cardNumber}`]?.title;
	// const cardDescription = pathsData[`${cardNumber}`]?.description;
	// console.log("cardNumber, column.title, ", cardNumber, column, "-->", cardTitle);
	// if (isNaN(pathwayNumber)) return null;

    return (
		<div 
			key={column.id}
			onClick={() => setSelectedCard({
				title: column.title,
				columnIndex: columnIndex,
				data: Liber777.map(row => row?.[columnIndex]),
				searchTerm: debouncedTerm
			})}
			className={`bg-gray-900 shadow-lg cursor-pointer 
					 hover:bg-gray-800 transition-colors rounded-3xl border border-primary-700/20
					 hover:border-primary-700/40 ${style.container}`}
		>
			<h3 className={style.title}>
				{title}
			</h3>
			<div className={style.treeContainer || 'flex justify-center items-center'}>
				<TreeOfLife 
					height={style.treeHeight}
					radiusSephira={style.radiusSephira}
					selected={[pathwayNumber]}
					pathwayColor={kingScaleColor}
				/>
			</div>
			{style.showDetails && (
				<div className="space-y-2">
					{debouncedTerm ? (
						// Show matched fields when searching
						matchedValues.map(({value, rowIdx}) => {
							if (value === '...') return null;
							return (
								<p key={rowIdx} 
								className={`text-gray-300 ${cardSize === 'small' ? 'text-xs' : 'text-sm'} bg-primary-500/20 rounded-xl px-1`}>
									<span className={`${cardSize === 'small' ? 'text-[10px]' : 'text-xs'} text-primary-400`}>
										{Liber777[rowIdx].index}:
									</span>
									<br />
									{value}
								</p>
							)
						})
					) : (
						// Show regular preview when not searching
						values.slice(0, cardSize === 'small' ? 1 : (cardSize === 'medium' ? 2 : 3)).map((value, idx) => (
							<p key={idx} className={`text-gray-300 ${cardSize === 'small' ? 'text-xs' : 'text-sm'}`}>
								{value}
							</p>
						))
					)}
					{cardSize === 'large' && (
						<p key={'z09123'} className="text-gray-300 text-sm">
							{heavensOfAssiah}
						</p>
					)}
					{values.length > (cardSize === 'medium' ? 2 : 4) && (
						<p className="text-secondary-400 text-sm italic">
							+ {values.length - (cardSize === 'medium' ? 2 : 4)} more...
						</p>
					)}
				</div>
			)}
		</div>
	);
}; 