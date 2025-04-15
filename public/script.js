// Загрузка темы из cookie
function loadTheme() {
    const themeCookie = document.cookie.split('; ')
        .find(row => row.startsWith('theme='));

    if (themeCookie) {
        const theme = themeCookie.split('=')[1];
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Обновление данных
async function updateData() {
    const response = await fetch('/api/data');
    const data = await response.json();
   
    document.getElementById('data-container').innerHTML = `
        <h3>Данные API</h3>
        <p><strong>Источник:</strong> ${data.source}</p>
        <p><strong>Время генерации:</strong> ${new
    Date(data.timestamp).toLocaleTimeString()}</p>
        <pre>${JSON.stringify(data.items, null, 2)}</pre>
    `;
}

// Смена темы
document.getElementById('toggle-theme').addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
   
    document.body.setAttribute('data-theme', newTheme);
   
    fetch('/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
    });

    console.log(`Тема изменена на ${newTheme}`);
});

// Кнопка обновления данных
document.getElementById('refresh-data').addEventListener('click', updateData);

// Инициализация
loadTheme();
updateData();

// Автообновление каждые 5 секунд
setInterval(updateData, 5000);

