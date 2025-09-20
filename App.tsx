
import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import ResultsPage from './components/ResultsPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleStartCreating = useCallback(() => {
    setAppState(AppState.WORKSPACE);
  }, []);

  const handleProcessingComplete = useCallback((targetImage: string, result: string) => {
    setOriginalImage(targetImage);
    setResultImage(result);
    setAppState(AppState.RESULTS);
  }, []);

  const handleStartOver = useCallback(() => {
    setOriginalImage(null);
    setResultImage(null);
    setAppState(AppState.LANDING);
  }, []);
  
  const handleNewCreation = useCallback(() => {
    setOriginalImage(null);
    setResultImage(null);
    setAppState(AppState.WORKSPACE);
  }, []);


  const renderContent = () => {
    switch (appState) {
      case AppState.LANDING:
        return <LandingPage onStartCreating={handleStartCreating} />;
      case AppState.WORKSPACE:
        return <Workspace onProcessingComplete={handleProcessingComplete} />;
      case AppState.RESULTS:
        if (originalImage && resultImage) {
          return <ResultsPage originalImage={originalImage} resultImage={resultImage} onStartOver={handleStartOver} onNewCreation={handleNewCreation} />;
        }
        // Fallback to workspace if images are not available
        setAppState(AppState.WORKSPACE);
        return <Workspace onProcessingComplete={handleProcessingComplete} />;
      default:
        return <LandingPage onStartCreating={handleStartCreating} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-gray-200">
      <Header onLogoClick={handleStartOver} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
