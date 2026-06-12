const levelOrder = ["debug", "info", "warn", "error"] as const;
type Level = (typeof levelOrder)[number];

function format(level: Level, args: any[]) {
    const time = new Date().toISOString();
    return [`[${time}] [${level.toUpperCase()}]`, ...args];
}

const logger = {
    debug: (...args: any[]) => console.debug(...format("debug", args)),
    info: (...args: any[]) => console.info(...format("info", args)),
    warn: (...args: any[]) => console.warn(...format("warn", args)),
    error: (...args: any[]) => console.error(...format("error", args)),
};

export default logger;
