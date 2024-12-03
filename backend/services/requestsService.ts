import sql from "../db/connection.ts";

export async function getRequestsBalance(userId: number): Promise<number> {
    const result = await sql`SELECT requests_balance FROM users WHERE id = ${userId}`;
    return result[0].requests_balance;
}

export async function checkRequestAvailability(userId: number, text: string): Promise<boolean> {
    // Get user's current request balance
    const requestsBalance = await getRequestsBalance(userId);
    
    // Check if user has any requests available
    if (requestsBalance <= 0) {
        return false;
    }

    // Check text length (assuming there's a character limit)
    const charLimit = 4000; // This should match the frontend REQUEST_PACKAGE.charLimit
    if (text.length > charLimit) {
        return false;
    }

    return true;
}

export async function deductRequest(userId: number, referenceId: string): Promise<number> {
    const result = await sql.begin(async (sql) => {
        // Deduct request from user balance
        const result = await sql`
            UPDATE users 
            SET requests_balance = requests_balance - 1
            WHERE id = ${userId}
            AND requests_balance > 0
            RETURNING requests_balance
        `;

        if (result.length === 0) {
            throw new Error('No requests available');
        }

        // Log the transaction
        await sql`
            INSERT INTO requests_transactions (
                user_id,
                amount,
                transaction_type,
                reference_id,
                notes
            ) VALUES (
                ${userId},
                ${-1},
                'usage',
                ${referenceId},
                'Text optimization request'
            )
        `;

        return result[0].requests_balance;
    });

    return result;
} 