const { default: makeWASocket, useMultiFileAuthState, PHONENUMBER_MCC } = require("@whiskeysockets/baileys");

async function createPairingCode() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({ auth: state });

    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr, isNewLogin } = update;

        if (connection === "open") {
            console.log("✅ Successfully connected to WhatsApp!");
        } else if (connection === "close") {
            console.log("🔄 Reconnecting...");
            createPairingCode(); // Reconnect on disconnect
        }
        
        if (isNewLogin) {
            try {
                const phoneNumber = "919778158839"; // Replace with your phone number
                const countryCode = phoneNumber.substring(91, 2); // Extract country code
                const result = await sock.requestPairingCode(countryCode);
                console.log(`🔗 Your Pairing Code: ${result}`);
            } catch (error) {
                console.error("generating pairing code:", error);
            }
        }
    });
}

createPairingCode()
