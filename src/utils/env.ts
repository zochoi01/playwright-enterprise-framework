export function requireEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(
            `[ENV GUARD] Missing required environment variable: ${name}`
        );
    }

    console.info(`[ENV GUARD] ${name}=<configured>`);
    return value;
}
