 # 🤖 x3-ui Telegram Client Bot

Бот для управления **x3-ui** (работает **только для VLESS**) через Telegram.  
Простой способ выдавать клиенты прямо из чата!

---

## 🚀 Возможности
- Управление пользователями VLESS через Telegram  
- Поддержка `.env` для удобной настройки  
- Автозапуск через **PM2**  
- Простая установка и развертывание

---

## ⚙️ Установка и запуск

### 1. Установи Node.js и npm
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### 2. Склонируй репозиторий и перейди в папку проекта
```bash
git clone [[https://github.com/yourname/x3-ui-tg-client-bot.git]()](https://github.com/tinenaoka/x3-ui-tg-client-bot)
cd x3-ui-tg-client-bot
```

---

### 3. Установи зависимости
```bash
npm i
```

---

### 4. Настрой файл `.env`

Создай файл `.env` в корне проекта и укажи свои данные. Пример:

```env
BOT_TOKEN=твой_тг_токен_от_BotFather
X3UI_URL=http://127.0.0.1:2053
X3UI_USERNAME=admin
X3UI_PASSWORD=пароль
```

---

### 5. Установи PM2 (для автозапуска)
```bash
sudo npm i -g pm2
```

---

### 6. Запусти бота
```bash
pm2 start bot.js --name x3-ui-tg-client-bot
```

---

### 7. Сохрани конфигурацию PM2 и настрой автозапуск
```bash
pm2 save
pm2 startup
```

---

## ✅ Готово!

Бот запущен и будет автоматически стартовать при перезагрузке сервера.  
Теперь можно управлять **x3-ui** через Telegram.

---

## 🧩 Требования
- Сервер с установленным **x3-ui**
- Node.js 20+
- Telegram бот (создан через [BotFather](https://t.me/BotFather))

---

## 💡 Полезные команды PM2
| Команда | Описание |
|----------|-----------|
| `pm2 list` | Показать все процессы |
| `pm2 logs x3-ui-tg-client-bot` | Просмотр логов |
| `pm2 restart x3-ui-tg-client-bot` | Перезапустить бота |
| `pm2 stop x3-ui-tg-client-bot` | Остановить бота |
| `pm2 delete x3-ui-tg-client-bot` | Удалить процесс |

---

## 🧠 Советы
- Проверяй корректность `.env` — неправильный токен или URL часто причина ошибок.  
- Для безопасности не коммить `.env` в репозиторий.  

---

## 📄 Лицензия
MIT License © 2025  
Автор: tinenaoka
