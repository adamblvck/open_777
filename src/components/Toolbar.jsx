import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../logo_full_icon_transparent.png';

const Toolbar = ({ onInfoClick }) => {
    const location = useLocation();
    const isExplore = location.pathname.startsWith('/explore');
    const isRead = location.pathname.startsWith('/read');

    return (
        <nav className="w-full bg-[#1a1e2e]/40 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo + Title */}
                    <Link to="/" className="flex items-center gap-3 no-underline">
                        <img src={logo} alt="Open 777" className="h-10 w-10" />
                        <span className="text-white text-xl font-['philosopher'] tracking-wide">Open 777</span>
                    </Link>

                    {/* Right: Nav links */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg text-sm transition-colors no-underline ${
                                location.pathname === '/'
                                    ? 'bg-purple-600/80 text-white'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/explore"
                            className={`px-4 py-2 rounded-lg text-sm transition-colors no-underline ${
                                isExplore
                                    ? 'bg-purple-600/80 text-white'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            Explore
                        </Link>
                        <Link
                            to="/read"
                            className={`px-4 py-2 rounded-lg text-sm transition-colors no-underline ${
                                isRead
                                    ? 'bg-purple-600/80 text-white'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            Read
                        </Link>
                        <button
                            onClick={onInfoClick}
                            className="ml-2 w-9 h-9 text-sm flex items-center justify-center rounded-full bg-white/10 hover:bg-purple-600/80 text-gray-400 hover:text-white font-semibold transition-colors"
                        >
                            i
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Toolbar;
