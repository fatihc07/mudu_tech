import { supabase } from './main.js'

const loginScreen = document.getElementById('login-screen');
const adminContent = document.getElementById('admin-content');
const loginBtn = document.getElementById('login-btn');
const adminPassInput = document.getElementById('admin-pass');
const loginError = document.getElementById('login-error');

const tableContainer = document.getElementById('table-container');
const tabButtons = document.querySelectorAll('.tab-btn');

// Simple Admin Auth (In a real app, use Supabase Auth)
// Default password is 'mudu2026' if not set in .env
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'mudu2026';

loginBtn.addEventListener('click', () => {
    if (adminPassInput.value === ADMIN_PASSWORD) {
        loginScreen.style.display = 'none';
        adminContent.style.display = 'block';
        fetchData('registrations');
    } else {
        loginError.innerHTML = 'Hatalı şifre!';
    }
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
    tableContainer.innerHTML = '<p>Veriler yükleniyor...</p>';
    
    try {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            tableContainer.innerHTML = '<p>Henüz veri bulunmuyor.</p>';
            return;
        }

        renderTable(table, data);
    } catch (error) {
        console.error('Fetch error:', error);
        tableContainer.innerHTML = `<p style="color: red;">Veri çekilirken hata oluştu: ${error.message}</p>`;
    }
}

function renderTable(type, data) {
    let html = `<table class="data-table"><thead><tr>`;
    
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
                    <td>${item.full_name}</td>
                    <td>${item.email}</td>
                    <td>${item.department}</td>
                    <td>${item.survey_interest}</td>
                    <td>${date}</td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td><b>${item.full_name}</b></td>
                    <td>${item.email}<br><small>${item.phone}</small></td>
                    <td>${item.workshop_title}</td>
                    <td title="${item.workshop_description}">${item.workshop_description ? item.workshop_description.substring(0, 30) + '...' : '-'}</td>
                    <td>${item.duration}<br><small>${item.format}</small></td>
                    <td>${item.location}</td>
                    <td>${date}</td>
                </tr>
            `;
        }
    });
    
    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}
