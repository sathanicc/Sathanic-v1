require("dotenv").config();
const twilio = require("twilio");
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));

const client = twilio(process.env.ACbc395a26495b0a0e5a98e834dec3a965, process.env.fd1f06b4f0498da0879ac5b77dc09eff);

app.post("/whatsapp", async (req, res) => {
    const message = req.body.Body;
    const sender = req.body.From;

    await client.messages.create({
        from: `whatsapp:${process.env.+919778158839}`,
        to: sender,
        body: `You said: ${message}`,
    });

    res.sendStatus(200);
});

app.listen(3000, () => console.log("WhatsApp bot is running on port 3000"));
