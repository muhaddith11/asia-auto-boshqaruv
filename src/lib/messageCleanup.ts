import supabase from '@/lib/supabaseClient';

const BATCH_SIZE = 50;
const MAX_ATTEMPTS = 5;
const THROTTLE_MS = 60_000;

let running = false;
let lastRunAt = 0;

async function deleteTelegramMessage(chatId: string, messageId: number): Promise<{ ok: boolean; description: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, description: 'TELEGRAM_BOT_TOKEN yo\'q' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
      signal: AbortSignal.timeout(10_000),
    });
    const json = await res.json();
    return { ok: !!json.ok, description: String(json.description || '') };
  } catch (e) {
    return { ok: false, description: `fetch: ${String(e)}` };
  }
}

// Qayta urinishdan foyda yo'q xatolar (xabar allaqachon yo'q, chat yopilgan va h.k.)
const PERMANENT_ERROR = /message to delete not found|message can't be deleted|chat not found|bot was blocked|user is deactivated|bot can't initiate/i;

export async function cleanupExpiredMessages() {
  if (running) return;
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ Cleanup: TELEGRAM_BOT_TOKEN yo\'q');
    return;
  }
  running = true;

  try {
    const { data: due, error } = await supabase
      .from('bot_messages_to_delete')
      .select('id, chat_id, message_id, attempts')
      .eq('status', 'pending')
      .lte('delete_at', new Date().toISOString())
      .order('delete_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.error('❌ Cleanup fetch error:', error);
      return;
    }
    if (!due || due.length === 0) return;

    console.log(`🧹 Cleaning up ${due.length} expired messages...`);

    for (const msg of due) {
      const result = await deleteTelegramMessage(String(msg.chat_id), Number(msg.message_id));

      // Telegram tezlik chegarasi — urinish sanamaymiz, keyingi safar davom etamiz
      if (/too many requests/i.test(result.description)) {
        console.warn('⚠️ Telegram rate limit, tozalash keyingi safarga qoldi');
        break;
      }

      const attempts = (msg.attempts || 0) + 1;

      let status: 'deleted' | 'failed' | 'pending' = 'pending';
      if (result.ok) status = 'deleted';
      else if (PERMANENT_ERROR.test(result.description) || attempts >= MAX_ATTEMPTS) status = 'failed';

      if (!result.ok) {
        console.warn(`⚠️ deleteMessage ${msg.chat_id}/${msg.message_id} (urinish ${attempts}): ${result.description}`);
      }

      // .eq('status','pending') — bir vaqtda ishlayotgan boshqa nusxa natijani ustidan yozib yubormasin
      await supabase
        .from('bot_messages_to_delete')
        .update({
          status,
          attempts,
          last_error: result.ok ? null : result.description,
          processed_at: status === 'pending' ? null : new Date().toISOString(),
        })
        .eq('id', msg.id)
        .eq('status', 'pending');
    }
  } catch (err) {
    console.error('❌ Global cleanup error:', err);
  } finally {
    running = false;
  }
}

// Serverless (Vercel)da setInterval ishonchsiz — shuning uchun so'rovlar orqali ham chaqiriladi.
export async function cleanupExpiredMessagesThrottled() {
  const now = Date.now();
  if (now - lastRunAt < THROTTLE_MS) return;
  lastRunAt = now;
  await cleanupExpiredMessages();
}
