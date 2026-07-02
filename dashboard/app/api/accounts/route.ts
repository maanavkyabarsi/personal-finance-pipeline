import { NextResponse } from "next/server";
import { retrieve_accounts } from "@/lib/queries";

export async function GET() {
    try {
        const rows = await retrieve_accounts()
        return NextResponse.json(rows)
    }
    catch (error) {
        return NextResponse.json(
            {error: 'Failed to get accounts'},
            {status: 500}
        )
    }
}
