import logger from "@/logger";

type MonitoringLevel = "info" | "warn" | "error";

type MonitoringDetails = Record<string, unknown>;

export function trackEvent(name: string, details: MonitoringDetails = {}, level: MonitoringLevel = "info") {
    logger[level](`[monitor] ${name}`, details);
}

export async function trackDuration<T>(
    name: string,
    operation: () => Promise<T>,
    details: MonitoringDetails = {},
) {
    const startedAt = Date.now();

    try {
        const result = await operation();
        trackEvent(name, { ...details, durationMs: Date.now() - startedAt });
        return result;
    } catch (error) {
        trackEvent(
            `${name}.failed`,
            { ...details, durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) },
            "error",
        );
        throw error;
    }
}