// AI konfiguratsiyasi
const AI_CONFIG = {
    operationTypes: ['debet', 'kredit', 'aktiv', 'passiv', 'dekret'],
    keywords: {
        debet: ['kirim', 'daromad', 'tushum', 'salom', 'slim', 'salaam', 'sala', 'debed', 'debit', 'income', 'kirish', 'tushgan', 'pul'],
        kredit: ['chiqim', 'xarajat', 'qarz', 'kredet', 'kredit', 'credit', 'expense', 'chiqish', 'sarflandi'],
        aktiv: ['mol-mulk', 'aktivlar', 'mablag', 'aktif', 'asset', 'property', 'boylik'],
        passiv: ['qarzlar', 'passivlar', 'majburiyat', 'pasiv', 'liability', 'debt', 'qarz'],
        dekret: ['dekret', 'homiladorlik', 'tug\'ruq', 'dekrit', 'maternity', 'leave', 'bola']
    },
    maxPassivThreshold: 1000000,
    minBalanceThreshold: 0,
    aboutAbduraxmon: 'Abduraxmon Intelligence – bu Abduraxmon tomonidan yaratilgan dunyo miqyosidagi loyiha! Abduraxmon – o‘z ishiga sadoqatli, ijodiy va professional dasturchi. U buxgalteriya va moliyaviy hisob-kitoblarni soddalashtirish uchun ushbu tizimni ishlab chiqdi. Abduraxmonning maqsadi – har bir foydalanuvchiga moliyaviy erkinlikka erishishda yordam berish. Uning tufayli bu sayt eng zamonaviy, qulay va aqlli platformaga aylandi. Abduraxmon – haqiqiy innovator!',
    maxManageAttempts: 5,
    attemptRecoveryInterval: 3 * 60 * 1000, // 3 daqiqa
    badWords: ['yomon', 'axmoq', 'so‘kinish', 'fuck', 'shit', 'damn', 'stupid', 'idiot', 'bad'],
    suggestions: [
        'Yangi operatsiya qo‘shing!',
        'Kalkulyatorda foiz hisoblang!',
        'Hisobotlarni tekshirib, moliyangizni tahlil qiling!',
        'AI yordamchisidan maslahat so‘rang!',
        'Abduraxmon haqida ko‘proq bilib oling!'
    ]
};

// Levenshtein masofasi (xato tuzatish)
function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[b.length][a.length];
}

// AI: Eng yaqin operatsiya turini topish
function findClosestOperationType(input) {
    input = input.toLowerCase().trim();
    let minDistance = Infinity;
    let closestType = AI_CONFIG.operationTypes[0];

    for (const type of AI_CONFIG.operationTypes) {
        const distance = levenshteinDistance(input, type);
        if (distance < minDistance) {
            minDistance = distance;
            closestType = type;
        }
        for (const keyword of AI_CONFIG.keywords[type]) {
            const keywordDistance = levenshteinDistance(input, keyword);
            if (keywordDistance < minDistance) {
                minDistance = keywordDistance;
                closestType = type;
            }
        }
    }

    return minDistance <= 7 ? closestType : null;
}

// AI: Tavsifdan operatsiya turini taxmin qilish
function guessOperationTypeFromDescription(description) {
    description = description.toLowerCase().trim();
    for (const type of AI_CONFIG.operationTypes) {
        for (const keyword of AI_CONFIG.keywords[type]) {
            if (description.includes(keyword)) {
                return type;
            }
        }
    }
    return null;
}

// AI: So‘kinishlarni tekshirish
function checkBadWords(query) {
    query = query.toLowerCase().trim();
    for (const badWord of AI_CONFIG.badWords) {
        if (query.includes(badWord)) {
            return true;
        }
    }
    return false;
}

// AI: Tasodifiy maslahat
function getRandomSuggestion() {
    const index = Math.floor(Math.random() * AI_CONFIG.suggestions.length);
    return AI_CONFIG.suggestions[index];
}

// AI: Moliyaviy maslahatlar
function generateFinancialAdvice(transactions) {
    let totalPassiv = 0, totalAktiv = 0, monthlyIncome = 0, profitLoss = 0;
    const now = new Date();
    const currentMonth = now.getMonth();

    transactions.forEach(t => {
        if (t.type === 'passiv') totalPassiv += t.amount;
        if (t.type === 'aktiv') totalAktiv += t.amount;
        if (t.type === 'debet' && new Date(t.date).getMonth() === currentMonth) {
            monthlyIncome += t.amount;
        }
        if (t.type === 'debet') profitLoss += t.amount;
        if (t.type === 'kredit') profitLoss -= t.amount;
    });

    const balance = totalAktiv - totalPassiv;
    const advice = [];

    if (totalPassiv > AI_CONFIG.maxPassivThreshold) {
        advice.push('Ogohlantirish: Passivlaringiz juda yuqori! Qarzlarni kamaytirish uchun xarajatlarni qayta ko‘rib chiqing.');
    }
    if (balance < AI_CONFIG.minBalanceThreshold) {
        advice.push('Diqqat: Balansingiz salbiy! Daromadni ko‘paytirishga e’tibor bering.');
    }
    if (monthlyIncome > 0) {
        advice.push(`Ajoyib! Bu oyda ${monthlyIncome.toFixed(2)} daromad kiritdingiz. Investitsiya imkoniyatlarini o‘rganing!`);
    }
    if (profitLoss > 0) {
        advice.push(`Foyda: ${profitLoss.toFixed(2)}. Yaxshi ish! Yangi daromad manbalarini topishga harakat qiling.`);
    } else if (profitLoss < 0) {
        advice.push(`Zarar: ${Math.abs(profitLoss).toFixed(2)}. Xarajatlarni optimallashtirish uchun AI yordamchisidan maslahat so‘rang.`);
    }

    return advice.length > 0 ? advice.join(' ') : 'Hozircha moliyaviy maslahat yo‘q. Operatsiyalarni kiritishdan boshlang!';
}

// AI: Savol-javob va suggestion
function processAIQuery() {
    const query = document.getElementById('aiQuery').value.toLowerCase().trim();
    let response = '';
    let suggestion = getRandomSuggestion();

    // So‘kinish tekshiruvi
    if (checkBadWords(query)) {
        response = 'Iltimos, xushmuomala bo‘ling! Bu tizim sizga eng yaxshi yordamni taqdim etish uchun yaratilgan. Savolingizni muloyim tarzda yozing.';
        suggestion = 'Masalan, "sayt qanday ishlaydi?" yoki "debet nima?" deb so‘rang.';
    }
    // Matematik savollar
    else if (query.match(/[\d+\-*/=()]/)) {
        try {
            const cleanQuery = query.replace(/[^0-9+\-*/(). ]/g, '');
            const result = eval(cleanQuery); // Xavfsiz matematik hisoblash
            response = `Natija: ${result}`;
            suggestion = 'Yana matematik savollar so‘rashingiz mumkin yoki buxgalteriya hisob-kitoblarini sinab ko‘ring!';
        } catch (e) {
            response = 'Matematik ifodada xato bor. Iltimos, to‘g‘ri yozing (masalan, 2 + 2 yoki 5 * (3 + 2))!';
            suggestion = 'Oddiy ifodadan boshlang, masalan, 5 * 3.';
        }
    }
    // Buxgalteriya savollari
    else if (query.includes('debet') || query.includes('kredit') || query.includes('aktiv') || query.includes('passiv') || query.includes('dekret')) {
        const type = findClosestOperationType(query) || guessOperationTypeFromDescription(query);
        if (type) {
            response = `${type.charAt(0).toUpperCase() + type.slice(1)} haqida ma’lumot: `;
            if (type === 'debet') response += 'Debet – bu sizning daromadingiz yoki kirim hisoblanadi. Masalan, sotuvdan tushgan pul yoki ish haqi.';
            else if (type === 'kredit') response += 'Kredit – bu xarajat yoki chiqim hisoblanadi. Masalan, qarz to‘lovi yoki xaridlar.';
            else if (type === 'aktiv') response += 'Aktiv – bu sizning mol-mulkingiz yoki qimmatbaho resurslaringiz. Masalan, uy, mashina yoki investitsiyalar.';
            else if (type === 'passiv') response += 'Passiv – bu qarzlar yoki moliyaviy majburiyatlar. Masalan, bank krediti yoki to‘lanmagan hisoblar.';
            else if (type === 'dekret') response += 'Dekret – homiladorlik yoki tug‘ruq bilan bog‘liq to‘lovlar, masalan, oylik nafaqa.';
            suggestion = `Yangi ${type} operatsiyasini qo‘shish uchun formani to‘ldiring yoki ko‘proq ma’lumot so‘rang!`;
        } else {
            response = 'Buxgalteriya termini aniqlanmadi. Iltimos, aniqroq yozing!';
            suggestion = 'Masalan, "debet nima?" yoki "aktiv qanday hisoblanadi?" deb so‘rang.';
        }
    }
    // Abduraxmon haqida
    else if (query.includes('kim yasagan') || query.includes('saytni kim') || query.includes('abduraxmon') || query.includes('ha') || query.includes('go next') || query.includes('nima')) {
        response = AI_CONFIG.aboutAbduraxmon;
        suggestion = 'Abduraxmonning ajoyib ishini davom ettirish uchun operatsiyalarni kiritishdan boshlang!';
    }
    // Sayt qanday ishlaydi
    else if (query.includes('qanday ishlaydi') || query.includes('saytni qanday') || query.includes('nima qilish kerak')) {
        response = 'Abduraxmon Intelligence – buxgalteriya va moliyaviy hisob-kitoblarni avtomatlashtirish uchun eng zamonaviy platforma! Quyidagi qadamlarni bajaring:\n1. Tizimga kirish uchun foydalanuvchi nomi va parolni kiriting.\n2. Yangi operatsiya qo‘shish uchun tur, summa, tavsif va kategoriyani to‘ldiring.\n3. Kalkulyatorda foiz, dekret yoki soliq hisoblang.\n4. Hisobotlarda moliyaviy holatingizni kuzating.\n5. AI yordamchisidan maslahat so‘rang!';
        suggestion = 'Yangi operatsiya qo‘shib, moliyaviy tahlilni boshlang!';
    }
    // Hayotiy savollar
    else if (query.includes('salom') || query.includes('slim') || query.includes('salaam') || query.includes('sala')) {
        response = 'Salom! Abduraxmon Intelligence tizimiga xush kelibsiz! Bu tizim sizning moliyaviy hisoblaringizni aqlli boshqaradi. Nima qilmoqchisiz?';
        suggestion = 'Operatsiya qo‘shish yoki kalkulyatordan boshlang!';
    }
    // Umumiy savollar
    else {
        const closestType = findClosestOperationType(query);
        if (closestType) {
            response = `Siz "${closestType}" haqida so‘rayapsizmi? Iltimos, aniqroq ma’lumot bering yoki operatsiya qo‘shish uchun formani to‘ldiring.`;
            suggestion = 'Operatsiya formasi orqali yangi hisob-kitob qo‘shing!';
        } else {
            response = 'Savolingizni to‘liq tushunmadim, lekin baribir yordam beraman! Iltimos, aniqroq yozing yoki quyidagi maslahatdan foydalaning.';
            suggestion = getRandomSuggestion();
        }
    }

    document.getElementById('aiResponse').textContent = response;
    document.getElementById('aiSuggestion').textContent = suggestion;
    showNotification(`Javob: ${response}\nMaslahat: ${suggestion}`, 'success');
}

// Database
class Database {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || {};
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || {};
        this.attempts = JSON.parse(localStorage.getItem('manageAttempts')) || {};
    }

    addUser(username, data) {
        this.users[username] = data;
        this.saveUsers();
    }

    getUser(username) {
        return this.users[username] || null;
    }

    blockUser(username, status, banUntil = null) {
        if (this.users[username]) {
            this.users[username].blocked = status;
            this.users[username].banUntil = banUntil;
            this.saveUsers();
        }
    }

    addTransaction(username, transaction) {
        if (!this.transactions[username]) this.transactions[username] = [];
        this.transactions[username].push(transaction);
        this.saveTransactions();
    }

    getTransactions(username) {
        return this.transactions[username] || [];
    }

    clearTransactions(username) {
        if (this.transactions[username]) {
            this.transactions[username] = [];
            this.saveTransactions();
        }
    }

    setManageAttempts(username, attempts) {
        this.attempts[username] = { count: attempts, lastAttempt: Date.now() };
        this.saveAttempts();
    }

    getManageAttempts(username) {
        return this.attempts[username] || { count: AI_CONFIG.maxManageAttempts, lastAttempt: 0 };
    }

    recoverAttempts() {
        const now = Date.now();
        Object.keys(this.attempts).forEach(username => {
            const attempts = this.attempts[username];
            const elapsed = now - attempts.lastAttempt;
            const recovered = Math.floor(elapsed / AI_CONFIG.attemptRecoveryInterval);
            if (recovered > 0) {
                attempts.count = Math.min(AI_CONFIG.maxManageAttempts, attempts.count + recovered);
                attempts.lastAttempt = now;
            }
        });
        this.saveAttempts();
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    saveAttempts() {
        localStorage.setItem('manageAttempts', JSON.stringify(this.attempts));
    }
}

const db = new Database();

// Auth
const SYSTEM_PASSWORD = 'PASSWORDABDDURAXMON';

function login(username, password, rememberMe) {
    if (!username.trim()) {
        showNotification('Xato: Foydalanuvchi nomini kiriting!', 'error');
        return false;
    }

    if (password !== SYSTEM_PASSWORD) {
        showNotification('Xato: Noto‘g‘ri parol! Qayta urinib ko‘ring.', 'error');
        return false;
    }

    const user = db.getUser(username);
    if (user && user.blocked) {
        const now = Date.now();
        if (user.banUntil && now < user.banUntil) {
            const remaining = Math.ceil((user.banUntil - now) / (1000 * 3600));
            showNotification(`Xato: Hisobingiz ${remaining} soatga bloklangan!`, 'error');
            return false;
        } else if (user.banUntil) {
            db.blockUser(username, false, null); // Ban muddati tugagan
        }
    }

    if (!user) {
        db.addUser(username, { blocked: false, createdAt: new Date(), activity: 0, banUntil: null });
        db.setManageAttempts(username, AI_CONFIG.maxManageAttempts);
    }

    localStorage.setItem('currentUser', username);
    if (rememberMe) {
        localStorage.setItem('rememberedUser', username);
    } else {
        localStorage.removeItem('rememberedUser');
    }

    showNotification('Tizimga muvaffaqiyatli kirdingiz! Moliyaviy muvaffaqiyat sari birinchi qadam!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
    return true;
}

function logout() {
    localStorage.removeItem('currentUser');
    showNotification('Tizimdan chiqdingiz! Yana keling, Abduraxmon sizni kutmoqda!', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

function checkAuth() {
    const username = localStorage.getItem('currentUser');
    if (!username) {
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    } else {
        document.getElementById('currentUser').textContent = username;
        db.recoverAttempts();
        updateManageAttempts();
    }
}

// Remember Me
function loadRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.value = rememberedUser;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

// Notifications
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.classList.remove('hidden', 'bg-blue-500', 'bg-red-500');
    notification.classList.add(type === 'success' ? 'bg-blue-500' : 'bg-red-500', 'show');
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
    }, 5000);
}

// Utils
function formatDate(date) {
    return new Date(date).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function validateInput(amount, description, category) {
    if (!amount || isNaN(amount) || amount <= 0) {
        showNotification('Xato: To‘g‘ri summa kiriting!', 'error');
        return false;
    }
    if (!description.trim()) {
        showNotification('Xato: Tavsif kiriting!', 'error');
        return false;
    }
    if (!category.trim()) {
        showNotification('Xato: Kategoriya kiriting!', 'error');
        return false;
    }
    return true;
}

// Calculator
function calculateFoiz(amount, foiz) {
    if (!foiz || !amount) return 0;
    const n = 12; // Oylik foiz
    const t = 1;  // 1 yil
    return amount * Math.pow(1 + foiz / (100 * n), n * t) - amount;
}

function calculateDekret(amount, months) {
    if (!amount || !months) return 0;
    const monthlyPayment = amount * 0.35;
    const bonus = months > 6 ? amount * 0.05 : 0;
    const riskFactor = months > 12 ? 0.02 : 0;
    return (monthlyPayment * months) + bonus - (amount * riskFactor);
}

function calculateTax(amount, taxRate) {
    if (!amount || !taxRate) return 0;
    const baseTax = amount * (taxRate / 100);
    const additionalTax = amount > 1000000 ? amount * 0.08 : 0;
    return baseTax + additionalTax;
}

function calculateProfitLoss(transactions) {
    let profitLoss = 0;
    transactions.forEach(t => {
        if (t.type === 'debet') profitLoss += t.amount;
        if (t.type === 'kredit') profitLoss -= t.amount;
    });
    return profitLoss;
}

function calculateActivity(transactions) {
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentTransactions = transactions.filter(t => new Date(t.date).getTime() > oneMonthAgo);
    return Math.min((recentTransactions.length / 10) * 100, 100).toFixed(2);
}

// Transactions
function addTransaction() {
    const username = localStorage.getItem('currentUser');
    if (!username) {
        showNotification('Xato: Avval tizimga kiring!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }

    let type = document.getElementById('operationType').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const date = new Date();

    if (!validateInput(amount, description, category)) return;

    type = findClosestOperationType(type) || guessOperationTypeFromDescription(description) || 'debet';
    showNotification(`Operatsiya turi "${type}" sifatida aniqlandi.`, 'success');

    const transaction = { type, amount, description, category, date };
    db.addTransaction(username, transaction);

    const user = db.getUser(username);
    user.activity = calculateActivity(db.getTransactions(username));
    db.addUser(username, user);

    showNotification('Operatsiya muvaffaqiyatli qo‘shildi! Ajoyib, davom eting!', 'success');
    updateReport();
    updateProfile();
    updateAIdvice();
    clearInputs();
}

function updateReport(tab = 'debet') {
    const username = localStorage.getItem('currentUser');
    const reportBody = document.getElementById('reportBody');
    if (!reportBody) return;
    reportBody.innerHTML = '';

    let totalDebet = 0, totalKredit = 0, totalAktiv = 0, totalPassiv = 0, monthlyIncome = 0;
    const now = new Date();
    const currentMonth = now.getMonth();

    const transactions = db.getTransactions(username).filter(t => t.type === tab || tab === 'all');

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-2">${transaction.type}</td>
            <td class="border p-2">${transaction.amount.toFixed(2)}</td>
            <td class="border p-2">${transaction.description}</td>
            <td class="border p-2">${transaction.category}</td>
            <td class="border p-2">${formatDate(transaction.date)}</td>
        `;
        reportBody.appendChild(row);

        if (transaction.type === 'debet') totalDebet += transaction.amount;
        if (transaction.type === 'kredit') totalKredit += transaction.amount;
        if (transaction.type === 'aktiv') totalAktiv += transaction.amount;
        if (transaction.type === 'passiv') totalPassiv += transaction.amount;
        if (transaction.type === 'debet' && new Date(transaction.date).getMonth() === currentMonth) {
            monthlyIncome += transaction.amount;
        }
    });

    const balance = totalAktiv - totalPassiv;
    const profitLoss = calculateProfitLoss(db.getTransactions(username));

    document.getElementById('totalDebet').textContent = totalDebet.toFixed(2);
    document.getElementById('totalKredit').textContent = totalKredit.toFixed(2);
    document.getElementById('totalAktiv').textContent = totalAktiv.toFixed(2);
    document.getElementById('totalPassiv').textContent = totalPassiv.toFixed(2);
    document.getElementById('monthlyIncome').textContent = monthlyIncome.toFixed(2);
    document.getElementById('profitLossSummary').textContent = profitLoss.toFixed(2);
    document.getElementById('balance').textContent = balance.toFixed(2);

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tab)) {
            btn.classList.add('active');
        }
    });
}

function showTab(tab) {
    updateReport(tab);
}

function clearInputs() {
    document.getElementById('operationType').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('category').value = '';
}

// Profile
function updateProfile() {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    const userTransactions = db.getTransactions(username);
    let totalAktiv = 0, totalPassiv = 0;

    userTransactions.forEach(t => {
        if (t.type === 'aktiv') totalAktiv += t.amount;
        if (t.type === 'passiv') totalPassiv += t.amount;
    });

    const user = db.getUser(username);
    const activity = calculateActivity(userTransactions);

    document.getElementById('profileName').textContent = username;
    document.getElementById('profileTransactions').textContent = userTransactions.length;
    document.getElementById('profileAktiv').textContent = totalAktiv.toFixed(2);
    document.getElementById('profilePassiv').textContent = totalPassiv.toFixed(2);
    document.getElementById('profileActivity').textContent = activity + '%';
}

// AI Advice
function updateAIdvice() {
    const username = localStorage.getItem('currentUser');
    const advice = generateFinancialAdvice(db.getTransactions(username));
    document.getElementById('aiAdvice').textContent = advice;
}

// Calculator
function calculateAll() {
    const foiz = parseFloat(document.getElementById('foiz').value);
    const foizAmount = parseFloat(document.getElementById('foizAmount').value);
    const dekretMonths = parseInt(document.getElementById('dekretMonths').value);
    const taxRate = parseFloat(document.getElementById('taxRate').value);

    const foizResult = calculateFoiz(foizAmount, foiz);
    const dekretResult = calculateDekret(foizAmount, dekretMonths);
    const taxResult = calculateTax(foizAmount, taxRate);
    const profitLoss = calculateProfitLoss(db.getTransactions(localStorage.getItem('currentUser')));

    document.getElementById('foizResult').textContent = foizResult.toFixed(2);
    document.getElementById('dekretResult').textContent = dekretResult.toFixed(2);
    document.getElementById('taxResult').textContent = taxResult.toFixed(2);
    document.getElementById('profitLoss').textContent = profitLoss.toFixed(2);

    showNotification('Hisob-kitoblar muvaffaqiyatli amalga oshirildi! Ajoyib, moliyaviy muvaffaqiyat sari davom eting!', 'success');
}

// Manage Panel
function showManagePanel() {
    const panel = document.getElementById('managePanel');
    if (!panel) return;
    panel.classList.toggle('hidden');
    panel.classList.toggle('show');
}

function accessManage() {
    const username = localStorage.getItem('currentUser');
    const password = document.getElementById('managePassword').value;
    const attempts = db.getManageAttempts(username);

    if (attempts.count <= 0) {
        showNotification('Urinishlar tugadi! Iltimos, 3 daqiqa kuting.', 'error');
        return;
    }

    if (password !== SYSTEM_PASSWORD) {
        attempts.count--;
        db.setManageAttempts(username, attempts.count);
        showNotification(`Xato parol! ${attempts.count} urinish qoldi.`, 'error');
        updateManageAttempts();
        return;
    }

    showNotification('Sozlamalar paneliga kirdingiz! Ajoyib, endi sozlamalarni boshqaring!', 'success');
    db.setManageAttempts(username, AI_CONFIG.maxManageAttempts);
    updateManageAttempts();
}

function updateManageAttempts() {
    const username = localStorage.getItem('currentUser');
    const attempts = db.getManageAttempts(username);
    const manageAttemptsElement = document.getElementById('manageAttempts');
    if (manageAttemptsElement) {
        manageAttemptsElement.textContent = attempts.count;
    }
}

function clearTransactions() {
    const username = localStorage.getItem('currentUser');
    const attempts = db.getManageAttempts(username);

    if (attempts.count <= 0) {
        showNotification('Urinishlar tugadi! Iltimos, 3 daqiqa kuting.', 'error');
        return;
    }

    db.clearTransactions(username);
    showNotification('Barcha operatsiyalar o‘chirildi! Yangi boshlash uchun tayyorsiz!', 'success');
    updateReport();
    updateProfile();
    updateAIdvice();
}

// Admin
function updateAdminPanel() {
    const userList = document.getElementById('userList');
    if (!userList) return;

    userList.innerHTML = '';

    Object.keys(db.users).forEach(username => {
        const user = db.getUser(username);
        const activity = calculateActivity(db.getTransactions(username));
        const banTime = user.banUntil ? formatDate(user.banUntil) : 'Yo‘q';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-2">${username}</td>
            <td class="border p-2">${formatDate(user.createdAt)}</td>
            <td class="border p-2">${user.blocked ? 'Ha' : 'Yo‘q'}</td>
            <td class="border p-2">${banTime}</td>
            <td class="border p-2">${activity}%</td>
            <td class="border p-2">
                <button onclick="toggleBlockUser('${username}', ${!user.blocked})" class="bg-${user.blocked ? 'green' : 'red'}-500 text-white px-2 py-1 rounded hover:bg-${user.blocked ? 'green' : 'red'}-600 mr-2">
                    ${user.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                </button>
                <button onclick="banUser('${username}')" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                    Vaqtincha ban
                </button>
            </td>
        `;
        userList.appendChild(row);
    });
}

function toggleBlockUser(username, status) {
    db.blockUser(username, status, null);
    showNotification(`${username} ${status ? 'bloklandi' : 'blokdan chiqarildi'}!`, 'success');
    updateAdminPanel();
}

function banUser(username) {
    const hours = parseInt(document.getElementById('banHours').value);
    if (!hours || hours <= 0) {
        showNotification('Xato: To‘g‘ri soat kiritng!', 'error');
        return;
    }

    const banUntil = Date.now() + hours * 3600 * 1000;
    db.blockUser(username, true, banUntil);
    showNotification(`${username} ${hours} soatga ban qilindi!`, 'success');
    updateAdminPanel();
}

// Initialization
function initializeApp() {
    if (window.location.pathname.includes('login.html')) {
        loadRememberedUser();
    } else if (window.location.pathname.includes('index.html')) {
        checkAuth();
        updateReport();
        updateProfile();
        updateAIdvice();
    } else if (window.location.pathname.includes('admin.html')) {
        checkAuth();
        updateAdminPanel();
    }

    setInterval(() => {
        db.recoverAttempts();
        updateManageAttempts();
    }, AI_CONFIG.attemptRecoveryInterval);
}

document.addEventListener('DOMContentLoaded', initializeApp, { once: true });