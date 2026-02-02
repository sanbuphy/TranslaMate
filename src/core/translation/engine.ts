import OpenAI from 'openai';
import type { TranslationRequest, TranslationConfig, TranslationResult } from '../types';

export class TranslationEngine {
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const { apiKey, baseURL, model, maxTokens, temperature } = this.config;

    if (!apiKey) {
      throw new Error('API Key is required');
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseURL || 'https://api.deepseek.com',
    });

    const systemPrompt = `You are a professional translator. Your task is to translate text accurately while maintaining the original meaning, tone, and style.

Rules:
- Only provide the translated text without any explanations or additional content
- Preserve formatting, line breaks, and special characters
- Handle technical terms appropriately
- If the source language is the same as the target language, return the original text
- Do NOT add any quotes, prefixes, or explanations`;

    const userPrompt = `Translate the following text to ${request.targetLanguage}:

${request.text}`;

    try {
      const response = await client.chat.completions.create({
        model: model || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens || 512,
        temperature: temperature || 0.7,
        stream: false,
      });

      const translatedText = response.choices[0]?.message?.content?.trim() || '';

      return {
        text: translatedText,
        sourceLang: request.sourceLanguage,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw error;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    const chinesePattern = /[\u4e00-\u9fa5]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7af]/;
    const russianPattern = /[\u0400-\u04FF]/;
    const arabicPattern = /[\u0600-\u06FF]/;

    if (chinesePattern.test(text)) return 'zh';
    if (japanesePattern.test(text)) return 'ja';
    if (koreanPattern.test(text)) return 'ko';
    if (russianPattern.test(text)) return 'ru';
    if (arabicPattern.test(text)) return 'ar';

    return 'en';
  }
}

// Backward compatibility - standalone function
export async function translateText(
  request: TranslationRequest,
  config: TranslationConfig
): Promise<TranslationResult> {
  const engine = new TranslationEngine(config);
  return engine.translate(request);
}

export async function detectLanguage(text: string): Promise<string> {
  const engine = new TranslationEngine({} as TranslationConfig);
  return engine.detectLanguage(text);
}
