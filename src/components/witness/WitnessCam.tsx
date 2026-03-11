/**
 * Module 3: Witness Cam Component
 *
 * Full-screen camera UI per Component Spec:
 * - Black background + film grain SVG overlay
 * - Oversized circular capture buttons with heavy borders
 * - Photo, Audio, Video (15s max, gated by reputation) modes
 * - Real-time audio waveform: white → Emerald when GPS lock achieved
 *
 * Source:
 * - Component Spec: "Witness Cam" UI
 * - UI/UX Strategy §3: Motion & spatial composition
 * - Feature Goal Matrix §"Blow whistle with proofs"
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    watchPosition,
    generateGeoLabel,
    checkGeoPermission,
    type GeoPosition,
    type GeoPermissionState,
} from '../../lib/media/geoStamp';
import {
    createWaveformAnalyser,
    getWaveformData,
} from '../../lib/media/voiceDisguise';
import '../../styles/witness.css';

/* ───────────────────── Types ───────────────────── */

export type CaptureMode = 'photo' | 'audio' | 'video';

export interface CapturedMedia {
    blob: Blob;
    type: CaptureMode;
    mimeType: string;
    duration?: number; // seconds (audio/video)
}

interface WitnessCamProps {
    onCapture: (media: CapturedMedia) => void;
    onClose: () => void;
}

/* ───────────────────── Constants ───────────────────── */

const MAX_VIDEO_DURATION = 15; // seconds
const WAVEFORM_BARS = 32;
const WAVEFORM_UPDATE_INTERVAL = 100; // ms — slowed from 50ms to reduce re-renders

/* ───────────────────── Component ───────────────────── */

const WitnessCam: React.FC<WitnessCamProps> = ({ onCapture, onClose }) => {
    const { reputation } = useAuth();

    // State
    const [mode, setMode] = useState<CaptureMode>('photo');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [sorSokeEnabled, setSorSokeEnabled] = useState(false);

    // GPS state stored in refs to avoid re-renders that shake the camera
    const [geoPermission, setGeoPermission] = useState<GeoPermissionState>('prompt');
    const hasGpsLockRef = useRef(false);
    const geoLabelRef = useRef<string | null>(null);
    const [, forceUpdate] = useState(0); // Trigger a single re-render after GPS lock

    // Waveform data stored in ref — only used in audio mode
    const waveformDataRef = useRef<number[]>(Array(WAVEFORM_BARS).fill(0.5));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_waveformTick, setWaveformTick] = useState(0); // triggers re-render for waveform animation

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const waveformTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const geoCleanupRef = useRef<(() => void) | null>(null);
    const recordingTimeRef = useRef(0);
    const cameraStartedRef = useRef(false); // Guard against double-start
    const modeRef = useRef(mode); // Track mode without re-renders

    const canUploadVideo = reputation?.canUploadVideo ?? false;

    // Keep modeRef in sync
    useEffect(() => { modeRef.current = mode; }, [mode]);

    /* ─── Camera Setup ─── */

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (audioCtxRef.current?.state !== 'closed') {
            audioCtxRef.current?.close();
        }
        audioCtxRef.current = null;
        analyserRef.current = null;
        if (waveformTimerRef.current) {
            clearInterval(waveformTimerRef.current);
            waveformTimerRef.current = null;
        }
        setCameraReady(false);
        cameraStartedRef.current = false;
    }, []);

    const startCamera = useCallback(async () => {
        // Guard: prevent double-start
        if (cameraStartedRef.current) return;
        cameraStartedRef.current = true;

        const currentMode = modeRef.current;

        try {
            // Simple constraints — no facingMode to avoid shaking
            const constraints: MediaStreamConstraints = {
                video: currentMode !== 'audio' ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                } : false,
                audio: currentMode !== 'photo',
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            // Wait for the video element to be ready before attaching
            if (videoRef.current && currentMode !== 'audio') {
                const videoEl = videoRef.current;
                videoEl.srcObject = stream;
                // Don't call play() manually — let autoPlay + playsInline handle it
                // This prevents the race condition that causes shaking
            }

            // Setup audio waveform analyser (only for audio/video modes)
            if (currentMode !== 'photo') {
                try {
                    const audioCtx = new AudioContext();
                    audioCtxRef.current = audioCtx;
                    const source = audioCtx.createMediaStreamSource(stream);
                    const analyser = createWaveformAnalyser(audioCtx, source);
                    analyserRef.current = analyser;

                    // Start waveform updates at a slower rate
                    waveformTimerRef.current = setInterval(() => {
                        if (analyserRef.current) {
                            const data = getWaveformData(analyserRef.current);
                            const step = Math.floor(data.length / WAVEFORM_BARS);
                            const bars: number[] = [];
                            for (let i = 0; i < WAVEFORM_BARS; i++) {
                                bars.push(data[i * step] ?? 0.5);
                            }
                            waveformDataRef.current = bars;
                            setWaveformTick(t => t + 1);
                        }
                    }, WAVEFORM_UPDATE_INTERVAL);
                } catch {
                    // Audio context failure is non-fatal
                }
            }

            setCameraReady(true);
            setCameraError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Camera access failed';
            setCameraError(message);
            setCameraReady(false);
            cameraStartedRef.current = false;
        }
    }, []);

    /* ─── Geolocation — fire-and-forget, no state updates during camera ─── */

    useEffect(() => {
        checkGeoPermission().then(setGeoPermission);

        let locked = false;
        const cleanup = watchPosition(
            (pos: GeoPosition) => {
                if (!locked && pos.accuracy < 200) {
                    locked = true;
                    hasGpsLockRef.current = true;
                    geoLabelRef.current = generateGeoLabel(pos.latitude, pos.longitude);
                    // Single re-render to update GPS display
                    forceUpdate(n => n + 1);
                }
            },
            () => { /* Silently ignore errors — don't set state */ }
        );
        geoCleanupRef.current = cleanup;

        return () => {
            cleanup();
            geoCleanupRef.current = null;
        };
    }, []);

    /* ─── Camera lifecycle — start once, cleanup on unmount ─── */

    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ─── Mode change: restart camera ─── */

    const handleModeChange = useCallback((newMode: CaptureMode) => {
        if (isRecording) return;
        if (newMode === mode) return;
        setMode(newMode);
        modeRef.current = newMode;
        // Stop current stream and restart with new constraints
        stopCamera();
        // Small delay to ensure cleanup completes
        setTimeout(() => {
            startCamera();
        }, 100);
    }, [isRecording, mode, stopCamera, startCamera]);

    /* ─── Capture Handlers ─── */

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = canvasRef.current ?? document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    onCapture({ blob, type: 'photo', mimeType: 'image/jpeg' });
                }
            },
            'image/jpeg',
            0.92
        );
    }, [onCapture]);

    const stopRecording = useCallback(() => {
        recorderRef.current?.stop();
        recorderRef.current = null;
        setIsRecording(false);
        recordingTimeRef.current = 0;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startRecording = useCallback(() => {
        if (!streamRef.current) return;

        const currentMode = modeRef.current;
        const mimeType = currentMode === 'audio'
            ? (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg')
            : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4');

        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            onCapture({
                blob,
                type: currentMode,
                mimeType,
                duration: recordingTimeRef.current,
            });
            chunksRef.current = [];
        };

        recorder.start(100);
        recorderRef.current = recorder;
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimeRef.current = 0;

        timerRef.current = setInterval(() => {
            recordingTimeRef.current += 1;
            setRecordingTime(recordingTimeRef.current);
            if (modeRef.current === 'video' && recordingTimeRef.current >= MAX_VIDEO_DURATION) {
                recorderRef.current?.stop();
                recorderRef.current = null;
                setIsRecording(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        }, 1000);
    }, [onCapture]);

    const handleCapture = useCallback(() => {
        if (mode === 'photo') {
            capturePhoto();
        } else if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [mode, isRecording, capturePhoto, startRecording, stopRecording]);

    /* ─── Cleanup ─── */

    useEffect(() => {
        return () => {
            stopCamera();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [stopCamera]);

    /* ─── Render ─── */

    const hasGpsLock = hasGpsLockRef.current;
    const geoLabel = geoLabelRef.current;
    const waveformData = waveformDataRef.current;

    // Camera error state
    if (cameraError) {
        return (
            <div className="witness-cam" id="witness-cam">
                <div className="witness-cam__viewfinder">
                    <button className="witness-cam__close" onClick={onClose} aria-label="Close camera" type="button">✕</button>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'white', textAlign: 'center', padding: '32px' }}>
                        <svg style={{ width: 48, height: 48, opacity: 0.5 }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>Camera Access Required</h3>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                            {cameraError.includes('denied')
                                ? 'Please allow camera access in your browser settings to use Witness Cam.'
                                : `Camera error: ${cameraError}`
                            }
                        </p>
                        <button
                            onClick={() => { cameraStartedRef.current = false; startCamera(); }}
                            type="button"
                            style={{ marginTop: '8px', padding: '10px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="witness-cam" id="witness-cam" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}>
            {/* Viewfinder */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close camera"
                    type="button"
                    style={{
                        position: 'absolute', top: 24, left: 24, zIndex: 20,
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', fontSize: '1.25rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    ✕
                </button>

                {/* GPS indicator */}
                <div style={{
                    position: 'absolute', top: 24, right: 24, zIndex: 20,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)',
                }}>
                    <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: hasGpsLock ? '#059669' : '#888',
                    }} />
                    {hasGpsLock ? (geoLabel ?? 'GPS locked') : (geoPermission === 'denied' ? 'GPS denied' : 'Acquiring GPS...')}
                </div>

                {/* Camera video preview */}
                {mode !== 'audio' && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            // Prevent layout shifts and flickering
                            transform: 'translateZ(0)',
                            backfaceVisibility: 'hidden',
                        }}
                    />
                )}

                {/* Audio waveform (for audio mode) */}
                {mode === 'audio' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 48 }}>
                        {waveformData.map((value, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 3, borderRadius: 999, minHeight: 4,
                                    height: `${Math.max(4, value * 48)}px`,
                                    background: hasGpsLock ? '#059669' : 'rgba(255,255,255,0.4)',
                                    transition: 'height 0.15s ease',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Loading indicator */}
                {!cameraReady && !cameraError && (
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'white' }}>
                        <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: 13, opacity: 0.7 }}>Starting camera...</span>
                    </div>
                )}

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 32px', background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
                {/* Recording timer */}
                {isRecording && (
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#DC2626', fontSize: '0.875rem' }}>
                        ● {formatTime(recordingTime)}
                        {mode === 'video' && ` / ${formatTime(MAX_VIDEO_DURATION)}`}
                    </span>
                )}

                {/* Audio waveform in controls (for video/audio recording) */}
                {mode !== 'photo' && cameraReady && !isRecording && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 28 }}>
                        {waveformData.map((value, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 3, borderRadius: 999, minHeight: 4,
                                    height: `${Math.max(4, value * 28)}px`,
                                    background: hasGpsLock ? '#059669' : 'rgba(255,255,255,0.4)',
                                    transition: 'height 0.15s ease',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Sor Soke Toggle */}
                {mode === 'audio' && (
                    <button
                        onClick={() => setSorSokeEnabled(!sorSokeEnabled)}
                        type="button"
                        id="sor-soke-toggle"
                        style={{
                            background: sorSokeEnabled ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.1)',
                            border: `1px solid ${sorSokeEnabled ? '#059669' : 'rgba(255,255,255,0.15)'}`,
                            color: sorSokeEnabled ? '#059669' : 'rgba(255,255,255,0.6)',
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        🔊 Sor Soke {sorSokeEnabled ? 'ON' : 'OFF'}
                    </button>
                )}

                {/* Capture Button */}
                <button
                    onClick={handleCapture}
                    aria-label={mode === 'photo' ? 'Take photo' : isRecording ? 'Stop recording' : `Start ${mode} recording`}
                    type="button"
                    id="capture-btn"
                    disabled={!cameraReady}
                    style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'transparent',
                        border: '3px solid rgba(255,255,255,0.7)',
                        cursor: cameraReady ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', opacity: cameraReady ? 1 : 0.4,
                    }}
                >
                    <div style={{
                        width: isRecording ? 32 : 56,
                        height: isRecording ? 32 : 56,
                        borderRadius: isRecording ? 8 : '50%',
                        background: isRecording ? '#DC2626' : 'white',
                        transition: 'all 0.2s ease',
                    }} />
                </button>

                {/* Mode Selector */}
                <div style={{ display: 'flex', gap: 12 }}>
                    {(['photo', 'audio', 'video'] as CaptureMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => handleModeChange(m)}
                            disabled={isRecording || (m === 'video' && !canUploadVideo)}
                            type="button"
                            id={`mode-${m}`}
                            style={{
                                background: 'none', border: 'none', cursor: isRecording ? 'not-allowed' : 'pointer',
                                color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
                                fontSize: 13, fontWeight: mode === m ? 700 : 500,
                                textTransform: 'capitalize', opacity: (m === 'video' && !canUploadVideo) ? 0.3 : 1,
                                borderBottom: mode === m ? '2px solid white' : '2px solid transparent',
                                paddingBottom: 4,
                            }}
                        >
                            {m}
                            {m === 'video' && !canUploadVideo && (
                                <span style={{ fontSize: 9, marginLeft: 4, color: '#D97706' }}>🔒</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Spinner animation keyframes */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

/* ───────────────────── Helpers ───────────────────── */

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default WitnessCam;
