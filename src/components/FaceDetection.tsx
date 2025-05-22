import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from './Webcam';

interface FaceDetectionProps {
  onFaceDetected?: (faceDescriptor: Float32Array) => void;
  mode: 'register' | 'recognize';
  showLabels?: boolean;
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ 
  onFaceDetected, 
  mode,
  showLabels = true 
}) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detections, setDetections] = useState<faceapi.FaceDetection[]>([]);
  const [message, setMessage] = useState<string>('Initializing face detection...');
  
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setMessage('Loading face detection models...');
        
        // Load models from public folder
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        
        setModelsLoaded(true);
        setMessage('Models loaded. Ready to detect faces.');
      } catch (error) {
        console.error('Error loading models:', error);
        setMessage('Error loading face detection models. Please refresh and try again.');
      }
    };

    loadModels();
  }, []);

  // Handle video frame processing
  const handleFrame = async (imageData: ImageData) => {
    if (!modelsLoaded || !detecting) return;

    try {
      // Detect faces in the current frame
      const detectedFaces = await faceapi.detectAllFaces(
        imageData, 
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
      ).withFaceLandmarks().withFaceDescriptors();

      if (detectedFaces.length > 0) {
        setFaceDetected(true);
        setDetections(detectedFaces.map(face => face.detection));
        
        // In register mode, we want a clear frontal face
        if (mode === 'register') {
          setMessage('Face detected! Hold still...');
          
          // Only use the largest face for registration
          const bestFace = detectedFaces.reduce((prev, current) => 
            (prev.detection.box.area > current.detection.box.area) ? prev : current
          );
          
          if (onFaceDetected) {
            onFaceDetected(bestFace.descriptor);
          }
        } 
        // In recognize mode, try to match the face
        else if (mode === 'recognize') {
          setMessage('Scanning face...');
          
          // Use the largest face for recognition
          const bestFace = detectedFaces.reduce((prev, current) => 
            (prev.detection.box.area > current.detection.box.area) ? prev : current
          );
          
          if (onFaceDetected) {
            onFaceDetected(bestFace.descriptor);
          }
        }
      } else {
        setFaceDetected(false);
        setDetections([]);
        setMessage('No face detected. Please position your face in front of the camera.');
      }
    } catch (error) {
      console.error('Error processing frame:', error);
      setMessage('Error processing video frame.');
    }
  };

  // Handle stream ready
  const handleStreamReady = () => {
    setDetecting(true);
    setMessage(mode === 'register' ? 'Position your face in the frame...' : 'Looking for faces...');
  };

  // Render face detection boxes
  const renderFaceBoxes = () => {
    if (!overlayRef.current) return null;
    
    const overlay = overlayRef.current;
    const overlayWidth = overlay.offsetWidth;
    const overlayHeight = overlay.offsetHeight;
    
    return detections.map((detection, index) => {
      const { x, y, width, height } = detection.box;
      
      // Scale coordinates to match the overlay size
      const scaleX = overlayWidth / detection.imageWidth;
      const scaleY = overlayHeight / detection.imageHeight;
      
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      return (
        <div key={index}>
          <div 
            className={`face-detection-box face-pulse ${faceDetected ? 'border-green-500' : 'border-yellow-500'}`}
            style={{
              left: `${scaledX}px`,
              top: `${scaledY}px`,
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`
            }}
          />
          {showLabels && (
            <div 
              className="face-detection-label"
              style={{
                left: `${scaledX}px`,
                top: `${scaledY}px`,
              }}
            >
              {mode === 'register' ? 'New Face' : 'Scanning...'}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="relative">
      {!modelsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 text-white z-10 rounded-lg">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p>{message}</p>
          </div>
        </div>
      )}
      
      <div className="relative rounded-lg overflow-hidden">
        <Webcam 
          onStreamReady={handleStreamReady}
          onFrame={handleFrame}
          width={640}
          height={480}
        />
        
        <div 
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
        >
          {renderFaceBoxes()}
          {detecting && <div className="scanning-line" />}
        </div>
      </div>
      
      <div className="mt-3 text-center text-sm text-gray-600">
        {message}
      </div>
    </div>
  );
};

export default FaceDetection;