import React, { useState, useRef, useEffect } from 'react';

const SizeSelector = ({ cardSize, setCardSize }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sizeOptions = [
        { size: 'small', icon: '□', label: 'Small' },
        { size: 'medium', icon: '▢', label: 'Medium' },
        { size: 'large', icon: '■', label: 'Large' }
    ];

    const currentOption = sizeOptions.find(option => option.size === cardSize);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 
                          text-gray-200 border border-gray-700 transition-colors"
            >
                <span>{currentOption.icon}</span>
                <span className="text-sm">{currentOption.label}</span>
                <svg 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute mt-2 py-2 w-36 bg-gray-800 border border-gray-700 
                              rounded-lg shadow-lg z-50">
                    {sizeOptions.map(({ size, icon, label }) => (
                        <button
                            key={size}
                            onClick={() => {
                                setCardSize(size);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm flex items-center gap-2
                                      ${cardSize === size 
                                        ? 'bg-purple-600 text-white' 
                                        : 'text-gray-300 hover:bg-gray-700'
                                      } transition-colors`}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SizeSelector; 