<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <span class="logo-icon">✈</span>
            <span class="logo-text">ETN<strong>Air</strong></span>
          </div>
          <p>La plateforme de location de logements étudiants. Simple, rapide, sécurisé.</p>
          <div class="socials">
            <a href="#" class="social-btn">f</a>
            <a href="#" class="social-btn">in</a>
            <a href="#" class="social-btn">tw</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Logements</h4>
          <ul class="footer-links">
            <li><RouterLink to="/annonces">Toutes les annonces</RouterLink></li>
            <li><RouterLink to="/annonces?city=Paris">Paris</RouterLink></li>
            <li><RouterLink to="/annonces?city=Lyon">Lyon</RouterLink></li>
            <li><RouterLink to="/annonces?city=Toulouse">Toulouse</RouterLink></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">Mon espace</h4>
          <ul class="footer-links">
            <li><RouterLink to="/login">Se connecter</RouterLink></li>
            <li><RouterLink to="/register">Créer un compte</RouterLink></li>
            <li><RouterLink to="/dashboard">Mon tableau de bord</RouterLink></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">Aide</h4>
          <ul class="footer-links">
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Mentions légales</a></li>
            <li><a href="#">CGU</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 ETNAir — Projet ETNA C2W-CBI1</span>
        <span>Fait avec ❤️ par l'équipe ETNAir</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: #0f172a; color: #94a3b8; padding: 64px 0 32px; margin-top: 80px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
.footer-brand .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.footer-brand .logo-icon { font-size: 1.3rem; }
.footer-brand .logo-text { font-size: 1.2rem; font-weight: 600; color: #fff; }
.footer-brand .logo-text strong { color: #60a5fa; }
.footer-brand p { font-size: .9rem; line-height: 1.7; margin-bottom: 20px; }
.socials { display: flex; gap: 8px; }
.social-btn { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; color: #fff; transition: background var(--transition); }
.social-btn:hover { background: var(--primary); }
.footer-title { font-size: .95rem; font-weight: 700; color: #fff; margin-bottom: 16px; }
.footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-links a { font-size: .9rem; color: #94a3b8; transition: color var(--transition); }
.footer-links a:hover { color: #fff; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,.1); padding-top: 24px; display: flex; justify-content: space-between; font-size: .85rem; }
@media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr; } .footer-bottom { flex-direction: column; gap: 8px; } }
</style>