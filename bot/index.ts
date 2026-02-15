import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

// Загружаем переменные из .env.local
dotenv.config({ path: '.env.local' });

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN) {
    console.error('❌ ОШИБКА: BOT_TOKEN не найден в .env.local');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Лог для отладки при старте
console.log('--- Конфигурация загружена ---');
console.log('WEBAPP_URL:', WEBAPP_URL);

bot.start((ctx) => {
    ctx.reply('Welcome to TaskVaultBot! 🚀\nUse /help to see available commands.');
});

bot.help((ctx) => {
    ctx.reply(
        'Available commands:\n' +
        '/start - Start the bot\n' +
        '/help - Show this help message\n' +
        '/webapp - Open the Mini App'
    );
});

bot.command('webapp', (ctx) => {
    try {
        const chatId = ctx.chat.id;
        // Кодируем и УДАЛЯЕМ символы '=', которые запрещены в startapp
        const encodedGroupId = Buffer.from(chatId.toString())
            .toString('base64')
            .replace(/=/g, ''); // <--- ВАЖНО: убираем лишние символы

        console.log(`Команда от чата: ${chatId}, Код: ${encodedGroupId}`);

        // Добавляем https:// если его нет
        const baseUrl = WEBAPP_URL?.startsWith('http') ? WEBAPP_URL : `https://${WEBAPP_URL}`;
        const url = `${baseUrl}?startapp=${encodedGroupId}`;

        ctx.reply('Нажмите кнопку для входа:', {
            reply_markup: {
                inline_keyboard: [[
                    { text: "🚀 Открыть доску", url: url }
                ]]
            }
        });
    } catch (e) {
        console.error(e);
    }
});

bot.launch().then(() => {
    console.log('✅ Bot is running and waiting for commands...');
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));