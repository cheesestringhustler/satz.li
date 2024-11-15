import sql from "../db/connection.ts";

interface UsageLog {
    userId: number;
    requestType: string;
    modelType: string;
    inputTokens: number;
    outputTokens: number;
    creditsUsed: number;
    status?: string;
    errorMessage?: string | null;
    responseTime?: number | null;
}

export async function logUsage({
    userId,
    requestType,
    modelType,
    inputTokens,
    outputTokens = 0,
    creditsUsed,
    status = 'completed',
    errorMessage = null,
    responseTime = null
}: UsageLog): Promise<number> {
    // Validate required fields
    if (!userId) throw new Error('userId is required');
    if (!requestType) throw new Error('requestType is required');
    if (!modelType) throw new Error('modelType is required');
    if (inputTokens === undefined) throw new Error('inputTokens is required');
    if (creditsUsed === undefined) throw new Error('creditsUsed is required');

    // Ensure all values are defined before SQL query
    const values = {
        userId,
        requestType,
        modelType,
        inputTokens,
        outputTokens: outputTokens || 0,
        creditsUsed,
        status: status || 'completed',
        errorMessage: errorMessage || null,
        responseTime: responseTime || null
    };

    const result = await sql`
        INSERT INTO usage_logs (
            user_id,
            request_type,
            model_type,
            input_tokens,
            output_tokens,
            credits_used,
            status,
            error_message,
            response_time
        ) VALUES (
            ${values.userId},
            ${values.requestType},
            ${values.modelType},
            ${values.inputTokens},
            ${values.outputTokens},
            ${values.creditsUsed},
            ${values.status},
            ${values.errorMessage},
            ${values.responseTime}
        )
        RETURNING id
    `;

    return result[0].id;
}

export async function updateUsageLog(
    usageLogId: number,
    inputTokens: number,
    outputTokens: number,
    status: string = 'completed',
    responseTime: number,
    creditsUsed?: number
): Promise<void> {
    // Validate all required parameters
    if (!usageLogId) throw new Error('usageLogId is required');
    if (outputTokens === undefined) throw new Error('outputTokens is required');
    if (!status) throw new Error('status is required');
    if (responseTime === undefined) throw new Error('responseTime is required');

    const values = {
        usageLogId,
        inputTokens,
        outputTokens,
        status,
        responseTime,
        creditsUsed
    };

    await sql`
        UPDATE usage_logs 
        SET input_tokens = ${values.inputTokens},
            output_tokens = ${values.outputTokens},
            status = ${values.status},
            response_time = ${values.responseTime},
            ${values.creditsUsed ? sql`credits_used = ${values.creditsUsed}` : sql``}
        WHERE id = ${values.usageLogId}
    `;
}