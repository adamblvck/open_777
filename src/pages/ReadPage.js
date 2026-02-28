import React, { useState } from 'react';
import { BookReader } from '../components/BookReader';
import { LiberO } from '../constants/libero';
import { LiberE } from '../constants/libere';
import { LiberCC } from '../constants/libercc';
import { LiberIII } from '../constants/liberIII';
import { LiberSamekh } from '../constants/libersamekh';
import { LiberLXV } from '../constants/liberlxv';

const BOOKS = [
    { key: 'liber-o', label: 'Liber O', data: LiberO },
    { key: 'liber-e', label: 'Liber E', data: LiberE },
    { key: 'liber-cc', label: 'Liber Resh', data: LiberCC },
    { key: 'liber-iii', label: 'Liber III', data: LiberIII },
    { key: 'liber-samekh', label: 'Liber Samekh', data: LiberSamekh },
    { key: 'liber-lxv', label: 'Liber LXV', data: LiberLXV },
];

function ReadPage() {
    const [activeBook, setActiveBook] = useState(BOOKS[0].key);
    const currentBook = BOOKS.find(b => b.key === activeBook);

    return (
        <div className="min-h-screen bg-[#212638]">
            <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
                {/* Book selector */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    {BOOKS.map((book) => (
                        <button
                            key={book.key}
                            onClick={() => setActiveBook(book.key)}
                            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                                activeBook === book.key
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-300 text-gray-700'
                            }`}
                        >
                            {book.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-12">
                <BookReader book={currentBook.data} />
            </div>

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
}

export default ReadPage;
