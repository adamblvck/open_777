import React, { useEffect, useState, useCallback, useMemo } from 'react';

import '../App.css';
import "@glideapps/glide-data-grid/dist/index.css";

import DataEditor from '@glideapps/glide-data-grid';

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
import { GridCellKind } from "@glideapps/glide-data-grid";

import { TableColumns, TableIndex } from '../structure';
import { Liber777 } from '../constants/liber_777';
import { DarkTheme } from '../dark';

import _ from 'lodash';
import debounce from 'lodash/debounce';

import { Modal } from '../components/modals/Modal';

import { CardView } from '../components/cards/CardView';
import SearchBar from '../components/search/SearchBar';

import { drawTreeOfLife } from '../components/drawTreeOfLife';
import SizeSelector from '../components/SizeSelector';

import { VERSION_STRING } from '../version';

function ExplorePage() {

	const [showSearch, setShowSearch] = React.useState(false);
	const onSearchClose = React.useCallback(() => setShowSearch(false), []);

	// Add state for selected filter
    const [selectedFilter, setSelectedFilter] = React.useState("All");

	const [showLiberORows, setShowLiberORows] = React.useState(false);

	// Define the ranges for each filter
    const filterRanges = {
		"All": Array.from({ length: 36 }, (_, i) => i), // first column is the keyscale, then follow 0 1-32, 31b, 32b = 36 columns!
		"Spheres": [0, 2, 3,4,5,6,7,8,9,10,11], // Rows 0 to 10
		"Planets": [0, 13, 14, 15, 22, 28, 31, 33], // Specific rows for Planets
		"Elements": [0, 12, 24, 32, 34, 35], // Specific rows for Planets
		"Zodiacs": [0, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 29, 30], // Specific rows for Zodiacs
		"Paths": [0, 12, 13, 14, 15, 16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35] // Rows 11 to 32
	};

	// Add the roman numeral patterns to match
	const liberORomanNumerals = [
		'I.', 'II.', 'III.', 'V.', 'VI.', 'VII.', 'IX.', 'XI.', 'XII.', 'XIV.', 
		'XV.', 'XVI.', 'XVII.', 'XVIII.', 'XIX.', 'XXXIV.', 'XXXV.', 'XXXVIII.', 
		'XXXIX.', 'XL.', 'XLI.', 'XLII.', 'XLV.', 'LIV.', 'LV.', 'LIX.', 'LX.', 
		'LXI.', 'LXIII.', 'LXX.', 'LXXV.', 'LXXVII.', 'LXVIII.', 'LXXIX.', 
		'LXXX.', 'LXXXI.', 'LXXXIII.', 'XCVII.', 'XCVIII.', 'XCIX.', 'C.', 
		'CI.', 'CXVII.', 'CXVIII.', 'CXXXVII.', 'CXXXVIII.', 'CXXXIX.', 
		'CLXXV.', 'CLXXVI.', 'CLXXVII.', 'CLXXXII.'
	];

	const [liber777, updateLiber777] = React.useState(Liber777);

	const [columns, setColumns] = React.useState(TableColumns);

	React.useEffect(() => {
		if (showLiberORows) {
			// Filter rows where index starts with any of the Roman numerals
			const filteredRows = Liber777.filter(row => 
				liberORomanNumerals.some(numeral => 
					row.index && row.index.startsWith(numeral)
				)
			);

			// Sort rows based on the order in liberORomanNumerals
			const sortedRows = filteredRows.sort((a, b) => {
				// Find the matching numeral for each row
				const aNumeral = liberORomanNumerals.find(num => a.index.startsWith(num));
				const bNumeral = liberORomanNumerals.find(num => b.index.startsWith(num));
				
				// Get the index of each numeral in the liberORomanNumerals array
				const aIndex = liberORomanNumerals.indexOf(aNumeral);
				const bIndex = liberORomanNumerals.indexOf(bNumeral);
				
				// Sort based on the index
				return aIndex - bIndex;
			});

			updateLiber777(sortedRows);
		} else { 
			updateLiber777(Liber777);
		}
	}, [showLiberORows]);

	React.useEffect(() => {
		const filteredColumns = TableColumns.filter((_, index) => filterRanges[selectedFilter].includes(index))
			.map(col => ({
				...col,
				width: 130  // Add default width of 120
			}));
		setColumns(filteredColumns);
	}, [selectedFilter]);

	const getContent = React.useCallback(cell => {
		const [col, row] = cell;
		const dataRow = liber777[row];

		// retrieve correct index, based on selected filter range
		const filterSpecificColumn = filterRanges[selectedFilter][col];
		const d = dataRow[TableIndex[filterSpecificColumn]];

		// Ensure we return a string value
		const displayValue = d === undefined || d === null ? '' : String(d);

		return {
			kind: GridCellKind.Text,
			allowOverlay: false,
			displayData: displayValue,
			data: displayValue,
		};
	}, [selectedFilter]);

	const Slider = ({ options, onChange }) => (
        <div className="selector">
            {options.map(option => (
                <button
                    key={option}
                    className={`selector-option ${selectedFilter === option ? 'selected' : ''}`}
                    onClick={() => onChange(option)}
                >
                    {option}
                </button>
            ))}
        </div>
    );

	const getTextColor = (background_color) => {
		// Remove the "#" symbol if present
		if (background_color.startsWith("#")) {
		  background_color = background_color.slice(1);
		}
	  
		// Convert the background color to RGB values
		const r = parseInt(background_color.slice(0, 2), 16);
		const g = parseInt(background_color.slice(2, 4), 16);
		const b = parseInt(background_color.slice(4, 6), 16);
	  
		// Calculate the relative luminance using the formula for sRGB
		const relative_luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
	  
		// Determine the appropriate text color based on the relative luminance
		let text_color;
		if (relative_luminance > 0.5) {
		  text_color = "#000000";  // Black for light backgrounds
		} else {
		  text_color = "#FFFFFF";  // White for dark backgrounds
		}
	  
		return text_color;
	}

	const handleColumnResize = (column, newSize) => {
		setColumns(prevCols => {
			const index = _.findIndex(prevCols, { id: column.id });
			const newCols = [...prevCols];
			newCols.splice(index, 1, {
				...prevCols[index],
				width: newSize,
			});
			return newCols;
		});
	}

	const [viewMode, setViewMode] = useState('cards');

	// px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-purple-600 transition-colors text-sm

	// Add the LiberO toggle button component
	const LiberOToggle = () => (
		<div className="flex items-center">
			<button
				onClick={() => setShowLiberORows(!showLiberORows)}
				className={`px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-purple-600 transition-colors text-sm ${
					showLiberORows 
						? 'bg-purple-600'
						: 'bg-gray-700'
				}`}
			>
				Liber O Rows
			</button>
			<div className="relative group">
				<span className="ml-2 cursor-help text-purple-400 font-bold text-xl align-middle justify-center">ⓘ</span>
				<div className="absolute hidden group-hover:block bg-gray-700 text-white border border-gray-200 rounded-xl shadow-lg w-64 text-sm z-50 -left-32">
					Shows only rows that correspond to Liber O instructions, identified by their Roman numeral prefixes.
				</div>
			</div>
		</div>
	);

	const [selectedCard, setSelectedCard] = useState(null);

	// Replace the existing state declarations with these:
	const [cardSize, setCardSize] = useState(() => {
		const saved = localStorage.getItem('cardSize');
		return saved || 'medium';
	});

	// Add these effects after the state declarations
	useEffect(() => {
		localStorage.setItem('cardSize', cardSize);
	}, [cardSize]);

	// Add these new states
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedTerm, setDebouncedTerm] = useState('');
	const [matchedFields, setMatchedFields] = useState(new Map());
	const [filteredResults, setFilteredResults] = useState(null);

	// Add this near your other state declarations
	const [reverseOrder, setReverseOrder] = useState(() => {
		const saved = localStorage.getItem('reverseOrder');
		return saved === 'true';
	});

	// Add these effects after the state declarations
	useEffect(() => {
		localStorage.setItem('reverseOrder', reverseOrder);
	}, [reverseOrder]);

	// Create debounced search function
	const debouncedSearch = useMemo(
		() => debounce((term) => {
			if (!term) {
				setDebouncedTerm('');
				setMatchedFields(new Map());
				setFilteredResults(null);
				return;
			}

			// Split search terms by comma and trim each term
			const searchTerms = term.toLowerCase()
				.split(',')
				.map(t => t.trim())
				.filter(t => t.length > 0);

			// Batch our state updates
			const results = new Map();

			requestAnimationFrame(() => {
				liber777.forEach((row, rowIdx) => {
					// Check if row.index matches any search term
					if (row.index && 
						searchTerms.some(term => {
							// If term contains a dot, use startsWith for exact matching
							if (term.includes('.')) {
								return String(row.index).toLowerCase().startsWith(term);
							}
							// Otherwise use includes for broader matching
							return String(row.index).toLowerCase().includes(term);
						})) {
						// If row.index matches, add all columns for this row
						for (let i = 0; i <= 34; i++) {
							results.set(`${rowIdx}-${i}`, true);
						}
					} else {
						// Check each column value against all search terms
						for (let colIdx = 0; colIdx <= 34; colIdx++) {
							const value = row[colIdx];
							if (value && 
								typeof value === 'string' &&
								value.trim() !== '' &&
								value !== '...' && 
								searchTerms.some(term => {
									// If term contains a dot, use startsWith for exact matching
									if (term.includes('.')) {
										return String(value).toLowerCase().startsWith(term);
									}
									// Otherwise use includes for broader matching
									return String(value).toLowerCase().includes(term);
								})) {
								const key = `${rowIdx}-${colIdx}`;
								results.set(key, true);
							}
						}
					}
				});

				// Batch these state updates together
				Promise.resolve().then(() => {
					setDebouncedTerm(term);
					setMatchedFields(results);
				});
			});
		}, 750),
		[]
	);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	// Handle search input changes
	const handleSearchChange = useCallback((e) => {
		const value = e.target.value;
		setSearchTerm(value);
		debouncedSearch(value);
	}, [debouncedSearch]);

	// ViewToggle component that uses SizeSelector
	const ViewToggle = () => (
		<div className="flex items-center gap-4 p-2">
			<div className="flex items-center gap-2">
				<button
					onClick={() => setViewMode('table')}
					className={`text-sm px-4 py-2 rounded-l-lg min-w-[80px] h-[40px] flex items-center justify-center ${
						viewMode === 'table' 
						? 'bg-purple-600 text-white' 
						: 'bg-gray-300 text-gray-700'
					}`}
				>
					Table
				</button>
				<button
					onClick={() => setViewMode('cards')}
					className={`text-sm px-4 py-2 rounded-r-lg min-w-[80px] h-[40px] flex items-center justify-center ${
						viewMode === 'cards' 
						? 'bg-purple-600 text-white' 
						: 'bg-gray-300 text-gray-700'
					}`}
				>
					Cards
				</button>
			</div>
		</div>
	);

	// Add this useEffect near your other hooks at the top of the App component
	React.useEffect(() => {
		if (selectedCard) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		// Cleanup function to ensure we restore scrolling when component unmounts
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [selectedCard]);

	return (
		<div className="App">
			<div className="App-header">

				{/* Only show search button for table view */}
				{viewMode === 'table' && (
					<button onClick={()=>setShowSearch(true)} type="button" className="search">
						<div className="iconContainer">
							<svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/><path fill="none" stroke="#ccc" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M338.29 338.29L448 448"/></svg>
						</div>
					</button>
				)}

				<ViewToggle />
				<div className="h-4"/>

				<SearchBar 
							viewMode={viewMode}
							search={{
								term: searchTerm,
								setTerm: setSearchTerm,
								debouncedSearch,
								handleChange: handleSearchChange,
								clearSearch: () => {
									setSearchTerm('');
									debouncedSearch.cancel();
									setDebouncedTerm?.('');
									setMatchedFields?.(new Map());
									setFilteredResults?.(null);
								}
							}}
						/>
						<div className="flex items-center border border-gray-700 rounded-xl p-1 mb-4">
							<Slider
								options={["All", "Spheres", "Planets", "Zodiacs", "Elements", "Paths"]}
								onChange={setSelectedFilter}
							/>
							
							{ viewMode === 'table' ? <div className="flex items-center gap-2">
								<span className="text-gray-400">•</span>
								<LiberOToggle />
								</div>
							: null }
						</div>
						{ viewMode === 'cards' ? <div className="flex items-center self-end gap-2 mb-4">
							<button
								onClick={() => setReverseOrder(prev => !prev)}
								className={`px-4 py-2 rounded-lg text-sm ${
									reverseOrder 
										? 'bg-purple-600 text-white' 
										: 'bg-gray-700 text-white hover:bg-purple-600'
								} transition-colors`}
							>
								<span className="flex items-center gap-1">
									{reverseOrder ? '↑' : '↓'} Reverse
								</span>
							</button>
							<SizeSelector cardSize={cardSize} setCardSize={setCardSize} />
						</div> : null }

				{/* Main content rendering */}
				{viewMode === 'table' ? (
					<div className="w-full h-[calc(100vh-250px)] max-w-screen relative overflow-hidden rounded-xl min-h-[550px]">
						<DataEditor
							theme={DarkTheme}
							onColumnResize={handleColumnResize}
							freezeColumns={1}
							experimental={{hyperWrapping:true}}
							keybindings={{search: true}}
							showSearch={showSearch}
							getCellsForSelection={true}
							onSearchClose={onSearchClose}
							className="data"
							getCellContent={getContent}
							columns={columns}
							rows={liber777.length}
							smoothScrollY={true}
							headerHeight={100}
							smoothScrollX={true}
							drawCell={args => {
								const { cell, rect, ctx } = args;
								const cellColor = cell.displayData;
								
								if (cellColor === undefined) return;
								if (typeof cellColor !== 'string' || cellColor.charAt(0) !== "#") return false;
								if (cellColor.charAt(0) !== "#") return false;
				
								ctx.save();
								const { x, y, width, height } = rect;
				
								// Fill out cell with specified color
								ctx.fillStyle = cellColor;
								ctx.fillRect(x + 1, y + 1, width - 1, height - 1);
				
								// Enter text within cell
								ctx.fillStyle = getTextColor(cellColor);
								ctx.font = "bold 14px sans-serif roboto";
								ctx.fillText(cellColor, x + width/4, y + height / 2 + 1.5);
								ctx.restore();
				
								return true;
							}}
							drawHeader={args => {
								const { ctx, rect, column, columnIndex } = args;
								
								// Draw default header
								ctx.fillStyle = "#1e1e1e";
								ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

								// If it's the first column, draw the Tree of Life
								if (columnIndex >= 1) {
									drawTreeOfLife(ctx, rect, {
										height: rect.height - 4, // Slightly smaller than header height
										radiusSephira: (rect.height) / 20,
										selected: [parseInt(`${column?.title}`.replace('bis', ''))], // Remove 'bis' before parsing
										pathwayColor: "#fff"
									});
								}
								
								// Draw column title
								ctx.fillStyle = "#ffffff";
								ctx.font = "12px sans-serif";
								ctx.textAlign = "center";

								if (columnIndex > 0) {
									ctx.fillText(column.title, rect.x + 20, rect.y + rect.height /2 );
								} else {
									ctx.fillText(column.title, rect.x + rect.width/2, rect.y + rect.height /2 );
								}
								
								return true;
							}}
						/>
					</div>
				) : (
					<CardView 
						cardSize={cardSize}
						selectedFilter={selectedFilter}
						filterRanges={filterRanges}
						debouncedTerm={debouncedTerm}
						matchedFields={matchedFields}
						setSelectedCard={setSelectedCard}
						reverseOrder={reverseOrder}
					/>
				)}

				<Modal 
					card={selectedCard} 
					onClose={() => setSelectedCard(null)} 
					matchedFields={matchedFields}
					searchTerm={searchTerm}
				/>

				<div className="footer">
					Made with ❤️ by Adam Blvck | <a className="opensourcelink" href="https://github.com/adamblvck/open_777">This Project is Open Source</a>
					{" "} | v{VERSION_STRING}
				</div>
			</div>
		</div>
	);
}

export default ExplorePage;
