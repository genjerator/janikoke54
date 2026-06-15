import { useState } from 'react';
import { fetchChallengesData } from '../axios/ApiCalls';

// Keeps a local copy of the challenge and exposes a way to re-sync it from the
// server (used after collecting a point so the map reflects the new status).
export function useChallengeData(challenge, user) {
    const [currentChallenge, setCurrentChallenge] = useState(challenge);

    const refreshChallengeData = async () => {
        if (!user) return;
        try {
            const response = await fetchChallengesData(user);
            const allChallenges = response.data.data || response.data;
            const updated = allChallenges.find(c => c.id === currentChallenge.id);
            if (updated) {
                setCurrentChallenge(updated);
            }
        } catch (err) {
            console.error('Error refreshing challenge data:', err);
        }
    };

    return { currentChallenge, refreshChallengeData };
}
