
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
    onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div 
          className="flex items-center gap-2 cursor-pointer w-fit"
          onClick={onLogoClick}
          title="Back to Home"
        >
          <SparklesIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AI Face Swap Studio
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
