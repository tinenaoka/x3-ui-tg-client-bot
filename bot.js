// bot.js
import {Telegraf, Markup} from 'telegraf';
import fetch from 'node-fetch';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const {
    X3UI_HOST,
    X3UI_USER,
    X3UI_PASS,
    X3UI_HOST_CLEAR,
    INBOUND_ID,
} = process.env;

function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function getToken() {
    const res = await fetch(`${X3UI_HOST}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: X3UI_USER, password: X3UI_PASS })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Ошибка входа в X3UI');
    return await res.headers.raw()['set-cookie'];
}

async function createClient(cookie, email) {
    let formData = new FormData();
    formData.append('id', INBOUND_ID);
    formData.append('settings', JSON.stringify({
        clients: [{
            id: randomString(30),
            flow: "xtls-rprx-vision",
            email: email,
            limitIp: 0,
            totalGB: 0,
            expiryTime: 0,
            enable: true,
            tgId: "",
            subId: randomString(15),
            comment: email,
            reset: 0
        }]
    }));
    const res = await fetch(`${X3UI_HOST}/panel/api/inbounds/addClient`, {
        method: 'POST',
        headers: {
            'Cookie': cookie,
        },
        body: formData
    });
    try {
        return await res.json();
    } catch (e) {
        return {}
    }
}

async function getLastClient(cookie, inboundId, email) {
    const res = await fetch(`${X3UI_HOST}/panel/api/inbounds/list`, {
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie,
        }
    });
    const data = await res.json();
    const inbound = data.obj.find(i => i.id === Number(inboundId));
    if (!inbound) throw new Error('Inbound не найден');
    const clientsArr = JSON.parse(inbound.settings).clients;
    const client = clientsArr.find(c => c.email === email) || clientsArr[clientsArr.length - 1];
    if (!client) throw new Error('Клиент не найден');
    return {inbound, client};
}

function buildVlessUrl(inbound, client, email) {
    const inboundSettings = JSON.parse(inbound.streamSettings);
    const security = inboundSettings.security;
    const type = inboundSettings.network;
    const pbk = inboundSettings.realitySettings.settings.publicKey;
    const sni = inboundSettings.realitySettings.serverNames[0];
    const sid = inboundSettings.realitySettings.shortIds[0];
    const flow = client.flow;
    const id = client.id;
    return `vless://${id}@${X3UI_HOST_CLEAR}:${inbound.port}?type=${type}&security=${security}&pbk=${pbk}&fp=chrome&sni=${sni}&sid=${sid}&spx=%2F&flow=${flow}#${email}`;
}

bot.start((ctx) => {
    ctx.reply(
        '👋 Привет! Нажми кнопку, чтобы создать клиента:',
        Markup.inlineKeyboard([[Markup.button.callback('➕ Создать клиента', 'create_client')]])
    );
});

bot.action('create_client', async (ctx) => {
    await ctx.answerCbQuery('⏳ Создаю клиента...');
    const email = `tg_${ctx.from.id}_${Date.now()}@bot`;

    try {
        const token = await getToken();
        const result = await createClient(token, email);

        if (!result.success) {
            await ctx.reply(`⚠️ Ошибка при создании`);
            return;
        }

        const {inbound, client} = await getLastClient(token, INBOUND_ID, email);
        const url = buildVlessUrl(inbound, client, email);
        await ctx.reply(`✅ Клиент создан!`);
        await ctx.reply(`${url}`);

    } catch (err) {
        console.error(err);
        await ctx.reply('❌ Ошибка при создании клиента или генерации конфига.');
    }
});

bot.launch();
console.log('🚀 Bot started with QR feature.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
