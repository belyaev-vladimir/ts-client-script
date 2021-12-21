# Общее описание

Клиент раз в секунду запрашивает главную страницу [google](https://google.com/)
и как только получает ответ, отправляет его серверу [vanilla-js-server](https://github.com/belyaev-vladimir/vanilla-js-server) 
Клиент знает, что сервер работает из рук вон плохо,
 поэтому умеет переотправлять недоставленные сообщения с [экспоненциальной задержкой].
Если сервер долго не отвечает, то клиент разрывает соединение через 10 секунд.
Клиент логирует в терминал все попытки отправки и ответы сервера.
При остановке клиента, клиент выводит в консоль статистику обращений к серверу,
сколько было сделано запросов, сколько из них завершились успехом, сколько было 500х ошибок,
сколько запросов зависло.

# Как запустить:

Для сборки TS необходимо установить зависимости:
`npm i`

Можно запустить сервер сразу:
`npm run start`

Чтобы запустить ранее собранный сервер, не выполняя сборку повторно:
`npm run start:prod`

# Настройки

Модуль `./consts.ts` содержит в себе все константы используемые в приложении.

![Screenshot from 2021-12-06 13-35-04](https://user-images.githubusercontent.com/18545939/144833829-aeabe3c0-fae9-4d7d-9c3c-9315047309fe.png)

