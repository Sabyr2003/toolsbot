const { Client, LocalAuth } = require("whatsapp-web.js");
const fetch = require("node-fetch");

const client = new Client({
    authStrategy: new LocalAuth(),
});

let userData = {}; // Храним данные пользователей (язык + город)

// Номера, на которые бот не будет реагировать
const ignoredNumbers = [
    "7778295140@c.us",
    "77781728440@c.us",
    "0987654321@c.us"
];

client.on("qr", (qr) => {
    console.log("QR-код получен, отсканируйте его в WhatsApp.");
});

client.on("authenticated", () => {
    console.log("Бот успешно авторизован! ✅");
});

client.on("ready", () => {
    console.log("Бот успешно запущен! ✅");
});

client.on("message", async (msg) => {
    const chatId = msg.from;

    // Проверяем, есть ли номер в списке игнорируемых
    if (ignoredNumbers.includes(chatId)) {
        console.log(`Сообщение от ${chatId} проигнорировано.`);
        return;
    }

    console.log(`Получено сообщение от ${chatId}: ${msg.body}`);

    try {
        let text = msg.body.trim(); // Убираем лишние пробелы

        // Выбор языка
        if (!userData[chatId]) {
            if (text === "1") {
                userData[chatId] = { language: "kk" };
                await client.sendMessage(chatId, 
                    "✅ Сіз қазақ тілін таңдадыңыз!\n\n" +
                    "•  Сағыз Love is 🩷\n5шт 2490тг (1пачка=5сағыз)\n10шт 2990тг (2 пачка=10сағыз)\n15шт 3990тг (3 пачка немесе 1 үлкен)\n\n" +
                    "•  Именной киндер🍫 3490тг\n•  Именной Toffifee🍬 3490тг\n\n" +
                    "📍 Біз Алматы қаласы\n📦 Доставка Қазақстан бойынша (4-7 күн, 2500тг)\n\n" +
                    "📍 Қала таңдаңыз:\n\n1️⃣ Алматы\n2️⃣ Басқа қала\n3️⃣ Қайта тіл таңдау / Сменить язык"
                );
                return;
            } else if (text === "2") {
                userData[chatId] = { language: "ru" };
                await client.sendMessage(chatId, 
                    "✅ Вы выбрали русский язык!\n\n" +
                    "•  Жвачка Love is 🩷\n5шт 2490тг (1 пачка = 5 жвачек)\n10шт 2990тг (2 пачки = 10 жвачек)\n15шт 3990тг (3 пачки или 1 большая)\n\n" +
                    "•  Именной киндер 🍫 3490тг\n•  Именной Toffifee 🍬 3490тг\n\n" +
                    "📍 Мы в Алматы\n📦 Доставка по Казахстану (4-7 дней, 2500тг)\n\n" +
                    "📍 Выберите ваш город:\n\n1️⃣ Алматы\n2️⃣ Другой город\n3️⃣ Сменить язык / Қайта тіл таңдау"
                );
                return;
            }

            await client.sendMessage(
                chatId,
                "✋ Сәлеметсіз бе  | Здравствуйте\n🌍 Тілді таңдаңыз | Выберите язык:\n\n1️⃣ Қазақша 🇰🇿\n2️⃣ Русский 🇷🇺\n\n1 немесе 2 санын жіберіңіз | Отправьте цифру 1 или 2"
            );
            return;
        }

        // Выбор города
        if (!userData[chatId].city) {
            if (text === "1") {
                userData[chatId].city = "Алматы";
                await client.sendMessage(chatId, 
                    userData[chatId].language === "kk"
                        ? "✅ Сіз Алматы қаласын таңдадыңыз!\n✅ Ертең кешкі 18:00-де дайын болады\n\n" +
                          "🔴 Алып кету мекен-жайы: Райымбека 206к\n🚚 Доставка Яндекс арқылы бөлек төленеді\n\n" +
                          "📌 Заказ беру үшін фотолар + оплата жібересіз:\n💳 Каспи: +7 778 295-14-03 (Сабыр З.)"
                        : "✅ Вы выбрали Алматы!\n✅ Ваш заказ будет готов завтра к 18:00\n\n" +
                          "🔴 Адрес самовывоза: Райымбека 206к\n🚚 Доставка через Яндекс оплачивается отдельно\n\n" +
                          "📌 Чтобы оформить заказ, отправьте фото + оплату:\n💳 Kaspi: +7 778 295-14-03 (Сабыр З.)"
                );
                return;
            } else if (text === "2") {
                userData[chatId].city = "Другой";
                await client.sendMessage(chatId, 
                    userData[chatId].language === "kk"
                        ? "✅ Сіз басқа қаланы таңдадыңыз!\n✅ Ертең 15:00-де дайын болған соң\n📦 Почтаға барып салып жібереміз\n🚚 Почта 2500тг (жеткізу 4-7 күн)\n\n" +
                          "📌 Заказ беру үшін фотолар + оплата жібересіз:\n💳 Каспи: +7 778 295-14-03 (Сабыр З.)"
                        : "✅ Вы выбрали другой город!\n✅ Завтра в 15:00 заказ будет готов\n📦 Отправим через почту\n🚚 Доставка 2500 тг (срок 4-7 дней)\n\n" +
                          "📌 Чтобы оформить заказ, отправьте фото + оплату:\n💳 Kaspi: +7 778 295-14-03 (Сабыр З.)"
                );
                return;
            } else if (text === "3") {
                delete userData[chatId];
                await client.sendMessage(chatId, "🔄 Тілді қайта таңдаңыз / Выберите язык заново:\n\n1️⃣ Қазақша 🇰🇿\n2️⃣ Русский 🇷🇺");
                return;
            }

            await client.sendMessage(
                chatId,
                userData[chatId].language === "kk"
                    ? "📍 Сіз қала таңдаңыз:\n\n1️⃣ Алматы\n2️⃣ Басқа қала\n3️⃣ Қайта тіл таңдау / Сменить язык"
                    : "📍 Выберите ваш город:\n\n1️⃣ Алматы\n2️⃣ Другой город\n3️⃣ Сменить язык / Қайта тіл таңдау"
            );
            return;
        }
        
        // Если уже выбраны язык и город
        client.on("message", async (msg) => {
            const chatId = msg.from;
            if (ignoredNumbers.includes(chatId)) return;
            console.log(`Получено сообщение от ${chatId}: ${msg.body}`);
            
            let text = msg.body.trim();
            
            if (!userData[chatId]) {
                userData[chatId] = { language: "ru" };
            }
            
        });
    } catch (error) {
        console.error("Ошибка при обработке сообщения:", error);
    }
});

client.initialize();
