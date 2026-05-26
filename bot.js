import { Telegraf, Markup } from 'telegraf';
import fetch from 'node-fetch';
import 'dotenv/config';

const bot = new Telegraf(process.env.BOT_TOKEN);

const {
    X3UI_HOST,
    X3UI_TOKEN,
    X3UI_HOST_CLEAR,
    INBOUND_ID,
} = process.env;

function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ---------------------- GET INBOUND ----------------------
async function getInbound(inboundId) {
    const res = await fetch(`${X3UI_HOST}/panel/api/inbounds/get/${inboundId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${X3UI_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await res.json();
    if (!data.success) throw new Error('Inbound не найден');

    return data.obj;
}

// ---------------------- ADD CLIENT ----------------------
async function addClient(inbound, email) {
    const client = {
        id: randomString(30),
        email: email,
        enable: true,
        flow: "xtls-rprx-vision",
        limitIp: 0,
        totalGB: 0,
        expiryTime: 0,
        subId: randomString(15),
        comment: email
    };

    const res = await fetch(`${X3UI_HOST}/panel/api/clients/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${X3UI_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: inbound.id,
            settings: {
                clients: [client]
            }
        })
    });

    const data = await res.json();
    if (!data.success) throw new Error('Ошибка добавления клиента');

    return client;
}

// ---------------------- BUILD VLESS URL ----------------------
function buildVlessUrl(inbound, client, email) {
    const stream = inbound.streamSettings;
    const reality = stream.realitySettings;

    return `vless://${client.id}@${X3UI_HOST_CLEAR}:${inbound.port}` +
      `?type=${stream.network}` +
      `&security=${stream.security}` +
      `&pbk=${reality.settings.publicKey}` +
      `&sni=${reality.serverNames[0]}` +
      `&sid=${reality.shortIds[0]}` +
      `&fp=chrome&spx=%2F&flow=${client.flow}` +
      `#${email}`;
}

// ---------------------- TELEGRAM BOT ----------------------
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
        const inbound = await getInbound(INBOUND_ID);
        const client = await addClient(inbound, email);

        const url = buildVlessUrl(inbound, client, email);

        await ctx.reply(`✅ Клиент создан!`);
        await ctx.reply(url);

    } catch (err) {
        console.error(err);
        await ctx.reply('❌ Ошибка при создании клиента.');
    }
});

bot.launch();
console.log('🚀 Bot started with Bearer Token API');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
