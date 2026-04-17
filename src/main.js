import { createClient } from '@supabase/supabase-js'

/* 
  Supabase Configuration
  Get these values from your Supabase Dashboard: Project Settings > API
*/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Countdown Timer Logic
const countDownDate = new Date("May 14, 2026 10:00:00").getTime();

const x = setInterval(function() {
  const now = new Date().getTime();
  const distance = countDownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (daysEl) daysEl.innerHTML = days < 10 ? '0' + days : days;
  if (hoursEl) hoursEl.innerHTML = hours < 10 ? '0' + hours : hours;
  if (minutesEl) minutesEl.innerHTML = minutes < 10 ? '0' + minutes : minutes;
  if (secondsEl) secondsEl.innerHTML = seconds < 10 ? '0' + seconds : seconds;

  if (distance < 0) {
    clearInterval(x);
    if (daysEl) daysEl.innerHTML = "00";
    if (hoursEl) hoursEl.innerHTML = "00";
    if (minutesEl) minutesEl.innerHTML = "00";
    if (secondsEl) secondsEl.innerHTML = "00";
  }
}, 1000);

// Registration Form Logic
const form = document.getElementById('register-form');
const submitBtn = document.getElementById('submit-btn');
const loader = document.getElementById('loader');
const messageDiv = document.getElementById('form-message');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const department = document.getElementById('department').value;
    const survey = document.getElementById('survey').value;

    // Show loader
    if (submitBtn) {
      const span = submitBtn.querySelector('span');
      if (span) span.style.display = 'none';
      if (loader) loader.style.display = 'block';
      submitBtn.disabled = true;
    }
    
    if (messageDiv) {
      messageDiv.innerHTML = '';
      messageDiv.className = 'message';
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([
          { full_name: name, email: email, department: department, survey_interest: survey }
        ]);

      if (error) throw error;

      if (messageDiv) {
        messageDiv.innerHTML = 'Kayıt başarılı! Seni aramızda göreceğimiz için heyecanlıyız.';
        messageDiv.classList.add('success');
      }
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      if (messageDiv) {
        messageDiv.innerHTML = 'Kayıt olurken bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.<br>Not: Eğer Supabase bilgilerinizi .env dosyasına girmediyseniz bu hatayı alıyor olabilirsiniz.';
        messageDiv.classList.add('error');
      }
    } finally {
      // Hide loader
      if (submitBtn) {
        const span = submitBtn.querySelector('span');
        if (span) span.style.display = 'inline';
        if (loader) loader.style.display = 'none';
        submitBtn.disabled = false;
      }
    }
  });
}

// Navbar Scroll & Section Highlighting
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section, .hero-card');

const observerOptions = {
  threshold: 0.3
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id') || 'home';
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
      
      // Trigger animation
      if (entry.target.classList.contains('slide-up')) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// Dynamic Speakers Fetching
async function fetchAndRenderSpeakers() {
  const container = document.getElementById('speakers-container');
  if (!container) return;

  try {
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Henüz konuşmacı eklenmedi.</p>';
      return;
    }

    container.innerHTML = data.map(speaker => `
      <div class="speaker-card">
        <div class="speaker-image">
          <img src="${speaker.image_url || 'https://via.placeholder.com/400x400'}" alt="${speaker.full_name}">
        </div>
        <div class="speaker-info">
          <h3>${speaker.full_name}</h3>
          <p class="speaker-title">${speaker.title}</p>
          <p class="speaker-company">${speaker.company}</p>
          <div class="speaker-socials">
            ${speaker.linkedin_url ? `<a href="${speaker.linkedin_url}" target="_blank">LinkedIn</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error fetching speakers:', err);
    container.innerHTML = '<p style="color: red; grid-column: 1/-1;">Konuşmacılar yüklenirken hata oluştu.</p>';
  }
}

fetchAndRenderSpeakers();

async function fetchAndRenderProgram() {
  try {
    const { data, error } = await supabase.from('program_items').select('*').order('time', { ascending: true });
    if (error) throw error;
    
    ['day1', 'day2'].forEach(day => {
       const container = document.getElementById(`program-${day}`);
       if(!container) return;
       const dayData = data.filter(i => i.day === day);
       
       if (dayData.length === 0) {
         container.innerHTML = '<p style="padding-left: 20px;">Henüz bu gün için program eklenmedi.</p>';
         return;
       }

       container.innerHTML = dayData.map(item => `
         <div class="timeline-item">
           <div class="time">${item.time}</div>
           <div class="event">
             <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
               <div>
                  <h3>${item.title}</h3>
                  <p>${item.description || ''}</p>
                  ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
               </div>
               ${item.image_url ? `
                 <div class="event-poster" onclick="window.open('${item.image_url}', '_blank')" style="cursor: pointer;">
                   <img src="${item.image_url}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                   <small style="display: block; text-align: center; color: var(--accent-orange); margin-top: 4px; font-size: 0.7rem;">Afişi Gör</small>
                 </div>
               ` : ''}
             </div>
           </div>
         </div>
       `).join('');
    });
  } catch (err) { console.error('Program fetch error:', err); }
}

async function fetchAndRenderSponsors() {
  const container = document.getElementById('sponsors-dynamic-container');
  if (!container) return;

  try {
    const { data, error } = await supabase.from('sponsors').select('*').order('created_at', { ascending: true });
    if (error) throw error;

    const tiers = ['Platin', 'Altın', 'Gümüş', 'Katılımcı'];
    let html = '';

    tiers.forEach(tier => {
       const tierData = data.filter(s => s.tier === tier);
       if (tierData.length > 0) {
         html += `<h3 class="section-subheading">${tier} ${tier === 'Katılımcı' ? 'Firmalar' : 'Sponsorlar'}</h3>`;
         html += `<div class="sponsor-grid">`;
         html += tierData.map(s => `
           <div class="sponsor-item ${tier === 'Platin' || tier === 'Altın' ? 'featured' : ''}">
             <img src="${s.logo_url}" alt="${s.name}" style="max-height: ${tier === 'Platin' ? '200px' : (tier === 'Altın' ? '160px' : '100px')}; max-width: 100%; transition: all 0.3s;">
           </div>
         `).join('');
         html += `</div>`;
       }
    });

    container.innerHTML = html || '<p>Henüz sponsor eklenmedi.</p>';
  } catch (err) { console.error('Sponsor fetch error:', err); }
}

fetchAndRenderProgram();
fetchAndRenderSponsors();

async function fetchAndRenderTeam() {
  const container = document.getElementById('team-container');
  if (!container) return;

  try {
    const { data, error } = await supabase.from('team_members').select('*').order('order_index', { ascending: true });
    if (error) throw error;

    if (data.length === 0) {
      container.innerHTML = '<p>Henüz ekip üyesi eklenmedi.</p>';
      return;
    }

    container.innerHTML = data.map(member => `
      <div class="team-card team-member-card">
        <div class="team-member-image">
          <img src="${member.image_url || 'https://via.placeholder.com/150'}" alt="${member.full_name}">
        </div>
        <div class="team-member-info">
          <h4>${member.full_name}</h4>
          <small>${member.institution}</small>
        </div>
      </div>
    `).join('');
  } catch (err) { console.error('Team fetch error:', err); }
}

fetchAndRenderTeam();

// Program Tabs Logic
const programTabBtns = document.querySelectorAll('.program-tabs .tab-btn');
const dayContents = document.querySelectorAll('.day-content');

programTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const day = btn.dataset.day;
    
    // Reset active states
    programTabBtns.forEach(b => b.classList.remove('active'));
    dayContents.forEach(c => c.classList.remove('active'));
    
    // Set active
    btn.classList.add('active');
    document.getElementById(day).classList.add('active');
  });
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}
