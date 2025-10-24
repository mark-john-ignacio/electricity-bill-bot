import TelegramBot from "node-telegram-bot-api";
import express from "express";
import "dotenv/config";

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

function computeBill(total, totalKwh, prev, current, fixedPrice = 300) {
  const used = current - prev;
  const rate = total / totalKwh;
  const bill = used * rate;
  const totalBill = bill + fixedPrice;

  return `✅ Electric Bill Computation Summary
  
  Previous Reading: ${prev}
  Current Reading: ${current}
  Peso per kWH: ₱${rate.toFixed(2)}
  Estimated Bill: ₱${bill.toFixed(2)}
  Total bill (Estimated + Fixed Price(₱${fixedPrice.toFixed(
    2
  )})): ₱${totalBill.toFixed(2)}`;
}

// Handle /start and /help commands
bot.onText(/^\/(start|help)$/i, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `⚡ *Electricity Bill Calculator Bot*

I can help you calculate your electricity bill based on your meter readings!

*How to use:*
Send your values in this format:
\`total=2694 total_kwh=170 prev=1662 current=1832\`

*Optional:* Add \`fixed_price=300\` to override the default fixed charge (₱300).

*Parameters explained:*
• \`total\` - Your total bill amount from last month
• \`total_kwh\` - Total kWh consumed last month
• \`prev\` - Previous meter reading
• \`current\` - Current meter reading
• \`fixed_price\` - Fixed monthly charge (optional, default: ₱300)

*Example:*
\`total=2694 total_kwh=170 prev=1662 current=1832 fixed_price=300\`

*Commands:*
/help - Show this help message
/about - About this bot

💡 Tip: You can send values in any order!`;

  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
});

// Handle /about command
bot.onText(/^\/about$/i, (msg) => {
  const chatId = msg.chat.id;
  const aboutMessage = `⚡ *Electricity Bill Calculator Bot*

Version: 1.0.0
Created to help you estimate your monthly electricity bill based on your meter readings and previous billing information.

This bot calculates:
✓ Rate per kWh (based on your last bill)
✓ Estimated bill (based on consumption)
✓ Total bill (including fixed charges)

Made with ❤️ using Node.js and Telegram Bot API`;

  bot.sendMessage(chatId, aboutMessage, { parse_mode: "Markdown" });
});

// Handle greetings
bot.onText(
  /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/i,
  (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || "there";
    const greetingMessage = `👋 Hello ${name}! I'm your Electricity Bill Calculator Bot.

I can help you calculate your electricity bill. Send /help to see how to use me!`;

    bot.sendMessage(chatId, greetingMessage);
  }
);

// Handle bill calculations
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  // Skip if it's a command or greeting (already handled)
  if (
    text.startsWith("/") ||
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/i.test(
      text
    )
  ) {
    return;
  }

  const match = text.match(
    /total=(\d+(?:\.\d+)?)\s+total_kwh=(\d+(?:\.\d+)?)\s+prev=(\d+(?:\.\d+)?)\s+current=(\d+(?:\.\d+)?)(?:\s+fixed_price=(\d+(?:\.\d+)?))?/i
  );

  if (match) {
    const [, totalStr, totalKwhStr, prevStr, currentStr, fixedPriceStr] = match;
    const total = Number(totalStr);
    const totalKwh = Number(totalKwhStr);
    const prev = Number(prevStr);
    const current = Number(currentStr);
    const fixedPrice =
      fixedPriceStr !== undefined ? Number(fixedPriceStr) : undefined;

    // Validation
    if (current < prev) {
      bot.sendMessage(
        chatId,
        "❌ Error: Current reading must be greater than or equal to previous reading."
      );
      return;
    }
    if (totalKwh <= 0) {
      bot.sendMessage(chatId, "❌ Error: Total kWh must be greater than zero.");
      return;
    }
    if (total <= 0) {
      bot.sendMessage(
        chatId,
        "❌ Error: Total bill amount must be greater than zero."
      );
      return;
    }

    const reply = computeBill(total, totalKwh, prev, current, fixedPrice);
    bot.sendMessage(chatId, reply);
  } else {
    bot.sendMessage(
      chatId,
      "❌ I couldn't understand that format.\n\n👋 Send values like this:\n\n`total=2694 total_kwh=170 prev=1662 current=1832 fixed_price=300`\n\nOr type /help for more information.",
      { parse_mode: "Markdown" }
    );
  }
});

const app = express();
app.get("/", (req, res) => res.send("Bot is running 🚀"));
app.listen(process.env.PORT || 3000, () => console.log("Server started"));
