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
