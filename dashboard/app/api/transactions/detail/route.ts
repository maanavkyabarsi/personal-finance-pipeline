import { NextResponse } from "next/server";
import { retrieve_transactions_detailed_category_month } from "@/lib/queries";

export async function GET(request: Request) {
    const url = new URL(request.url)
    const detailed_category = url.searchParams.get('detailed_category')
    let month_year = url.searchParams.get('month_year')
    
    if (detailed_category !== null && month_year !== null) {
        try {
            month_year += "-01"
            const rows = await retrieve_transactions_detailed_category_month(detailed_category, month_year)
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
            {error: 'Detailed category and/or month and year are not defined'},
            {status: 400}
        )
    }

}

