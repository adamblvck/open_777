import React from 'react';

export const InfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
		<div 
			className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
			onClick={handleBackdropClick}
		>
			<div className="bg-gray-900/95 rounded-xl w-full max-w-2xl p-3 sm:p-4 md:p-6 border border-primary-700/20 shadow-2xl mt-4 sm:mt-8 mb-4">
				<div className="flex justify-between items-start mb-3 sm:mb-4">
					<h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-300">About Open 777</h2>
					<button 
						onClick={onClose}
						className="rounded-full p-1 sm:p-1.5 md:p-2 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
					>
						<svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div className="space-y-2 sm:space-y-3 md:space-y-4 text-gray-300 text-xs sm:text-sm md:text-base">
					<p className="leading-relaxed">
						Open 777 is a modern digital reference tool designed to make Aleister Crowley's system of correspondences more accessible and interactive. It serves as a bridge between traditional occult knowledge and contemporary technological convenience, allowing practitioners, researchers, and students to quickly navigate through complex magical and Kabbalistic associations.
					</p>
					<p className="leading-relaxed">
						The primary source for this tool is Aleister Crowley's "Liber 777", a fundamental text in Western esoteric traditions published in 1909. This seminal work contains detailed tables of correspondences between various magical and mystical traditions, including Kabbalah, Tarot, astrology, numerology, and more. Each column represents different aspects of these traditions, while each row shows their interconnections.
					</p>
					<p className="leading-relaxed">
						This application allows you to explore these correspondences through both a traditional table view and an innovative card-based interface. You can filter the information by categories such as Spheres, Planets, Zodiacs, Elements, and Paths, making it easier to focus on specific aspects of the system. Each entry is carefully preserved from the original source while being presented in a format that's more accessible to modern practitioners.
					</p>
					<p className="leading-relaxed border-t border-primary-700/20 pt-3 sm:pt-4 text-xs sm:text-sm">
						Transcription credits (Liber 777): Adam Blvck, Occultish Angel, Liber OZ
					</p>
					<p className="leading-relaxed border-t border-primary-700/20 pt-3 sm:pt-4 text-xs sm:text-sm">
						Open 777 is also available as a Progressive Web App (PWA), meaning you can install it on your device and use it offline. To install:
						<br/>• On Chrome/Desktop: Click the install icon (⊕) in the address bar
						<br/>• On iOS: Tap the share button and select "Add to Home Screen"
						<br/>• On Android: Tap the three dots menu and select "Install app" or "Add to Home Screen"
						Enjoy an offline experience!
					</p>
					<div className="footer border-t border-primary-700/20 pt-3 sm:pt-4 text-xs sm:text-sm">
						Made with ❤️ by ADAM BLVCK | <a className="opensourcelink hover:text-primary-400 transition-colors" href="https://github.com/adamblvck/open_777">This App and its data is open source</a>
					</div>
				</div>
			</div>
		</div>
	);
}; 