import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/guide.css';

/* ─── Feature Data ─── */
const features = [
    {
        id: 'witness-feed',
        icon: '📰',
        title: 'Dual-Lane Feed',
        tagline: 'Truth & Opinion, separated.',
        description:
            'GoVoicing separates verified witness reports from personal opinions. Toggle between the "Witness" lane (facts, evidence, geo-stamped reports) and the "Social" lane (community discussion, reactions, commentary).',
        steps: [
            'Open the home Feed page',
            'Use the toggle at the top to switch between Witness and Social lanes',
            'Witness cards show verified evidence with green emerald stamps',
            'Opinion cards show community discussions with engagement metrics',
        ],
        cta: { label: 'View Feed →', path: '/' },
        color: 'var(--truth-emerald)',
    },
    {
        id: 'witness-cam',
        icon: '📸',
        title: 'Witness Cam & Report',
        tagline: 'Capture. Scrub. Submit.',
        description:
            'Use your device camera to capture photo or video evidence. GoVoicing automatically strips all metadata (EXIF, GPS, device info) to protect your identity before submission.',
        steps: [
            'Tap "Report" in the navigation bar',
            'Grant camera permission and capture evidence',
            'Preview your media and confirm',
            'Watch the Amnesia Protocol scrub your metadata in real-time',
            'Complete human verification and submit',
        ],
        cta: { label: 'Submit a Report →', path: '/report' },
        color: '#DC2626',
    },
    {
        id: 'amnesia-protocol',
        icon: '🛡️',
        title: 'Amnesia Protocol',
        tagline: 'Your identity is invisible.',
        description:
            'Every submission runs through the Amnesia Protocol — a multi-layer privacy shield that strips IP addresses, purges headers, scrubs metadata, rotates sessions, and ensures no personally identifiable information (PII) is ever stored.',
        steps: [
            'All EXIF metadata is stripped from photos and videos',
            'IP addresses are purged at the edge (never reach the server)',
            'Voice recordings are pitch-shifted to prevent identification',
            'Geo-location is generalized to district level (not exact coordinates)',
            'Session tokens are cryptographic hashes — no emails or phones stored',
        ],
        cta: { label: 'View Your Privacy Audit →', path: '/profile' },
        color: '#8B5CF6',
    },
    {
        id: 'reputation',
        icon: '⭐',
        title: 'Reputation Engine',
        tagline: 'Earn trust. Unlock features.',
        description:
            'Your anonymous reputation grows as you contribute quality reports. Higher reputation unlocks additional features like video submissions and peer review privileges. No personal data is used — only your contribution quality.',
        steps: [
            'Start as a "Junior Witness" with base reputation',
            'Submit verified reports to earn reputation points',
            'Reach 500 points → "Field Reporter" (can review others\' reports)',
            'Reach 1000 points → "Senior Correspondent" (unlocks video submissions)',
            'Location diversity boosts your score (Sybil defense)',
        ],
        cta: { label: 'Check Your Reputation →', path: '/profile' },
        color: '#D97706',
    },
    {
        id: 'geo-verification',
        icon: '🌍',
        title: 'Dual-Key Geo-Verification',
        tagline: 'Were you really there?',
        description:
            'GoVoicing cross-references your network geo (from Cloudflare edge) with your device GPS. If both agree, your report earns the verified "Emerald Badge" — giving it maximum credibility in the feed.',
        steps: [
            'Your device GPS captures your location (district-level only)',
            'Cloudflare edge detects your network country',
            'If both match → "Witness Verified" emerald badge',
            'If they differ → "Remote Verified" (you may be using a VPN)',
            'Reports with emerald badges rank higher in the feed',
        ],
        cta: { label: 'Submit Verified Evidence →', path: '/report' },
        color: 'var(--truth-emerald)',
    },
    {
        id: 'peer-review',
        icon: '👥',
        title: 'Community Peer Review',
        tagline: 'Collective truth-finding.',
        description:
            'Reports can be reviewed by the community. Trusted users (reputation ≥ 500) can verify or flag content, creating a decentralized fact-checking layer. Flagged content gets escalated for moderation.',
        steps: [
            'Reports appear in the peer review queue on the Feed page',
            'Trusted users see "Verify" and "Flag" buttons',
            'Verified reports earn the submitter reputation points',
            'Flagged reports are escalated to admin review',
            'A tally bar shows the community consensus for each report',
        ],
        cta: { label: 'View the Feed →', path: '/' },
        color: '#0EA5E9',
    },
];

const useCases = [
    {
        emoji: '🏗️',
        title: 'Infrastructure Failures',
        description: 'Document collapsed bridges, broken roads, or flooding — with geo-verified evidence that can\'t be dismissed.',
    },
    {
        emoji: '⚡',
        title: 'Power & Water Outages',
        description: 'Report extended blackouts or water cuts. Geo-stamped reports create a map of service failures.',
    },
    {
        emoji: '🏥',
        title: 'Healthcare Gaps',
        description: 'Witness empty pharmacies, understaffed clinics, or ambulance delays. Your evidence drives accountability.',
    },
    {
        emoji: '🗳️',
        title: 'Election Monitoring',
        description: 'Anonymously document voting irregularities, intimidation, or ballot issues — your identity stays protected.',
    },
    {
        emoji: '🏫',
        title: 'Education Access',
        description: 'Capture evidence of school closures, missing teachers, or infrastructure problems in educational facilities.',
    },
    {
        emoji: '🌿',
        title: 'Environmental Issues',
        description: 'Document illegal dumping, oil spills, deforestation, or pollution — geo-verified to prove the location.',
    },
];

/* ─── Component ─── */
const Guide: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState(0);

    return (
        <div className="guide">
            {/* ─── Hero Section ─── */}
            <section className="guide__hero">
                <div className="guide__hero-badge">HOW IT WORKS</div>
                <h1 className="guide__hero-title">
                    Civic Accountability,<br />
                    <span className="guide__hero-accent">Powered by Citizens.</span>
                </h1>
                <p className="guide__hero-subtitle">
                    GoVoicing is a privacy-first civic reporting platform. Submit anonymous, geo-verified
                    evidence of governance failures — no email, no phone number, no tracking.
                    Your identity is protected by the <strong>Amnesia Protocol</strong>.
                </p>
                <div className="guide__hero-actions">
                    <Link to="/report" className="guide__btn guide__btn--primary">
                        Submit a Report
                    </Link>
                    <a href="#features" className="guide__btn guide__btn--secondary">
                        Learn More ↓
                    </a>
                </div>

                <div className="guide__hero-stats">
                    <div className="guide__stat">
                        <span className="guide__stat-value">0</span>
                        <span className="guide__stat-label">PII Stored</span>
                    </div>
                    <div className="guide__stat-divider" />
                    <div className="guide__stat">
                        <span className="guide__stat-value">256-bit</span>
                        <span className="guide__stat-label">Identity Hash</span>
                    </div>
                    <div className="guide__stat-divider" />
                    <div className="guide__stat">
                        <span className="guide__stat-value">100%</span>
                        <span className="guide__stat-label">Anonymous</span>
                    </div>
                </div>
            </section>

            {/* ─── How It Works - 3 Steps ─── */}
            <section className="guide__steps-section">
                <h2 className="guide__section-title">3 Steps to Civic Accountability</h2>
                <div className="guide__steps">
                    <div className="guide__step">
                        <div className="guide__step-number">01</div>
                        <div className="guide__step-icon">📸</div>
                        <h3>Capture</h3>
                        <p>Use your phone camera to document governance failures — potholes, blackouts, empty hospitals.</p>
                    </div>
                    <div className="guide__step-arrow">→</div>
                    <div className="guide__step">
                        <div className="guide__step-number">02</div>
                        <div className="guide__step-icon">🛡️</div>
                        <h3>Protect</h3>
                        <p>The Amnesia Protocol auto-strips your metadata, purges your IP, and disguises your voice.</p>
                    </div>
                    <div className="guide__step-arrow">→</div>
                    <div className="guide__step">
                        <div className="guide__step-number">03</div>
                        <div className="guide__step-icon">📡</div>
                        <h3>Publish</h3>
                        <p>Your geo-verified report appears in the Witness Feed — anonymous, credible, and undeniable.</p>
                    </div>
                </div>
            </section>

            {/* ─── Feature Deep-Dive ─── */}
            <section id="features" className="guide__features-section">
                <h2 className="guide__section-title">Platform Features</h2>
                <p className="guide__section-subtitle">
                    Every feature is designed with privacy-first principles and zero-knowledge architecture.
                </p>

                <div className="guide__features-layout">
                    {/* Feature Tabs */}
                    <div className="guide__feature-tabs">
                        {features.map((f, i) => (
                            <button
                                key={f.id}
                                type="button"
                                className={`guide__feature-tab ${i === activeFeature ? 'guide__feature-tab--active' : ''}`}
                                onClick={() => setActiveFeature(i)}
                                style={{ '--tab-color': f.color } as React.CSSProperties}
                            >
                                <span className="guide__feature-tab-icon">{f.icon}</span>
                                <span className="guide__feature-tab-title">{f.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Feature Detail */}
                    <div className="guide__feature-detail" key={features[activeFeature].id}>
                        <div
                            className="guide__feature-color-bar"
                            style={{ background: features[activeFeature].color }}
                        />
                        <div className="guide__feature-content">
                            <span className="guide__feature-icon-large">{features[activeFeature].icon}</span>
                            <h3>{features[activeFeature].title}</h3>
                            <p className="guide__feature-tagline">{features[activeFeature].tagline}</p>
                            <p className="guide__feature-desc">{features[activeFeature].description}</p>

                            <div className="guide__feature-steps">
                                <h4>How to use:</h4>
                                <ol>
                                    {features[activeFeature].steps.map((step, i) => (
                                        <li key={i}>
                                            <span className="guide__feature-step-num">{i + 1}</span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <Link to={features[activeFeature].cta.path} className="guide__btn guide__btn--primary">
                                {features[activeFeature].cta.label}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Use Cases ─── */}
            <section className="guide__usecases-section">
                <h2 className="guide__section-title">What Can You Report?</h2>
                <p className="guide__section-subtitle">
                    GoVoicing is built for documenting governance failures across every sector.
                </p>
                <div className="guide__usecases-grid">
                    {useCases.map((uc, i) => (
                        <div key={i} className="guide__usecase-card">
                            <span className="guide__usecase-emoji">{uc.emoji}</span>
                            <h4>{uc.title}</h4>
                            <p>{uc.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Privacy Promise ─── */}
            <section className="guide__privacy-section">
                <div className="guide__privacy-card">
                    <h2>🔒 Our Privacy Promise</h2>
                    <div className="guide__privacy-grid">
                        <div className="guide__privacy-item guide__privacy-item--good">
                            <h4>✅ What We DO</h4>
                            <ul>
                                <li>Strip all photo/video metadata (EXIF)</li>
                                <li>Purge IP addresses at the network edge</li>
                                <li>Hash your identity with 256-bit encryption</li>
                                <li>Disguise audio recordings</li>
                                <li>Generalize location to district level</li>
                                <li>Run all data through the Amnesia Protocol</li>
                            </ul>
                        </div>
                        <div className="guide__privacy-item guide__privacy-item--bad">
                            <h4>❌ What We NEVER Do</h4>
                            <ul>
                                <li>Store your email, phone, or real name</li>
                                <li>Log your IP address or device fingerprint</li>
                                <li>Use tracking cookies or analytics</li>
                                <li>Share data with third parties</li>
                                <li>Store exact GPS coordinates</li>
                                <li>Require account registration</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CTA Footer ─── */}
            <section className="guide__cta-section">
                <h2>Ready to Be the Witness?</h2>
                <p>Your voice matters. Your identity is protected.</p>
                <div className="guide__hero-actions">
                    <Link to="/report" className="guide__btn guide__btn--primary guide__btn--large">
                        📸 Submit Evidence Now
                    </Link>
                    <Link to="/" className="guide__btn guide__btn--secondary guide__btn--large">
                        📰 Browse the Feed
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Guide;
