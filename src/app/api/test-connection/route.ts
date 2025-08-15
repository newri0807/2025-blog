import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {list} from "@vercel/blob";

export async function GET() {
    const checks = {
        database: false,
        blob: false,
        environment: false,
        tables: [] as string[],
    };

    const errors: string[] = [];

    try {
        // 1. 환경 변수 확인
        if (process.env.DATABASE_URL && process.env.BLOB_READ_WRITE_TOKEN) {
            checks.environment = true;
        } else {
            if (!process.env.DATABASE_URL) errors.push("DATABASE_URL 누락");
            if (!process.env.BLOB_READ_WRITE_TOKEN) errors.push("BLOB_READ_WRITE_TOKEN 누락");
        }

        // 2. 데이터베이스 연결 확인
        if (process.env.DATABASE_URL) {
            try {
                const sql = neon(process.env.DATABASE_URL);
                await sql`SELECT 1`;
                checks.database = true;

                // 테이블 목록 확인
                const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
                checks.tables = tables.map((t) => t.table_name);
            } catch (error) {
                errors.push(`데이터베이스 연결 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
            }
        }

        // 3. Blob 스토리지 확인
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                await list({limit: 1});
                checks.blob = true;
            } catch (error) {
                errors.push(`Blob 연결 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
            }
        }

        const allHealthy = checks.database && checks.blob && checks.environment;

        return NextResponse.json(
            {
                status: allHealthy ? "healthy" : "unhealthy",
                checks,
                errors,
                recommendations: allHealthy
                    ? []
                    : [
                          ...(!checks.environment ? ["환경 변수를 .env.local에 설정하세요"] : []),
                          ...(!checks.database ? ["Neon 데이터베이스 연결을 확인하세요"] : []),
                          ...(!checks.blob ? ["Vercel Blob 토큰을 확인하세요"] : []),
                          ...(checks.tables.length === 0 ? ["/api/setup-db에 POST 요청으로 테이블을 생성하세요"] : []),
                      ],
            },
            {
                status: allHealthy ? 200 : 500,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                error: error instanceof Error ? error.message : "상태 확인 실패",
            },
            {status: 500}
        );
    }
}
