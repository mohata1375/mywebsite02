
// State Management
const appState = {
    currentUser: null,
    consultationData: {},
    dailyUsage: {},
    reminders: []
};

// Database Simulation (در حالت واقعی از API استفاده می‌شود)
const db = {
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    consultations: JSON.parse(localStorage.getItem('consultations') || '[]'),
    payments: JSON.parse(localStorage.getItem('payments') || '[]'),

    saveUser(user) {
        const index = this.users.findIndex(u => u.username === user.username);
        if (index >= 0) {
            this.users[index] = user;
        } else {
            this.users.push(user);
        }
        localStorage.setItem('users', JSON.stringify(this.users));
    },

    getUser(username, password) {
        return this.users.find(u => u.username === username && u.password === password);
    },

    saveConsultation(consultation) {
        this.consultations.push(consultation);
        localStorage.setItem('consultations', JSON.stringify(this.consultations));
    },

    getUserConsultations(userId) {
        return this.consultations.filter(c => c.userId === userId);
    },

    getTodayUsage(userId) {
        const today = new Date().toDateString();
        return this.consultations.filter(c => 
            c.userId === userId && 
            new Date(c.date).toDateString() === today
        ).length;
    }
};

// Drug Database
const drugsDB = {
    'استامینوفن': {
        englishName: 'Acetaminophen',
        forms: ['قرص 325mg', 'قرص 500mg', 'شربت 120mg/5ml'],
        uses: ['تب', 'درد خفیف تا متوسط', 'سردرد', 'دندان درد'],
        adultDose: 'قرص 500mg هر 4-6 ساعت (حداکثر 4 گرم در روز)',
        childDose: '10-15 mg/kg هر 4-6 ساعت',
        sideEffects: ['کمیاب: آسیب کبدی در دوز بالا'],
        contraindications: ['نارسایی کبدی شدید'],
        precautions: ['در بیماری کبدی', 'مصرف الکل'],
        interactions: ['وارفارین (در دوز بالا)'],
        notes: '✅ با معده خالی یا پر قابل مصرف\⚠️ از مصرف بیش از دوز مجاز خودداری کنید',
        price: { min: 5000, max: 25000 }
    },
    'ایبوپروفن': {
        englishName: 'Ibuprofen',
        forms: ['قرص 200mg', 'قرص 400mg', 'شربت 100mg/5ml'],
        uses: ['درد', 'التهاب', 'تب', 'آرتروز', 'درد قاعدگی'],
        adultDose: '200-400mg هر 4-6 ساعت (حداکثر 1200mg در روز)',
        childDose: '5-10 mg/kg هر 6-8 ساعت',
        sideEffects: ['سوزش معده', 'تهوع', 'سرگیجه'],
        contraindications: ['زخم گوارشی فعال', 'خونریزی گوارشی', 'نارسایی کلیه شدید'],
        precautions: ['بیماری قلبی', 'فشار خون', 'آسم'],
        interactions: ['آسپیرین', 'وارفارین', 'لیتیوم'],
        notes: '✅ با غذا یا شیر مصرف شود\n⚠️ در مصرف طولانی مدت احتیاط شود',
        price: { min: 8000, max: 35000 }
    },
    'دیفن‌هیدرامین': {
        englishName: 'Diphenhydramine',
        forms: ['شربت 12.5mg/5ml', 'قرص 25mg'],
        uses: ['آلرژی', 'کهیر', 'خارش', 'سرفه شبانه', 'بی‌خوابی موقت'],
        adultDose: '25-50mg هر 4-6 ساعت',
        childDose: '1-1.5 mg/kg هر 4-6 ساعت',
        sideEffects: ['خواب‌آلودگی', 'خشکی دهان', 'تاری دید'],
        contraindications: ['گلوکوم زاویه بسته', 'هیپرتروفی پروستات'],
        precautions: ['رانندگی', 'کار با ماشین‌آلات'],
        interactions: ['الکل', 'داروهای آرام‌بخش'],
        notes: '⚠️ باعث خواب‌آلودگی می‌شود\n🚗 از رانندگی خودداری کنید',
        price: { min: 12000, max: 40000 }
    },
    'لوپرامید': {
        englishName: 'Loperamide',
        forms: ['قرص 2mg'],
        uses: ['اسهال حاد', 'اسهال مسافرتی'],
        adultDose: 'ابتدا 4mg سپس 2mg بعد از هر دفع شل',
        childDose: 'بالای 2 سال: 0.1 mg/kg',
        sideEffects: ['یبوست', 'نفخ', 'درد شکم'],
        contraindications: ['اسهال خونی', 'تب بالا'],
        precautions: ['اسهال عفونی', 'کودکان زیر 2 سال'],
        interactions: ['کمی با سایمتیدین'],
        notes: '✅ با مایعات فراوان\n⚠️ اگر بعد از 2 روز بهبود نیافت به پزشک مراجعه کنید',
        price: { min: 15000, max: 45000 }
    },
    'سایمتیکون': {
        englishName: 'Simethicone',
        forms: ['قطره 40mg/ml', 'قرص جویدنی 40mg'],
        uses: ['نفخ', 'گاز معده', 'کولیک نوزادان'],
        adultDose: '40-125mg بعد از غذا و موقع خواب',
        childDose: 'نوزاد: 20mg چهار بار در روز',
        sideEffects: ['بسیار نادر'],
        contraindications: ['ندارد'],
        precautions: ['ندارد'],
        interactions: ['ندارد'],
        notes: '✅ بی‌خطر در بارداری\n✅ قرص‌ها را بجوید',
        price: { min: 10000, max: 30000 }
    }
};

// Symptom-Drug Mapping
const symptomDrugs = {
    'تب': ['استامینوفن', 'ایبوپروفن'],
    'سردرد': ['استامینوفن', 'ایبوپروفن'],
    'آلرژی': ['دیفن‌هیدرامین', 'کلرفنیرامین'],
    'اسهال': ['لوپرامید', 'ORS'],
    'نفخ': ['سایمتیکون'],
    'بی‌خوابی': ['دیفن‌هیدرامین']
};

// Subscription Plans
const subscriptionPlans = {
    free: {
        name: 'رایگان',
        price: 0,
        duration: 7,
        dailyLimit: 3,
        features: ['مشاوره محدود', 'اطلاعات پایه دارو', 'دسترسی 7 روزه']
    },
    basic: {
        name: 'پایه',
        price: 100000,
        duration: 30,
        dailyLimit: 10,
        features: ['10 مشاوره روزانه', 'تداخلات دارویی', 'یادآور دارو', 'سوابق کامل']
    },
    professional: {
        name: 'حرفه‌ای',
        price: 250000,
        duration: 30,
        dailyLimit: 50,
        features: ['50 مشاوره روزانه', 'همه امکانات پایه', 'تشخیص تصویر', 'پشتیبانی اولویت']
    },
    gold: {
        name: 'طلایی',
        price: 500000,
        duration: 30,
        dailyLimit: -1,
        features: ['مشاوره نامحدود', 'همه امکانات', 'دسترسی API', 'پشتیبانی VIP']
    }
};

// Initialize admin user
if (!db.users.find(u => u.username === 'admin')) {
    db.saveUser({
        username: 'admin',
        password: 'admin123',
        fullName: 'مدیر سیستم',
        email: 'admin@otc.com',
        phone: '09123456789',
        isAdmin: true,
        subscription: 'gold',
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
    });
}

// Check for existing session
window.addEventListener('load', function() {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        appState.currentUser = JSON.parse(savedUser);
        showMainApp();
    }
});

// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        let user = db.getUser(username, password);

        if (!user) {
            // Register new user
            user = {
                username: username,
                password: password,
                fullName: username,
                email: '',
                phone: '',
                isAdmin: false,
                subscription: 'free',
                subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date()
            };
            db.saveUser(user);
            showAlert('ثبت نام با موفقیت انجام شد! با پلن رایگان 7 روزه وارد شدید.', 'success');
        }

        // Login user
        appState.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        showMainApp();
    });
});

function showMainApp() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    // Update user info
    document.getElementById('userFullName').textContent = appState.currentUser.fullName;
    document.getElementById('userPlan').textContent = subscriptionPlans[appState.currentUser.subscription].name;
    document.getElementById('subscriptionExpiry').textContent = new Date(appState.currentUser.subscriptionExpiry).toLocaleDateString('fa-IR');

    const limit = subscriptionPlans[appState.currentUser.subscription].dailyLimit;
    document.getElementById('dailyLimit').textContent = limit === -1 ? 'نامحدود' : limit;

    // Update today's usage
    const todayUsage = db.getTodayUsage(appState.currentUser.username);
    document.getElementById('todayConsultations').textContent = todayUsage;

    // Show admin menu if admin
    if (appState.currentUser.isAdmin) {
        document.getElementById('adminMenuItem').style.display = 'block';
    }
}

function showConsultation() {
    const limit = subscriptionPlans[appState.currentUser.subscription].dailyLimit;
    const todayUsage = db.getTodayUsage(appState.currentUser.username);

    if (limit !== -1 && todayUsage >= limit) {
        showAlert('محدودیت روزانه مشاوره به پایان رسیده است. برای ادامه پلن خود را ارتقا دهید.', 'error');
        showSubscriptions();
        return;
    }

    const content = `
        <h2>🩺 مشاوره براساس علائم</h2>
        <div class="consultation-form">
            <h3>لطفاً علامت خود را انتخاب کنید:</h3>
            <div class="symptom-grid">
                <div class="symptom-btn" onclick="selectSymptom('تب')">🤒 تب</div>
                <div class="symptom-btn" onclick="selectSymptom('سردرد')">🤕 سردرد</div>
                <div class="symptom-btn" onclick="selectSymptom('آلرژی')">🤧 آلرژی</div>
                <div class="symptom-btn" onclick="selectSymptom('اسهال')">🚽 اسهال</div>
                <div class="symptom-btn" onclick="selectSymptom('نفخ')">💨 نفخ</div>
                <div class="symptom-btn" onclick="selectSymptom('بی‌خوابی')">😴 بی‌خوابی</div>
            </div>
            <div id="consultationSteps" style="display:none;">
                <div class="form-group">
                    <label>سن (سال):</label>
                    <input type="number" id="age" min="0" max="120" required>
                </div>
                <div class="form-group">
                    <label>جنسیت:</label>
                    <select id="gender">
                        <option value="مرد">مرد</option>
                        <option value="زن">زن</option>
                    </select>
                </div>
                <div class="form-group" id="pregnancyGroup" style="display:none;">
                    <label>آیا باردار یا شیرده هستید؟</label>
                    <select id="pregnancy">
                        <option value="خیر">خیر</option>
                        <option value="بله">بله</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>حساسیت دارویی:</label>
                    <input type="text" id="allergies" placeholder="ندارم">
                </div>
                <div class="form-group">
                    <label>بیماری‌های زمینه‌ای:</label>
                    <input type="text" id="diseases" placeholder="ندارم">
                </div>
                <div class="form-group">
                    <label>داروهای فعلی:</label>
                    <input type="text" id="currentMeds" placeholder="ندارم">
                </div>
                <div class="form-group">
                    <label>مدت علائم:</label>
                    <select id="duration">
                        <option value="کمتر از 24 ساعت">کمتر از 24 ساعت</option>
                        <option value="1-3 روز">1-3 روز</option>
                        <option value="3-7 روز">3-7 روز</option>
                        <option value="بیش از یک هفته">بیش از یک هفته</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>شدت علائم:</label>
                    <select id="severity">
                        <option value="خفیف">خفیف</option>
                        <option value="متوسط">متوسط</option>
                        <option value="شدید">شدید</option>
                    </select>
                </div>
                <button class="btn" onclick="analyzeSymptoms()">دریافت توصیه</button>
            </div>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = content;
}

function selectSymptom(symptom) {
    appState.consultationData.symptom = symptom;
    document.querySelectorAll('.symptom-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent.includes(symptom)) {
            btn.classList.add('selected');
        }
    });
    document.getElementById('consultationSteps').style.display = 'block';

    // Show pregnancy field for females
    document.getElementById('gender').addEventListener('change', function() {
        const age = parseInt(document.getElementById('age').value);
        if (this.value === 'زن' && age >= 15 && age <= 50) {
            document.getElementById('pregnancyGroup').style.display = 'block';
        } else {
            document.getElementById('pregnancyGroup').style.display = 'none';
        }
    });
}

function analyzeSymptoms() {
    // Collect all data
    appState.consultationData = {
        ...appState.consultationData,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        pregnancy: document.getElementById('pregnancy').value,
        allergies: document.getElementById('allergies').value || 'ندارم',
        diseases: document.getElementById('diseases').value || 'ندارم',
        currentMeds: document.getElementById('currentMeds').value || 'ندارم',
        duration: document.getElementById('duration').value,
        severity: document.getElementById('severity').value
    };

    // Generate recommendation
    const recommendation = generateRecommendation(appState.consultationData);

    // Save consultation
    const consultation = {
        userId: appState.currentUser.username,
        date: new Date(),
        ...appState.consultationData,
        recommendation: recommendation
    };
    db.saveConsultation(consultation);

    // Update usage count
    const todayUsage = db.getTodayUsage(appState.currentUser.username);
    document.getElementById('todayConsultations').textContent = todayUsage;

    // Show recommendation
    showRecommendationModal(recommendation);
}

function generateRecommendation(data) {
    let recommendation = `
        <h3>📋 نتیجه تحلیل</h3>
        <div class="user-info">
            <p><strong>سن:</strong> ${data.age} سال</p>
            <p><strong>جنسیت:</strong> ${data.gender}</p>
            <p><strong>علامت:</strong> ${data.symptom}</p>
            <p><strong>مدت:</strong> ${data.duration}</p>
            <p><strong>شدت:</strong> ${data.severity}</p>
        </div>
    `;

    // Check warnings
    const warnings = [];
    if (data.severity === 'شدید' || data.duration === 'بیش از یک هفته') {
        warnings.push('🚨 شدت/مدت علائم → مراجعه فوری به پزشک');
    }
    if (data.age < 2) {
        warnings.push('👶 کودک زیر 2 سال → حتماً پزشک');
    }
    if (data.pregnancy === 'بله') {
        warnings.push('🤱 بارداری/شیردهی → احتیاط ویژه');
    }

    if (warnings.length > 0) {
        recommendation += '<div class="warning-box"><h4>⚠️ هشدارهای مهم:</h4>';
        warnings.forEach(w => recommendation += `<p>${w}</p>`);
        recommendation += '</div>';
    }

    // Drug recommendations
    const suitableDrugs = symptomDrugs[data.symptom] || [];
    recommendation += '<h4>💊 داروهای پیشنهادی:</h4>';

    suitableDrugs.forEach((drugName, index) => {
        if (drugsDB[drugName]) {
            const drug = drugsDB[drugName];
            const contraindications = checkContraindications(drugName, data);

            if (contraindications.length === 0) {
                recommendation += `
                    <div class="drug-info">
                        <h5>${index === 0 ? '🥇' : '🥈'} ${drugName}</h5>
                        <p><em>${drug.englishName}</em></p>
                        <p><strong>دوز:</strong> ${data.age < 12 ? drug.childDose : drug.adultDose}</p>
                        <p>${drug.notes}</p>
                    </div>
                `;
            }
        }
    });

    // General advice
    recommendation += getGeneralAdvice(data.symptom);

    return recommendation;
}

function checkContraindications(drugName, data) {
    const contraindications = [];
    const drug = drugsDB[drugName];

    // Check allergies
    if (data.allergies !== 'ندارم' && data.allergies.includes(drugName)) {
        contraindications.push('حساسیت دارویی');
    }

    // Check pregnancy
    if (data.pregnancy === 'بله' && drugName === 'ایبوپروفن') {
        contraindications.push('ممنوع در بارداری');
    }

    // Check age
    if (data.age < 2 && ['ایبوپروفن', 'دیفن‌هیدرامین'].includes(drugName)) {
        contraindications.push('نامناسب برای کودکان زیر 2 سال');
    }

    return contraindications;
}

function getGeneralAdvice(symptom) {
    const advices = {
        'تب': `
            <h4>🏠 توصیه‌های خانگی:</h4>
            <ul>
                <li>استراحت کافی و خواب</li>
                <li>نوشیدن مایعات فراوان</li>
                <li>استفاده از کمپرس خنک</li>
                <li>پوشیدن لباس سبک</li>
            </ul>
            <div class="warning-box">
                <p>⚠️ اگر تب بالای 39 درجه یا بیش از 3 روز ادامه یافت، به پزشک مراجعه کنید</p>
            </div>
        `,
        'سردرد': `
            <h4>🏠 توصیه‌های خانگی:</h4>
            <ul>
                <li>استراحت در محیط تاریک و آرام</li>
                <li>ماساژ ملایم شقیقه‌ها</li>
                <li>کمپرس سرد روی پیشانی</li>
                <li>اجتناب از صفحات نمایش</li>
            </ul>
        `,
        'اسهال': `
            <h4>🏠 توصیه‌های خانگی:</h4>
            <ul>
                <li>مصرف ORS برای جبران آب بدن</li>
                <li>رژیم BRAT (موز، برنج، سیب، نان تست)</li>
                <li>پرهیز از لبنیات و غذاهای چرب</li>
                <li>مایعات فراوان</li>
            </ul>
            <div class="warning-box">
                <p>⚠️ در صورت وجود خون در مدفوع یا تب بالا، فوراً به پزشک مراجعه کنید</p>
            </div>
        `
    };

    return advices[symptom] || '<p>توصیه‌های عمومی: استراحت، تغذیه مناسب و مایعات کافی</p>';
}

function showDrugInfo() {
    let content = '<h2>💊 اطلاعات داروها</h2><div class="menu-grid">';

    Object.keys(drugsDB).forEach(drugName => {
        content += `
            <div class="menu-item" onclick="showDrugDetails('${drugName}')">
                <span>${drugName}</span>
            </div>
        `;
    });

    content += '</div>';
    document.getElementById('contentArea').innerHTML = content;
}

function showDrugDetails(drugName) {
    const drug = drugsDB[drugName];
    const content = `
        <h3>${drugName}</h3>
        <p><strong>نام انگلیسی:</strong> ${drug.englishName}</p>
        <p><strong>اشکال دارویی:</strong> ${drug.forms.join('، ')}</p>
        <p><strong>موارد مصرف:</strong> ${drug.uses.join('، ')}</p>
        <p><strong>دوز بزرگسالان:</strong> ${drug.adultDose}</p>
        <p><strong>دوز کودکان:</strong> ${drug.childDose}</p>
        <p><strong>عوارض جانبی:</strong> ${drug.sideEffects.join('، ')}</p>
        <p><strong>منع مصرف:</strong> ${drug.contraindications.join('، ')}</p>
        <p><strong>احتیاط:</strong> ${drug.precautions.join('، ')}</p>
        <p><strong>تداخلات:</strong> ${drug.interactions.join('، ')}</p>
        <div class="drug-info">${drug.notes}</div>
        <p><strong>محدوده قیمت:</strong> ${drug.price.min.toLocaleString()} - ${drug.price.max.toLocaleString()} تومان</p>
    `;

    showModal(content);
}

function showInteractions() {
    const content = `
        <h2>⚠️ بررسی تداخلات دارویی</h2>
        <div class="consultation-form">
            <div class="form-group">
                <label>داروی اول:</label>
                <select id="drug1">
                    ${Object.keys(drugsDB).map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>داروی دوم:</label>
                <select id="drug2">
                    ${Object.keys(drugsDB).map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
            </div>
            <button class="btn" onclick="checkInteraction()">بررسی تداخل</button>
            <div id="interactionResult" style="margin-top: 20px;"></div>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = content;
}

function checkInteraction() {
    const drug1 = document.getElementById('drug1').value;
    const drug2 = document.getElementById('drug2').value;

    let result = '<h4>نتیجه بررسی:</h4>';

    // Simple interaction check (در واقعیت پیچیده‌تر است)
    if ((drug1 === 'ایبوپروفن' && drug2 === 'آسپیرین') || 
        (drug1 === 'آسپیرین' && drug2 === 'ایبوپروفن')) {
        result += '<div class="warning-box">⚠️ تداخل متوسط: خطر خونریزی گوارشی</div>';
    } else {
        result += '<div class="drug-info">✅ تداخل خطرناکی مشاهده نشد</div>';
    }

    document.getElementById('interactionResult').innerHTML = result;
}

function showPriceComparison() {
    const content = `
        <h2>💰 مقایسه قیمت داروها</h2>
        <div class="form-group">
            <label>انتخاب دارو:</label>
            <select id="drugSelect" onchange="comparePrices()">
                <option value="">انتخاب کنید...</option>
                ${Object.keys(drugsDB).map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
        </div>
        <div id="priceComparison"></div>
    `;
    document.getElementById('contentArea').innerHTML = content;
}

function comparePrices() {
    const drugName = document.getElementById('drugSelect').value;
    if (!drugName) return;

    const drug = drugsDB[drugName];
    let content = `
        <h3>${drugName}</h3>
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <th>فرم دارویی</th>
                <th>قیمت حداقل</th>
                <th>قیمت حداکثر</th>
            </tr>
    `;

    drug.forms.forEach(form => {
        content += `
            <tr>
                <td>${form}</td>
                <td>${drug.price.min.toLocaleString()} تومان</td>
                <td>${drug.price.max.toLocaleString()} تومان</td>
            </tr>
        `;
    });

    content += '</table>';
    content += '<p style="margin-top: 15px; color: #666;">* قیمت‌ها تقریبی بوده و ممکن است در داروخانه‌های مختلف متفاوت باشد</p>';

    document.getElementById('priceComparison').innerHTML = content;
}

function showPharmacies() {
    const pharmacies = [
        {
            name: 'داروخانه شبانه‌روزی امام رضا',
            city: 'تهران',
            address: 'خیابان ولی‌عصر، نرسیده به پارک ملت',
            phone: '021-12345678',
            hours: '24 ساعته'
        },
        {
            name: 'داروخانه دکتر محمدی',
            city: 'تهران',
            address: 'میدان ونک، ابتدای گاندی',
            phone: '021-87654321',
            hours: '8:00 - 22:00'
        },
        {
            name: 'داروخانه شفا',
            city: 'اصفهان',
            address: 'خیابان چهارباغ، کوچه گلستان',
            phone: '031-12345678',
            hours: '8:00 - 20:00'
        }
    ];

    let content = `
        <h2>🏥 داروخانه‌های نزدیک</h2>
        <div class="form-group">
            <label>فیلتر بر اساس شهر:</label>
            <select id="cityFilter" onchange="filterPharmacies()">
                <option value="">همه شهرها</option>
                <option value="تهران">تهران</option>
                <option value="اصفهان">اصفهان</option>
            </select>
        </div>
        <div class="pharmacy-list" id="pharmacyList">
    `;

    pharmacies.forEach(pharmacy => {
        content += `
            <div class="pharmacy-card" data-city="${pharmacy.city}">
                <h4>${pharmacy.name}</h4>
                <p>📍 ${pharmacy.city} - ${pharmacy.address}</p>
                <p>📞 ${pharmacy.phone}</p>
                <p>🕐 ساعت کاری: ${pharmacy.hours}</p>
            </div>
        `;
    });

    content += '</div>';
    document.getElementById('contentArea').innerHTML = content;
}

function filterPharmacies() {
    const city = document.getElementById('cityFilter').value;
    const cards = document.querySelectorAll('.pharmacy-card');

    cards.forEach(card => {
        if (city === '' || card.dataset.city === city) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showReminders() {
    let reminders = JSON.parse(localStorage.getItem(`reminders_${appState.currentUser.username}`) || '[]');

    let content = `
        <h2>⏰ یادآور مصرف دارو</h2>
        <div class="consultation-form">
            <h3>افزودن یادآور جدید</h3>
            <div class="form-group">
                <label>نام دارو:</label>
                <input type="text" id="reminderDrug">
            </div>
            <div class="form-group">
                <label>زمان‌های مصرف (با کاما جدا کنید):</label>
                <input type="text" id="reminderTimes" placeholder="8:00, 14:00, 20:00">
            </div>
            <button class="btn" onclick="addReminder()">افزودن یادآور</button>
        </div>
        <div class="reminder-list">
            <h3>یادآورهای فعال</h3>
    `;

    if (reminders.length === 0) {
        content += '<p>هیچ یادآوری ثبت نشده است</p>';
    } else {
        reminders.forEach((reminder, index) => {
            content += `
                <div class="reminder-item">
                    <div>
                        <strong>${reminder.drug}</strong>
                        <p>زمان‌ها: ${reminder.times.join(', ')}</p>
                    </div>
                    <button class="btn btn-danger" onclick="deleteReminder(${index})">حذف</button>
                </div>
            `;
        });
    }

    content += '</div>';
    document.getElementById('contentArea').innerHTML = content;
}

function addReminder() {
    const drug = document.getElementById('reminderDrug').value;
    const times = document.getElementById('reminderTimes').value.split(',').map(t => t.trim());

    if (!drug || times.length === 0) {
        showAlert('لطفاً نام دارو و زمان‌های مصرف را وارد کنید', 'error');
        return;
    }

    let reminders = JSON.parse(localStorage.getItem(`reminders_${appState.currentUser.username}`) || '[]');
    reminders.push({ drug, times });
    localStorage.setItem(`reminders_${appState.currentUser.username}`, JSON.stringify(reminders));

    showAlert('یادآور با موفقیت اضافه شد', 'success');
    showReminders();
}

function deleteReminder(index) {
    let reminders = JSON.parse(localStorage.getItem(`reminders_${appState.currentUser.username}`) || '[]');
    reminders.splice(index, 1);
    localStorage.setItem(`reminders_${appState.currentUser.username}`, JSON.stringify(reminders));
    showReminders();
}

function showHistory() {
    const consultations = db.getUserConsultations(appState.currentUser.username);

    let content = '<h2>📋 سوابق مشاوره</h2>';

    if (consultations.length === 0) {
        content += '<p>تاکنون مشاوره‌ای انجام نداده‌اید</p>';
    } else {
        consultations.reverse().forEach((consultation, index) => {
            content += `
                <div class="history-item" onclick="showConsultationDetail(${consultations.length - index - 1})">
                    <h4>مشاوره ${new Date(consultation.date).toLocaleDateString('fa-IR')}</h4>
                    <p>علامت: ${consultation.symptom}</p>
                    <p>شدت: ${consultation.severity}</p>
                </div>
            `;
        });
    }

    document.getElementById('contentArea').innerHTML = content;
}

function showConsultationDetail(index) {
    const consultations = db.getUserConsultations(appState.currentUser.username);
    const consultation = consultations[index];

    showModal(consultation.recommendation);
}

function showSubscriptions() {
    let content = '<h2>💎 پلن‌های اشتراک</h2><div class="subscription-plans">';

    Object.entries(subscriptionPlans).forEach(([key, plan]) => {
        const isCurrentPlan = appState.currentUser.subscription === key;
        content += `
            <div class="plan-card ${key === 'professional' ? 'featured' : ''}">
                <h3>${plan.name}</h3>
                <div class="plan-price">${plan.price === 0 ? 'رایگان' : plan.price.toLocaleString() + ' تومان'}</div>
                <p>${plan.duration} روزه</p>
                <ul class="plan-features">
                    ${plan.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                ${isCurrentPlan ? 
                    '<button class="btn" disabled>پلن فعلی</button>' : 
                    `<button class="btn ${key === 'professional' ? 'btn-secondary' : ''}" onclick="upgradePlan('${key}')">خرید</button>`
                }
            </div>
        `;
    });

    content += '</div>';
    document.getElementById('contentArea').innerHTML = content;
}

function upgradePlan(planKey) {
    const plan = subscriptionPlans[planKey];

    if (plan.price === 0) {
        showAlert('این پلن رایگان است و نیازی به پرداخت ندارد', 'error');
        return;
    }

    // Simulate payment
    if (confirm(`آیا از خرید پلن ${plan.name} به مبلغ ${plan.price.toLocaleString()} تومان اطمینان دارید؟`)) {
        // Update user subscription
        appState.currentUser.subscription = planKey;
        appState.currentUser.subscriptionExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);

        // Save to database
        db.saveUser(appState.currentUser);
        sessionStorage.setItem('currentUser', JSON.stringify(appState.currentUser));

        // Save payment record
        db.payments.push({
            userId: appState.currentUser.username,
            planKey: planKey,
            amount: plan.price,
            date: new Date()
        });
        localStorage.setItem('payments', JSON.stringify(db.payments));

        showAlert(`پلن ${plan.name} با موفقیت خریداری شد!`, 'success');
        showMainApp();
    }
}

function showProfile() {
    const content = `
        <h2>👤 پروفایل کاربری</h2>
        <div class="consultation-form">
            <div class="form-group">
                <label>نام کامل:</label>
                <input type="text" id="profileFullName" value="${appState.currentUser.fullName}">
            </div>
            <div class="form-group">
                <label>ایمیل:</label>
                <input type="email" id="profileEmail" value="${appState.currentUser.email || ''}">
            </div>
            <div class="form-group">
                <label>شماره موبایل:</label>
                <input type="tel" id="profilePhone" value="${appState.currentUser.phone || ''}">
            </div>
            <div class="form-group">
                <label>رمز عبور جدید (در صورت نیاز):</label>
                <input type="password" id="profilePassword" placeholder="خالی بگذارید اگر نمی‌خواهید تغییر دهید">
            </div>
            <button class="btn" onclick="updateProfile()">ذخیره تغییرات</button>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = content;
}

function updateProfile() {
    appState.currentUser.fullName = document.getElementById('profileFullName').value;
    appState.currentUser.email = document.getElementById('profileEmail').value;
    appState.currentUser.phone = document.getElementById('profilePhone').value;

    const newPassword = document.getElementById('profilePassword').value;
    if (newPassword) {
        appState.currentUser.password = newPassword;
    }

    db.saveUser(appState.currentUser);
    sessionStorage.setItem('currentUser', JSON.stringify(appState.currentUser));

    showAlert('پروفایل با موفقیت به‌روزرسانی شد', 'success');
    showMainApp();
}

function showEmergency() {
    const content = `
        <h2>🚨 شماره‌های اضطراری</h2>
        <div class="emergency-numbers">
            <div class="drug-info">
                <h4>اورژانس</h4>
                <p style="font-size: 2em; font-weight: bold;">115</p>
            </div>
            <div class="drug-info">
                <h4>مرکز اطلاعات دارویی و سموم</h4>
                <p style="font-size: 2em; font-weight: bold;">190</p>
            </div>
            <div class="drug-info">
                <h4>اورژانس اجتماعی</h4>
                <p style="font-size: 2em; font-weight: bold;">123</p>
            </div>
            <div class="drug-info">
                <h4>آتش‌نشانی</h4>
                <p style="font-size: 2em; font-weight: bold;">125</p>
            </div>
        </div>
        <div class="warning-box">
            <p>در موارد اضطراری و تهدیدکننده حیات، بلافاصله با اورژانس تماس بگیرید</p>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = content;
}

function showAdmin() {
    if (!appState.currentUser.isAdmin) {
        showAlert('شما دسترسی مدیریت ندارید', 'error');
        return;
    }

    const totalUsers = db.users.length;
    const totalConsultations = db.consultations.length;
    const todayConsultations = db.consultations.filter(c => 
        new Date(c.date).toDateString() === new Date().toDateString()
    ).length;
    const totalRevenue = db.payments.reduce((sum, p) => sum + p.amount, 0);

    const content = `
        <h2>🔧 پنل مدیریت</h2>
        <div class="admin-panel">
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>کل کاربران</h4>
                    <div class="number">${totalUsers}</div>
                </div>
                <div class="stat-card">
                    <h4>کل مشاوره‌ها</h4>
                    <div class="number">${totalConsultations}</div>
                </div>
                <div class="stat-card">
                    <h4>مشاوره‌های امروز</h4>
                    <div class="number">${todayConsultations}</div>
                </div>
                <div class="stat-card">
                    <h4>درآمد کل</h4>
                    <div class="number">${totalRevenue.toLocaleString()} تومان</div>
                </div>
            </div>

            <h3>عملیات مدیریتی</h3>
            <div class="menu-grid">
                <button class="btn" onclick="showUsersList()">لیست کاربران</button>
                <button class="btn" onclick="showFinancialReport()">گزارش مالی</button>
                <button class="btn" onclick="showBroadcastMessage()">پیام همگانی</button>
            </div>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = content;
}

function showUsersList() {
    let content = '<h3>لیست کاربران</h3><table style="width: 100%;">';
    content += '<tr><th>نام کاربری</th><th>نام کامل</th><th>پلن</th><th>تاریخ عضویت</th></tr>';

    db.users.forEach(user => {
        content += `
            <tr>
                <td>${user.username}</td>
                <td>${user.fullName}</td>
                <td>${subscriptionPlans[user.subscription].name}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
            </tr>
        `;
    });

    content += '</table>';
    showModal(content);
}

function showFinancialReport() {
    const monthlyRevenue = {};

    db.payments.forEach(payment => {
        const month = new Date(payment.date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amount;
    });

    let content = '<h3>گزارش مالی</h3>';
    content += '<table style="width: 100%;"><tr><th>ماه</th><th>درآمد</th></tr>';

    Object.entries(monthlyRevenue).forEach(([month, revenue]) => {
        content += `<tr><td>${month}</td><td>${revenue.toLocaleString()} تومان</td></tr>`;
    });

    content += '</table>';
    showModal(content);
}

function showBroadcastMessage() {
    const content = `
        <h3>ارسال پیام همگانی</h3>
        <div class="form-group">
            <label>عنوان پیام:</label>
            <input type="text" id="broadcastTitle">
        </div>
        <div class="form-group">
            <label>متن پیام:</label>
            <textarea id="broadcastText" rows="5"></textarea>
        </div>
        <button class="btn" onclick="sendBroadcast()">ارسال به همه کاربران</button>
    `;
    showModal(content);
}

function sendBroadcast() {
    const title = document.getElementById('broadcastTitle').value;
    const text = document.getElementById('broadcastText').value;

    if (!title || !text) {
        showAlert('لطفاً عنوان و متن پیام را وارد کنید', 'error');
        return;
    }

    // در حالت واقعی، پیام به کاربران ارسال می‌شود
    showAlert(`پیام به ${db.users.length} کاربر ارسال شد`, 'success');
    closeModal();
}

function logout() {
    if (confirm('آیا از خروج اطمینان دارید؟')) {
        appState.currentUser = null;
        sessionStorage.removeItem('currentUser');
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('contentArea').innerHTML = '';

        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}

// Modal functions
function showModal(content) {
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function showRecommendationModal(recommendation) {
    showModal(recommendation);
}

// Alert function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Register function
function showRegister() {
    showAlert('برای ثبت نام، فقط نام کاربری و رمز عبور دلخواه وارد کنید و روی ورود کلیک کنید', 'success');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Initialize reminders check (در حالت واقعی با Service Worker)
setInterval(() => {
    if (appState.currentUser) {
        const reminders = JSON.parse(localStorage.getItem(`reminders_${appState.currentUser.username}`) || '[]');
        const now = new Date();
        const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

        reminders.forEach(reminder => {
            if (reminder.times.includes(currentTime)) {
                // در حالت واقعی، نوتیفیکیشن ارسال می‌شود
                console.log(`یادآور: زمان مصرف ${reminder.drug}`);
            }
        });
    }
}, 60000); // هر دقیقه چک شود
