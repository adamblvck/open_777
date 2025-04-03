import React from 'react';
import TreeOfLife from '../TreeOfLife';
import { Liber777 } from '../../constants/liber_777';
import { pathsData } from '../../constants/paths';
import { getTextColor } from '../../helpers/helpers';

export const Modal = ({ card, matchedFields, searchTerm, onClose }) => {
    const [showLiberO, setShowLiberO] = React.useState(false);
    const [favorites, setFavorites] = React.useState(() => {
        const stored = localStorage.getItem('favoriteCorrespondences');
        return stored ? JSON.parse(stored) : [];
    });

    // Early return if no card is provided
    if (!card) return null;

    // Move these declarations after the null check
    const cardNumber = parseInt(card.title);
    const cardName = pathsData[`${cardNumber}`]?.name;
    const cardTitle = pathsData[`${cardNumber}`]?.title;
    const cardDescription = pathsData[`${cardNumber}`]?.description;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const copyAllData = () => {
        if (!card) return;
        
        const sphereInfo = cardDescription ? `${cardName}\n${cardDescription}` : '';
        
        const formattedData = card.data
            .map((value, idx) => {
                if (!value || value === '...') return null;
                const header = Liber777[idx]?.index;
                return `${header}: ${value}`;
            })
            .filter(Boolean)
            .join('\n');
            
        navigator.clipboard.writeText(sphereInfo + '\n\n' + formattedData);
    };

    const liberOIndices = [
        'II', 'III', 'V', 'VI', 'VII', 'IX', 'XI', 'XII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX',
        'XXXIV', 'XXXV', 'XXXVIII', 'XXXIX', 'XL', 'XLI', 'XLII', 'XLV', 'LIV', 'LV', 'LIX', 'LX', 'LXI',
        'LXIII', 'LXX', 'LXXV', 'LXXVII', 'LXVIII', 'LXXIX', 'LXXX', 'LXXXI', 'LXXXIII', 'XCVII', 'XCVIII',
        'XCIX', 'C', 'CI', 'CXVII', 'CXVIII', 'CXXXVII', 'CXXXVIII', 'CXXXIX', 'CLXXV', 'CLXXVI', 'CLXXVII',
        'CLXXXII'
    ];

    const toggleFavorite = (idx) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(idx)
                ? prev.filter(i => i !== idx)
                : [...prev, idx];
            
            localStorage.setItem('favoriteCorrespondences', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const StarButton = ({ idx, isFavorite }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(idx);
            }}
            className="p-0 rounded-md hover:bg-gray-700/50 transition-colors"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-500 fill-current'}`}
                viewBox="0 0 20 20"
            >
                <path
                    fillRule="evenodd"
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
            </svg>
        </button>
    );

    return (
		<div 
			className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
			onClick={handleBackdropClick}
		>
			<div className="bg-gray-900/95 rounded-xl w-full h-[90vh] max-w-7xl overflow-hidden border border-primary-700/20 shadow-2xl modal-content">
				{/* Header */}
				<div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-primary-700/20 flex flex-col gap-4">
					<div className="flex items-center justify-between w-full">
						<h2 className="text-3xl font-bold text-primary-300">{cardTitle}</h2>
						<button 
							onClick={onClose}
							className="rounded-full p-2 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div className="flex items-center justify-center gap-2 flex-wrap">
						<button
							onClick={copyAllData}
							className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							Copy all
						</button>
						<div className="relative group">
							<button
								className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-semibold transition-colors"
							>
								i
							</button>
							<div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-2 bg-gray-800 rounded-md text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
								With the copy all button you'll be able to copy all the information in this popup, perfect for LLM usage.
							</div>
						</div>
						<button
							onClick={() => setShowLiberO(!showLiberO)}
							className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md ${
								showLiberO ? 'bg-primary-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
							} transition-colors`}
						>
							Liber O
						</button>
						<div className="relative group">
							<button
								className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-semibold transition-colors"
							>
								i
							</button>
							<div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-2 bg-gray-800 rounded-md text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
								Toggling this will only show correspondences that are to be "committed to memory", as mentioned in Liber O, Chapter II.1
							</div>
						</div>
					</div>
				</div>

				{/* New content layout with grid */}
				<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-[calc(90vh-5rem)]">
					{/* Sticky Tree of Life Section */}
					<div className="hidden lg:block bg-gray-800/30 border-r border-primary-700/20">
						<div className="sticky top-0 p-6 max-h-[calc(90vh-5rem)] overflow-y-auto">
							<div className="bg-gray-800/50 rounded-lg p-4 border border-primary-700/10">
								<h3 className="text-secondary-400 font-medium mb-4 text-sm uppercase tracking-wider">
									Path on the Tree
								</h3>
								<div className="flex justify-center items-center">
									<TreeOfLife 
										height={250} 
										radiusSephira={15} 
										selected={[parseInt(card.title)]}
										pathwayColor={card.data[19] || "#FFFFFF"}
									/>
								</div>

								{/* Path Information */}
								<div className="mt-6 space-y-4">
									<h3 className="text-2xl font-semibold text-primary-300 text-left">
										{cardName}
									</h3>
									<div className="text-gray-300 leading-relaxed text-base text-left space-y-4">
										{cardDescription?.split('\n\n').map((paragraph, index) => (
											<p key={index}>{paragraph}</p>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Scrollable Content Section */}
					<div className="p-6 overflow-y-auto">
						{/* Show TreeOfLife at the top on mobile */}
						<div className="lg:hidden mb-6">
							<div className="bg-gray-800/50 rounded-lg p-4 border border-primary-700/10">
								<h3 className="text-secondary-400 font-medium mb-4 text-sm uppercase tracking-wider">
									Path on the Tree
								</h3>
								<div className="flex justify-center items-center">
									<TreeOfLife 
										height={250} 
										radiusSephira={15} 
										selected={[parseInt(card.title)]}
										pathwayColor={card.data[19] || "#FFFFFF"}
									/>
								</div>

								{/* Path Information */}
								<div className="mt-6 space-y-4">
									<h3 className="text-2xl font-semibold text-primary-300 text-left">
										{cardName}
									</h3>
									<div className="text-gray-300 leading-relaxed text-base text-left space-y-4">
										{cardDescription?.split('\n\n').map((paragraph, index) => (
											<p key={index}>{paragraph}</p>
										))}
									</div>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Searched Terms Section */}
							{searchTerm && (
								<>
									<div className="md:col-span-2">
										<h2 className="text-xl font-semibold text-primary-300 mb-4">
											Searched Terms
										</h2>
									</div>
									{card.data.map((value, idx) => {
										if (!value || value === '...') return null;
										
										if (showLiberO) {
											const currentIndex = Liber777[idx]?.index?.split('.')?.[0];
											if (!liberOIndices.includes(currentIndex)) return null;
										}

										const matchKey = `${idx}-${card.columnIndex}`;
										if (!matchedFields.has(matchKey)) return null;
										
										return (
											<div 
												key={idx} 
												className="bg-gray-800/50 rounded-lg p-2 border border-primary-700/10 
														hover:border-primary-700/20 transition-colors
														ring-2 ring-primary-500/50 items-center justify-between"
											>
												<h3 className="text-secondary-400 font-medium mb-2 text-sm uppercase tracking-wider">
													{Liber777[idx]?.index}
												</h3>
												<div className="font-philosopher text-gray-300 font-medium bg-primary-500/20 rounded px-2">
													{typeof value === 'string' && value.startsWith('#')
														? (
															<div 
																className="flex items-center gap-2 p-2 rounded" 
																style={{ 
																	backgroundColor: value,
																	color: getTextColor(value)
																}}
															>
																<span>{value}</span>
																<button 
																	onClick={(e) => {
																		e.stopPropagation();
																		navigator.clipboard.writeText(value);
																	}}
																	className="ml-auto p-1 rounded-md hover:bg-black/20 transition-colors"
																	title="Copy color"
																>
																	<svg 
																		xmlns="http://www.w3.org/2000/svg" 
																		className="h-4 w-4" 
																		fill="none" 
																		viewBox="0 0 24 24" 
																		stroke="currentColor"
																	>
																		<path 
																			strokeLinecap="round" 
																			strokeLinejoin="round" 
																			strokeWidth={2} 
																			d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
																		/>
																	</svg>
																</button>
															</div>
														)
														: typeof value === 'string'
															? value.split('\n').map((line, i) => (
																<p key={i} className="mb-1">{line}</p>
															))
															: value
													}
												</div>
											</div>
										);
									})}
								</>
							)}

							{/* Favorite Correspondences Section */}
							{favorites.length > 0 && (
								<>
									<div className="md:col-span-2">
										<h2 className="text-xl font-semibold text-primary-300 mb-4">
											Favorite Correspondences
										</h2>
									</div>
									{card.data.map((value, idx) => {
										if (!value || value === '...') return null;
										if (!favorites.includes(idx)) return null;
										
										if (showLiberO) {
											const currentIndex = Liber777[idx]?.index?.split('.')?.[0];
											if (!liberOIndices.includes(currentIndex)) return null;
										}
										
										return (
											<div 
												key={`fav-${idx}`} 
												className="bg-gray-800/50 rounded-lg p-2 border border-primary-700/10 
														hover:border-primary-700/20 transition-colors"
											>
												<h3 className="text-secondary-400 font-medium mb-2 text-sm uppercase tracking-wider flex items-center justify-between">
													{Liber777[idx]?.index}
													<StarButton idx={idx} isFavorite={true} />
												</h3>
												<div className="font-philosopher text-gray-300 font-medium">
													{typeof value === 'string' && value.startsWith('#')
														? (
															<div 
																className="flex items-center gap-2 p-2 rounded" 
																style={{ 
																	backgroundColor: value,
																	color: getTextColor(value)
																}}
															>
																<span>{value}</span>
																<button 
																	onClick={(e) => {
																		e.stopPropagation();
																		navigator.clipboard.writeText(value);
																	}}
																	className="ml-auto p-1 rounded-md hover:bg-black/20 transition-colors"
																	title="Copy color"
																>
																	<svg 
																		xmlns="http://www.w3.org/2000/svg" 
																		className="h-4 w-4" 
																		fill="none" 
																		viewBox="0 0 24 24" 
																		stroke="currentColor"
																	>
																		<path 
																			strokeLinecap="round" 
																			strokeLinejoin="round" 
																			strokeWidth={2} 
																			d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
																		/>
																	</svg>
																</button>
															</div>
														)
														: typeof value === 'string'
															? value.split('\n').map((line, i) => (
																<p key={i} className="mb-1">{line}</p>
															))
															: value
													}
												</div>
											</div>
										);
									})}
								</>
							)}

							{/* Other Correspondences Section */}
							<div className="md:col-span-2">
								<h2 className="text-xl font-semibold text-primary-300 mb-4">
									{card.searchTerm ? 'Other Correspondences' : 'All Correspondences'}
								</h2>
							</div>
							{card.data.map((value, idx) => {
								if (!value || value === '...') return null;
								
								if (showLiberO) {
									const currentIndex = Liber777[idx]?.index?.split('.')?.[0];
									if (!liberOIndices.includes(currentIndex)) return null;
								}

								const matchKey = `${idx}-${card.columnIndex}`;
								// Skip if this is a matched item (already shown above)
								if (card.searchTerm && matchedFields.has(matchKey)) return null;
								
								return (
									<div 
										key={idx} 
										className="bg-gray-800/50 w-full rounded-lg p-2 border border-primary-700/10 
												hover:border-primary-700/20 transition-colors"
									>
										<h3 className="text-secondary-400 font-medium mb-2 text-sm uppercase tracking-wider flex items-center justify-between">
											{Liber777[idx]?.index}
											<StarButton idx={idx} isFavorite={favorites.includes(idx)} />
										</h3>
										<div className="font-philosopher text-gray-300 font-medium">
											{typeof value === 'string' && value.startsWith('#')
												? (
													<div 
														className="flex items-center gap-2 p-2 rounded" 
														style={{ 
															backgroundColor: value,
															color: getTextColor(value)
														}}
													>
														<span>{value}</span>
														<button 
															onClick={(e) => {
																e.stopPropagation();
																navigator.clipboard.writeText(value);
															}}
															className="ml-auto p-1 rounded-md hover:bg-black/20 transition-colors"
															title="Copy color"
														>
															<svg 
																xmlns="http://www.w3.org/2000/svg" 
																className="h-4 w-4" 
																fill="none" 
																viewBox="0 0 24 24" 
																stroke="currentColor"
															>
																<path 
																	strokeLinecap="round" 
																	strokeLinejoin="round" 
																	strokeWidth={2} 
																	d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
																/>
															</svg>
														</button>
													</div>
												)
												: typeof value === 'string'
													? value.split('\n').map((line, i) => (
														<p key={i} className="mb-1">{line}</p>
													))
													: value
											}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}; 