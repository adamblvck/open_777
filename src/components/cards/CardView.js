import React from 'react';
import { Card } from './Card';
import { Liber777 } from '../../liber_777';
import { TableColumns } from '../../structure';



export const CardView = ({ 
    cardSize, 
    selectedFilter, 
    filterRanges, 
    debouncedTerm, 
    matchedFields,
    setSelectedCard 
}) => {
    const filteredColumns = TableColumns.filter((_, index) => 
        filterRanges[selectedFilter].includes(index)
    );

    const visibleCards = debouncedTerm
        ? filteredColumns.filter((_, colIndex) => {
            const columnIndex = filterRanges[selectedFilter][colIndex];
            return Liber777.some((row, rowIdx) => 
                matchedFields.has(`${rowIdx}-${columnIndex}`)
            );
        })
        : filteredColumns;

    const gridClasses = {
        small: "grid grid-cols-3 gap-1 p-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8",
        medium: "grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        large: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
    };

    return (
        <div className={gridClasses[cardSize]}>
            {visibleCards.map((column, colIndex) => (
                <Card
                    key={column.id}
                    column={column}
                    colIndex={colIndex}
                    cardSize={cardSize}
                    selectedFilter={selectedFilter}
                    filterRanges={filterRanges}
                    debouncedTerm={debouncedTerm}
                    matchedFields={matchedFields}
                    setSelectedCard={setSelectedCard}
                />
            ))}
        </div>
    );
}; 