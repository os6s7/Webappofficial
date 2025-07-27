import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Get environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ 
    status: 'Bot is running', 
    timestamp: new Date().toISOString(),
    web_app_url: WEB_APP_URL
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    bot: 'active',
    uptime: process.uptime()
  });
});

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'there';
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🛍️ Open Marketplace',
          web_app: { url: WEB_APP_URL }
        }],
        [
          { text: '📋 Browse Categories', callback_data: 'categories' },
          { text: '💎 Telegram Stars', callback_data: 'stars' }
        ],
        [
          { text: '❓ Help', callback_data: 'help' }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, 
    `🎉 Welcome to TeleMarket, ${firstName}!\n\n` +
    `🛍️ Your one-stop shop for Telegram gifts:\n` +
    `• 🎭 Animated Sticker Packs\n` +
    `• 🌟 Premium Features\n` +
    `• 🎨 Digital Collectibles\n` +
    `• 🎁 Gift Cards & Stars\n` +
    `• 🎯 Custom Themes\n\n` +
    `Click "Open Marketplace" to start shopping!`,
    options
  );
});

// Callback query handler
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch(data) {
    case 'categories':
      const categoriesKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎭 Sticker Packs', web_app: { url: `${WEB_APP_URL}?category=sticker-packs` } }],
            [{ text: '🌟 Premium Features', web_app: { url: `${WEB_APP_URL}?category=premium-features` } }],
            [{ text: '🎨 Digital Collectibles', web_app: { url: `${WEB_APP_URL}?category=digital-collectibles` } }],
            [{ text: '🎁 Gift Cards', web_app: { url: `${WEB_APP_URL}?category=gift-cards` } }],
            [{ text: '🎯 Custom Themes', web_app: { url: `${WEB_APP_URL}?category=custom-themes` } }],
            [{ text: '⭐ Telegram Stars', web_app: { url: `${WEB_APP_URL}?category=telegram-stars` } }],
            [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(
        '📋 Choose a category to browse:',
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          ...categoriesKeyboard
        }
      );
      break;

    case 'stars':
      await bot.editMessageText(
        '⭐ **Telegram Stars** are the official currency for digital purchases!\n\n' +
        '💰 **Available Star Bundles:**\n' +
        '• 100 Stars - \$9.99\n' +
        '• 500 Stars - \$39.99 (Save 20%)\n' +
        '• 1000 Stars - \$69.99 (Save 30%)\n\n' +
        '🎁 Use Stars to:\n' +
        '• Buy premium stickers\n' +
        '• Unlock exclusive features\n' +
        '• Send gifts to friends\n' +
        '• Purchase digital collectibles',
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💎 Buy Stars', web_app: { url: `${WEB_APP_URL}?category=telegram-stars` } }],
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );
      break;

    case 'help':
      await bot.editMessageText(
        '❓ **How to use TeleMarket:**\n\n' +
        '1️⃣ Click "Open Marketplace" to browse products\n' +
        '2️⃣ Add items to your cart\n' +
        '3️⃣ Pay with Telegram Stars, Bitcoin, or Ethereum\n' +
        '4️⃣ Receive your digital gifts instantly!\n\n' +
        '🛡️ **Safe & Secure:**\n' +
        '• All payments are encrypted\n' +
        '• Instant delivery\n' +
        '• 24/7 customer support\n\n' +
        '💬 **Need help?** Contact @support',
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛍️ Start Shopping', web_app: { url: WEB_APP_URL } }],
              [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );
      break;

    case 'back_to_menu':
      try {
        await bot.deleteMessage(chatId, callbackQuery.message.message_id);
        await bot.sendMessage(chatId, 'Main menu:', {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛍️ Open Marketplace', web_app: { url: WEB_APP_URL } }],
              [
                { text: '📋 Browse Categories', callback_data: 'categories' },
                { text: '💎 Telegram Stars', callback_data: 'stars' }
              ],
              [{ text: '❓ Help', callback_data: 'help' }]
            ]
          }
        });
      } catch (error) {
        console.error('Error handling back_to_menu:', error);
      }
      break;
  }

  await bot.answerCallbackQuery(callbackQuery.id);
});

// Handle regular messages
bot.on('message', (msg) => {
  if (!msg.text?.startsWith('/')) {
    bot.sendMessage(msg.chat.id, 'Use /start to access the marketplace', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛍️ Open Marketplace', web_app: { url: WEB_APP_URL } }]
        ]
      }
    });
  }
});

// Error handlers
bot.on('error', (error) => console.error('Bot error:', error));
bot.on('polling_error', (error) => console.error('Polling error:', error));

// Start server
app.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${port}`);
  try {
    const me = await bot.getMe();
    console.log(`🤖 Bot started: @${me.username}`);
  } catch (error) {
    console.error('Failed to get bot info:', error);
  }
  console.log(`📱 WebApp URL: ${WEB_APP_URL}`);
});