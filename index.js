import TelegramBot from "node-telegram-bot-api";
import express from "express";

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Simple helper to compute the bill
function computeBill(total, totalKwh, prev, current) {
  const used = current - prev;
  const rate = total / totalKwh;
  const bill = used * rate;

  return `✅ Electric Bill Computation Summary

Previous Reading: ${prev}
Current Reading: ${current}
Total kWh Used: ${used}
Peso per kWh: ₱${rate.toFixed(2)}
Estimated Bill: ₱${bill.toFixed(0)}`;
}

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Match numbers from user input
  const match = text.match(/total=(\d+)\s+total_kwh=(\d+)\s+prev=(\d+)\s+current=(\d+)/i);

  if (match) {
    const [, total, totalKwh, prev, current] = match.map(Number);
    const reply = computeBill(total, totalKwh, prev, current);
    bot.sendMessage(chatId, reply);
  } else {
    bot.sendMessage(
      chatId,
      "👋 Hi! Send values like this:\n\n`total=2694 total_kwh=170 prev=1662 current=1832`",
      { parse_mode: "Markdown" }
    );
  }
});

// Express server (needed for Render to keep app alive)
const app = express();
app.get("/", (req, res) => res.send("Bot is running 🚀"));
app.listen(process.env.PORT || 3000, () => console.log("Server started"));
