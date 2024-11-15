import type { MessageContent } from "npm:@langchain/core/messages";
import { PROMPTS } from "../utils/prompts.ts";
import { encode as encode_o200k_base } from "npm:gpt-tokenizer/encoding/o200k_base";
import { encode as encode_cl100k_base } from "npm:gpt-tokenizer/encoding/cl100k_base";
import type { ModelConfig } from "../utils/models.ts";
import { ChatOpenAI } from "npm:@langchain/openai";
import { BaseChatModel } from "npm:@langchain/core/language_models/chat_models";
import { OUTPUT_TOKENS_ESTIMATE_MULTIPLIER } from "../utils/models.ts";

export async function getTokenCount(model: ModelConfig, text: MessageContent): Promise<number> {
    try {
        if (model.class === ChatOpenAI) {
            const tokens = encode_o200k_base(text.toString());
            return tokens.length;
        } else {
            // const modelInstance = new model.class(model.config) as unknown as BaseChatModel;
            // return await modelInstance.getNumTokens(text);
            return Math.ceil(text.length / 4);
        }
    } catch (_error) {
        console.error('Error getting token count:', _error);
        // Fallback to approximate count for other models
        // Claude typically uses ~4 characters per token
        return Math.ceil(text.length / 4);
    }
}

export async function getTokenCountFromMessageContent(model: ModelConfig, values: { text: string, languageCode: string, customPrompt: string }): Promise<number> {
    const prompt = PROMPTS[values.languageCode as keyof typeof PROMPTS] || PROMPTS.en;
    const messages = await prompt.formatMessages(values);
    
    const tokenCounts = await Promise.all(
        messages.map(message => getTokenCount(model, message.content))
    );
    const totalTokens = tokenCounts.reduce((sum, count) => sum + count, 0);
    return totalTokens;
}

export async function getTokenEstimateOutputTokens(model: ModelConfig, text: string): Promise<number> {
    const tokenCount = await getTokenCount(model, text);
    const estimate = tokenCount * OUTPUT_TOKENS_ESTIMATE_MULTIPLIER;
    return Math.ceil(estimate);
}