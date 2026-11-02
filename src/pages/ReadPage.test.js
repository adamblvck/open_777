import { fireEvent, render, screen, within } from '@testing-library/react';
import ReadPage from './ReadPage';
import { LiberO } from '../constants/libero';
import { LiberE } from '../constants/libere';
import { LiberCC } from '../constants/libercc';

const expectChapter = (chapter) => {
    const heading = screen.getByRole('heading', { level: 3 });
    expect(within(heading).getByText(`Chapter ${chapter.chapter_number}`)).toBeInTheDocument();
    expect(within(heading).getByText(chapter.chapter_title)).toBeInTheDocument();
};

test('switching from chapter two to a single-chapter book resets the reader, including on return', () => {
    render(<ReadPage />);
    fireEvent.click(screen.getByRole('button', { name: /^Chapter II\s/ }));
    expectChapter(LiberO.chapters[1]);

    fireEvent.click(screen.getByRole('button', { name: 'Liber Resh' }));
    expectChapter(LiberCC.chapters[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Liber O' }));
    expectChapter(LiberO.chapters[0]);
});

test('switching to another multi-chapter book also resets to its first chapter', () => {
    render(<ReadPage />);
    fireEvent.click(screen.getByRole('button', { name: /^Chapter II\s/ }));
    expectChapter(LiberO.chapters[1]);

    // Clicking the active book is not a tab change and should keep the chapter.
    fireEvent.click(screen.getByRole('button', { name: 'Liber O' }));
    expectChapter(LiberO.chapters[1]);

    fireEvent.click(screen.getByRole('button', { name: 'Liber E' }));
    expectChapter(LiberE.chapters[0]);
});
