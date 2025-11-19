
import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-accent bg-grid-pattern relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />
      
      <main className="flex-grow p-4 md:p-6 lg:p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      <footer className="flex-shrink-0 py-6 border-t border-card-border bg-accent/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-text-muted gap-2">
          <div className="font-medium tracking-wide">© 2025 <span className="text-primary">KLU</span> Attendance</div>
          <div className="flex items-center gap-2">
            Built with <span className="text-primary animate-pulse">❤️</span> for Students
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
