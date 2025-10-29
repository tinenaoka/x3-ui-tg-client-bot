На серве установить node + npm
В .env указать данные
Создать бота через botfather в тг
Захостить через pm2 бота
Готово!

Последовательность

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

Перейти в папку

npm i
sudo npm i -g pm2
pm2 start bot.js --name x3-ui-tg-client-bot
pm2 save
pm2 startup

Готово
