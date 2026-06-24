const levelOrder = ["debug", "info", "warn", "error"] as const;
type Level = (typeof levelOrder)[number];

function format(level: Level, args: unknown[]) {
    const time = new Date().toISOString();
    return [`[${time}] [${level.toUpperCase()}]`, ...args];
}

const logger = {
    debug: (...args: unknown[]) => console.debug(...format("debug", args)),
    info: (...args: unknown[]) => console.info(...format("info", args)),
    warn: (...args: unknown[]) => console.warn(...format("warn", args)),
    error: (...args: unknown[]) => console.error(...format("error", args)),
};

export default logger;
