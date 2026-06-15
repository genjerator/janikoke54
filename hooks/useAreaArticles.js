import { useState, useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import { fetchRoundArticles } from '../axios/ApiCalls';

// Loads every article for the round once (in the background) when the challenge
// is ready, and groups them by area_id. Exposes getRandomArticle(areaId) to pick
// one at random when the user enters an area — no network call at that moment.
export function useAreaArticles(challengeId, user) {
    const [articlesByArea, setArticlesByArea] = useState({});

    useEffect(() => {
        if (!challengeId || !user) return;

        let cancelled = false;
        (async () => {
            const payload = await fetchRoundArticles(user);
            if (cancelled || !payload) return;

            const list = Array.isArray(payload) ? payload : (payload.data || []);
            const grouped = list.reduce((acc, article) => {
                const key = article.area_id;
                if (key === undefined || key === null) return acc;
                (acc[key] = acc[key] || []).push(article);
                return acc;
            }, {});

            setArticlesByArea(grouped);
            Sentry.logger.info('Loaded area articles', { areas: Object.keys(grouped).length });
        })();

        return () => { cancelled = true; };
    }, [challengeId, user?.token]);

    const getRandomArticle = useCallback((areaId) => {
        const list = articlesByArea[areaId];
        if (!list || list.length === 0) return null;
        return list[Math.floor(Math.random() * list.length)];
    }, [articlesByArea]);

    return { articlesByArea, getRandomArticle };
}
