export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { startBotPolling, startCleanupWorker } = await import('./bot-poller');

        // Chek xabarlarini 24 soatdan so'ng o'chirish — botning polling rejimidan
        // (START_POLLER) mustaqil, doim ishga tushadi.
        startCleanupWorker();

        if (process.env.START_POLLER === 'true') {
            startBotPolling();
        }
    }
}
