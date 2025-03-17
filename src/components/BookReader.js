import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export const BookReader = ({ book }) => {
    const [currentChapter, setCurrentChapter] = useState(0);
    const [isSticky, setIsSticky] = useState(false);

    // Add scroll handler
    React.useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setIsSticky(offset > 200); // Adjust this value based on when you want the pill to stick
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const nextChapter = () => {
        if (currentChapter < book.chapters.length - 1) {
            setCurrentChapter(c => c + 1);
        }
    };

    const prevChapter = () => {
        if (currentChapter > 0) {
            setCurrentChapter(c => c - 1);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 border-2 rounded-xl border-purple-900">
            {/* Mobile Chapter Navigation - Now conditionally sticky */}
            <div className={`md:hidden ${isSticky ? 'fixed top-4' : 'relative mt-4'} left-0 right-0 z-50`}>
                <div className="mx-auto max-w-sm bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-between px-4 py-2">
                    <button 
                        onClick={prevChapter}
                        disabled={currentChapter === 0}
                        className="p-1 disabled:opacity-50"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="font-philosopher font-semibold">
                        Chapter {book.chapters[currentChapter].chapter_number}
                    </span>
                    <button 
                        onClick={nextChapter}
                        disabled={currentChapter === book.chapters.length - 1}
                        className="p-1 disabled:opacity-50"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="hidden md:block w-64 flex-shrink-0">
                    <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                        <h2 className="text-xl font-philosopher font-bold mb-4 text-gray-800 dark:text-white">
                            Chapters
                        </h2>
                        <nav className="space-y-2">
                            {book.chapters.map((chapter, idx) => (
                                <button
                                    key={chapter.chapter_number}
                                    onClick={() => setCurrentChapter(idx)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                        currentChapter === idx 
                                        ? 'bg-purple-600 text-white' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="text-sm font-medium font-philosopher">Chapter {chapter.chapter_number}</div>
                                    <div className="text-sm font-philosopher">{chapter.chapter_title}</div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content - Add overflow handling */}
                <div className="flex-1 max-w-3xl mx-auto overflow-hidden">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        <h1 className="text-2xl font-philosopher text-left mb-2 text-gray-900 dark:text-white">
                            {book.title}
                        </h1>
                        <h2 className="text-lg font-philosopher text-left mb-6 text-gray-600 dark:text-gray-400">
                            {book.subtitle}
                        </h2>

                        {/* Chapter Content */}
                        <div className="space-y-6 max-w-full">
                            <div>
                                <h3 className="text-xl font-philosopher text-left mb-4 text-gray-800 dark:text-white">
                                    <div className="font-medium">Chapter {book.chapters[currentChapter].chapter_number}</div>
                                    <div>{book.chapters[currentChapter].chapter_title}</div>
                                </h3>
                                <ul role="list" className="space-y-0">
                                    {book.chapters[currentChapter].verses.map((verse, index) => (
                                        <li key={verse.verse} className="relative flex gap-x-4">
                                            {/* Vertical line connector */}
                                            <div className={`absolute left-[11px] top-0 ${
                                                index === book.chapters[currentChapter].verses.length - 1 
                                                ? 'h-6' 
                                                : 'h-full'
                                            }`}>
                                                <div className="w-px h-full bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                            
                                            {/* Verse number circle with number */}
                                            <div className="relative flex h-6 w-6 flex-none items-center justify-center">
                                                <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-600 ring-1 ring-gray-300 dark:ring-gray-500 flex items-center justify-center">
                                                    <span className="text-xs text-gray-600 dark:text-gray-300">{verse.verse}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Verse text container - Improved mobile handling */}
                                            <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                                                <p className="pb-4 text-sm text-gray-700 dark:text-gray-300 text-left break-words whitespace-pre-wrap overflow-wrap-anywhere">
                                                    {verse.text ? (() => {
                                                        const lines = verse.text.split('\n');
                                                        const result = [];
                                                        let skipUntil = -1;

                                                        for (let i = 0; i < lines.length; i++) {
                                                            if (i <= skipUntil) continue;

                                                            const line = lines[i];
                                                            
                                                            if (line.trim() === '$$$') {
                                                                const asciiArtLines = [];
                                                                let endIndex = -1;
                                                                
                                                                for (let j = i + 1; j < lines.length; j++) {
                                                                    if (lines[j].trim() === '$$$') {
                                                                        endIndex = j;
                                                                        break;
                                                                    }
                                                                    asciiArtLines.push(lines[j]);
                                                                }

                                                                if (endIndex !== -1) {
                                                                    result.push(
                                                                        <div key={`ascii-${i}`} className="relative w-full my-2">
                                                                            {/* Outer container with strict width constraints */}
                                                                            <div  style={{ isolation: 'isolate' }} className="w-full max-w-[calc(100vw-7rem)] md:max-w-full mx-auto">
                                                                                <div className="overflow-x-auto border dark:border-gray-700 dark:bg-gray-700 rounded-lg" >
                                                                                    <div className="font-mono text-sm whitespace-pre bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                                                        {asciiArtLines.join('\n')}
                                                                                    </div>
                                                                                </div>
                                                                                {/* Mobile scroll indicator */}
                                                                                <div className="absolute right-2 top-2 sm:hidden">
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                                                                        scroll →
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                    skipUntil = endIndex;
                                                                    continue;
                                                                }
                                                            }

                                                            // Regular text line
                                                            result.push(
                                                                <span key={`text-${i}`} className="inline break-words">
                                                                    {line}
                                                                    {i < lines.length - 1 && <br />}
                                                                </span>
                                                            );
                                                        }

                                                        return result;
                                                    })() : 'No text available'}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 