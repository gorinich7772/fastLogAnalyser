document.addEventListener('DOMContentLoaded', () => {
    // --- ОБЪЕКТ С ПЕРЕВОДАМИ ---
    const translations = {
        en: {
            title: "Log Analyzer Pro v3.0",
            main_title: "Log Analyzer Pro",
            subtitle: "Two-step intelligent log analysis",
            analyze_button: "Analyze",
            request_details: "Request Details",
            uuid_label: "UUID:",
            time_label: "Time:",
            footer_text: "Software created with the participation of: Filipp Molotov, Kirill Zubov, Roman Korovyakov",
            alert_select_file: "Please select a log file.",
            status_finding_anomalies: "Step 1: Searching for anomalies...",
            status_waiting: "Step 2: Waiting...",
            status_anomalies_found: "Anomalies found:",
            status_solution_not_needed: "No solution required as there are no anomalies.",
            status_finding_solution: "Step 2: Searching for solution...",
            status_solution_found: "Solution found.",
            error_stage1: "[Stage 1]",
            error_stage2: "[Stage 2]",
            error_unknown: "Unknown server error",
            error_unexpected: "An unexpected error occurred",
            error_skipped: "Step skipped due to an error.",
            component_label: "Component:",
            message_label: "Message:",
            exception_label: "Exception:",
            anomaly_level: "Anomaly Level"
        },
        ru: {
            title: "Log Analyzer Pro v3.0",
            main_title: "Log Analyzer Pro",
            subtitle: "Двухэтапный интеллектуальный анализ логов",
            analyze_button: "Анализировать",
            request_details: "Детали запроса",
            uuid_label: "UUID:",
            time_label: "Время:",
            footer_text: "ПО создано при участии: Молотов Филипп, Зубов Кирилл, Коровяков Роман",
            alert_select_file: "Пожалуйста, выберите файл лога.",
            status_finding_anomalies: "Шаг 1: Поиск аномалий...",
            status_waiting: "Шаг 2: Ожидание...",
            status_anomalies_found: "Найдено аномалий:",
            status_solution_not_needed: "Решение не требуется, так как аномалий нет.",
            status_finding_solution: "Шаг 2: Поиск решения...",
            status_solution_found: "Решение найдено.",
            error_stage1: "[Этап 1]",
            error_stage2: "[Этап 2]",
            error_unknown: "Неизвестная ошибка сервера",
            error_unexpected: "Произошла непредвиденная ошибка",
            error_skipped: "Этап пропущен из-за ошибки.",
            component_label: "Компонент:",
            message_label: "Сообщение:",
            exception_label: "Исключение:",
            anomaly_level: "Уровень аномалии"
        }
    };

    let currentLanguage = 'ru';

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА ---
    const langToggle = document.getElementById('language-toggle');

    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLanguage = lang;
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);

        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
    }

    langToggle.addEventListener('change', (event) => {
        const newLang = event.target.checked ? 'ru' : 'en';
        setLanguage(newLang);
    });

    // --- ИНИЦИАЛИЗАЦИЯ ЯЗЫКА ПРИ ЗАГРУЗКЕ ---
    const savedLang = localStorage.getItem('language') || 'ru';
    langToggle.checked = savedLang === 'ru';
    setLanguage(savedLang);

    // --- ОСНОВНОЙ СКРИПТ АНАЛИЗА ---
    document.getElementById('submitBtn').addEventListener('click', handleLogAnalysis);

    const ICONS = {
        // --- ЗАМЕТНЫЙ СПИННЕР ---
        loading: `<div class="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 spinner"></div>`,
        success: `<svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        error: `<svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };

    function updateStatus(stage, state, message) {
        const statusEl = document.getElementById(`${stage}-status`);
        const contentEl = document.getElementById(`${stage}-content`);

        let icon = ICONS[state];
        let textColor = 'text-gray-700';
        if (state === 'success') textColor = 'text-green-700';
        if (state === 'error') textColor = 'text-red-700';

        statusEl.innerHTML = `${icon}<span class="ml-3 font-medium ${textColor}">${message}</span>`;
        contentEl.classList.add('hidden');
    }

    function displayAnomalies(anomalies) {
        const contentEl = document.getElementById('anomalies-content');
        const accordion = document.getElementById('anomaliesAccordion');
        accordion.innerHTML = '';

        if (!anomalies || anomalies.length === 0) {
            return;
        }
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
                    <p class="font-mono text-sm break-all"><strong>${translations[currentLanguage].component_label}</strong> ${anomaly.component || 'N/A'}</p>
                    <strong class="block mt-2">${translations[currentLanguage].message_label}</strong>
                    <p class="ai-response p-2 bg-gray-50 rounded mt-1">${anomaly.message || 'No message'}</p>
                    ${anomaly.exception ? `
                    <strong class="block mt-2">${translations[currentLanguage].exception_label}</strong>
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
        const lang = currentLanguage; // Захватываем текущий язык для этого анализа

        if (!fileInput.files[0]) {
            alert(translations[lang].alert_select_file);
            return;
        }

        submitBtn.disabled = true;
        fileInput.disabled = true;
        document.getElementById('resultsContainer').classList.remove('hidden');
        document.getElementById('metaInfo').classList.add('hidden');

        updateStatus('anomalies', 'loading', translations[lang].status_finding_anomalies);
        document.getElementById('solution-column').classList.remove('hidden');
        updateStatus('solution', 'loading', translations[lang].status_waiting);


        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const analyzeResponse = await fetch('/api/logs/analyze', { method: 'POST', body: formData });
            const analysisResult = await analyzeResponse.json();

            if (!analyzeResponse.ok) {
                throw new Error(`${translations[lang].error_stage1} ${analysisResult.detail || translations[lang].error_unknown}`);
            }

            const anomalies = analysisResult.anomalies;
            updateStatus('anomalies', 'success', `${translations[lang].status_anomalies_found} ${anomalies.length}`);
            document.getElementById('uuid-val').textContent = analysisResult.uuid;
            document.getElementById('datetime-val').textContent = new Date(analysisResult.date_time || analysisResult.dateTime).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
            document.getElementById('metaInfo').classList.remove('hidden');
            displayAnomalies(anomalies);

            if (!anomalies || anomalies.length === 0) {
                updateStatus('solution', 'success', translations[lang].status_solution_not_needed);
                return;
            }

            updateStatus('solution', 'loading', translations[lang].status_finding_solution);
            const solveRequestPayload = { uuid: analysisResult.uuid, anomalies };
            const solveResponse = await fetch('/api/logs/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(solveRequestPayload)
            });
            const solutionResult = await solveResponse.json();

            if (!solveResponse.ok) {
                throw new Error(`${translations[lang].error_stage2} ${solutionResult.detail || translations[lang].error_unknown}`);
            }

            updateStatus('solution', 'success', translations[lang].status_solution_found);
            const solutionContent = document.getElementById('solution-content');
            solutionContent.classList.remove('hidden');
            document.getElementById('solutionResult').textContent = solutionResult.answer;

        } catch (error) {
            const message = error.message || translations[lang].error_unexpected;
            if (message.startsWith(translations[lang].error_stage1)) {
                updateStatus('anomalies', 'error', message);
                updateStatus('solution', 'error', translations[lang].error_skipped);
            } else {
                updateStatus('solution', 'error', message);
            }
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            fileInput.disabled = false;
        }
    }
});