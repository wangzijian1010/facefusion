
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
      <SparklesIcon className="w-16 h-16 text-cyan-400 animate-spin-slow mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
      <p className="text-slate-400">Please wait a moment...</p>
    </div>
  );
};

export default Loader;
