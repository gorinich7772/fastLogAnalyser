document.getElementById('submitBtn').addEventListener('click', handleLogAnalysis);

const ICONS = {
    loading: `<div class="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 spinner"></div>`,
    success: `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    error: `<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
};

function updateStatus(stage, state, message) {
    const statusEl = document.getElementById(`${stage}-status`);
    const contentEl = document.getElementById(`${stage}-content`);

    let icon = ICONS[state];
    let textColor = 'text-gray-700';
    if (state === 'success') textColor = 'text-green-700';
    if (state === 'error') textColor = 'text-red-700';

    statusEl.innerHTML = `${icon}<span class="ml-3 font-medium ${textColor}">${message}</span>`;

    // Прячем контент по умолчанию, будем показывать его отдельно
    contentEl.classList.add('hidden');
}

// --- НОВАЯ, ПОЛНАЯ И ИСПРАВЛЕННАЯ ФУНКЦИЯ ---
function displayAnomalies(anomalies) {
    const contentEl = document.getElementById('anomalies-content');
    const accordion = document.getElementById('anomaliesAccordion');
    accordion.innerHTML = '';

    if (!anomalies || anomalies.length === 0) {
        // Если аномалий нет, контентный блок остается скрытым
        return;
    }

    // А если есть - показываем контентный блок
    contentEl.classList.remove('hidden');

    anomalies.forEach((anomaly, index) => {
        const isError = anomaly.level === 'ERROR';
        const levelClass = isError ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
        const borderClass = isError ? 'border-red-200' : 'border-yellow-300';

        const item = document.createElement('div');
        item.className = `border ${borderClass} rounded-lg`;
        item.innerHTML = `
            <button class="w-full text-left p-3 ${levelClass} font-semibold flex justify-between items-center rounded-t-lg">
                <span>${index + 1}. [${anomaly.timestamp}] ${anomaly.level}</span>
                <svg class="w-6 h-6 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="accordion-content bg-white p-4 rounded-b-lg">
                <p class="font-mono text-sm break-all"><strong>Component:</strong> ${anomaly.component || 'N/A'}</p>
                <strong class="block mt-2">Сообщение:</strong>
                <p class="ai-response p-2 bg-gray-50 rounded mt-1">${anomaly.message || 'No message'}</p>
                ${anomaly.exception ? `
                <strong class="block mt-2">Исключение:</strong>
                <pre class="ai-response p-2 bg-red-50 text-red-600 rounded mt-1">${JSON.stringify(anomaly.exception, null, 2)}</pre>` : ''}
            </div>
        `;
        accordion.appendChild(item);
    });

    accordion.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('svg');
            const isOpening = !content.style.maxHeight || content.style.maxHeight === "0px";

            icon.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';
            content.style.maxHeight = isOpening ? content.scrollHeight + "px" : "0px";
        });
    });
}


async function handleLogAnalysis() {
    const fileInput = document.getElementById('logFile');
    const submitBtn = document.getElementById('submitBtn');

    if (!fileInput.files[0]) {
        alert('Пожалуйста, выберите файл лога.');
        return;
    }

    // 1. Reset and Prepare UI
    submitBtn.disabled = true;
    fileInput.disabled = true;
    document.getElementById('resultsContainer').classList.remove('hidden');
    document.getElementById('metaInfo').classList.add('hidden');

    updateStatus('anomalies', 'loading', 'Шаг 1: Поиск аномалий...');
    updateStatus('solution', 'loading', 'Шаг 2: Ожидание...');
    document.getElementById('solution-status').innerHTML = ''; // Clear solution status

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        // --- STAGE 1: FIND ANOMALIES ---
        const analyzeResponse = await fetch('/api/logs/analyze', { method: 'POST', body: formData });
        const analysisResult = await analyzeResponse.json();

        if (!analyzeResponse.ok) {
            throw new Error(`[Этап 1] ${analysisResult.detail || 'Неизвестная ошибка сервера'}`);
        }

        const anomalies = analysisResult.anomalies;

        // --- STAGE 1 SUCCESS ---
        updateStatus('anomalies', 'success', `Найдено аномалий: ${anomalies.length}`);
        document.getElementById('uuid-val').textContent = analysisResult.uuid;
        // Используем свойство date_time для Python и dateTime для Java для универсальности
        document.getElementById('datetime-val').textContent = new Date(analysisResult.date_time || analysisResult.dateTime).toLocaleString('ru-RU');
        document.getElementById('metaInfo').classList.remove('hidden');

        // ВЫЗЫВАЕМ ОБНОВЛЕННУЮ ФУНКЦИЮ ОТРИСОВКИ
        displayAnomalies(anomalies);

        // --- ИМЕННО ЭТОТ БЛОК ТЕПЕРЬ БУДЕТ РАБОТАТЬ КОРРЕКТНО ---
        if (!anomalies || anomalies.length === 0) {
            updateStatus('solution', 'success', 'Решение не требуется, так как аномалий нет.');
            return; // Завершаем выполнение, если аномалий нет
        }

        // --- STAGE 2: FIND SOLUTION ---
        updateStatus('solution', 'loading', 'Шаг 2: Поиск решения...');
        const solveRequestPayload = { uuid: analysisResult.uuid, anomalies };
        const solveResponse = await fetch('/api/logs/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solveRequestPayload)
        });
        const solutionResult = await solveResponse.json();

        if (!solveResponse.ok) {
            throw new Error(`[Этап 2] ${solutionResult.detail || 'Неизвестная ошибка сервера'}`);
        }

        // --- STAGE 2 SUCCESS ---
        updateStatus('solution', 'success', 'Решение найдено.');
        // Показываем контентный блок для решения
        const solutionContent = document.getElementById('solution-content');
        solutionContent.classList.remove('hidden');
        document.getElementById('solutionResult').textContent = solutionResult.answer;

    } catch (error) {
        // --- ERROR HANDLING ---
        const message = error.message || 'Произошла непредвиденная ошибка';
        if (message.startsWith('[Этап 1]')) {
            updateStatus('anomalies', 'error', message);
            updateStatus('solution', 'error', 'Этап пропущен из-за ошибки.');
        } else {
            // Ошибка произошла на 2 этапе, первый завершился успешно
            updateStatus('solution', 'error', message);
        }
        console.error(error);
    } finally {
        submitBtn.disabled = false;
        fileInput.disabled = false;
    }
}