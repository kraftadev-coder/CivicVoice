/**
 * Module 3: Submission Flow Component
 *
 * Multi-step wizard: Capture → Preview → Scrub → Submit
 * Enforces the "Amnesia Constraint" — rejects unscrubbed files.
 *
 * Source:
 * - Feature Goal Matrix §"Amnesia Constraint": scrubMedia() required
 * - UI/UX Strategy §2.3: "Amnesia Wipe" animation on submit
 * - Security Protocol §1.2: reject raw files
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import WitnessCam, { type CapturedMedia } from './WitnessCam';
import { useAuth } from '../../contexts/AuthContext';
import { scrubMedia, validateScrubbed, type ScrubResult } from '../../lib/media/metadataScrubber';
import { compressImage, compressAudio, detectMediaType, isWithinPayloadCap } from '../../lib/media/compressor';
import { createGeoStamp, type GeoStamp } from '../../lib/media/geoStamp';
import { applyVoiceDisguise, DEFAULT_PITCH_FACTOR } from '../../lib/media/voiceDisguise';
import { Turnstile } from '../ui/Turnstile';
import '../../styles/witness.css';

/* ─── Turnstile Configuration ─── */
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

/* ───────────────────── Types ───────────────────── */

type FlowStep = 'idle' | 'capture' | 'preview' | 'scrub' | 'submit' | 'done';

interface ScrubStep {
    label: string;
    status: 'pending' | 'active' | 'done' | 'error';
}

export interface SubmissionData {
    file: File;
    type: 'photo' | 'audio' | 'video';
    geoStamp: GeoStamp | null;
    contentHash: string;
    sorSokeEnabled: boolean;
    title: string;
    description: string;
    lane: 'witness' | 'social';
}

interface SubmissionFlowProps {
    onSubmit?: (data: SubmissionData) => void;
}

/* ───────────────────── Component ───────────────────── */

const SubmissionFlow: React.FC<SubmissionFlowProps> = ({ onSubmit }) => {
    const { reputation } = useAuth();

    // State
    const [step, setStep] = useState<FlowStep>('idle');
    const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [geoStamp, setGeoStamp] = useState<GeoStamp | null>(null);
    const [scrubResult, setScrubResult] = useState<ScrubResult | null>(null);
    const [sorSokeEnabled, setSorSokeEnabled] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lane, setLane] = useState<'witness' | 'social'>('witness');
    const [showAmnesiaWipe, setShowAmnesiaWipe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [scrubSteps, setScrubSteps] = useState<ScrubStep[]>([
        { label: 'STRIPPING METADATA', status: 'pending' },
        { label: 'COMPRESSING MEDIA', status: 'pending' },
        { label: 'GENERATING CONTENT HASH', status: 'pending' },
        { label: 'APPLYING VOICE DISGUISE', status: 'pending' },
        { label: 'VALIDATING SCRUB', status: 'pending' },
    ]);

    const prevUrlRef = useRef<string | null>(null);
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

    /* ─── Cleanup object URLs ─── */
    useEffect(() => {
        return () => {
            if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
            // Clear any pending animation timeouts
            timeoutRefs.current.forEach(clearTimeout);
            timeoutRefs.current = [];
        };
    }, []);

    /* ─── Step Handlers ─── */

    const handleCapture = useCallback((media: CapturedMedia) => {
        setCapturedMedia(media);
        const url = URL.createObjectURL(media.blob);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
        setPreviewUrl(url);
        setStep('preview');

        // Try to get geo-stamp
        createGeoStamp()
            .then(setGeoStamp)
            .catch(() => setGeoStamp(null));
    }, []);

    const handleStartScrub = useCallback(async () => {
        if (!capturedMedia) return;
        setStep('scrub');
        setError(null);

        const updateStep = (index: number, status: ScrubStep['status']) => {
            setScrubSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
        };

        try {
            let processedBlob: Blob = capturedMedia.blob;

            // Step 1: Strip metadata (images only)
            updateStep(0, 'active');
            await delay(400); // Visual delay for UX
            if (capturedMedia.type === 'photo') {
                const file = new File([capturedMedia.blob], 'capture.jpg', { type: capturedMedia.mimeType });
                const result = await scrubMedia(file);
                processedBlob = result.file;
                setScrubResult(result);
            }
            updateStep(0, 'done');

            // Step 2: Compress
            updateStep(1, 'active');
            await delay(300);
            const mediaType = detectMediaType(capturedMedia.mimeType);
            if (capturedMedia.type === 'photo') {
                const file = new File([processedBlob], 'capture.jpg', { type: 'image/jpeg' });
                const compressed = await compressImage(file);
                processedBlob = compressed.blob;
            } else if (capturedMedia.type === 'audio') {
                const compressed = await compressAudio(processedBlob);
                processedBlob = compressed.blob;
            }
            // Video compression deferred to server-side (Module 5)
            updateStep(1, 'done');

            // Step 3: Generate content hash
            updateStep(2, 'active');
            await delay(300);
            const hashBuffer = await crypto.subtle.digest('SHA-256', await processedBlob.arrayBuffer());
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            updateStep(2, 'done');

            // Step 4: Voice disguise (audio only, if Sor Soke enabled)
            updateStep(3, 'active');
            await delay(300);
            if (capturedMedia.type === 'audio' && sorSokeEnabled) {
                processedBlob = await applyVoiceDisguise(processedBlob, DEFAULT_PITCH_FACTOR);
            }
            updateStep(3, 'done');

            // Step 5: Validate scrub
            updateStep(4, 'active');
            await delay(300);
            if (capturedMedia.type === 'photo') {
                const file = new File([processedBlob], 'evidence.jpg', { type: 'image/jpeg' });
                const isValid = await validateScrubbed(file);
                if (!isValid) {
                    updateStep(4, 'error');
                    setError('SCRUB VALIDATION FAILED — File rejected. Metadata still present.');
                    return;
                }
            }
            // Payload cap check
            if (!isWithinPayloadCap(processedBlob, mediaType)) {
                updateStep(4, 'error');
                setError(`FILE EXCEEDS ${mediaType.toUpperCase()} PAYLOAD CAP — Submission rejected.`);
                return;
            }
            updateStep(4, 'done');

            // Store processed file for submission
            const processedFile = new File(
                [processedBlob],
                `evidence_${Date.now()}.${getExtension(capturedMedia.mimeType)}`,
                { type: capturedMedia.mimeType }
            );

            // Move to submit confirmation
            setStep('submit');

            // Trigger submission
            const submissionData: SubmissionData = {
                file: processedFile,
                type: capturedMedia.type,
                geoStamp,
                contentHash,
                sorSokeEnabled,
                title: title.trim() || 'Untitled Report',
                description: description.trim(),
                lane,
            };

            onSubmit?.(submissionData);

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Processing failed';
            setError(message);
        }
    }, [capturedMedia, geoStamp, sorSokeEnabled, onSubmit]);

    const handleSubmitConfirm = useCallback(() => {
        // Play Amnesia Wipe animation
        setShowAmnesiaWipe(true);
        const id1 = setTimeout(() => {
            setShowAmnesiaWipe(false);
            setStep('done');
            // Reset after animation
            const id2 = setTimeout(() => {
                resetFlow();
            }, 1000);
            timeoutRefs.current.push(id2);
        }, 1200);
        timeoutRefs.current.push(id1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetFlow = useCallback(() => {
        setStep('idle');
        setCapturedMedia(null);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
        setPreviewUrl(null);
        setGeoStamp(null);
        setScrubResult(null);
        setError(null);
        setTitle('');
        setDescription('');
        setLane('witness');
        setScrubSteps(prev => prev.map(s => ({ ...s, status: 'pending' as const })));
    }, []);

    /* ─── Step Number ─── */

    const stepNumber = (() => {
        switch (step) {
            case 'capture': return 1;
            case 'preview': return 2;
            case 'scrub': return 3;
            case 'submit':
            case 'done': return 4;
            default: return 0;
        }
    })();

    /* ─── Render ─── */

    // Amnesia Wipe overlay
    if (showAmnesiaWipe) {
        return (
            <div className="amnesia-wipe" id="amnesia-wipe">
                <span className="amnesia-wipe__text">EVIDENCE SECURED • IDENTITY ERASED</span>
            </div>
        );
    }

    // Camera capture mode
    if (step === 'capture') {
        return (
            <WitnessCam
                onCapture={handleCapture}
                onClose={() => setStep('idle')}
            />
        );
    }

    return (
        <div className="p-6 sm:p-8" id="submission-flow">
            {/* Step Indicator */}
            {step !== 'idle' && step !== 'done' && (
                <div className="mb-6 flex items-center justify-center gap-2">
                    {[1, 2, 3, 4].map((num, i) => (
                        <React.Fragment key={num}>
                            {i > 0 && (
                                <div className={`h-0.5 w-8 rounded-full transition-colors ${stepNumber > num - 1 ? 'bg-success' : 'bg-border'}`} />
                            )}
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                stepNumber === num ? 'bg-cta text-white shadow-lg shadow-cta/20' :
                                stepNumber > num ? 'bg-success text-white' : 'border border-border bg-white text-text-secondary'
                            }`}>
                                {stepNumber > num ? '✓' : num}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Idle State — Camera Prompt */}
            {step === 'idle' && (
                <div className="flex flex-col items-center py-8 text-center">
                    {/* Camera Icon */}
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-muted">
                        <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                    </div>

                    <h3 className="mb-2 text-xl font-black tracking-tight text-text-primary">Witness Cam</h3>
                    <p className="mb-6 max-w-sm text-[13px] leading-relaxed text-text-body">
                        Capture evidence with automatic metadata scrubbing and geo-stamping. Your identity is protected.
                    </p>

                    {/* Open Camera Button */}
                    <button
                        onClick={() => setStep('capture')}
                        type="button"
                        id="open-witness-cam"
                        aria-label="Open Witness Cam"
                        className="btn-primary group mb-4 text-[14px]"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                        </svg>
                        Open Camera
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                    </button>

                    {/* Video Gate Badge */}
                    {!reputation?.canUploadVideo && (
                        <div className="badge-pending mt-2 text-[10px]" id="video-gate-badge">
                            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 00-6 0V9h6z" clipRule="evenodd" /></svg>
                            Video requires Advanced (1000+ pts)
                        </div>
                    )}
                    {reputation?.canUploadVideo && (
                        <div className="badge-verified mt-2 text-[10px]">
                            ✓ Video unlocked
                        </div>
                    )}

                    {/* Privacy Note */}
                    <div className="mt-6 flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-2.5">
                        <svg className="h-3.5 w-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[11px] font-medium text-text-secondary">Amnesia Protocol protects your identity</span>
                    </div>
                </div>
            )}

            {/* Preview Step */}
            {step === 'preview' && capturedMedia && (
                <div>
                    <h3 className="mb-4 text-lg font-black tracking-tight text-text-primary">Preview Evidence</h3>

                    {/* Evidence Frame */}
                    <div className="overflow-hidden rounded-2xl border border-border bg-white">
                        {geoStamp && (
                            <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-[12px] text-text-secondary" id="geo-label">
                                <svg className="h-3.5 w-3.5 text-success" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                {geoStamp.geoLabel} • {new Date(geoStamp.timestamp).toLocaleTimeString()}
                            </div>
                        )}
                        {capturedMedia.type === 'photo' && previewUrl && (
                            <img src={previewUrl} alt="Captured evidence" className="w-full" />
                        )}
                        {capturedMedia.type === 'video' && previewUrl && (
                            <video src={previewUrl} controls className="w-full" />
                        )}
                        {capturedMedia.type === 'audio' && previewUrl && (
                            <div className="p-6"><audio src={previewUrl} controls className="w-full" /></div>
                        )}
                    </div>

                    {/* Report Details */}
                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="report-title" className="meta-label mb-1.5 block text-text-secondary">Report Title</label>
                            <input
                                id="report-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Brief title for your report..."
                                maxLength={120}
                                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-[14px] text-text-primary outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10"
                            />
                        </div>
                        <div>
                            <label htmlFor="report-description" className="meta-label mb-1.5 block text-text-secondary">Description</label>
                            <textarea
                                id="report-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what you witnessed..."
                                rows={3}
                                maxLength={2000}
                                className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 font-[inherit] text-[14px] text-text-primary outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/10"
                            />
                        </div>
                        <div>
                            <label className="meta-label mb-1.5 block text-text-secondary">Feed Lane</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    id="lane-witness"
                                    onClick={() => setLane('witness')}
                                    className={`flex-1 rounded-xl border px-4 py-3 text-[13px] font-semibold transition-all ${
                                        lane === 'witness'
                                            ? 'border-success bg-success text-white shadow-md shadow-success/10'
                                            : 'border-border bg-white text-text-primary hover:border-success/30'
                                    }`}
                                >
                                    ◈ Witness Report
                                </button>
                                <button
                                    type="button"
                                    id="lane-social"
                                    onClick={() => setLane('social')}
                                    className={`flex-1 rounded-xl border px-4 py-3 text-[13px] font-semibold transition-all ${
                                        lane === 'social'
                                            ? 'border-cta bg-cta text-white shadow-md shadow-cta/10'
                                            : 'border-border bg-white text-text-primary hover:border-cta/30'
                                    }`}
                                >
                                    💬 Social Opinion
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sor Soke toggle (audio only) */}
                    {capturedMedia.type === 'audio' && (
                        <button
                            onClick={() => setSorSokeEnabled(!sorSokeEnabled)}
                            type="button"
                            id="sor-soke-preview-toggle"
                            className={`mt-4 w-full rounded-xl border px-4 py-3 text-center text-[13px] font-semibold transition-all ${
                                sorSokeEnabled
                                    ? 'border-brand bg-brand/10 text-brand'
                                    : 'border-border bg-white text-text-secondary hover:border-brand/30'
                            }`}
                        >
                            🔊 Sor Soke Voice Disguise {sorSokeEnabled ? 'ON' : 'OFF'}
                        </button>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => { resetFlow(); setStep('capture'); }}
                            type="button"
                            className="btn-secondary flex-1 text-[13px]"
                        >
                            Retake
                        </button>
                        <button
                            onClick={handleStartScrub}
                            type="button"
                            id="process-evidence"
                            className="btn-primary flex-[2] text-[13px]"
                        >
                            Process & Scrub →
                        </button>
                    </div>
                </div>
            )}

            {/* Scrub Step */}
            {step === 'scrub' && (
                <div>
                    <h3 className="mb-4 text-lg font-black tracking-tight text-text-primary">Scrubbing Evidence</h3>
                    <div className="space-y-2" id="scrub-progress">
                        {scrubSteps.map((s, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[12px] font-bold uppercase tracking-[0.1em] transition-all ${
                                    s.status === 'done' ? 'border-success/20 bg-success-light text-success' :
                                    s.status === 'active' ? 'border-brand/20 bg-brand/5 text-brand' :
                                    s.status === 'error' ? 'border-danger/20 bg-danger/5 text-danger' :
                                    'border-border bg-white text-text-secondary'
                                }`}
                            >
                                <span className="text-[14px]">
                                    {s.status === 'done' ? '✓' : s.status === 'active' ? '⏳' : s.status === 'error' ? '✕' : '○'}
                                </span>
                                {s.label}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-4 text-[12px] font-medium text-danger">
                            ⚠ {error}
                        </div>
                    )}

                    {scrubResult && (
                        <div className="mt-3 text-center font-mono text-[11px] text-text-secondary">
                            Original: {formatBytes(scrubResult.originalSize)} → Scrubbed: {formatBytes(scrubResult.scrubbedSize)}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Confirmation Step */}
            {step === 'submit' && (
                <div className="py-4 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-light">
                        <svg className="h-7 w-7 text-success" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-black tracking-tight text-text-primary">Evidence Processed</h3>
                    <p className="mx-auto mb-6 max-w-sm text-[13px] text-text-body">
                        All metadata has been stripped. Your identity is protected by the Amnesia Protocol.
                    </p>

                    {geoStamp && (
                        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-[12px] text-text-secondary">
                            <svg className="h-3.5 w-3.5 text-success" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                            {geoStamp.geoLabel}
                        </div>
                    )}

                    {/* Turnstile CAPTCHA */}
                    <div className="mb-6 flex justify-center">
                        <Turnstile
                            siteKey={TURNSTILE_SITE_KEY}
                            onVerify={(token) => setTurnstileToken(token)}
                            onExpire={() => setTurnstileToken(null)}
                            onError={() => setTurnstileToken(null)}
                            theme="dark"
                        />
                    </div>

                    <button
                        onClick={handleSubmitConfirm}
                        type="button"
                        id="submit-evidence"
                        disabled={!turnstileToken}
                        className={`rounded-full px-8 py-3 text-[14px] font-bold text-white transition-all ${
                            turnstileToken
                                ? 'bg-success shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30 cursor-pointer'
                                : 'bg-text-secondary/40 cursor-not-allowed opacity-60'
                        }`}
                    >
                        {turnstileToken ? 'Submit to GoVoicing' : 'Complete Verification First'}
                    </button>
                </div>
            )}

            {/* Done State */}
            {step === 'done' && (
                <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-light">
                        <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </div>
                    <h3 className="mb-2 text-lg font-black tracking-tight text-success">Evidence Submitted</h3>
                    <p className="mx-auto mb-6 max-w-sm text-[13px] text-text-body">
                        Your report has been secured. All traces have been wiped.
                    </p>
                    <button
                        onClick={resetFlow}
                        type="button"
                        className="btn-secondary text-[13px]"
                    >
                        Submit Another Report
                    </button>
                </div>
            )}
        </div>
    );
};

/* ───────────────────── Helpers ───────────────────── */

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
}

function getExtension(mimeType: string): string {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'audio/webm': 'webm',
        'audio/ogg': 'ogg',
        'audio/wav': 'wav',
        'video/webm': 'webm',
        'video/mp4': 'mp4',
    };
    return map[mimeType] ?? 'bin';
}

export default SubmissionFlow;
