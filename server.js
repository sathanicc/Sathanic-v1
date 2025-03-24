const express = require("express");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
let pairingCode = null;

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
            generatePairingCode();
        }

        if (isNewLogin) {
            try {
                pairingCode = await sock.requestPairingCode();
                console.log(`🔗 Pairing Code: ${pairingCode}`);
            } catch (error) {
                console.error("❌ Error generating pairing code:", error);
            }
        }
    });
}

app.get("/pairing", (req, res) => {
    if (pairingCode) {
        res.send(`Your Pairing Code: <b>${pairingCode}</b> <br> Enter it in WhatsApp > Linked Devices.`);
    } else {
        res.send("Pairing code not generated yet. Please try again.");
    }
});

app.listen(3000, () => {
    console.log("🌐 Pairing Code Server Running at http://localhost:3000/pairing");
    generatePairingCode();
});
