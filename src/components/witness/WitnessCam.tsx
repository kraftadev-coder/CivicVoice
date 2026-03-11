/**
 * Module 3: Witness Cam Component
 *
 * Full-screen camera UI:
 * - Black background overlay (fixed, z-9999)
 * - Photo, Audio, Video modes
 * - GPS lock indicator
 * - Stable camera with no re-render shaking
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

/* ───────────────────── Types ───────────────────── */

export type CaptureMode = 'photo' | 'audio' | 'video';

export interface CapturedMedia {
    blob: Blob;
    type: CaptureMode;
    mimeType: string;
    duration?: number;
}

interface WitnessCamProps {
    onCapture: (media: CapturedMedia) => void;
    onClose: () => void;
}

/* ───────────────────── Constants ───────────────────── */

const MAX_VIDEO_DURATION = 15;
const WAVEFORM_BARS = 32;

/* ───────────────────── Shared Styles ───────────────────── */

// The full-screen overlay style — used by ALL render paths
const OVERLAY_STYLE: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    background: '#000',
    display: 'flex',
    flexDirection: 'column',
    // Prevent any background scroll/interaction
    touchAction: 'none',
    overflow: 'hidden',
};

/* ───────────────────── Component ───────────────────── */

const WitnessCam: React.FC<WitnessCamProps> = ({ onCapture, onClose }) => {
    const { reputation } = useAuth();

    const [mode, setMode] = useState<CaptureMode>('photo');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [sorSokeEnabled, setSorSokeEnabled] = useState(false);
    const [geoPermission, setGeoPermission] = useState<GeoPermissionState>('prompt');

    // GPS stored in refs — no re-renders
    const hasGpsLockRef = useRef(false);
    const geoLabelRef = useRef<string | null>(null);
    const [, forceGpsUpdate] = useState(0);

    // Waveform stored in ref
    const waveformRef = useRef<number[]>(Array(WAVEFORM_BARS).fill(0.5));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_wfTick, setWfTick] = useState(0);

    // Core refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const wfTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const geoCleanupRef = useRef<(() => void) | null>(null);
    const recordingTimeRef = useRef(0);
    const startingRef = useRef(false);
    const modeRef = useRef(mode);

    const canUploadVideo = reputation?.canUploadVideo ?? false;

    useEffect(() => { modeRef.current = mode; }, [mode]);

    /* ─── Stop Camera ─── */
    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close();
        audioCtxRef.current = null;
        analyserRef.current = null;
        if (wfTimerRef.current) { clearInterval(wfTimerRef.current); wfTimerRef.current = null; }
        setCameraReady(false);
        startingRef.current = false;
    }, []);

    /* ─── Start Camera ─── */
    const startCamera = useCallback(async () => {
        if (startingRef.current) return;
        startingRef.current = true;
        setCameraError(null);

        const m = modeRef.current;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: m !== 'audio' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
                audio: m !== 'photo',
            });

            streamRef.current = stream;

            // Attach stream to video element
            if (videoRef.current && m !== 'audio') {
                videoRef.current.srcObject = stream;
                // Let autoPlay handle playback — no manual play()
            }

            // Audio analyser for waveform
            if (m !== 'photo') {
                try {
                    const ctx = new AudioContext();
                    audioCtxRef.current = ctx;
                    const src = ctx.createMediaStreamSource(stream);
                    const an = createWaveformAnalyser(ctx, src);
                    analyserRef.current = an;
                    wfTimerRef.current = setInterval(() => {
                        if (!analyserRef.current) return;
                        const d = getWaveformData(analyserRef.current);
                        const step = Math.floor(d.length / WAVEFORM_BARS);
                        const bars: number[] = [];
                        for (let i = 0; i < WAVEFORM_BARS; i++) bars.push(d[i * step] ?? 0.5);
                        waveformRef.current = bars;
                        setWfTick(t => t + 1);
                    }, 120);
                } catch { /* non-fatal */ }
            }

            setCameraReady(true);
        } catch (err) {
            setCameraError(err instanceof Error ? err.message : 'Camera access failed');
            startingRef.current = false;
        }
    }, []);

    /* ─── Geolocation ─── */
    useEffect(() => {
        checkGeoPermission().then(setGeoPermission);
        let locked = false;
        const cleanup = watchPosition(
            (pos: GeoPosition) => {
                if (!locked && pos.accuracy < 200) {
                    locked = true;
                    hasGpsLockRef.current = true;
                    geoLabelRef.current = generateGeoLabel(pos.latitude, pos.longitude);
                    forceGpsUpdate(n => n + 1);
                }
            },
            () => {}
        );
        geoCleanupRef.current = cleanup;
        return () => { cleanup(); geoCleanupRef.current = null; };
    }, []);

    /* ─── Start camera once on mount ─── */
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ─── Mode change ─── */
    const handleModeChange = useCallback((newMode: CaptureMode) => {
        if (isRecording || newMode === mode) return;
        setMode(newMode);
        modeRef.current = newMode;
        stopCamera();
        setTimeout(() => startCamera(), 150);
    }, [isRecording, mode, stopCamera, startCamera]);

    /* ─── Capture ─── */
    const capturePhoto = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        const c = canvasRef.current ?? document.createElement('canvas');
        c.width = v.videoWidth; c.height = v.videoHeight;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(v, 0, 0);
        c.toBlob(b => { if (b) onCapture({ blob: b, type: 'photo', mimeType: 'image/jpeg' }); }, 'image/jpeg', 0.92);
    }, [onCapture]);

    const stopRecording = useCallback(() => {
        recorderRef.current?.stop(); recorderRef.current = null;
        setIsRecording(false); recordingTimeRef.current = 0;
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, []);

    const startRecording = useCallback(() => {
        if (!streamRef.current) return;
        const m = modeRef.current;
        const mime = m === 'audio'
            ? (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg')
            : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4');
        const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
        chunksRef.current = [];
        rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        rec.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mime });
            onCapture({ blob, type: m, mimeType: mime, duration: recordingTimeRef.current });
            chunksRef.current = [];
        };
        rec.start(100); recorderRef.current = rec;
        setIsRecording(true); setRecordingTime(0); recordingTimeRef.current = 0;
        timerRef.current = setInterval(() => {
            recordingTimeRef.current += 1; setRecordingTime(recordingTimeRef.current);
            if (modeRef.current === 'video' && recordingTimeRef.current >= MAX_VIDEO_DURATION) {
                recorderRef.current?.stop(); recorderRef.current = null; setIsRecording(false);
                if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            }
        }, 1000);
    }, [onCapture]);

    const handleCapture = useCallback(() => {
        if (mode === 'photo') capturePhoto();
        else if (isRecording) stopRecording();
        else startRecording();
    }, [mode, isRecording, capturePhoto, startRecording, stopRecording]);

    /* ─── Cleanup ─── */
    useEffect(() => () => {
        stopCamera();
        if (timerRef.current) clearInterval(timerRef.current);
    }, [stopCamera]);

    /* ─── Read refs for render ─── */
    const hasGpsLock = hasGpsLockRef.current;
    const geoLabel = geoLabelRef.current;
    const waveformData = waveformRef.current;

    /* ═══════════════════ ERROR STATE ═══════════════════ */
    if (cameraError) {
        return (
            <div style={OVERLAY_STYLE}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'white', textAlign: 'center', padding: 32 }}>
                    {/* Close — top-left */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        type="button"
                        style={{
                            position: 'absolute', top: 20, left: 20, zIndex: 10,
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', fontSize: 18, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >✕</button>

                    <svg style={{ width: 56, height: 56, opacity: 0.4 }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>

                    <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Camera Access Required</h3>
                    <p style={{ fontSize: 14, opacity: 0.6, maxWidth: 280, lineHeight: 1.5 }}>
                        {cameraError.includes('denied') || cameraError.includes('NotAllowed')
                            ? 'Please allow camera access in your browser settings, then tap Retry.'
                            : `Error: ${cameraError}`}
                    </p>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                startingRef.current = false;
                                setCameraError(null);
                                startCamera();
                            }}
                            type="button"
                            style={{
                                padding: '12px 28px', background: '#059669', color: 'white',
                                border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14,
                                cursor: 'pointer',
                            }}
                        >Retry</button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                            type="button"
                            style={{
                                padding: '12px 28px', background: 'rgba(255,255,255,0.1)', color: 'white',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, fontWeight: 600,
                                fontSize: 14, cursor: 'pointer',
                            }}
                        >Go Back</button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════ CAMERA VIEW ═══════════════════ */
    return (
        <div style={OVERLAY_STYLE}>
            {/* Viewfinder */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                {/* Close */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                    type="button"
                    style={{
                        position: 'absolute', top: 20, left: 20, zIndex: 20,
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', fontSize: 18, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >✕</button>

                {/* GPS */}
                <div style={{
                    position: 'absolute', top: 20, right: 20, zIndex: 20,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: hasGpsLock ? '#059669' : '#666' }} />
                    {hasGpsLock ? (geoLabel ?? 'GPS locked') : (geoPermission === 'denied' ? 'GPS off' : 'GPS...')}
                </div>

                {/* Video preview */}
                {mode !== 'audio' && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: 'translateZ(0)', backfaceVisibility: 'hidden',
                        }}
                    />
                )}

                {/* Audio waveform */}
                {mode === 'audio' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 48 }}>
                        {waveformData.map((v, i) => (
                            <div key={i} style={{ width: 3, borderRadius: 999, minHeight: 4, height: `${Math.max(4, v * 48)}px`, background: hasGpsLock ? '#059669' : 'rgba(255,255,255,0.35)', transition: 'height 0.12s ease' }} />
                        ))}
                    </div>
                )}

                {/* Loading */}
                {!cameraReady && !cameraError && (
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'white' }}>
                        <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: 'white', borderRadius: '50%', animation: 'wcSpin 1s linear infinite' }} />
                        <span style={{ fontSize: 12, opacity: 0.6 }}>Starting camera...</span>
                    </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Controls bar */}
            <div style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
                padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                background: 'rgba(0,0,0,0.9)', borderTop: '1px solid rgba(255,255,255,0.06)',
                flexWrap: 'wrap',
            }}>
                {/* Recording timer */}
                {isRecording && (
                    <span style={{ fontFamily: 'monospace', color: '#DC2626', fontSize: 14, fontWeight: 600 }}>
                        ● {fmtTime(recordingTime)}{mode === 'video' ? ` / ${fmtTime(MAX_VIDEO_DURATION)}` : ''}
                    </span>
                )}

                {/* Sor Soke */}
                {mode === 'audio' && (
                    <button
                        onClick={() => setSorSokeEnabled(!sorSokeEnabled)}
                        type="button"
                        style={{
                            background: sorSokeEnabled ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${sorSokeEnabled ? '#059669' : 'rgba(255,255,255,0.12)'}`,
                            color: sorSokeEnabled ? '#059669' : 'rgba(255,255,255,0.5)',
                            padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        }}
                    >🔊 Sor Soke {sorSokeEnabled ? 'ON' : 'OFF'}</button>
                )}

                {/* Capture button */}
                <button
                    onClick={handleCapture}
                    disabled={!cameraReady}
                    type="button"
                    style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'transparent', border: '3px solid rgba(255,255,255,0.6)',
                        cursor: cameraReady ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: cameraReady ? 1 : 0.3, transition: 'all 0.2s',
                    }}
                >
                    <div style={{
                        width: isRecording ? 28 : 50, height: isRecording ? 28 : 50,
                        borderRadius: isRecording ? 6 : '50%',
                        background: isRecording ? '#DC2626' : 'white',
                        transition: 'all 0.2s',
                    }} />
                </button>

                {/* Mode selector */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {(['photo', 'audio', 'video'] as CaptureMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => handleModeChange(m)}
                            disabled={isRecording || (m === 'video' && !canUploadVideo)}
                            type="button"
                            style={{
                                background: 'none', border: 'none',
                                cursor: isRecording ? 'not-allowed' : 'pointer',
                                color: mode === m ? 'white' : 'rgba(255,255,255,0.35)',
                                fontSize: 12, fontWeight: mode === m ? 700 : 500,
                                textTransform: 'capitalize',
                                opacity: (m === 'video' && !canUploadVideo) ? 0.2 : 1,
                                borderBottom: mode === m ? '2px solid white' : '2px solid transparent',
                                paddingBottom: 3,
                            }}
                        >
                            {m}{m === 'video' && !canUploadVideo && <span style={{ fontSize: 8, marginLeft: 3 }}>🔒</span>}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`@keyframes wcSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

function fmtTime(s: number): string {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default WitnessCam;
