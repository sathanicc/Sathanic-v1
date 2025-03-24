const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const axios = require("axios");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const moment = require("moment");
const chalk = require("chalk");

const BOT_NAME = "Sathanic v1";
const PREFIX = "."; // Change this to any prefix you like
const CHATGPT_API_KEY = "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"; // Get from OpenAI (optional for AI responses)

// Load authentication state
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (msg) => {
        const m = msg.messages[0];
        if (!m.message || m.key.fromMe) return;
        
        const chat = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;
        
        console.log(chalk.green(`[${moment().format("HH:mm:ss")}] Message from ${sender}: ${text}`));

        if (text && text.startsWith(PREFIX)) {
            const args = text.slice(PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            switch (command) {
                case "ping":
                    await sock.sendMessage(chat, { text: "🏓 Pong!" });
                    break;

                case "time":
                    await sock.sendMessage(chat, { text: `⏰ Current Time: ${moment().format("LLLL")}` });
                    break;

                case "sticker":
                    if (m.message.imageMessage) {
                        const buffer = await sock.downloadMediaMessage(m);
                        fs.writeFileSync("temp.jpg", buffer);
                        await sock.sendMessage(chat, { sticker: { url: "temp.jpg" } });
                        fs.unlinkSync("temp.jpg");
                    } else {
                        await sock.sendMessage(chat, { text: "❌ Please send an image with the command!" });
                    }
                    break;

                case "quote":
                    const quoteRes = await axios.get("https://api.quotable.io/random");
                    await sock.sendMessage(chat, { text: `📜 *Quote*: ${quoteRes.data.content} - _${quoteRes.data.author}_` });
                    break;

                case "chatgpt":
                    if (!CHATGPT_API_KEY) return await sock.sendMessage(chat, { text: "⚠️ AI is disabled. Set up an OpenAI API key." });
                    const query = args.join(" ");
                    if (!query) return await sock.sendMessage(chat, { text: "❌ Please provide a query!" });

                    try {
                        const aiResponse = await axios.post("https://api.openai.com/v1/completions", {
                            model: "gpt-3.5-turbo",
                            messages: [{ role: "user", content: query }],
                        }, {
                            headers: { "Authorization": `Bearer ${CHATGPT_API_KEY}`, "Content-Type": "application/json" }
                        });
                        await sock.sendMessage(chat, { text: `🤖 *AI Response*: ${aiResponse.data.choices[0].message.content}` });
                    } catch (err) {
                        await sock.sendMessage(chat, { text: "⚠️ AI request failed!" });
                    }
                    break;

                default:
                    await sock.sendMessage(chat, { text: `❌ Unknown command! Use ${PREFIX}help for available commands.` });
                    break;
            }
        }
    });

    console.log(chalk.blue(`✅ ${BOT_NAME} is running...`));
}

connectToWhatsApp();
