
import React from 'react';
import ComparisonSlider from './ComparisonSlider';
import { DownloadIcon } from './icons/DownloadIcon';
import { ResetIcon } from './icons/ResetIcon';

interface ResultsPageProps {
  originalImage: string;
  resultImage: string;
  onStartOver: () => void;
  onNewCreation: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ originalImage, resultImage, onStartOver, onNewCreation }) => {

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resultImage;
    // To download from picsum.photos, we can't set the download attribute directly due to CORS.
    // In a real app where the image is a data URL or from the same origin, this would work:
    link.download = 'face-swap-result.png'; 
    link.target = '_blank'; // Open in new tab as a fallback
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center animate-fade-in">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Your Creation is Ready!</h2>
      <p className="text-slate-400 text-center mb-6">Drag the slider to compare the before and after.</p>
      
      <div className="w-full aspect-video rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10 border border-slate-700 mb-8">
        <ComparisonSlider
          originalImage={originalImage}
          resultImage={resultImage}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
            onClick={onNewCreation}
            className="flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-6 rounded-full hover:bg-slate-500 transition-colors text-lg"
        >
            <ResetIcon className="w-5 h-5"/> Create Another
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-3 bg-cyan-500 text-slate-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
        >
          <DownloadIcon className="w-6 h-6" /> Download Image
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
