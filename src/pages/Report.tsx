/**
 * Module 3: Report Page
 *
 * The primary evidence submission page. Embeds the SubmissionFlow
 * component which handles camera capture, media processing, and submission.
 *
 * Source:
 * - Implementation Plan §Module 3: "Report page with WitnessCam & SubmissionFlow"
 * - Feature Goal Matrix §"Blow whistle with proofs"
 */

import React, { useCallback } from 'react';
import { Main } from '../components/ui';
import SubmissionFlow, { type SubmissionData } from '../components/witness/SubmissionFlow';
import '../styles/report.css';

const Report: React.FC = () => {
    const handleSubmit = useCallback((data: SubmissionData) => {
        // Module 5 will wire this to the /api/report Worker endpoint.
        console.log('[Report] Evidence submitted:', {
            type: data.type,
            fileSize: data.file.size,
            geoLabel: data.geoStamp?.geoLabel ?? 'No GPS',
            contentHash: data.contentHash.slice(0, 16) + '...',
            sorSoke: data.sorSokeEnabled,
        });
    }, []);

    return (
        <Main>
            <div className="report-page">
                {/* Hero header */}
                <section className="report-page__hero">
                    <div className="report-page__badge">📢 FILE A REPORT</div>
                    <h1 className="report-page__title">Report</h1>
                    <p className="report-page__subtitle">
                        Submit verified evidence of civic issues. Your identity is protected by the <strong>Amnesia Protocol</strong>.
                    </p>
                </section>

                {/* Submission flow */}
                <section className="report-page__flow">
                    <SubmissionFlow onSubmit={handleSubmit} />
                </section>
            </div>
        </Main>
    );
};

export default Report;
