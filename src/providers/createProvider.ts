import { BaseProvider } from "./BaseProvider";
import { QianfanProvider } from "./QIanfanProvider";
import { OpenAIProvider } from "./OpenAiProvider";
import { DashScopeProvider } from "./DashScopeProvider";

export function createProvider(providerName: string): BaseProvider {
    switch(providerName) {
        case "qianfan":
            return new QianfanProvider(process.env.QIANFAN_ACCESS_KEY!, process.env.QIANFAN_SECRET_KEY!)
        case "openai":
            return new OpenAIProvider(process.env.OPENAI_API_KEY!, process.env.OPENAI_BASE_URL!)
        case "dashscope":
            return new DashScopeProvider(process.env.DASHSCOPE_API_KEY!, process.env.DASHSCOPE_BASE_URL!)
        case "deepseek":
            return new OpenAIProvider(process.env.DASHSCOPE_API_KEY!, process.env.DASHSCOPE_BASE_URL!)
        default:
            throw new Error(`Unknown provider: ${providerName}`)
    }
}
