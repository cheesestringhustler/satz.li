import { ChatAnthropic } from "npm:@langchain/anthropic";
import { ChatOpenAI } from "npm:@langchain/openai";
import { config } from "../config/index.ts";

export const OUTPUT_TOKENS_ESTIMATE_MULTIPLIER = 1.1;

export type ModelConfig = {
    class: typeof ChatAnthropic | typeof ChatOpenAI;
    config: {
        modelName: string;
        anthropicApiKey?: string;
        apiKey?: string;
    };
    rates: {
        inputRate: number;  // Credits per 1K input tokens
        outputRate: number; // Credits per 1K output tokens
    };
    encoding?: string;
};

export const MODEL_MAP: Record<string, ModelConfig> = {
    'claude-3-haiku': {
        class: ChatAnthropic,
        config: {
            modelName: "claude-3-haiku-20240307",
            anthropicApiKey: config.ai.anthropicApiKey,
        },
        rates: {
            inputRate: 0.000250,
            outputRate: 0.001250
        }
    },
    'claude-3-5-sonnet': {
        class: ChatAnthropic,
        config: {
            modelName: "claude-3-5-sonnet-latest",
            anthropicApiKey: config.ai.anthropicApiKey,
        },
        rates: {
            inputRate: 0.003000,
            outputRate: 0.015000
        }
    },
    'gpt-4o-mini': {
        class: ChatOpenAI,
        config: {
            modelName: "gpt-4o-mini",
            apiKey: config.ai.openaiApiKey,
        },
        rates: {
            inputRate: 0.000150,
            outputRate: 0.000600
        },
        encoding: 'o200k_base'
    },
    'gpt-4o': {
        class: ChatOpenAI,
        config: {
            modelName: "gpt-4o",
            apiKey: config.ai.openaiApiKey,
        },
        rates: {
            inputRate: 0.002500,
            outputRate: 0.010000
        },
        encoding: 'o200k_base'
    }
};
