import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamProps {
  onStreamReady?: (stream: MediaStream) => void;
  onFrame?: (imageData: ImageData) => void;
  width?: number;
  height?: number;
}

const Webcam: React.FC<WebcamProps> = ({ 
  onStreamReady, 
  onFrame, 
  width = 640, 
  height = 480 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setError(null);
        
        if (onStreamReady) {
          onStreamReady(stream);
        }
      }
    } catch (err) {
      setError('Could not access webcam. Please make sure you have granted camera permissions.');
      setIsActive(false);
      console.error('Error accessing webcam:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  // Process video frames
  useEffect(() => {
    if (!isActive || !onFrame) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    const processFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data and pass to callback
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        onFrame(imageData);
      }
      
      animationId = requestAnimationFrame(processFrame);
    };
    
    video.onloadedmetadata = () => {
      processFrame();
    };
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, onFrame]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video 
          ref={videoRef}
          className="w-full h-auto" 
          autoPlay 
          playsInline 
          muted
        />
        
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />
        
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-75 text-white p-4">
            <CameraOff size={48} className="mb-4" />
            <p className="text-center mb-4">Camera is currently off</p>
            <button
              className="btn-primary"
              onClick={startWebcam}
            >
              <Camera size={18} className="mr-2 inline" />
              Start Camera
            </button>
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="absolute bottom-4 right-4">
          <button
            className="btn-error"
            onClick={stopWebcam}
          >
            <CameraOff size={18} className="mr-2 inline" />
            Turn Off
          </button>
        </div>
      )}
    </div>
  );
};

export default Webcam;