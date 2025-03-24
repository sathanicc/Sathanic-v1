const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function generatePairingCode() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, isNewLogin } = update;

        if (connection === "open") {
            console.log("✅ Bot connected to WhatsApp!");
        } else if (connection === "close") {
            console.log("🔄 Reconnecting...");
            generatePairingCode(); // Reconnect on disconnect
        }

        if (isNewLogin) {
            try {
                const pairingCode = await sock.requestPairingCode();
                console.log(`🔗 Your Pairing Code: ${pairingCode}`);
                console.log("📲 Enter this code in WhatsApp > Linked Devices.");
            } catch (error) {
                console.error("❌ Error generating pairing code:", error);
            }
        }
    });
}

generatePairingCode();
