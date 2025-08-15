// utils/api.ts 또는 lib/utils.ts
export const getBaseUrl = (): string => {
    // 변경: 클라이언트에서는 항상 상대 경로 사용
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    // 변경: 서버에서는 여러 URL 옵션 시도
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 로컬 개발환경
    return "http://localhost:3000";
};

// 변경: 디버깅용 함수 추가
export const debugBaseUrl = () => {
    console.log("=== Base URL 디버깅 ===");
    console.log("typeof window:", typeof window);
    console.log("VERCEL_URL:", process.env.VERCEL_URL);
    console.log("VERCEL_PROJECT_PRODUCTION_URL:", process.env.VERCEL_PROJECT_PRODUCTION_URL);
    console.log("최종 baseUrl:", getBaseUrl());
    console.log("=====================");
};
