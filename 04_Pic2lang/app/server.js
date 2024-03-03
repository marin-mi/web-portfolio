const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();
const config = require("./server-config.json");

app.use("/", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.listen(config.PORT, () => {
    console.log(`Server started on port:${config.PORT}`);
});

app.post("/api/translate", async (req, res) => {
    const { data } = await axios.post(
        "https://api-free.deepl.com/v2/translate",
        {
            text: [req.body.text],
            target_lang: req.body.targetLang,
        },
        {
            headers: {
                Authorization: `DeepL-Auth-Key ${config.DEEPL_AUTH_KEY}`,
            },
        }
    );
    res.json({ text: data.translations[0].text });
});
