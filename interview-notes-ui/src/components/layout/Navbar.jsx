import { Edit2, BookOpen } from 'lucide-react';
import { useEditMode } from '../../contexts/EditModeContext';
import { SearchBar } from '../shared/SearchBar';

export function Navbar({ onSearch }) {
  const { isEditMode, toggleEditMode } = useEditMode();

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-6 px-6 h-14">
        <div className="flex items-center gap-2 flex-shrink-0">
          <BookOpen size={20} className="text-amber-800" />
          <span className="text-lg font-semibold text-stone-800 font-serif tracking-tight">Interview Notes</span>
        </div>

        <div className="flex-1 max-w-lg">
          <SearchBar onSearch={onSearch} placeholder="Search questions, answers, code..." />
        </div>

        <div className="ml-auto flex-shrink-0">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isEditMode
                ? 'bg-amber-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Edit2 size={15} />
            <span>{isEditMode ? 'Editing' : 'Edit'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
