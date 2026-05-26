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
    const res = await fetch(`${X3UI_HOST}/panel/api/clients/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${X3UI_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "client": {
                "email": email,
                "totalGB": 0,
                "flow": "xtls-rprx-vision",
                "tgId": 0,
                "limitIp": 0,
                "enable": true
            },
            "inboundIds": [inbound.id]
        })
    });

    const data = await res.json();
    if (!data.success) throw new Error('Ошибка добавления клиента');

    return data;
}

// ---------------------- GET CLIENT ----------------------
async function getClient(email) {
    const res = await fetch(`${X3UI_HOST}/panel/api/clients/get/${email}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${X3UI_TOKEN}`,
            'Content-Type': 'application/json'
        },
    });

    const data = await res.json();
    if (!data.success) throw new Error('Ошибка получения клиента');

    return data.obj.client;
}

// ---------------------- BUILD VLESS URL ----------------------
function buildVlessUrl(inbound, client, email) {
    const stream = inbound.streamSettings;
    const settings = inbound.settings;
    const reality = stream.realitySettings;

    return `vless://${client.uuid}@${X3UI_HOST_CLEAR}:${inbound.port}` +
      `?encryption=${settings.encryption}` +
      `&type=${stream.network}` +
      `&pqv=${reality.settings.mldsa65Verify}` +
      `&security=${stream.security}` +
      `&pbk=${reality.settings.publicKey}` +
      `&sni=${reality.serverNames[0]}` +
      `&sid=${reality.shortIds[0]}` +
      `&fp=${reality.settings.fingerprint}` +
      `&spx=%2Fclcj4lwklvARrUo` +
      `&flow=${client.flow}` +
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
        await addClient(inbound, email);
        const client = await getClient(email);

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
