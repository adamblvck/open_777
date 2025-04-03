import React, { useState, useRef } from 'react';
import { InfoModal, SavePresetModal, AllPresetsModal } from './SearchModals';

const ClearButton = ({ onClear }) => (
	<button
		onClick={onClear}
		className="absolute right-3 top-1/2 -translate-y-1/2
				 text-gray-400 hover:text-white transition-colors"
	>
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>
);

const InfoButton = ({ onClick }) => (
	<button
		onClick={onClick}
		className="absolute right-12 top-1/2 -translate-y-1/2
				 text-gray-400 hover:text-white transition-colors"
	>
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
				  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	</button>
);

const PresetButton = ({ preset, onClick, onSearch }) => (
	<button
		onClick={() => {
			onClick(preset.query);
			onSearch(preset.query);
		}}
		className="px-3 py-1 text-sm bg-gray-800/50 border border-primary-700/20
				 rounded-lg text-gray-200 hover:border-primary-700/40 transition-colors
				 whitespace-nowrap"
	>
		{preset.name}
	</button>
);

const SearchBar = ({ 
	viewMode,
	search: {
		term: searchTerm,
		setTerm: setSearchTerm,
		debouncedSearch,
		handleChange: handleSearchChange,
		clearSearch
	}
}) => {
	const [showInfo, setShowInfo] = useState(false);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [showAllPresets, setShowAllPresets] = useState(false);
	const [presetScroll, setPresetScroll] = useState(0);
	
	const presetListRef = useRef(null);
	
	// Add this constant for default presets
	const defaultPresets = [
		{ deletable: false, name: 'Touch', query: 'xiv., xl., xxxix., xli., clxxxii.' },
		{ deletable: false, name: 'Sight', query: 'xiv., xv., xvi., xvii., xviii., xx., xix., xxxiv., xxxiii., xxii., xxxv., xxxvi., xxxviii., xlix., clxxxi., clxxv., li., lii., liii., clxxxiii.' },
		{ deletable: false, name: 'Hearing', query: 'v., clxxxvii.' },
		{ deletable: false, name: 'Smell & Taste', query: 'xxxix., xlii.' },
		{ deletable: false, name: 'Psychic', query: 'xlii., xxiii.' },
		{ deletable: false, name: 'Causal', query: 'xxiv., xlv.' },
	];

	// Update the presets state initialization to use defaultPresets
	const [presets, setPresets] = useState(() => {
		const saved = localStorage.getItem('searchPresets');
		return saved ? JSON.parse(saved) : defaultPresets;
	});

	const savePreset = (preset) => {
		const newPresets = [...presets, preset];
		setPresets(newPresets);
		localStorage.setItem('searchPresets', JSON.stringify(newPresets));
	};

	// Add this new function to handle preset deletion
	const deletePreset = (index) => {
		const newPresets = presets.filter((_, idx) => idx !== index);
		setPresets(newPresets);
		localStorage.setItem('searchPresets', JSON.stringify(newPresets));
	};

	// Add reset function
	const resetPresets = () => {
		setPresets(defaultPresets);
		localStorage.setItem('searchPresets', JSON.stringify(defaultPresets));
	};

	if (viewMode === 'table') return null;

	return (
		<>
			<div className="w-full max-w-2xl mx-auto px-4 mb-4">
				<div className="relative mb-3">
					<input
						type="text"
						value={searchTerm}
						onChange={handleSearchChange}
						placeholder="Search correspondences"
						className="w-full px-4 py-2 bg-gray-800/50 border border-primary-700/20 
								 rounded-lg text-gray-200 placeholder-gray-400
								 focus:outline-none focus:border-primary-700/40
								 transition-colors"
					/>
					{searchTerm && (
						<button
							onClick={() => setShowSaveModal(true)}
							className="absolute right-20 top-1/2 -translate-y-1/2
									 text-gray-400 hover:text-green-400 transition-colors"
							title="Save this search"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
									  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
							</svg>
						</button>
					)}
					<InfoButton onClick={() => setShowInfo(true)} />
					{searchTerm && <ClearButton onClear={clearSearch} />}
				</div>

				{/* Presets Carousel */}
				<div className="relative">
					<button 
						onClick={() => setPresetScroll(Math.max(0, presetScroll - 200))}
						className="absolute left-0 top-1/2 -translate-y-1/2 z-10
								 bg-gray-800/80 rounded-full p-1 text-gray-400 
								 hover:text-white disabled:opacity-0"
						disabled={presetScroll <= 0}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<div className="overflow-hidden">
						<div 
							ref={presetListRef}
							className="flex gap-2 transition-transform duration-300"
							style={{ transform: `translateX(-${presetScroll}px)` }}
						>
							{presets.map((preset, idx) => (
								<PresetButton 
									key={idx} 
									preset={preset} 
									onClick={setSearchTerm}
									onSearch={debouncedSearch}
								/>
							))}
							<button
								onClick={() => setShowAllPresets(true)}
								className="px-3 py-1 text-sm bg-gray-700/50 rounded-lg text-gray-300
										 hover:bg-gray-700/70 transition-colors whitespace-nowrap"
							>
								Show All
							</button>
						</div>
					</div>

					<button 
						onClick={() => {
							const maxScroll = presetListRef.current.scrollWidth - presetListRef.current.clientWidth;
							setPresetScroll(Math.min(maxScroll, presetScroll + 200));
						}}
						className="absolute right-0 top-1/2 -translate-y-1/2 z-10
								 bg-gray-800/80 rounded-full p-1 text-gray-400 
								 hover:text-white disabled:opacity-0"
						disabled={presetScroll >= (presetListRef.current?.scrollWidth || 0) - (presetListRef.current?.clientWidth || 0)}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>
			
			<InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
			<SavePresetModal
				isOpen={showSaveModal}
				onClose={() => setShowSaveModal(false)}
				onSave={savePreset}
				currentSearch={searchTerm}
			/>
			<AllPresetsModal
				isOpen={showAllPresets}
				onClose={() => setShowAllPresets(false)}
				presets={presets}
				onSelectPreset={setSearchTerm}
				onDeletePreset={deletePreset}
				onResetPresets={resetPresets}
			/>
		</>
	);
};

export default SearchBar;