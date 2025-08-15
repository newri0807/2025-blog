import {drizzle} from "drizzle-orm/neon-http";
import {neon} from "@neondatabase/serverless";
import * as schema from "./schema";

// Neon 연결 사용
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, {schema});

// 연결 테스트 함수
export async function testConnection() {
    try {
        //const result = await sql`SELECT 1 as test`;
        console.log("✅ Neon 데이터베이스 연결 성공");
        return true;
    } catch (error) {
        console.error("❌ 데이터베이스 연결 실패:", error);
        return false;
    }
}
