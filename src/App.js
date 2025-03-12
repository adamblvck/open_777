import React, { useEffect, useState, useCallback, useMemo } from 'react';

import './App.css';
import "@glideapps/glide-data-grid/dist/index.css";

import DataEditor from '@glideapps/glide-data-grid';

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
import { GridCellKind } from "@glideapps/glide-data-grid";

import { TableColumns, TableIndex } from './structure';
import { Liber777 } from './constants/liber_777';
import { DarkTheme } from './dark';

import _ from 'lodash';
import logo from './logo_full_icon_transparent.png';
import debounce from 'lodash/debounce';

import { Modal } from './components/modals/Modal';
import { InfoModal } from './components/modals/InfoModal';
import TreeOfLife from './components/TreeOfLife';

import { CardView } from './components/cards/CardView';
import SearchBar from './components/search/SearchBar';

function App() {

	const [showSearch, setShowSearch] = React.useState(false);
	const onSearchClose = React.useCallback(() => setShowSearch(false), []);

	// Add state for selected filter
    const [selectedFilter, setSelectedFilter] = React.useState("All");

	// Define the ranges for each filter
    const filterRanges = {
		"All": Array.from({ length: 36 }, (_, i) => i), // first column is the keyscale, then follow 0 1-32, 31b, 32b = 36 columns!
		"The Spheres": [0, 2,3,4,5,6,7,8,9,10,11], // Rows 0 to 10
		"The Planets": [0, 13, 14, 15, 22, 28, 31, 33], // Specific rows for Planets
		"The Elements": [0, 12, 24, 32, 34, 35], // Specific rows for Planets
		"The Zodiacs": [0, 16, 17, 18, 19, 20, 21, 23, 25, 26, 27, 29, 30], // Specific rows for Zodiacs
		"The Paths": [0, 12, 13, 14, 15, 16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35] // Rows 11 to 32
	};

	const [columns, setColumns] = React.useState(TableColumns);

	React.useEffect(() => {
		const filteredColumns = TableColumns.filter((_, index) => filterRanges[selectedFilter].includes(index));
		setColumns(filteredColumns);
	}, [selectedFilter]);

	const getContent = React.useCallback(cell => {
		const [col, row] = cell;
		const dataRow = Liber777[row];

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

	// Update view mode on window resize
	// useEffect(() => {
	// 	const handleResize = () => {
	// 		setViewMode(window.innerWidth <= 1024 ? 'cards' : 'table');
	// 	};
	// 	window.addEventListener('resize', handleResize);
	// 	return () => window.removeEventListener('resize', handleResize);
	// }, []);

	const [selectedCard, setSelectedCard] = useState(null);

	// Add this state near your other useState declarations
	const [cardSize, setCardSize] = useState('large'); // 'small', 'medium', 'large'

	// Add these new states
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedTerm, setDebouncedTerm] = useState('');
	const [matchedFields, setMatchedFields] = useState(new Map());
	const [filteredResults, setFilteredResults] = useState(null);

	// Create debounced search function
	const debouncedSearch = useMemo(
		() => debounce((term) => {
			if (!term) {
				setDebouncedTerm('');
				setMatchedFields(new Map());
				setFilteredResults(null);
				return;
			}

			// Batch our state updates
			const results = new Map();
			const searchTermLower = term.toLowerCase().trim();

			requestAnimationFrame(() => {
				Liber777.forEach((row, rowIdx) => {
					for (let colIdx = 0; colIdx <= 34; colIdx++) {
						const value = row[colIdx];
						if (value && 
							typeof value === 'string' &&
							value.trim() !== '' &&
							value !== '...' && 
							String(value).toLowerCase().includes(searchTermLower)) {
							const key = `${rowIdx}-${colIdx}`;
							results.set(key, true);
						}
					}
				});

				// Batch these state updates together
				Promise.resolve().then(() => {
					setDebouncedTerm(term);
					setMatchedFields(results);
				});
			});
		}, 750), // Increased debounce delay to 750ms
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

	// Define SizeSelector before it's used
	const SizeSelector = () => (
        <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg">
            {[
                { size: 'small', icon: '□' },
                { size: 'medium', icon: '▢' },
                { size: 'large', icon: '■' }
            ].map(({ size, icon }) => (
                <button
                    key={size}
                    onClick={() => setCardSize(size)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                        cardSize === size 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:bg-gray-700/50'
                    }`}
                >
                    {icon}
                </button>
            ))}
        </div>
    );

	// ViewToggle component that uses SizeSelector
	const ViewToggle = () => (
		<div className="flex items-center gap-4 p-2">
			<div className="flex items-center gap-2">
				<button
					onClick={() => setViewMode('table')}
					className={`text-sm px-4 py-2 rounded-l-lg ${
						viewMode === 'table' 
						? 'bg-purple-600 text-white' 
						: 'bg-gray-200 text-gray-700'
					}`}
				>
					Table
				</button>
				<button
					onClick={() => setViewMode('cards')}
					className={`text-sm px-4 py-2 rounded-r-lg ${
						viewMode === 'cards' 
						? 'bg-purple-600 text-white' 
						: 'bg-gray-200 text-gray-700'
					}`}
				>
					Cards
				</button>
			</div>
			{viewMode === 'cards' && <SizeSelector />}
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

	const [showInfo, setShowInfo] = React.useState(false);

	return (
		<div className="App">
			<div className="App-header">
				<div className="toolbar">
					<div className="flex items-center justify-center gap-3">
						<img src={logo} alt="Three Sevens" className="h-20 mt-2" />
						<div className="title">Open 777</div>
						<button
							onClick={() => setShowInfo(true)}
							className="ml-2 w-10 h-10 text-xl text-black flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-700 text-gray-400 text-sm font-semibold transition-colors"
						>
							i
						</button>
					</div>
					<div className="flex items-center justify-center gap-2">
						<div className="subtitle">Online Look-up & Reference Tool for Aleister Crowley's Kabbalistic Correspondences</div>
					</div>
				</div>

				{viewMode === 'table' ? <button onClick={()=>setShowSearch(true)} type="button" className="search">
					<div className="iconContainer">
						<svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/><path fill="none" stroke="#ccc" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M338.29 338.29L448 448"/></svg>
					</div>
				</button>: undefined }

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
				<Slider
                    options={["All", "The Spheres", "The Planets", "The Zodiacs", "The Elements", "The Paths"]}
                    onChange={setSelectedFilter}
                />

				{/* Here add search bar */}

				{viewMode === 'table' ? (
					<div className="dataContainer">
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
							rows={Liber777.length}

							smoothScrollY={true}
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
					/>
				)}

				

				<Modal 
					card={selectedCard} 
					onClose={() => setSelectedCard(null)} 
				/>

				<InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

				<div className="footer">Made with ❤️ by ADAM BLVCK | <a className="opensourcelink" href="https://github.com/adamblvck/open_777">This Project is Open Source</a></div>
			</div>
		</div>
	);
}

export default App;
