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

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

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
    const reply = computeBill(total, totalKwh, prev, current, fixedPrice);
    bot.sendMessage(chatId, reply);
  } else {
    bot.sendMessage(
      chatId,
      "👋 Hi! Send values like this:\n\n`total=2694 total_kwh=170 prev=1662 current=1832 fixed_price=300`\n\nInclude fixed_price only when you need to override the default ₱300.",
      { parse_mode: "Markdown" }
    );
  }
});

const app = express();
app.get("/", (req, res) => res.send("Bot is running 🚀"));
app.listen(process.env.PORT || 3000, () => console.log("Server started"));
