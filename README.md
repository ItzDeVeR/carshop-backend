# carshop-backend

Бэкенд для сервиса автосалона (каталог автомобилей, фильтрация, заказы, избранное, заявки менеджерам, авторизация).

Фронтенд проекта: [carshop-react](https://github.com/ItzDeVeR/carshop-react)

## Стек
- Node.js, Express
- PostgreSQL (`pg`)
- JWT, bcrypt
- Multer (загрузка фото)

## Запуск проекта

1. Установка зависимостей:
```bash
npm install
```

2. Настройка переменных окружения:
Создайте файл `.env` в корне (на основе `.env.example`):
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=carshop
JWT_SECRET=your_secret_key
```

3. Запуск:
```bash
# dev (с nodemon)
npm run dev

# prod
npm start
```

Сервер по умолчанию запускается на `http://localhost:5000`.

## Основные эндпоинты

- `/api/auth` — `/register`, `/login`
- `/api/profile` — `/me`, редактирование профиля, смена пароля, загрузка аватара
- `/api/cars` — каталог авто с фильтрами, детальная информация, добавление/редактирование
- `/api/favorite` — добавление в избранное, получение списка, очистка
- `/api/orders` — создание заказа, просмотр своих заказов, управление статусами (менеджер / админ)
- `/api/leads` — заявки с сайта (тест-драйв / обратная связь) и конвертация в заказ
