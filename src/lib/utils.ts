export const getBaseUrl = (): string => {
    // Vercel이 자동으로 제공하는 VERCEL_URL 사용
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 클라이언트 사이드에서는 현재 도메인 사용
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    // 로컬 개발환경
    return "http://localhost:3000";
};
