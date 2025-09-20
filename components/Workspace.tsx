
import React, { useState, useCallback } from 'react';
import { DetectedFace } from '../types';
import { detectFacesInImage, swapFacesInImage } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import Loader from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';

interface WorkspaceProps {
  onProcessingComplete: (targetImage: string, result: string) => void;
}

interface ImageState {
  file: File | null;
  url: string | null;
  faces: DetectedFace[];
  selectedFaceId: string | null;
}

const initialImageState: ImageState = {
  file: null,
  url: null,
  faces: [],
  selectedFaceId: null,
};

const ImageSlot: React.FC<{
  title: string;
  imageState: ImageState;
  onImageUpload: (file: File) => void;
  onFaceSelect: (faceId: string) => void;
  isLoading: boolean;
}> = ({ title, imageState, onImageUpload, onFaceSelect, isLoading }) => {
  const { url, faces, selectedFaceId } = imageState;

  return (
    <div className="flex-1 flex flex-col items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
      <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
      <div className="w-full aspect-square bg-slate-900 rounded-md flex items-center justify-center relative overflow-hidden">
        {!url ? (
          <ImageUploader onImageUpload={onImageUpload} />
        ) : (
          <>
            <img src={url} alt={title} className="max-h-full max-w-full object-contain" />
            {faces.map(face => (
              <div
                key={face.id}
                onClick={() => onFaceSelect(face.id)}
                className={`absolute border-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-white/20 ${
                  selectedFaceId === face.id ? 'border-yellow-400 border-4 shadow-lg shadow-yellow-500/30' : 'border-cyan-400/60'
                }`}
                style={{
                  left: `${face.box.x * 100}%`,
                  top: `${face.box.y * 100}%`,
                  width: `${face.box.width * 100}%`,
                  height: `${face.box.height * 100}%`,
                }}
              >
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2.5 py-0.5 text-md font-bold rounded-full border border-slate-600">{parseInt(face.id) + 1}</span>
              </div>
            ))}
          </>
        )}
      </div>
      {faces.length > 0 && (
        <div className="w-full text-center">
            <p className="text-sm text-slate-400 mb-2">
                {faces.length > 1 ? `Detected ${faces.length} faces. Please select one.` : `Detected 1 face.`}
            </p>
            <div className="flex justify-center gap-2 flex-wrap bg-slate-900/50 p-2 rounded-md">
                {faces.map(face => (
                     <img 
                        key={face.id}
                        src={face.thumbnailUrl} 
                        alt={`Face ${parseInt(face.id) + 1}`}
                        onClick={() => onFaceSelect(face.id)}
                        className={`w-14 h-14 rounded-full object-cover cursor-pointer transition-all duration-200 hover:scale-110 ${
                            selectedFaceId === face.id ? 'border-4 border-yellow-400' : 'border-2 border-slate-500'
                        }`}
                     />
                ))}
            </div>
        </div>
      )}
      {url && faces.length === 0 && !isLoading && (
        <p className="text-yellow-500 text-sm">No faces were detected in this image.</p>
      )}
    </div>
  );
};

const Workspace: React.FC<WorkspaceProps> = ({ onProcessingComplete }) => {
  const [sourceState, setSourceState] = useState<ImageState>(initialImageState);
  const [targetState, setTargetState] = useState<ImageState>(initialImageState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleImageUpload = useCallback(async (file: File, type: 'source' | 'target') => {
    const setState = type === 'source' ? setSourceState : setTargetState;
    
    setState({ ...initialImageState, file, url: URL.createObjectURL(file) });
    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Detecting faces in ${type} image...`);

    try {
      const faces = await detectFacesInImage(file);
      setState(prevState => ({ 
        ...prevState, 
        faces,
        // Auto-select face if only one is detected
        selectedFaceId: faces.length === 1 ? faces[0].id : null,
      }));
    } catch (err) {
      setError(`Could not detect faces in the ${type} image.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleFaceSelect = (faceId: string, type: 'source' | 'target') => {
      const setState = type === 'source' ? setSourceState : setTargetState;
      setState(prevState => ({...prevState, selectedFaceId: faceId}));
  }

  const handleGenerate = async () => {
    if (!sourceState.file || !targetState.file || !sourceState.selectedFaceId || !targetState.selectedFaceId || !targetState.url) {
        setError("Please upload both images and select a face from each.");
        return;
    }

    const sourceFace = sourceState.faces.find(f => f.id === sourceState.selectedFaceId);
    const targetFace = targetState.faces.find(f => f.id === targetState.selectedFaceId);

    if (!sourceFace || !targetFace) {
        setError("Selected faces are not valid. Please try again.");
        return;
    }

    setIsLoading(true);
    setLoadingMessage('AI is working its magic...');
    setError(null);

    try {
      const resultImageUrl = await swapFacesInImage(sourceState.file, targetState.file, sourceFace, targetFace);
      onProcessingComplete(targetState.url, resultImageUrl);
    } catch (err) {
      setError('An error occurred during face swapping. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader message={loadingMessage} />;
  }
  
  const isGenerateDisabled = !sourceState.selectedFaceId || !targetState.selectedFaceId;

  return (
    <div className="w-full max-w-7xl flex flex-col items-center animate-fade-in gap-6">
      <div className="w-full flex flex-col md:flex-row gap-6">
        <ImageSlot 
            title="Source Image (The Face)" 
            imageState={sourceState} 
            onImageUpload={(file) => handleImageUpload(file, 'source')}
            onFaceSelect={(id) => handleFaceSelect(id, 'source')}
            isLoading={isLoading}
        />
        <ImageSlot 
            title="Target Image (The Scene)" 
            imageState={targetState} 
            onImageUpload={(file) => handleImageUpload(file, 'target')}
            onFaceSelect={(id) => handleFaceSelect(id, 'target')}
            isLoading={isLoading}
        />
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md text-center">{error}</div>}

      <div className="flex flex-col items-center gap-2">
        <button onClick={handleGenerate} disabled={isGenerateDisabled} className="flex items-center gap-2 bg-cyan-500 text-slate-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
          <SparklesIcon className="w-6 h-6"/> Generate
        </button>
        {isGenerateDisabled && (sourceState.file || targetState.file) && <p className="text-sm text-slate-400">Upload both images and select a face from each to continue.</p>}
      </div>
    </div>
  );
};

export default Workspace;
