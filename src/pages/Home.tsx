import React, { useState, useCallback } from 'react';
import { Main, BentoGrid, BentoItem } from '../components/ui';
import { FeedToggle, WitnessCard, OpinionCard, StaggeredFeed } from '../components/feed';
import { mockWitnessPosts, mockOpinionPosts } from '../data/mockFeed';
import type { FeedLane } from '../data/mockFeed';
import '../styles/home.css';

const Home: React.FC = () => {
    const [activeLane, setActiveLane] = useState<FeedLane>('witness');

    const handleLaneChange = useCallback((lane: FeedLane) => {
        setActiveLane(lane);
    }, []);

    return (
        <>
            {/* Hero Section — Doczai mesh gradient */}
            <section className="cv-hero">
                <div className="container">
                    <h1 className="cv-hero__title">
                        Report 📢!<br />Make Your Voice Heard
                    </h1>
                    <p className="cv-hero__subtitle">
                        Verified civic evidence and public discourse — powered by zero-knowledge privacy.
                    </p>
                </div>
            </section>

            <Main>
                {/* Feed Toggle */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <FeedToggle activeLane={activeLane} onLaneChange={handleLaneChange} />
                </div>

                {/* Feed Content */}
                <div
                    id="feed-panel"
                    role="tabpanel"
                    aria-label={`${activeLane === 'witness' ? 'Witness' : 'Social'} feed`}
                    aria-live="polite"
                >
                    <BentoGrid>
                        <StaggeredFeed key={activeLane}>
                            {activeLane === 'witness'
                                ? mockWitnessPosts.map((post) => (
                                    <BentoItem key={post.id} span={2}>
                                        <WitnessCard post={post} />
                                    </BentoItem>
                                ))
                                : mockOpinionPosts.map((post) => (
                                    <BentoItem key={post.id} span={1}>
                                        <OpinionCard post={post} />
                                    </BentoItem>
                                ))}
                        </StaggeredFeed>
                    </BentoGrid>
                </div>
            </Main>
        </>
    );
};

export default Home;
