import React from 'react';

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
	if (viewMode === 'table') return null;

	return (
		<div className="w-full max-w-2xl mx-auto px-4 mb-4">
			<div className="relative">
				<input
					type="text"
					value={searchTerm}
					onChange={handleSearchChange}
					placeholder="Search correspondences..."
					className="w-full px-4 py-2 bg-gray-800/50 border border-primary-700/20 
							 rounded-lg text-gray-200 placeholder-gray-400
							 focus:outline-none focus:border-primary-700/40
							 transition-colors"
				/>
				{searchTerm && <ClearButton onClear={clearSearch} />}
			</div>
		</div>
	);
};

export default SearchBar;