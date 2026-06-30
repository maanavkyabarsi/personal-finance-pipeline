import { NextResponse } from "next/server";
import { retrieve_transactions_account } from "@/lib/queries";

export async function GET(request: Request) {
    const url = new URL(request.url)
    const account_id = url.searchParams.get('account_id')

    if (account_id !== null) {
        try {
            const rows = await retrieve_transactions_account(account_id)
            return NextResponse.json(rows)
        }

        catch (error) {
            return NextResponse.json(
                {error: 'Failed to get transactions'},
                {status: 500}
            )
        }
    }
        
    else {
        return NextResponse.json(
            {error: 'Account ID not defined'},
            {status: 400}
        )
    }

}

