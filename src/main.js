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

// Educator Form Logic
const eduForm = document.getElementById('educator-form');
const eduSubmitBtn = document.getElementById('edu-submit-btn');
const eduLoader = document.getElementById('edu-loader');
const eduMessageDiv = document.getElementById('edu-form-message');

if (eduForm) {
  eduForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('edu-name').value;
    const email = document.getElementById('edu-email').value;
    const phone = document.getElementById('edu-phone').value;
    const title = document.getElementById('edu-title').value;
    const desc = document.getElementById('edu-desc').value;
    const location = document.getElementById('edu-location').value;
    const notes = document.getElementById('edu-notes').value;

    // Get Radio value (Duration)
    const duration = eduForm.querySelector('input[name="edu-duration"]:checked')?.value || '';

    // Get Checkbox values (Format)
    const formats = Array.from(eduForm.querySelectorAll('input[name="edu-format"]:checked'))
      .map(cb => cb.value)
      .join(', ');

    // Show loader
    if (eduSubmitBtn) {
      const span = eduSubmitBtn.querySelector('span');
      if (span) span.style.display = 'none';
      if (eduLoader) eduLoader.style.display = 'block';
      eduSubmitBtn.disabled = true;
    }
    
    if (eduMessageDiv) {
      eduMessageDiv.innerHTML = '';
      eduMessageDiv.className = 'message';
    }

    try {
      const { data, error } = await supabase
        .from('educators')
        .insert([
          { 
            full_name: name, 
            email: email, 
            phone: phone,
            workshop_title: title,
            workshop_description: desc,
            duration: duration,
            format: formats,
            location: location,
            notes: notes
          }
        ]);

      if (error) throw error;

      if (eduMessageDiv) {
        eduMessageDiv.innerHTML = 'Başvurunuz alındı! Teşekkür ederiz.';
        eduMessageDiv.classList.add('success');
      }
      eduForm.reset();
    } catch (error) {
      console.error('Error:', error);
      if (eduMessageDiv) {
        eduMessageDiv.innerHTML = 'Hata oluştu. Lütfen tekrar deneyin.';
        eduMessageDiv.classList.add('error');
      }
    } finally {
      // Hide loader
      if (eduSubmitBtn) {
        const span = eduSubmitBtn.querySelector('span');
        if (span) span.style.display = 'inline';
        if (eduLoader) eduLoader.style.display = 'none';
        eduSubmitBtn.disabled = false;
      }
    }
  });
}

// Educator Modal Logic
const modal = document.getElementById("educator-modal");
const openBtn = document.getElementById("open-educator-btn");
const closeSpan = document.querySelector(".close-modal");

if (openBtn) {
  openBtn.onclick = function() {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

if (closeSpan) {
  closeSpan.onclick = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}
