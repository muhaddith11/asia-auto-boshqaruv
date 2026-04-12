export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startBotPolling } = await import('./bot-poller');
    startBotPolling();
  }
}
