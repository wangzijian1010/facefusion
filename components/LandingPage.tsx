
import React from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface LandingPageProps {
  onStartCreating: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
        <div className="flex justify-center mb-4 text-cyan-400">{icon}</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onStartCreating }) => {
  return (
    <div className="w-full text-center animate-fade-in">
      <div className="relative w-full max-w-4xl mx-auto mb-8 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10 border border-slate-700">
        <img src="https://picsum.photos/seed/faceswap/1200/600" alt="Face swap example" className="w-full h-auto" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                The Simplest Multi-Face Swap Tool
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mb-8">
                Unleash your creativity. Swap faces between any two photos in just a few clicks.
            </p>
            <button
                onClick={onStartCreating}
                className="bg-cyan-500 text-slate-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
                Start Creating
            </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-16">
        <h3 className="text-3xl font-bold text-center mb-4">How It Works</h3>
        <p className="text-slate-400 text-center mb-10">A seamless three-step creative process.</p>
        <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
                icon={<UploadIcon className="w-10 h-10" />} 
                title="1. Upload Images" 
                description="Upload a 'Source' image for the face, and a 'Target' image for the body." 
            />
            <FeatureCard 
                icon={<SparklesIcon className="w-10 h-10" />} 
                title="2. Select & Create" 
                description="Our AI finds all faces. Simply click to select one face from each photo, then let the magic happen." 
            />
            <FeatureCard 
                icon={<DownloadIcon className="w-10 h-10" />} 
                title="3. Download" 
                description="Preview your masterpiece, compare with the original, and download in high quality." 
            />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
