export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.START_POLLER === 'true') {
    const { startBotPolling } = await import('./bot-poller');
    startBotPolling();
  }
}
