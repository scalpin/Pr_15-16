const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const cacheDir = path.join(__dirname, 'cache');

// Создаем папку для кэша, если её нет
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// Функция для кэширования данных в файлы
function getCachedData(key, ttlSeconds = 30) {
    const cacheFile = path.join(cacheDir, `${key}.json`);
    // Если файл существует и не устарел
    if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const now = new Date().getTime();
        const fileAge = (now - stats.mtimeMs) / 1000;
        if (fileAge < ttlSeconds) {
            const cachedData = fs.readFileSync(cacheFile, 'utf-8');
            return JSON.parse(cachedData);
        }
    }

    // Генерируем новые данные
    const newData = {
        items: [1, 2, 3],
        timestamp: Date.now(),
        source: 'Файловый кэш'
    };

    // Сохраняем в файл
    fs.writeFileSync(cacheFile, JSON.stringify(newData));

    // Удаляем файл после истечения TTL
    setTimeout(() => {
        if (fs.existsSync(cacheFile)) {
            fs.unlinkSync(cacheFile);
        }
    }, ttlSeconds * 1000);
    return newData;
}

// API для получения данных
app.get('/api/data', (req, res) => {
    const data = getCachedData('api_data');
    
    const theme = req.cookies.theme;
    if (theme === 'dark') {
        data.source = 'Файловый кэш (тёмная тема)';
    } else if (theme === 'light') {
        data.source = 'Файловый кэш (светлая тема)';
    } 
    res.json(data);
});

// API для сохранения темы
app.post('/theme', (req, res) => {
    const theme = req.body.theme;
        res.cookie('theme', theme, {
        maxAge: 86400000, // 1 день
        sameSite: 'strict'
    });
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
    console.log('Кэш хранится в папке:', cacheDir);
});


// Дополнительно
app.use((req, res, next) => {
    if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
        res.set('Cache-Control', 'public, max-age=86400');
    }
    next();
});

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
    console.error('Необработанная ошибка:', err);
});
    