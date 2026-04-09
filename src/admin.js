import { supabase } from './main.js'

// Elements
const loginScreen = document.getElementById('login-screen');
const adminContent = document.getElementById('admin-content');
const loginBtn = document.getElementById('login-btn');
const adminPassInput = document.getElementById('admin-pass');
const loginError = document.getElementById('login-error');
const tableContainer = document.getElementById('table-container');
const tabButtons = document.querySelectorAll('.tab-btn');

// Default password is 'mudu2026'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'mudu2026';

console.log("Admin module loaded");

// Initial state
if (adminContent) adminContent.style.display = 'none';
if (loginScreen) loginScreen.style.display = 'flex';

loginBtn.addEventListener('click', () => {
    const enteredPass = adminPassInput.value.trim();
    if (enteredPass === ADMIN_PASSWORD) {
        console.log("Login successful");
        loginScreen.style.display = 'none';
        adminContent.style.display = 'block';
        fetchData('registrations');
    } else {
        loginError.innerHTML = 'Hatalı şifre!';
        adminPassInput.value = '';
    }
});

// Handle enter key
adminPassInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

// Handle Tabs
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchData(btn.dataset.tab);
    });
});

async function fetchData(table) {
    console.log(`Fetching data from ${table}...`);
    tableContainer.innerHTML = '<div class="loader-container"><div class="loader"></div><p>Veriler yükleniyor...</p></div>';
    
    try {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        console.log(`Fetched ${data ? data.length : 0} rows`);

        if (!data || data.length === 0) {
            tableContainer.innerHTML = '<div class="empty-state"><p>Henüz herhangi bir kayıt bulunmuyor.</p></div>';
            return;
        }

        renderTable(table, data);
    } catch (error) {
        console.error('Fetch error:', error);
        tableContainer.innerHTML = `
            <div class="error-state">
                <p style="color: #f44336; font-weight: bold;">Hata oluştu!</p>
                <p>${error.message}</p>
                <small>Not: Veritabanı izinlerini (RLS) verdiğinizden emin olun.</small>
            </div>`;
    }
}

function renderTable(type, data) {
    let html = `<div class="table-responsive"><table class="data-table"><thead><tr>`;
    
    if (type === 'registrations') {
        html += `
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Bölüm</th>
            <th>İlgi Alanı</th>
            <th>Tarih</th>
        `;
    } else {
        html += `
            <th>Ad Soyad</th>
            <th>İletişim</th>
            <th>Atölye Başlığı</th>
            <th>Detaylar</th>
            <th>Süre / Format</th>
            <th>Konum</th>
            <th>Tarih</th>
        `;
    }
    
    html += `</tr></thead><tbody>`;
    
    data.forEach(item => {
        const date = new Date(item.created_at).toLocaleString('tr-TR');
        if (type === 'registrations') {
            html += `
                <tr>
                    <td>${item.full_name || '-'}</td>
                    <td>${item.email || '-'}</td>
                    <td>${item.department || '-'}</td>
                    <td>${item.survey_interest || '-'}</td>
                    <td>${date}</td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td><b>${item.full_name || '-'}</b></td>
                    <td>${item.email || '-'}<br><small>${item.phone || ''}</small></td>
                    <td>${item.workshop_title || '-'}</td>
                    <td title="${item.workshop_description}">${item.workshop_description ? item.workshop_description.substring(0, 30) + '...' : '-'}</td>
                    <td>${item.duration || '-'}<br><small>${item.format || ''}</small></td>
                    <td>${item.location || '-'}</td>
                    <td>${date}</td>
                </tr>
            `;
        }
    });
    
    html += `</tbody></table></div>`;
    tableContainer.innerHTML = html;
}
