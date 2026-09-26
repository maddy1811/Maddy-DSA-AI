import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';
import { sound } from '../services/audio';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // user | environment

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera access error:", err);
      setCameraError("Camera unavailable or permission denied. Please allow camera permissions or upload an image file instead.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    sound.playShutter();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    sound.playPop();
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    sound.playAttach();

    // Extract raw base64 data for Gemini
    const base64Data = capturedImage.split(',')[1];

    onCapture({
      id: `img-${Date.now()}`,
      name: `DSA_Capture_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.jpg`,
      type: 'image',
      previewUrl: capturedImage,
      base64Data,
      mimeType: 'image/jpeg',
      size: `${Math.round((base64Data.length * 3) / 4 / 1024)} KB`
    });

    onClose();
  };

  const toggleFacingMode = () => {
    sound.playPop();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#0e1626',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(59, 130, 246, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
              {capturedImage ? 'Review Captured Photo' : 'Snap Photo for DSA Instructor'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!capturedImage && !cameraError && (
              <button
                onClick={toggleFacingMode}
                className="btn-icon"
                title="Flip Camera"
              >
                <FlipHorizontal size={16} />
              </button>
            )}
            <button onClick={onClose} className="btn-icon" title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video / Snapshot Viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {cameraError ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle size={36} color="var(--accent-rose)" />
              <p style={{ fontSize: '13px', lineHeight: 1.5, maxWidth: '340px' }}>
                {cameraError}
              </p>
              <button
                onClick={startCamera}
                className="btn btn-ghost"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                <RefreshCw size={13} />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Snapshot"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Bottom Actions */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="btn btn-ghost"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                <RefreshCw size={14} />
                <span>Retake</span>
              </button>

              <button
                onClick={handleConfirm}
                className="btn btn-primary"
                style={{ padding: '8px 24px', fontSize: '13px' }}
              >
                <Check size={16} />
                <span>Attach to Chat</span>
              </button>
            </>
          ) : (
            !cameraError && (
              <button
                onClick={handleSnap}
                className="btn btn-primary"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  padding: 0,
                  boxShadow: '0 0 24px var(--accent-primary-glow)'
                }}
                title="Click Photo"
              >
                <Camera size={26} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
