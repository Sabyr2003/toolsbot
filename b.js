const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = "cognitivecomputations/dolphin3.0-r1-mistral-24b:free";
const client = new Client({ authStrategy: new LocalAuth() });

let userData = {}; // Храним данные пользователей (язык + город)

const ignoredNumbers = ["7778295140@c.us", "77713951294@c.us", "0987654321@c.us"];

async function askAI(prompt, language) {
    try {
        const systemMessage = language === "kk"
            ? "Сіз пайдалы көмекшісіз. Қысқа әрі нақты жауап беріңіз, тек қазақ тілінде."
            : "Ты дружелюбный помощник. Отвечай кратко и по делу, только на русском языке.";

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": "https://yourwebsite.com",
                "X-Title": "WhatsApp Bot"
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("❌ Ошибка OpenRouter API:", error.response ? error.response.data : error.message);
        return language === "kk"
            ? "Кешіріңіз, сұранысты өңдеу кезінде қате пайда болды. Кейінірек қайталап көріңіз."
            : "Ошибка при обработке запроса. Попробуйте позже.";
    }
}

client.on('qr', qr => {
    console.log('Сканируйте QR-код в WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Бот подключен к WhatsApp!');
});

client.on("message", async (msg) => {
    const chatId = msg.from;
    if (ignoredNumbers.includes(chatId)) return;
    
    let text = msg.body.trim();
    console.log(`📩 Получено сообщение от ${chatId}: ${text}`);

    // Проверка выбора языка
    if (!userData[chatId]) {
        if (text === "1") {
            userData[chatId] = { language: "kk" };
            await client.sendMessage(chatId, "✅ Сіз қазақ тілін таңдадыңыз!\n📍 Сіз қала таңдаңыз:\n\n1️⃣ Алматы\n2️⃣ Басқа қала\n3️⃣ Қайта тіл таңдау");
            return;
        } else if (text === "2") {
            userData[chatId] = { language: "ru" };
            await client.sendMessage(chatId, "✅ Вы выбрали русский язык!\n📍 Выберите ваш город:\n\n1️⃣ Алматы\n2️⃣ Другой город\n3️⃣ Сменить язык");
            return;
        }

        await client.sendMessage(chatId, "🌍 Выберите язык:\n\n1️⃣ Қазақша 🇰🇿\n2️⃣ Русский 🇷🇺");
        return;
    }

    // Проверка выбора города
    if (!userData[chatId].city) {
        if (text === "1") {
            userData[chatId].city = "Алматы";
            await client.sendMessage(chatId,
                userData[chatId].language === "kk"
                    ? "✅ Сіз Алматы қаласын таңдадыңыз!\n🔴 Самовывоз: Райымбека 206к\n🚚 Доставка арқылы Indrive.\n📌 Тапсырыс беру үшін фото + төлем жіберіңіз: Kaspi: +7 778 295-14-03 (Сабыр З.)"
                    : "✅ Вы выбрали Алматы!\n🔴 Самовывоз: Райымбека 206к\n🚚 Доставка через Indrive.\n📌 Отправьте фото + оплату на Kaspi: +7 778 295-14-03 (Сабыр З.)"
            );
            return;
        } else if (text === "2") {
            userData[chatId].city = "Другой";
            await client.sendMessage(chatId, 
                userData[chatId].language === "kk"
                    ? "✅ Сіз басқа қаланы таңдадыңыз!\n📦 Почта 2500 тг (4-7 күн).\n📌 Тапсырыс беру үшін фото + төлем жіберіңіз: Kaspi: +7 778 295-14-03 (Сабыр З.)"
                    : "✅ Вы выбрали другой город!\n📦 Почта 2500 тг (4-7 дней).\n📌 Отправьте фото + оплату на Kaspi: +7 778 295-14-03 (Сабыр З.)"
            );
            return;
        } else if (text === "3") {
            delete userData[chatId];
            await client.sendMessage(chatId, "🔄 Выберите язык заново:\n\n1️⃣ Қазақша 🇰🇿\n2️⃣ Русский 🇷🇺");
            return;
        }

        await client.sendMessage(chatId,
            userData[chatId].language === "kk"
                ? "📍 Сіз қала таңдаңыз:\n\n1️⃣ Алматы\n2️⃣ Басқа қала\n3️⃣ Қайта тіл таңдау"
                : "📍 Выберите ваш город:\n\n1️⃣ Алматы\n2️⃣ Другой город\n3️⃣ Сменить язык"
        );
        return;
    }

    // Обработка команды !бот
    if (text.startsWith("!бот ")) {
        const userMessage = text.slice(5);
        const botReply = await askAI(userMessage, userData[chatId].language);
        await client.sendMessage(chatId, botReply);
        return;
    }

    // Если язык и город уже выбраны, отправляем сообщение в AI
    const botResponse = await askAI(text, userData[chatId].language);
    await client.sendMessage(chatId, botResponse);
});

client.initialize();
