const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            console.log("Disconnected, reconnecting...");
            connect();
        } else if (connection === "open") {
            console.log("Connected to WhatsApp!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text) {
            console.log(`Received message: ${text}`);
            await sock.sendMessage(sender, { text: "Hey i am sathan! This is your bot replying." });
        }
    });
}

connect();
