import { supabase } from './main.js'

const loginScreen = document.getElementById('login-screen');
const adminContent = document.getElementById('admin-content');
const loginBtn = document.getElementById('login-btn');
const adminPassInput = document.getElementById('admin-pass');
const loginError = document.getElementById('login-error');

const tableContainer = document.getElementById('table-container');
const tabButtons = document.querySelectorAll('.tab-btn');
const speakerFormContainer = document.getElementById('speaker-form-container');
const programFormContainer = document.getElementById('program-form-container');
const sponsorFormContainer = document.getElementById('sponsor-form-container');

const addSpeakerForm = document.getElementById('add-speaker-form');
const addProgramForm = document.getElementById('add-program-form');
const addSponsorForm = document.getElementById('add-sponsor-form');

// Simple Admin Auth
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
        
        const type = btn.dataset.tab;
        
        // Hide all form panels
        [speakerFormContainer, programFormContainer, sponsorFormContainer].forEach(p => {
           if(p) p.style.display = 'none';
        });

        // Show relevant form panel
        if (type === 'speakers' && speakerFormContainer) speakerFormContainer.style.display = 'block';
        if (type === 'program' && programFormContainer) programFormContainer.style.display = 'block';
        if (type === 'sponsors' && sponsorFormContainer) sponsorFormContainer.style.display = 'block';
        
        fetchData(type);
    });
});

async function fetchData(table) {
    tableContainer.innerHTML = '<p>Veriler yükleniyor...</p>';
    
    try {
        const { data, error } = await supabase
            .from(table === 'program' ? 'program_items' : table)
            .select('*')
            .order(table === 'program' ? 'time' : 'created_at', { ascending: table === 'program' });

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
        html += `<th>Ad Soyad</th><th>E-posta</th><th>Bölüm</th><th>İlgi</th><th>Tarih</th>`;
    } else if (type === 'educators') {
        html += `<th>Ad Soyad</th><th>İletişim</th><th>Atölye</th><th>Detay</th><th>Format</th><th>Konum</th><th>Tarih</th>`;
    } else if (type === 'speakers') {
        html += `<th>Foto</th><th>Ad Soyad</th><th>Ünvan</th><th>Aksiyon</th>`;
    } else if (type === 'program') {
        html += `<th>Gün</th><th>Saat</th><th>Başlık</th><th>Afiş</th><th>Aksiyon</th>`;
    } else {
        html += `<th>Logo</th><th>Sponsor</th><th>Tier</th><th>Aksiyon</th>`;
    }
    
    html += `</tr></thead><tbody>`;
    
    data.forEach(item => {
        const date = new Date(item.created_at).toLocaleString('tr-TR');
        if (type === 'registrations') {
            html += `<tr><td>${item.full_name}</td><td>${item.email}</td><td>${item.department}</td><td>${item.survey_interest}</td><td>${date}</td></tr>`;
        } else if (type === 'educators') {
            html += `<tr><td><b>${item.full_name}</b></td><td>${item.email}</td><td>${item.workshop_title}</td><td title="${item.workshop_description}">${item.workshop_description?.substring(0,20)}...</td><td>${item.format}</td><td>${item.location}</td><td>${date}</td></tr>`;
        } else if (type === 'speakers') {
            html += `<tr><td><img src="${item.image_url}" style="width:30px;height:30px;border-radius:50%"></td><td>${item.full_name}</td><td>${item.title} @ ${item.company}</td><td><button onclick="window.deleteItem('speakers', '${item.id}')" style="background:red;color:white;border:none;padding:5px;border-radius:4px;">Sil</button></td></tr>`;
        } else if (type === 'program') {
            html += `<tr><td>${item.day === 'day1' ? '1. Gün' : '2. Gün'}</td><td>${item.time}</td><td>${item.title}</td><td>${item.image_url ? `<img src="${item.image_url}" style="width:30px;height:30px;">` : '-'}</td><td><button onclick="window.deleteItem('program_items', '${item.id}', 'program')" style="background:red;color:white;border:none;padding:5px;border-radius:4px;">Sil</button></td></tr>`;
        } else {
            html += `<tr><td><img src="${item.logo_url}" style="width:30px;height:30px;"></td><td>${item.name}</td><td>${item.tier}</td><td><button onclick="window.deleteItem('sponsors', '${item.id}')" style="background:red;color:white;border:none;padding:5px;border-radius:4px;">Sil</button></td></tr>`;
        }
    });
    
    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}

// Global Delete Function
window.deleteItem = async (table, id, tabType) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
        const { error } = await supabase.from(table).delete().match({ id });
        if (error) throw error;
        fetchData(tabType || table);
    } catch (err) { alert('Hata: ' + err.message); }
};

// Generic Handle Submit with Upload
async function handleSubmit(formId, table, fields, fileInputId, urlInputId, msgId, tabName) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById(msgId);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const fileInput = document.getElementById(fileInputId);
        const urlInput = document.getElementById(urlInputId);

        submitBtn.disabled = true;
        msgDiv.innerHTML = 'Kaydediliyor...';

        try {
            let imageUrl = urlInput?.value;
            const file = fileInput?.files[0];

            if (file) {
                const fileName = `${Date.now()}_${file.name}`;
                const bucket = table === 'sponsors' ? 'sponsors' : 'speakers'; // Using two main buckets
                
                const { error: upErr } = await supabase.storage.from(bucket).upload(`uploads/${fileName}`, file);
                if (upErr) throw upErr;
                
                const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(`uploads/${fileName}`);
                imageUrl = pubData.publicUrl;
            }

            const insertData = {};
            fields.forEach(f => {
                insertData[f.db] = document.getElementById(f.id).value;
            });
            insertData[table === 'sponsors' ? 'logo_url' : 'image_url'] = imageUrl;

            const { error } = await supabase.from(table).insert([insertData]);
            if (error) throw error;

            msgDiv.innerHTML = '<span style="color:green;">Başarıyla eklendi!</span>';
            form.reset();
            fetchData(tabName || table);
        } catch (err) {
            msgDiv.innerHTML = `<span style="color:red;">Hata: ${err.message}</span>`;
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// Initialize Forms
handleSubmit('add-speaker-form', 'speakers', 
    [{id:'sp-name', db:'full_name'}, {id:'sp-title', db:'title'}, {id:'sp-company', db:'company'}, {id:'sp-linkedin', db:'linkedin_url'}],
    'sp-image', 'sp-image-url', 'sp-message', 'speakers'
);

handleSubmit('add-program-form', 'program_items', 
    [{id:'pg-day', db:'day'}, {id:'pg-time', db:'time'}, {id:'pg-title', db:'title'}, {id:'pg-desc', db:'description'}, {id:'pg-tag', db:'tag'}],
    'pg-image', 'pg-image-url', 'pg-message', 'program'
);

handleSubmit('add-sponsor-form', 'sponsors', 
    [{id:'sn-name', db:'name'}, {id:'sn-tier', db:'tier'}],
    'sn-logo', 'sn-logo-url', 'sn-message', 'sponsors'
);
