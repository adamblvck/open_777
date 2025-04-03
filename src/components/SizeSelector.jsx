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
                className={`px-4 py-2 rounded-lg text-sm text-white
                            ${isOpen ? 'bg-purple-600' : 'bg-gray-700 hover:bg-purple-600'}
                            transition-colors flex items-center gap-1`}
            >
                <span>{currentOption.icon}</span>
                <span>{currentOption.label}</span>
                <svg 
                    className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute mt-1 py-1 w-32 bg-gray-800 rounded-lg shadow-lg z-50">
                    {sizeOptions.map(({ size, icon, label }) => (
                        <button
                            key={size}
                            onClick={() => {
                                setCardSize(size);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm flex items-center gap-1
                                      ${cardSize === size 
                                        ? 'bg-purple-600 text-white' 
                                        : 'text-white hover:bg-purple-600'
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