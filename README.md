На серве установить node + npm <br>
В .env указать данные <br>
Создать бота через botfather в тг <br>
Захостить через pm2 бота <br>
Готово!

Последовательность

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - <br>
sudo apt install -y nodejs <br>

Перейти в папку

npm i <br>
sudo npm i -g pm2 <br>
pm2 start bot.js --name x3-ui-tg-client-bot <br>
pm2 save <br>
pm2 startup <br>

Готово
