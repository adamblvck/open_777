import React from 'react';

import './App.css';
import "@glideapps/glide-data-grid/dist/index.css";

import DataEditor from '@glideapps/glide-data-grid';

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
import { GridCellKind } from "@glideapps/glide-data-grid";

import { TableColumns, TableIndex } from './structure';
import { Liber777 } from './liber_777';
import { DarkTheme } from './dark';

import _ from 'lodash';

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

	const getContent = React.useCallback( cell => {
		const [col, row] = cell;
		const dataRow = Liber777[row];
	
		// retrieve correct index, based on selected filter range
		const filterSpecificColumn = filterRanges[selectedFilter][col]
		const d = dataRow[ TableIndex[filterSpecificColumn]];

		return {
			kind: GridCellKind.Text,
			allowOverlay: false,
			displayData: d,
			data: d,
		};
	}, [columns]);

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

	return (
		<div className="App">
			<div className="App-header">
				<div className="toolbar">
					<div className="title">Open 777</div>
					<div className="subtitle">Online Look-up & Reference Tool for Aleister Crowley's Kabbalistic Correspondences</div>
				</div>
				
				<div className="logoContainer">
					<img src="logo_full_icon_transparent.png" alt="Three Sevens"></img>
				</div>

				<button onClick={()=>setShowSearch(true)} type="button" className="search">
					<div className="iconContainer">
						<svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"/><path fill="none" stroke="#ccc" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" d="M338.29 338.29L448 448"/></svg>
					</div>
				</button>

				<Slider
                    options={["All", "The Spheres", "The Planets", "The Zodiacs", "The Elements", "The Paths"]}
                    onChange={setSelectedFilter}
                />

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

				<div className="footer">Made with ❤️ by ADAM BLVCK | <a className="opensourcelink" href="https://github.com/adamblvck/open_777">Open Source</a></div>
			</div>
		</div>
	);
}

export default App;
