import { NextResponse } from "next/server";
import { retrieve_recent_transactions } from "@/lib/queries";

export async function GET(request: Request) {
    const url = new URL(request.url)
    let month_year = url.searchParams.get('month_year')
    const account_id = url.searchParams.get('account_id')

    if (month_year !== null) {
        try {
            month_year += "-01"
            const rows = await retrieve_recent_transactions(month_year, account_id)
            return NextResponse.json(rows)
        }
        catch (error) {
            return NextResponse.json(
                {error: 'Failed to get recent transactions'},
                {status: 500}
            )
        }
    }
    else {
        return NextResponse.json(
            {error: 'Month and year are not defined'},
            {status: 500}
        )
    }
}
