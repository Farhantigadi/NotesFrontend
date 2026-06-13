import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSections } from '../../hooks/useSections';
import { useSubSectionsBySection } from '../../hooks/useSubSections';
import { useEditMode } from '../../contexts/EditModeContext';

export function Sidebar({ onAddSection, onAddSubSection }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isEditMode } = useEditMode();
  const { data: sections, isLoading } = useSections();
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <aside className="w-60 bg-stone-50 border-r border-stone-200 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3">
        {isEditMode && (
          <button
            onClick={onAddSection}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-3 bg-amber-800 text-white text-sm font-medium rounded-lg hover:bg-amber-900 transition-colors"
          >
            <Plus size={15} />
            New Section
          </button>
        )}

        {isLoading ? (
          <div className="space-y-2 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 bg-stone-200 rounded-md animate-pulse" />
            ))}
          </div>
        ) : sections?.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm">
            <Layers size={24} className="mx-auto mb-2 opacity-50" />
            No sections yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {sections?.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                onNavigate={() => navigate(`/sections/${section.id}`)}
                onAddSubSection={onAddSubSection}
                isActive={location.pathname === `/sections/${section.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function SectionItem({ section, isExpanded, onToggle, onNavigate, onAddSubSection, isActive }) {
  const { isEditMode } = useEditMode();
  const { data: subSections } = useSubSectionsBySection(section.id);

  return (
    <div>
      <div className={`flex items-center gap-0.5 rounded-lg group ${isActive ? 'bg-amber-100' : 'hover:bg-stone-200/70'}`}>
        <button
          onClick={onToggle}
          className="p-1.5 text-stone-400 hover:text-stone-600 flex-shrink-0"
        >
          {isExpanded
            ? <ChevronDown size={14} />
            : <ChevronRight size={14} />
          }
        </button>
        <button
          onClick={onNavigate}
          className={`flex-1 text-left py-1.5 text-sm font-medium truncate ${isActive ? 'text-amber-900' : 'text-stone-700'}`}
        >
          {section.title}
        </button>
        {isEditMode && (
          <button
            onClick={() => onAddSubSection?.(section.id)}
            className="p-1.5 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-amber-800 transition-all flex-shrink-0"
            title="Add subsection"
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      {isExpanded && subSections && (
        <div className="ml-5 mt-0.5 space-y-0.5 border-l border-stone-200 pl-2">
          {subSections.map((subSection) => (
            <SubSectionItem key={subSection.id} subSection={subSection} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubSectionItem({ subSection }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === `/subsections/${subSection.id}`;

  return (
    <button
      onClick={() => navigate(`/subsections/${subSection.id}`)}
      className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors truncate ${
        isActive
          ? 'bg-amber-100 text-amber-900 font-medium'
          : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-800'
      }`}
    >
      {subSection.title}
    </button>
  );
}
