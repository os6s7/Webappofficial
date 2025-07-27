
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Replace with your bot token from @BotFather
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// Replace with your web app URL after deployment
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-app.replit.app';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Bot is running', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', bot: 'active' });
});

// Start command - shows main menu with web app button
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'there';
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🛍️ Open Marketplace',
            web_app: { url: WEB_APP_URL }
          }
        ],
        [
          {
            text: '📋 Browse Categories',
            callback_data: 'categories'
          },
          {
            text: '💎 Telegram Stars',
            callback_data: 'stars'
          }
        ],
        [
          {
            text: '❓ Help',
            callback_data: 'help'
          }
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

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch(data) {
    case 'categories':
      const categoriesKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎭 Sticker Packs', web_app: { url: `${WEB_APP_URL}?category=sticker-packs` } }
            ],
            [
              { text: '🌟 Premium Features', web_app: { url: `${WEB_APP_URL}?category=premium-features` } }
            ],
            [
              { text: '🎨 Digital Collectibles', web_app: { url: `${WEB_APP_URL}?category=digital-collectibles` } }
            ],
            [
              { text: '🎁 Gift Cards', web_app: { url: `${WEB_APP_URL}?category=gift-cards` } }
            ],
            [
              { text: '🎯 Custom Themes', web_app: { url: `${WEB_APP_URL}?category=custom-themes` } }
            ],
            [
              { text: '⭐ Telegram Stars', web_app: { url: `${WEB_APP_URL}?category=telegram-stars` } }
            ],
            [
              { text: '🔙 Back to Menu', callback_data: 'back_to_menu' }
            ]
          ]
        }
      };
      
      bot.editMessageText(
        '📋 Choose a category to browse:',
        {
          chat_id: chatId,
          message_id: callbackQuery.message.message_id,
          ...categoriesKeyboard
        }
      );
      break;

    case 'stars':
      bot.editMessageText(
        '⭐ **Telegram Stars** are the official currency for digital purchases!\n\n' +
        '💰 **Available Star Bundles:**\n' +
        '• 100 Stars - $9.99\n' +
        '• 500 Stars - $39.99 (Save 20%)\n' +
        '• 1000 Stars - $69.99 (Save 30%)\n\n' +
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
              [
                { text: '💎 Buy Stars', web_app: { url: `${WEB_APP_URL}?category=telegram-stars` } }
              ],
              [
                { text: '🔙 Back to Menu', callback_data: 'back_to_menu' }
              ]
            ]
          }
        }
      );
      break;

    case 'help':
      bot.editMessageText(
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
              [
                { text: '🛍️ Start Shopping', web_app: { url: WEB_APP_URL } }
              ],
              [
                { text: '🔙 Back to Menu', callback_data: 'back_to_menu' }
              ]
            ]
          }
        }
      );
      break;
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

// Handle any text message
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip if it's a command (starts with /)
  if (text && !text.startsWith('/')) {
    bot.sendMessage(chatId, 
      '🤖 Hi! Use /start to access the marketplace, or click the button below:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🛍️ Open Marketplace',
                web_app: { url: WEB_APP_URL }
              }
            ]
          ]
        }
      }
    );
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Start the HTTP server
app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 HTTP server listening on port ${port}`);
  console.log('🤖 Telegram bot is running...');
  console.log('📱 Web App URL:', WEB_APP_URL);
});
