import React from 'react';
import { useNavigate } from 'react-router-dom';
import TreeOfLife from '../components/TreeOfLife';

const FEATURES = [
    {
        title: 'Complete Kabbalistic Tables',
        description: 'All 35 columns of Liber 777 correspondences at your fingertips — Sephiroth, Paths, Planets, Zodiacs, and Elements in a searchable data grid.',
        selected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
        title: 'Powerful Search & Filtering',
        description: 'Search across every correspondence simultaneously. Filter by Spheres, Planets, Zodiacs, Elements, or Paths with a single click.',
        selected: [14, 15, 16, 17, 18],
    },
    {
        title: 'Interactive Card View',
        description: 'Visual card-based layout with Tree of Life glyphs on every card, highlighting the exact position of each correspondence on the Tree.',
        selected: [6, 24, 25, 26],
    },
    {
        title: 'Liber O & Liber E Readers',
        description: 'Built-in readers for Liber O and Liber E, essential instruction texts for the A∴A∴ curriculum, presented in clean markdown.',
        selected: [11, 12, 13],
    },
    {
        title: 'Color-Coded Scales',
        description: 'The four color scales — King, Queen, Prince, and Princess — rendered directly in-cell so you see the exact hue Crowley prescribed.',
        selected: [1, 13, 6, 25, 32],
    },
    {
        title: 'Open Source & Offline-Ready',
        description: 'Fully open-source under MIT license. Service worker enabled so it works offline once loaded — your grimoire goes where you go.',
        selected: [9, 10, 29, 30, 31, 32],
    },
];

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#212638]">
            {/* ===== HERO SECTION ===== */}
            <section className="relative overflow-hidden py-20 sm:py-28 px-4">
                {/* Background Tree of Life — large, centered, faded */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
                    <TreeOfLife
                        height={700}
                        radiusSephira={28}
                        selected={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]}
                        pathwayColor="#a78bfa"
                    />
                </div>

                <div className="relative max-w-4xl mx-auto text-center z-10">
                    <h1 className="text-5xl sm:text-6xl font-bold text-white font-['philosopher'] tracking-tight mb-6">
                        Open <span className="text-purple-400">777</span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-gray-300 font-['philosopher'] max-w-2xl mx-auto mb-4 leading-relaxed">
                        The online reference tool for Aleister Crowley's Kabbalistic Correspondences
                    </p>

                    <p className="text-gray-400 max-w-xl mx-auto mb-10 text-base leading-relaxed">
                        Explore every column of Liber 777 through interactive tables, filterable card views, 
                        and built-in readings of Liber O and Liber E — all in one place.
                    </p>

                    <button
                        onClick={() => navigate('/explore')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-600/25 hover:-translate-y-0.5"
                    >
                        Dive into Open777
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* ===== FEATURE GRID ===== */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white font-['philosopher'] text-center mb-4">
                        Everything in <span className="text-purple-400">Liber 777</span>, modernized
                    </h2>
                    <p className="text-gray-400 text-center max-w-2xl mx-auto mb-14 text-base">
                        A complete digital companion to Crowley's tables of correspondences, 
                        built for students and practitioners of the Western Mystery Tradition.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-[#1a1e2e] border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20"
                            >
                                {/* Tree of Life glyph per feature card */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <TreeOfLife
                                            height={56}
                                            radiusSephira={2.2}
                                            selected={feature.selected}
                                            pathwayColor="#a78bfa"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white leading-tight">
                                        {feature.title}
                                    </h3>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TREE OF LIFE SHOWCASE ===== */}
            <section className="py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                    <TreeOfLife
                        height={600}
                        radiusSephira={24}
                        selected={[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]}
                        pathwayColor="#7c3aed"
                    />
                </div>

                <div className="relative max-w-4xl mx-auto text-center z-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white font-['philosopher'] mb-6">
                        The Tree of Life, Everywhere
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-base leading-relaxed">
                        Every column header, every card, and every correspondence maps back to the Tree. 
                        The Sephiroth and 22 Paths light up dynamically so you always know 
                        where you are on the glyph.
                    </p>

                    {/* Showcase row of Trees with different selections */}
                    <div className="flex flex-wrap justify-center gap-8 mb-10">
                        {[
                            { sel: [1], label: 'Kether' },
                            { sel: [6, 13, 25], label: 'Tiphareth' },
                            { sel: [7, 8, 27], label: 'Netzach–Hod' },
                            { sel: [10, 29, 31, 32], label: 'Malkuth' },
                            { sel: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], label: 'All Sephiroth' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="bg-[#1a1e2e] border border-gray-700/50 rounded-xl p-4">
                                    <TreeOfLife
                                        height={100}
                                        radiusSephira={4}
                                        selected={item.sel}
                                        pathwayColor="#a78bfa"
                                    />
                                </div>
                                <span className="text-xs text-gray-500 font-['philosopher']">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <TreeOfLife
                            height={120}
                            radiusSephira={5}
                            selected={[1, 6, 9, 10, 13, 25, 32]}
                            pathwayColor="#a78bfa"
                        />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white font-['philosopher'] mb-4">
                        Ready to Explore?
                    </h2>
                    <p className="text-gray-400 mb-8 text-base">
                        Search, filter, and study every correspondence from Liber 777 — right now, for free.
                    </p>
                    <button
                        onClick={() => navigate('/explore')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-600/25 hover:-translate-y-0.5"
                    >
                        Dive into Open777
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="border-t border-gray-700/50 py-6 px-4">
                <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-['philosopher']">
                    Made with ❤️ by Adam Blvck |{' '}
                    <a className="text-gray-400 underline italic hover:text-purple-400 transition-colors" href="https://github.com/adamblvck/open_777">
                        This Project is Open Source
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
