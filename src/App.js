import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';

import Toolbar from './components/Toolbar';
import { InfoModal } from './components/modals/InfoModal';

import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import ReadPage from './pages/ReadPage';

function App() {
	const [showInfo, setShowInfo] = React.useState(false);

	return (
		<div className="min-h-screen bg-[#212638]">
			<Toolbar onInfoClick={() => setShowInfo(true)} />

			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/explore" element={<ExplorePage />} />
				<Route path="/read" element={<ReadPage />} />
			</Routes>

			<InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
		</div>
	);
}

export default App;
