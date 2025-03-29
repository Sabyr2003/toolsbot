const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session'
    })
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
});

const catalog = {
    'дрель': { ru: '🔩 Дрель Bosch - 5000₽\n👉 Купить: напишите "Купить дрель"', kz: '🔩 Бұрғы Bosch - 5000₽\n👉 Сатып алу үшін: "Купить дрель" деп жазыңыз' },
    'шуруповерт': { ru: '🔧 Шуруповерт Makita - 7500₽\n👉 Купить: напишите "Купить шуруповерт"', kz: '🔧 Бұрағыш Makita - 7500₽\n👉 Сатып алу үшін: "Купить шуруповерт" деп жазыңыз' },
    'болгарка': { ru: '⚙️ Болгарка DeWalt - 8900₽\n👉 Купить: напишите "Купить болгарку"', kz: '⚙️ Болгарка DeWalt - 8900₽\n👉 Сатып алу үшін: "Купить болгарку" деп жазыңыз' }
};

let userState = {};

client.on('message', async message => {
    const msg = message.body.toLowerCase();
    const chatId = message.from;

    if (!userState[chatId]) {
        userState[chatId] = { stage: 'language_selection' };
        await message.reply('🌍 Выберите язык / Тілді таңдаңыз:\n🇷🇺 Русский\n🇰🇿 Қазақша');
        return;
    }

    if (userState[chatId].stage === 'language_selection') {
        if (msg.includes('русский')) {
            userState[chatId].language = 'ru';
        } else if (msg.includes('қазақша')) {
            userState[chatId].language = 'kz';
        } else {
            await message.reply('❗ Пожалуйста, выберите язык / Тілді таңдаңыз: 🇷🇺 Русский или 🇰🇿 Қазақша');
            return;
        }
        userState[chatId].stage = 'main_menu';
        await message.reply(userState[chatId].language === 'ru' ?
            '👋 Добро пожаловать в магазин электроинструментов!\nВыберите действие:\n1️⃣ Каталог\n2️⃣ Подбор инструмента\n3️⃣ Акции\n4️⃣ Связаться с менеджером' :
            '👋 Электроқұралдар дүкеніне қош келдіңіз!\nТаңдаңыз:\n1️⃣ Каталог\n2️⃣ Құрал таңдау\n3️⃣ Акциялар\n4️⃣ Менеджермен байланысу');
        return;
    }

    const lang = userState[chatId].language;

    if (msg === 'каталог' || msg === '1') {
        let productList = lang === 'ru' ? '🛠 Наши товары:\n' : '🛠 Біздің өнімдеріміз:\n';
        for (let product in catalog) {
            productList += `🔹 ${product}\n`;
        }
        await message.reply(productList + (lang === 'ru' ? '\nНапишите название товара, чтобы узнать больше.' : '\nКөбірек білу үшін өнім атауын жазыңыз.'));
    } else if (catalog[msg]) {
        await message.reply(catalog[msg][lang]);
    } else if (msg.includes('купить') || msg.includes('сатып алу')) {
        userState[chatId].stage = 'waiting_phone';
        await message.reply(lang === 'ru' ? '🛒 Отличный выбор! Напишите ваш номер телефона.' : '🛒 Керемет таңдау! Телефон нөміріңізді жазыңыз.');
    } else if (msg === 'подбор инструмента' || msg === '2') {
        await message.reply(lang === 'ru' ? '🔍 Ответьте на 3 вопроса:\n1️⃣ Где будете использовать? (дом/стройка)' : '🔍 3 сұраққа жауап беріңіз:\n1️⃣ Қайда қолданасыз? (үй/құрылыс)');
    } else if (msg === 'дом' || msg === 'стройка' || msg === 'үй' || msg === 'құрылыс') {
        await message.reply(lang === 'ru' ? '2️⃣ Какой бюджет? (до 5000 / 5000-10000 / больше 10000)' : '2️⃣ Бюджетіңіз қандай? (5000-ға дейін / 5000-10000 / 10000-нан жоғары)');
    } else if (msg === 'до 5000' || msg === '5000-10000' || msg === 'больше 10000' || msg === '5000-ға дейін' || msg === '5000-10000' || msg === '10000-нан жоғары') {
        await message.reply(lang === 'ru' ? '💡 Подбираем инструмент... 🔄\nРекомендуем: Дрель Bosch 5000₽.\nНапишите "Купить дрель" для заказа.' : '💡 Құрал таңдалуда... 🔄\nҰсыныс: Бұрғы Bosch 5000₽.\nСатып алу үшін "Купить дрель" жазыңыз.');
    } else {
        await message.reply(lang === 'ru' ? 'Не понял ваш запрос. Напишите "Меню" для списка команд.' : 'Сұранысыңызды түсінбедім. "Меню" жазыңыз.');
    }
});

client.initialize();
