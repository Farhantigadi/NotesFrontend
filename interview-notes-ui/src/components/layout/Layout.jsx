import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout({ children, onAddSubSection, onSearch }) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar onSearch={onSearch} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onAddSubSection={onAddSubSection} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-content mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
