import { supabase } from './main.js'

const loginScreen = document.getElementById('login-screen');
const adminContent = document.getElementById('admin-content');
const loginBtn = document.getElementById('login-btn');
const adminPassInput = document.getElementById('admin-pass');
const loginError = document.getElementById('login-error');

const tableContainer = document.getElementById('table-container');
const tabButtons = document.querySelectorAll('.tab-btn');
const speakerFormContainer = document.getElementById('speaker-form-container');
const addSpeakerForm = document.getElementById('add-speaker-form');

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
        
        const type = btn.dataset.tab;
        if (type === 'speakers') {
            speakerFormContainer.style.display = 'block';
        } else {
            speakerFormContainer.style.display = 'none';
        }
        
        fetchData(type);
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
    } else if (type === 'educators') {
        html += `
            <th>Ad Soyad</th>
            <th>İletişim</th>
            <th>Atölye Başlığı</th>
            <th>Detaylar</th>
            <th>Süre / Format</th>
            <th>Konum</th>
            <th>Tarih</th>
        `;
    } else {
        html += `
            <th>Foto</th>
            <th>Ad Soyad</th>
            <th>Ünvan / Şirket</th>
            <th>LinkedIn</th>
            <th>Aksiyon</th>
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
        } else if (type === 'educators') {
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
        } else {
            html += `
                <tr>
                    <td><img src="${item.image_url}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"></td>
                    <td>${item.full_name}</td>
                    <td>${item.title}<br><small>${item.company}</small></td>
                    <td><a href="${item.linkedin_url}" target="_blank">Link</a></td>
                    <td><button onclick="window.deleteSpeaker('${item.id}')" style="background: red; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Sil</button></td>
                </tr>
            `;
        }
    });
    
    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}

// Add Speaker Logic
if (addSpeakerForm) {
    addSpeakerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('sp-message');
        const submitBtn = document.getElementById('sp-submit-btn');
        
        const name = document.getElementById('sp-name').value;
        const title = document.getElementById('sp-title').value;
        const company = document.getElementById('sp-company').value;
        const linkedin = document.getElementById('sp-linkedin').value;
        const imageFile = document.getElementById('sp-image').files[0];
        const imageUrlInput = document.getElementById('sp-image-url').value;

        submitBtn.disabled = true;
        msgDiv.innerHTML = 'Kaydediliyor...';

        try {
            let imageUrl = imageUrlInput;

            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('speakers')
                    .upload(`avatars/${fileName}`, imageFile);
                
                if (uploadError) throw uploadError;
                
                const { data: publicUrlData } = supabase.storage
                    .from('speakers')
                    .getPublicUrl(`avatars/${fileName}`);
                
                imageUrl = publicUrlData.publicUrl;
            }

            const { error } = await supabase
                .from('speakers')
                .insert([{
                    full_name: name,
                    title: title,
                    company: company,
                    image_url: imageUrl,
                    linkedin_url: linkedin
                }]);

            if (error) throw error;

            msgDiv.innerHTML = '<span style="color: green;">Konuşmacı başarıyla eklendi!</span>';
            addSpeakerForm.reset();
            fetchData('speakers');
        } catch (err) {
            console.error(err);
            msgDiv.innerHTML = `<span style="color: red;">Hata: ${err.message}</span>`;
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// Expose delete to global window for onclick
window.deleteSpeaker = async (id) => {
    if (!confirm('Bu konuşmacıyı silmek istediğinize emin misiniz?')) return;
    
    try {
        const { error } = await supabase
            .from('speakers')
            .delete()
            .match({ id });

        if (error) throw error;
        
        fetchData('speakers');
    } catch (err) {
        alert('Silme hatası: ' + err.message);
    }
};
