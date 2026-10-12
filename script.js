document.documentElement.classList.add('js');

(() => {
  const STORAGE_KEY = 'proaudio-consent-v2';
  const readConsent = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (error) { return null; }
  };
  const savedConsent = readConsent();
  window.ProAudioConsent = { necessary: true, externalMedia: savedConsent?.externalMedia === true };

  const activateExternalMedia = () => {
    document.querySelectorAll('[data-cookie-src]').forEach(frame => {
      frame.src = frame.dataset.cookieSrc;
      frame.removeAttribute('data-cookie-src');
      frame.closest('.live-frame')?.classList.remove('media-blocked');
      frame.closest('.live-frame')?.querySelector('.media-consent-placeholder')?.remove();
    });
  };

  const mountConsentUi = () => {
    if (!window.ProAudioConsent.externalMedia) {
      document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"]').forEach(frame => {
        frame.dataset.cookieSrc = frame.src;
        frame.removeAttribute('src');
      });
    }
    const footerSurface = document.querySelector('.reference-footer-surface');
    if (footerSurface) {
      footerSurface.querySelector('.reference-footer-bottom')?.remove();
      footerSurface.querySelector('.reference-footer-meta')?.remove();
      const identity = footerSurface.querySelector('.reference-footer-identity');
      if (identity && !identity.querySelector('.reference-footer-note')) {
        const note = document.createElement('p');
        note.className = 'reference-footer-note';
        note.textContent = 'Formación musical contemporánea para producir, mezclar y actuar con criterio.';
        identity.querySelector('.reference-footer-logo')?.after(note);
      }
      const socialList = footerSurface.querySelector('nav[aria-label="Redes en el pie"] ul');
      if (socialList && !socialList.querySelector('a[href^="mailto:"]')) {
        const emailItem = document.createElement('li');
        emailItem.innerHTML = '<a href="mailto:info@proaudioescuela.com"><svg class="reference-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/></svg><span>Email</span></a>';
        socialList.prepend(emailItem);
      }
      const layout = footerSurface.querySelector('.reference-footer-layout');
      if (layout && !layout.querySelector('.reference-footer-newsletter')) {
        const newsletter = document.createElement('div');
        newsletter.className = 'reference-footer-newsletter footer-reveal';
        newsletter.style.setProperty('--footer-delay', '300ms');
        newsletter.innerHTML = '<h3>Mantente al día</h3><p>Nuevos cursos, sesiones y plazas abiertas.</p><form><label class="sr-only" for="footer-email">Tu email</label><input id="footer-email" name="email" type="email" autocomplete="email" placeholder="Tu email" required><button type="submit">Suscribirme</button></form><span class="footer-form-status" aria-live="polite"></span>';
        layout.append(newsletter);
        newsletter.querySelector('form').addEventListener('submit', event => {
          event.preventDefault();
          const email = new FormData(event.currentTarget).get('email');
          newsletter.querySelector('.footer-form-status').textContent = 'Abriendo tu correo para completar la suscripción…';
          location.href = `mailto:info@proaudioescuela.com?subject=${encodeURIComponent('Alta newsletter ProAudio')}&body=${encodeURIComponent(`Quiero suscribirme con: ${email}`)}`;
        });
      }
    }

    document.querySelectorAll('[data-cookie-src]').forEach(frame => {
      const container = frame.closest('.live-frame');
      if (!container || container.querySelector('.media-consent-placeholder')) return;
      container.classList.add('media-blocked');
      const placeholder = document.createElement('div');
      placeholder.className = 'media-consent-placeholder';
      placeholder.innerHTML = '<p>Este vídeo usa contenido externo de YouTube.</p><button type="button" data-cookie-settings>Configurar cookies</button>';
      container.append(placeholder);
    });

    const preferences = document.createElement('section');
    preferences.className = 'cookie-preferences';
    preferences.hidden = true;
    preferences.setAttribute('role', 'dialog');
    preferences.setAttribute('aria-modal', 'true');
    preferences.setAttribute('aria-labelledby', 'cookie-preferences-title');
    preferences.innerHTML = `<div class="cookie-preferences-panel"><div class="cookie-preferences-head"><div><p class="cookie-kicker">Privacidad</p><h2 id="cookie-preferences-title">Elige qué activamos.</h2></div><button type="button" class="cookie-close" aria-label="Cerrar preferencias">Cerrar</button></div><p>Las cookies necesarias mantienen tus preferencias. El contenido externo permite reproducir vídeos de YouTube y puede implicar comunicaciones con ese proveedor.</p><div class="cookie-option"><div><strong>Necesarias</strong><span>Preferencias de consentimiento y funcionamiento básico.</span></div><span class="cookie-required">Siempre activas</span></div><label class="cookie-option"><div><strong>Contenido externo</strong><span>Vídeos y recursos alojados por terceros.</span></div><input type="checkbox" name="externalMedia"></label><div class="cookie-actions"><button type="button" class="cookie-button secondary" data-cookie-reject>Solo necesarias</button><button type="button" class="cookie-button" data-cookie-save>Guardar selección</button></div></div>`;
    document.body.append(preferences);

    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.hidden = Boolean(savedConsent);
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Preferencias de privacidad');
    banner.innerHTML = `<div class="cookie-banner-copy"><strong>Tu privacidad también forma parte del ritmo.</strong><p>Usamos almacenamiento necesario y, solo con tu permiso, contenido externo de YouTube. Puedes aceptar, rechazar o elegir.</p><div class="cookie-banner-meta"><span>© ${new Date().getFullYear()} ProAudio Escuela · Sevilla</span><a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Privacidad</a><a href="cookies.html">Cookies</a></div></div><div class="cookie-banner-actions"><button type="button" class="cookie-button secondary" data-cookie-reject>Rechazar opcionales</button><button type="button" class="cookie-button secondary" data-cookie-settings>Configurar</button><button type="button" class="cookie-button" data-cookie-accept>Aceptar todo</button></div>`;
    document.body.append(banner);

    const mediaToggle = preferences.querySelector('input[name="externalMedia"]');
    mediaToggle.checked = window.ProAudioConsent.externalMedia;
    const openPreferences = () => {
      preferences.hidden = false;
      document.body.classList.add('cookie-dialog-open');
      preferences.querySelector('.cookie-close')?.focus();
    };
    const closePreferences = () => {
      preferences.hidden = true;
      document.body.classList.remove('cookie-dialog-open');
    };
    const saveConsent = externalMedia => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ necessary: true, externalMedia, updatedAt: new Date().toISOString() }));
      window.ProAudioConsent.externalMedia = externalMedia;
      banner.hidden = true;
      closePreferences();
      if (externalMedia) {
        activateExternalMedia();
        if (document.body.dataset.page === 'live') location.reload();
      }
    };

    document.addEventListener('click', event => {
      if (event.target.closest('[data-cookie-settings]')) openPreferences();
      if (event.target.closest('[data-cookie-accept]')) saveConsent(true);
      if (event.target.closest('[data-cookie-reject]')) saveConsent(false);
      if (event.target.closest('[data-cookie-save]')) saveConsent(mediaToggle.checked);
      if (event.target.closest('.cookie-close')) closePreferences();
      if (event.target === preferences) closePreferences();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !preferences.hidden) closePreferences();
    });

    if (window.ProAudioConsent.externalMedia) activateExternalMedia();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountConsentUi, { once: true });
  else mountConsentUi();
})();
document.addEventListener('DOMContentLoaded', () => {
  const pads = document.querySelector('.mixer-pads');
  if (pads) pads.innerHTML = Array.from({ length: 32 }, () => '<i class="mixer-pad"></i>').join('');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const compactNavigation = window.matchMedia('(max-width: 1100px)');
  const pageSurfaces = () => [...document.querySelectorAll('main, footer')];
  // Mobile menu panel (vanilla port of the shadcn "curved-menu" block), no motion.
  // Links are cloned from the desktop nav so both menus stay in sync.
  const socials = [
    ['Instagram', 'https://www.instagram.com/proaudioescuela/', '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'],
    ['YouTube', 'https://www.youtube.com/channel/UCj-96ru8VCh00szLGx2vClw', '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49 49 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49 49 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 9 5 3-5 3z"/>'],
    ['Facebook', 'https://www.facebook.com/ProaudioEscuela/', '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>']
  ];
  let panel = null, cmToggle = null;
  const buildMenu = () => {
    if (panel || !nav) return;
    const links = [...nav.querySelectorAll('a')];
    const here = (location.pathname.split('/').pop() || 'index.html');
    cmToggle = document.createElement('button');
    cmToggle.type = 'button';
    cmToggle.className = 'cm-toggle';
    cmToggle.setAttribute('aria-controls', 'curved-menu');
    cmToggle.setAttribute('aria-expanded', 'false');
    cmToggle.setAttribute('aria-label', 'Abrir menú');
    cmToggle.innerHTML = '<span class="cm-bars"><span></span><span></span><span></span></span>';
    panel = document.createElement('div');
    panel.className = 'curved-menu';
    panel.id = 'curved-menu';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Navegación principal');
    panel.hidden = true;
    panel.innerHTML = `
      <div class="cm-inner">
        <div class="cm-body">
          <ul class="cm-list">${links.map((a, i) => {
            const label = a.textContent.replace(/\s*↗\s*$/, '').trim();
            const href = a.getAttribute('href');
            const current = href === here ? ' aria-current="page"' : '';
            return `<li><a class="cm-link" href="${href}"${current}><span class="cm-num">${i + 1}.</span><span class="cm-word">${label}</span></a></li>`;
          }).join('')}</ul>
        </div>
        <div class="cm-footer">${socials.map(([name, url, icon]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg></a>`).join('')}</div>
      </div>`;
    document.body.append(panel);
    (document.querySelector('.site-header .header-inner') || document.body).append(cmToggle);
  };
  const menuOpen = () => !!panel && !panel.hidden;
  const setMenu = (open, restoreFocus = false, focusFirst = false) => {
    if (!menuToggle || !nav) return;
    buildMenu();
    if (open === menuOpen()) return;
    if (open) {
      const header = document.querySelector('.site-header');
      panel.style.setProperty('--cm-top', `${Math.max(0, header ? header.getBoundingClientRect().bottom : 0)}px`);
    }
    panel.hidden = !open;
    cmToggle.classList.toggle('is-active', open);
    document.body.classList.toggle('menu-open', open);
    cmToggle.setAttribute('aria-expanded', String(open));
    cmToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    pageSurfaces().forEach(surface => { surface.inert = open; });
    if (open && focusFirst) panel.querySelector('.cm-link')?.focus({ preventScroll: true });
    if (!open && restoreFocus) cmToggle.focus();
  };
  if (menuToggle && nav) {
    buildMenu();
    cmToggle.addEventListener('click', event => setMenu(!menuOpen(), false, event.detail === 0));
    document.addEventListener('click', event => {
      if (menuOpen() && event.target.closest('.cm-link')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (!menuOpen()) return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false, true); }
      if (event.key === 'Tab') {
        const links = [...panel.querySelectorAll('a'), cmToggle];
        const first = links[0], last = links.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    compactNavigation.addEventListener('change', () => setMenu(false));
  }

  // Dialogs keep focus inside the reader and restore the page when dismissed.
  const setDialogActive = active => {
    document.querySelectorAll('main, footer, .site-header, .topbar, .skip-link').forEach(surface => {
      surface.inert = active;
    });
  };
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const dialog = document.querySelector('.detail-modal.is-open [role="dialog"], .article-modal.is-open [role="dialog"]');
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  const hero = document.querySelector('.hero');
  const heroArt = document.querySelector('.hero-media');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hero && heroArt && !reduceMotion) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      heroArt.style.setProperty('--mx', (((event.clientX - rect.left) / rect.width) - .5).toFixed(3));
      heroArt.style.setProperty('--my', (((event.clientY - rect.top) / rect.height) - .5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      heroArt.style.setProperty('--mx', 0);
      heroArt.style.setProperty('--my', 0);
    });
  }

  const current = location.pathname.split('/').pop() || 'index.html';
  document.body.dataset.page = current.replace(/\.html$/, '') || 'index';
  if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') document.documentElement.classList.add('local-preview');

  // One reading signal across the whole platform.
  const siteProgress = document.querySelector('.reading-progress') || document.createElement('div');
  if (!siteProgress.parentElement) {
    siteProgress.className = 'reading-progress';
    siteProgress.setAttribute('aria-hidden', 'true');
    document.body.prepend(siteProgress);
  }
  const updateSiteProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    siteProgress.style.setProperty('--reading-progress-scale', String(percentage / 100));
  };
  updateSiteProgress();
  window.addEventListener('scroll', updateSiteProgress, { passive: true });
  window.addEventListener('resize', updateSiteProgress);
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.split('#')[0] === current) { link.classList.add('active'); link.setAttribute('aria-current', 'page'); }
  });

  // Use the actual ProAudio mark everywhere, like Ableton's persistent brand lockup.
  const proAudioLogo = 'https://www.proaudioescuela.com/wp-content/uploads/2019/04/logo-proaudio-escuela-sevilla-bn.png';
  document.querySelectorAll('.brand').forEach(brand => {
    brand.innerHTML = `<img src="${proAudioLogo}" alt="ProAudio Escuela de Música Electrónica">`;
  });

  // The new art direction is content-first: remove redundant eyebrow captions globally.
  document.querySelectorAll('.eyebrow, .hero-caption, .video-meta').forEach(el => el.remove());

  // Shared photographic faculty system. The same portraits appear in the
  // home team module and on the full faculty page so the site feels authored,
  // not assembled from placeholder cards.
  const teacherPhotos = [
    { name: 'David Surex', role: 'Producción · Ableton Live', src: 'assets/david-suarez-bio.jpg' },
    { name: 'Pedro Viñuela', role: 'Sonido · Mezcla & mastering', src: 'https://www.proaudioescuela.com/wp-content/uploads/2019/04/Disen%CC%83o-sin-ti%CC%81tulo-9-510x382.png' },
    { name: 'Juan Manuel García', role: 'Producción · Performance', src: 'https://www.proaudioescuela.com/wp-content/uploads/2024/03/273879368_5143619849003052_3293249894559204547_n-510x382.jpg' },
    { name: 'Enrique Seco', role: 'DJ · Cultura de club', src: 'https://www.proaudioescuela.com/wp-content/uploads/2023/02/kike_seco_bn-510x382.jpg' }
  ];
  document.querySelectorAll('.faculty').forEach((card, index) => {
    const avatar = card.querySelector('.avatar');
    const teacher = teacherPhotos[index % teacherPhotos.length];
    if (!avatar || !teacher || avatar.querySelector('.faculty-photo')) return;
    const photo = document.createElement('img');
    photo.className = 'faculty-photo';
    photo.src = teacher.src;
    photo.alt = `${teacher.name} — ${teacher.role}`;
    photo.loading = index > 1 ? 'lazy' : 'eager';
    avatar.replaceChildren(photo);
  });

  // Shared faculty shelf used by the landing and the complete faculty page.
  // The full page can opt into a longer description inside the open panel.
  const mountFacultySpine = (facultyGrid, { includeDescription = false } = {}) => {
    if (!facultyGrid || facultyGrid.classList.contains('spine-accordion')) return null;
    if (!document.querySelector('style[data-proaudio-spine-style]')) {
      const spineStyle = document.createElement('style');
      spineStyle.dataset.proaudioSpineStyle = 'true';
      spineStyle.textContent = `
        .profesorado-spine{display:flex!important;min-height:clamp(420px,57svh,620px)!important;overflow:hidden!important;background:#101010!important;border:1px solid rgba(16,16,16,.24)!important;box-shadow:12px 12px 0 #7657ff!important}
        .profesorado-spine .spine-panel{position:relative!important;display:block!important;min-width:84px!important;min-height:100%!important;flex:0 1 84px!important;overflow:hidden!important;padding:0!important;border:0!important;border-right:1px solid rgba(246,244,237,.28)!important;border-top:4px solid #ff764d!important;background:#171717!important;color:#f6f4ed!important;text-align:left!important;cursor:pointer!important;transition:flex-basis .7s cubic-bezier(.22,1,.36,1),background .4s ease!important}
        .profesorado-spine .spine-panel:nth-child(2){border-top-color:#b6ffc0!important}.profesorado-spine .spine-panel:nth-child(3){border-top-color:#7657ff!important}.profesorado-spine .spine-panel:nth-child(4){border-top-color:#ffb7d5!important}.profesorado-spine .spine-panel.is-open{flex:1 1 100%!important;background:#0b0b0b!important}
        .profesorado-spine .spine-media{position:absolute!important;inset:12px 12px 12px 92px!important;display:block!important;overflow:hidden!important;opacity:0!important;transform:translateX(18px) scale(1.03)!important;transition:opacity .55s ease .12s,transform .7s cubic-bezier(.22,1,.36,1) .08s!important}.profesorado-spine .spine-panel.is-open .spine-media{opacity:1!important;transform:none!important}.profesorado-spine .spine-media img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important}.profesorado-spine .spine-wash{position:absolute!important;inset:0!important;display:block!important;background:linear-gradient(90deg,rgba(0,0,0,.7),transparent 34%,rgba(0,0,0,.08) 70%,rgba(0,0,0,.56))!important}
        .profesorado-spine .spine-copy{position:absolute!important;z-index:2!important;inset:16px 12px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:space-between!important;pointer-events:none!important}.profesorado-spine .spine-name,.profesorado-spine .spine-meta{display:block!important;color:#f6f4ed!important;font:500 12px/1.1 var(--font-ui)!important;letter-spacing:.035em!important;text-transform:uppercase!important;writing-mode:vertical-rl!important;transform:rotate(180deg)!important;white-space:nowrap!important}.profesorado-spine .spine-meta{color:#b6ffc0!important;font-size:9px!important}.profesorado-spine .spine-description{position:absolute!important;left:106px!important;bottom:18px!important;width:min(390px,calc(100% - 128px))!important;color:rgba(246,244,237,.84)!important;font:400 14px/1.4 var(--font-body)!important;opacity:0!important}.profesorado-spine .spine-panel.is-open .spine-description{opacity:1!important}
        @media(max-width:680px){.profesorado-spine{flex-direction:column!important;min-height:0!important;box-shadow:6px 6px 0 #7657ff!important}.profesorado-spine .spine-panel{min-width:100%!important;min-height:64px!important;flex:0 1 64px!important;border-right:0!important;border-bottom:1px solid rgba(246,244,237,.28)!important}.profesorado-spine .spine-panel.is-open{min-height:360px!important;flex:1 1 360px!important}.profesorado-spine .spine-media,.profesorado-spine .spine-panel.is-open .spine-media{inset:58px 10px 10px!important;transform:none!important}.profesorado-spine .spine-copy{inset:0 14px!important;flex-direction:row!important;align-items:center!important}.profesorado-spine .spine-name,.profesorado-spine .spine-meta{max-width:72%!important;writing-mode:horizontal-tb!important;transform:none!important}.profesorado-spine .spine-description{left:14px!important;right:14px!important;bottom:24px!important;width:auto!important;font-size:13px!important}}
      `;
      document.head.append(spineStyle);
    }
    const shelf = document.createElement('div');
    shelf.className = `spine-accordion${includeDescription ? ' professorado-spine' : ''}`;
    shelf.setAttribute('role', 'tablist');
    shelf.setAttribute('aria-label', 'Personas detrás del sonido');

    Array.from(facultyGrid.querySelectorAll('.faculty')).forEach((card, index) => {
      const title = card.querySelector('h3')?.textContent?.trim() || `Profesor ${index + 1}`;
      const profile = Array.from(card.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean);
      const meta = profile[0] || 'ProAudio';
      const description = includeDescription ? (profile.slice(1).join(' ') || 'Profesional en activo y parte del equipo ProAudio.') : '';
      const image = card.querySelector('.faculty-photo');
      const panel = document.createElement('button');
      panel.type = 'button';
      panel.className = `spine-panel${index === 0 ? ' is-open' : ''}`;
      panel.setAttribute('role', 'tab');
      panel.setAttribute('aria-selected', String(index === 0));
      panel.setAttribute('aria-expanded', String(index === 0));
      panel.setAttribute('tabindex', index === 0 ? '0' : '-1');
      panel.dataset.index = String(index);
      panel.innerHTML = `
        <span class="spine-media" aria-hidden="true">
          <img src="${image?.src || ''}" alt="" loading="lazy" draggable="false">
          <span class="spine-wash"></span>
        </span>
        <span class="spine-copy">
          <span class="spine-name">${title}</span>
          <span class="spine-meta">${meta}</span>
          ${description ? `<span class="spine-description">${description}</span>` : ''}
        </span>
      `;
      shelf.append(panel);
    });

    const selectPanel = (next, focus = false) => {
      shelf.querySelectorAll('.spine-panel').forEach((panel, index) => {
        const selected = index === next;
        panel.classList.toggle('is-open', selected);
        panel.setAttribute('aria-selected', String(selected));
        panel.setAttribute('aria-expanded', String(selected));
        panel.setAttribute('tabindex', selected ? '0' : '-1');
        if (focus && selected) panel.focus();
      });
    };

    shelf.querySelectorAll('.spine-panel').forEach((panel, index, panels) => {
      panel.addEventListener('click', () => selectPanel(index));
      panel.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') selectPanel(index);
      });
      panel.addEventListener('focus', () => selectPanel(index));
      panel.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const horizontal = window.matchMedia('(min-width: 681px)').matches;
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = panels.length - 1;
        else if ((horizontal && event.key === 'ArrowRight') || (!horizontal && event.key === 'ArrowDown')) next = (index + 1) % panels.length;
        else if ((horizontal && event.key === 'ArrowLeft') || (!horizontal && event.key === 'ArrowUp')) next = (index - 1 + panels.length) % panels.length;
        selectPanel(next, true);
      });
    });

    facultyGrid.replaceWith(shelf);
    return shelf;
  };

  const mountFacultyBento = facultyGrid => {
    if (!facultyGrid || facultyGrid.classList.contains('faculty-bento')) return null;
    const bento = document.createElement('div');
    bento.className = 'faculty-bento';
    bento.setAttribute('aria-label', 'Equipo docente ProAudio');
    const facultyBios = [
      'Dirección académica y formación oficial en producción musical.',
      'Ingeniería de sonido y escucha crítica aplicada a tus producciones.',
      'Workflow, arreglo y puesta en escena para llevar una idea más lejos.',
      'Selección, mezcla y lectura de pista con visión profesional.'
    ];
    Array.from(facultyGrid.querySelectorAll('.faculty')).forEach((card, index) => {
      const title = card.querySelector('h3')?.textContent?.trim() || `Profesor ${index + 1}`;
      const profile = Array.from(card.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean);
      const image = card.querySelector('.faculty-photo');
      const bio = profile[1] || facultyBios[index] || 'Profesional en activo y parte del equipo ProAudio.';
      const article = document.createElement('article');
      article.className = `faculty-bento-card${index === 0 ? ' faculty-bento-featured' : ''}`;
      article.innerHTML = `
        <div class="faculty-bento-image"><img src="${image?.src || ''}" alt="${title}" loading="${index === 0 ? 'eager' : 'lazy'}"></div>
        <div class="faculty-bento-copy">
          <h3>${title}</h3>
          <p class="faculty-bento-role">${profile[0] || 'Equipo docente'}</p>
          <p class="faculty-bento-bio">${bio}</p>
        </div>
      `;
      bento.append(article);
    });
    facultyGrid.replaceWith(bento);
    return bento;
  };

  const mountCourseAccordion = () => {
    const detail = document.querySelector('main .course-detail');
    const list = detail?.querySelector('.module-list');
    if (!detail || !list || list.classList.contains('course-accordion')) return null;
    detail.classList.add('course-selector-shell');
    const courseData = {
      ableton: {
        summary: 'Aprende a pensar en Live como un instrumento: desde la primera idea hasta una exportación lista para compartir.',
        duration: '60 horas', format: 'Presencial + online', outcome: '1 track terminado',
        work: ['Session View + Arrangement', 'MIDI, sampling y warping', 'Síntesis, automatización y mezcla'],
        ideal: 'Quieres dejar de perderte en Live y empezar a terminar ideas con un flujo propio.',
        deep: ['Empiezas por la escucha y no por el menú. Aprendes a decidir qué necesita una idea antes de añadir más pistas, efectos o instrumentos.', 'El recorrido conecta Session View y Arrangement para que puedas improvisar sin perder la forma. Trabajas clips, escenas, estructura, automatización y transiciones con un proyecto propio como hilo conductor.', 'Después entran MIDI, sampling, warping y síntesis. No se trata de memorizar funciones, sino de entender qué cambia en el tiempo, el timbre, el espacio y la energía de una producción.', 'Cada bloque termina en una decisión audible: grabar, editar, mezclar y exportar una versión que puedas enseñar, revisar y seguir desarrollando.']
      },
      produccion: {
        summary: 'Ordena tus decisiones de sonido, arreglo y dinámica para que una mezcla tenga dirección, profundidad y criterio.',
        duration: '60 horas', format: 'Grupos reducidos', outcome: 'Mezcla revisada',
        work: ['Arreglo y elección de sonidos', 'EQ, compresión y dinámica', 'Espacio, profundidad y entrega'],
        ideal: 'Ya produces y necesitas que tus temas suenen más claros, sólidos y personales.',
        deep: ['Partes de una producción real, no de una plantilla. Analizas qué está contando el tema, qué elemento lleva el foco y qué información puede desaparecer para que la idea respire.', 'Trabajas selección de sonidos, arreglo y balance antes de perseguir volumen. La ecualización aparece como una herramienta para hacer sitio; la compresión, como una forma de controlar movimiento y presencia.', 'Después investigas profundidad, reverbs, delays, panorama, automatización y referencias. El objetivo es que puedas escuchar por qué una mezcla se siente plana, confusa, pequeña o sin dirección.', 'Terminas con una mezcla revisada y un método repetible: preparar, comparar, corregir, descansar el oído y tomar decisiones que sirvan a la canción.']
      },
      dj: {
        summary: 'Construye sesiones con narrativa, técnica y lectura de pista: del primer cue a una cabina preparada.',
        duration: 'Intensivo', format: 'Traktor + Serato', outcome: 'Sesión preparada',
        work: ['Selección y estructura musical', 'Mezcla, cues y transiciones', 'Equipo, cabina y preparación'],
        ideal: 'Quieres pinchar con seguridad, preparar una sesión y entender qué hace avanzar una pista.',
        deep: ['Una sesión empieza antes de abrir el software. Aprendes a investigar música, ordenar energía, detectar puntos de entrada y construir una selección que tenga intención.', 'En cabina trabajas beatmatching, phrasing, cues, loops, ganancias, ecualización y transiciones. Cada recurso se prueba por su efecto en la pista, no por lo espectacular que parece.', 'También preparas el contexto técnico: organización de librería, análisis, exportación, conexiones, monitores y respuesta ante los pequeños imprevistos de una cabina real.', 'Sales con una sesión preparada, grabada y revisada. Sabrás explicar por qué entra cada tema y qué quieres que ocurra después.']
      },
      master: {
        summary: 'Un recorrido anual para consolidar tu lenguaje: producir, escuchar, revisar y crear un portfolio propio.',
        duration: '9 meses', format: 'Programa anual', outcome: 'Portfolio propio',
        work: ['Producción y composición', 'Síntesis, mezcla y workflow', 'Feedback, proyecto y método'],
        ideal: 'Buscas una base completa, acompañamiento continuo y una dirección profesional para tu música.',
        deep: ['El programa está pensado como una práctica sostenida. A lo largo del año pasas de explorar herramientas a reconocer patrones propios: cómo empiezas, dónde te bloqueas y qué necesitas para terminar.', 'Compones y produces con acompañamiento, profundizando en síntesis, sampling, arreglo, grabación, mezcla y flujo de trabajo. Cada proyecto sirve para aprender algo que puedas volver a aplicar.', 'El feedback no llega solo al final. Revisas decisiones, escuchas referencias, compartes avances y aprendes a hablar de tu música con precisión sin perder intuición.', 'El resultado es un portfolio que muestra proceso y criterio, junto a una forma de trabajar más autónoma y sostenible.']
      },
      'master-dj': {
        summary: 'La ruta integral para moverte entre estudio y cabina con autonomía, criterio y una identidad sonora reconocible.',
        duration: '9 meses', format: 'Producción + DJ', outcome: 'Portfolio + sesión',
        work: ['Producción y mezcla', 'Selección, directo y performance', 'Marca, proyecto y escena'],
        ideal: 'Quieres conectar tus tracks con tus sesiones y desarrollar una práctica musical completa.',
        deep: ['Conectas dos espacios que suelen enseñarse por separado: el estudio y la pista. Produces música pensando también en cómo se comporta cuando se escucha seguida de otras piezas.', 'Construyes tracks, arreglos y mezclas; después preparas sesiones, selección y performance. Aprendes a pasar de una idea propia a una experiencia compartida con continuidad.', 'El programa incluye revisión de identidad, workflow, archivo musical y preparación técnica. La meta no es hacer más cosas, sino tomar mejores decisiones entre creación, directo y comunidad.', 'Cierras el recorrido con un portfolio propio y una sesión preparada, dos pruebas concretas de que puedes sostener un proyecto más allá del aula.']
      }
    };
    const courseAddenda = {
      ableton: ['Reservas tiempo para repetir el mismo gesto con variaciones: cambiar el tempo, recortar un sample, desplazar un clip o automatizar una transición. Esa repetición convierte la interfaz en memoria muscular.', 'El cierre incluye una sesión ordenada, una exportación con intención y una lista de próximos pasos para que puedas continuar sin depender de la clase.'],
      produccion: ['Las revisiones se hacen con referencias y con pausas de escucha. Aprendes a detectar cuándo una corrección mejora la mezcla y cuándo solo la hace más brillante o más grande.', 'El cierre deja una mezcla exportada, decisiones documentadas y una plantilla de escucha que puedes utilizar en tus siguientes producciones.'],
      dj: ['La práctica alterna preparación y respuesta: primero diseñas una ruta posible y después aprendes a leer lo que ocurre cuando dos temas conviven en el tiempo.', 'El cierre es una sesión grabada y revisada, con una biblioteca preparada para volver a pinchar y una técnica que no depende de improvisar todos los pasos.'],
      master: ['El acompañamiento anual permite volver sobre una misma dificultad desde distintos ángulos. Una semana puede ser arreglo; la siguiente, escucha, sonido o la forma de presentar el proyecto.', 'El cierre reúne piezas, revisiones y aprendizajes en un portfolio que explica tanto lo que haces como la manera en que has aprendido a tomar decisiones.'],
      'master-dj': ['La conexión entre estudio y cabina se prueba en situaciones concretas: un track que necesita funcionar en una sesión, una selección que pide una producción propia o un directo que exige preparar mejor el material.', 'El cierre reúne un portfolio y una sesión con identidad, dos formatos que muestran cómo conviertes una idea en una experiencia compartida.']
    };
    Object.entries(courseAddenda).forEach(([id, paragraphs]) => {
      if (courseData[id]) courseData[id].deep.push(...paragraphs);
    });
    const modules = Array.from(list.querySelectorAll('.module'));
    const accordion = document.createElement('div');
    accordion.className = 'course-accordion';

    modules.forEach((module, index) => {
      const title = module.querySelector('h3')?.textContent?.trim() || `Programa ${index + 1}`;
      const description = module.querySelector('p')?.textContent?.trim() || '';
      const label = module.querySelector('.module-index')?.textContent?.trim() || `0${index + 1}`;
      const data = courseData[module.id] || { summary: description, duration: 'A medida', format: 'ProAudio', outcome: 'Proyecto propio', work: [description], ideal: 'Quieres avanzar con una guía práctica.', deep: [description, 'Trabajamos con ejemplos y proyectos reales para que puedas convertir la teoría en decisiones audibles.', 'El proceso se revisa paso a paso hasta que encuentras una forma de avanzar con autonomía.'] };
      const item = document.createElement('div');
      item.id = module.id || `programa-${index + 1}`;
      item.className = 'nb-acc-item';
      item.dataset.state = 'closed';
      item.dataset.index = String(index);
      item.innerHTML = `
        <h3 class="nb-acc-header">
          <button type="button" class="nb-acc-trigger" aria-expanded="false" aria-controls="${item.id}-info">
            <span class="nb-acc-label">${label}</span>
            <span class="nb-acc-title">${title}</span>
            <svg class="nb-acc-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </h3>
        <div class="nb-acc-content" id="${item.id}-info" role="region" aria-labelledby="${item.id}-trigger">
          <div class="nb-acc-clip"><div class="nb-acc-body">
            <p class="nb-acc-summary">${data.summary}</p>
            <div class="nb-acc-facts">
              <span><small>Duración</small><b>${data.duration}</b></span>
              <span><small>Formato</small><b>${data.format}</b></span>
              <span><small>Salida</small><b>${data.outcome}</b></span>
            </div>
            <div class="nb-acc-grid">
              <div><small>Trabajas</small><ol class="nb-acc-route">${data.work.map((step, stepIndex) => `<li><i>0${stepIndex + 1}</i>${step}</li>`).join('')}</ol></div>
              <div><small>Para ti si</small><em>${data.ideal}</em></div>
            </div>
            <div class="nb-acc-longform">${data.deep.map(paragraph => `<p>${paragraph}</p>`).join('')}</div>
          </div></div>
        </div>
      `;
      item.querySelector('.nb-acc-trigger').id = `${item.id}-trigger`;
      accordion.append(item);
    });

    const items = Array.from(accordion.querySelectorAll('.nb-acc-item'));
    // Radix-style type="single" collapsible: one panel open at a time, click again to close.
    const select = (next, focus = false) => {
      const closing = next >= 0 && items[next]?.dataset.state === 'open';
      items.forEach((item, index) => {
        const open = index === next && !closing;
        const trigger = item.querySelector('.nb-acc-trigger');
        item.dataset.state = open ? 'open' : 'closed';
        trigger.setAttribute('aria-expanded', String(open));
        if (focus && open) trigger.focus({ preventScroll: true });
      });
      if (closing) history.replaceState(null, '', `${location.pathname}${location.search}`);
      else if (items[next]) history.replaceState(null, '', `#${items[next].id}`);
    };
    items.forEach((item, index) => {
      const trigger = item.querySelector('.nb-acc-trigger');
      trigger.addEventListener('click', () => select(index));
      trigger.addEventListener('keydown', event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else if (event.key === 'ArrowDown') next = (index + 1) % items.length;
        else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
        select(next, true);
      });
    });
    list.replaceWith(accordion);
    // Open the linked programme on entry and when browser history changes.
    const syncCourseHash = () => {
      const id = location.hash.slice(1);
      const index = items.findIndex(item => item.id === id);
      if (index < 0) select(-1);
      else if (items[index].dataset.state !== 'open') select(index);
    };
    syncCourseHash();
    window.addEventListener('hashchange', syncCourseHash);
    return accordion;
  };

  if (current === 'index.html') {
    const homeMain = document.querySelector('main');
    const homeHero = homeMain?.querySelector('.hero');
    const homeCourses = homeMain?.querySelector('#cursos');
    if (homeHero && homeCourses) homeHero.after(homeCourses);

    const courseGrid = homeCourses?.querySelector('.course-grid');
    const courseAside = homeCourses?.querySelector('.section-head > div:last-child');
    if (courseGrid && courseAside) {
      const bentoNote = document.createElement('div');
      bentoNote.className = 'course-aside';
      bentoNote.append(...Array.from(courseAside.childNodes));
      courseGrid.append(bentoNote);
      courseAside.remove();
    }

    // Join technology and school into one moving Ableton-like system strip.
    const partners = homeMain?.querySelector('#colaboradores');
    const school = Array.from(homeMain?.querySelectorAll('.split') || [])
      .find(split => split.querySelector('h2')?.textContent.includes('escuela'))?.closest('.section');
    const logos = partners?.querySelectorAll('.partner-logo-grid a img');
    if (partners && school && logos?.length) {
      const ticker = document.createElement('div');
      ticker.className = 'tech-ticker';
      const items = Array.from(logos).map(img => `<span class="tech-logo"><img src="${img.src}" alt="${img.alt}" loading="eager" decoding="async"></span>`).join('');
      const duplicateItems = Array.from(logos).map(img => `<span class="tech-logo"><img src="${img.src}" alt="" loading="eager" decoding="async"></span>`).join('');
      ticker.innerHTML = `<span class="tech-ticker-label">TECNOLOGÍA QUE USAMOS</span><div class="tech-ticker-window" tabindex="0" role="region" aria-label="Tecnología que usamos: Ableton, Adam Audio, Arturia, Focusrite, Native Instruments, Novation, Moog y Universal Audio"><div class="tech-ticker-track"><div class="tech-logo-group">${items}</div><div class="tech-logo-group" aria-hidden="true">${duplicateItems}</div></div></div>`;
      school.classList.add('school-bento');
      school.querySelector('.split')?.after(ticker);
      partners.remove();
    }

    const schoolSection = Array.from(homeMain?.querySelectorAll('.split') || [])
      .find(split => split.querySelector('h2')?.textContent.includes('escuela'));
    if (schoolSection) schoolSection.closest('.section')?.setAttribute('id', 'escuela-home');

    // Full-bleed home player with a bottom filmstrip selector.
    const livePreview = homeMain?.querySelector('.live-preview');
    const previewCards = Array.from(livePreview?.querySelectorAll('.live-preview-grid .live-card') || []);
    if (livePreview && previewCards.length) {
      // The landing carries one local session for now. The remaining Live
      // slots are intentionally left for the two videos the school will add.
      previewCards.slice(1).forEach(card => card.remove());
      previewCards.splice(1);
      const stage = document.createElement('div');
      stage.className = 'live-stage';
      stage.innerHTML = '<div class="live-stage-player"></div><div class="ls-scrim"></div><div class="ls-copy"><span class="ls-label"></span><h2>Play desde<br>el aula.</h2><p>Cada sesión es una forma de compartir proceso: selección, mezcla, performance y sonido real en el espacio de la escuela.</p></div><div class="ls-actions"><a class="button" href="live.html">Entrar en Live <span class="arrow">↗</span></a><div class="live-stage-rail" aria-label="Seleccionar sesión Live"></div></div>';
      const player = stage.querySelector('.live-stage-player');
      const caption = stage.querySelector('.ls-label');
      const rail = stage.querySelector('.live-stage-rail');
      livePreview.querySelector('.section-head')?.remove();
      const localLiveVideo = 'assets/video-live-inicio.mp4';
      const getVideoId = card => { const f = card.querySelector('iframe'); return (f?.src || f?.dataset.cookieSrc || '').match(/embed\/([^?]+)/)?.[1] || ''; };
      const renderStage = index => {
        const card = previewCards[index];
        // Session 01 embeds the YouTube set when external media is allowed and the
        // page has a real origin; otherwise it falls back to the local clip.
        const canEmbed = window.ProAudioConsent?.externalMedia && location.protocol !== 'file:';
        const useLocal = index === 0 && !canEmbed;
        const frame = useLocal
          ? Object.assign(document.createElement('div'), { className: 'live-frame' })
          : card.querySelector('.live-frame')?.cloneNode(true);
        if (!frame) return;
        if (useLocal) {
          frame.innerHTML = `<video class="live-video" autoplay muted loop playsinline preload="auto" controls="false" title="Proyecto Alumni ProAudio" src="${localLiveVideo}"></video>`;
        }
        player.replaceChildren(frame);
        const videoId = getVideoId(card);
        const embeddedVideo = frame.querySelector('.live-video');
        if (embeddedVideo?.tagName === 'VIDEO') {
          embeddedVideo.autoplay = true;
          embeddedVideo.muted = true;
          embeddedVideo.loop = true;
          embeddedVideo.playsInline = true;
          embeddedVideo.preload = 'auto';
          embeddedVideo.load();
          embeddedVideo.play().catch(() => {});
        } else if (embeddedVideo) {
          // Cloned lazy iframes can remain about:blank in some browsers. Reset
          // the real YouTube src after mounting so the selected session loads
          // directly inside the stage instead of falling back to the poster.
          embeddedVideo.setAttribute('loading', 'eager');
          embeddedVideo.src = embeddedVideo.getAttribute('src') || embeddedVideo.src;
        }
        const thumbUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
        if (thumbUrl) {
          player.style.setProperty('--stage-thumb', `url('${thumbUrl}')`);
          frame.style.backgroundImage = `url('${thumbUrl}')`;
          frame.style.backgroundPosition = 'center';
          frame.style.backgroundSize = 'cover';
          const poster = document.createElement('img');
          poster.className = 'live-stage-poster';
          poster.src = thumbUrl;
          poster.alt = '';
          poster.setAttribute('aria-hidden', 'true');
          frame.prepend(poster);
        } else {
          player.style.removeProperty('--stage-thumb');
          frame.style.removeProperty('background-image');
        }
        const meta = card.querySelector('.live-card-meta');
        caption.textContent = `LIVE / 0${index + 1} · ${meta?.querySelector('.label')?.textContent || 'SESIÓN'}`;
        frame.querySelector('.live-index')?.remove();
        rail.querySelectorAll('button').forEach((button, buttonIndex) => {
          button.classList.toggle('is-active', buttonIndex === index);
          button.setAttribute('aria-pressed', String(buttonIndex === index));
        });
      };
      rail.innerHTML = previewCards.map((card, index) => {
        const id = getVideoId(card);
        const label = card.querySelector('.label')?.textContent || `LIVE / 0${index + 1}`;
        return `<button type="button" class="live-stage-thumb" aria-label="Ver ${label}" aria-pressed="${index === 0}" style="--thumb: url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')"><span>0${index + 1}</span></button>`;
      }).join('');
      rail.hidden = previewCards.length < 2;
      rail.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => renderStage(index)));
      // Do not keep the original hidden YouTube card mounted: its duplicate
      // media element can claim the browser's decode budget and leave the
      // full-bleed local session stuck at readyState 0.
      livePreview.querySelector('.live-preview-grid')?.remove();
      livePreview.querySelector('.container')?.append(stage);
      renderStage(0);
    }

    // A photographic team module with a clear bottom filet: the role of the
    // people behind the sound stays visible without adding another text block.
    const teamSection = Array.from(homeMain?.querySelectorAll('.section') || [])
      .find(section => section.querySelector('h2')?.textContent.includes('Personas detrás'));
    if (teamSection) {
      teamSection.id = 'equipo';
      teamSection.classList.add('team-bento');
      const head = teamSection.querySelector('.section-head');
      const aside = head?.querySelector('div:last-child');
      const roleText = aside?.querySelector('p')?.textContent || 'Productores, DJs, ingenieros y educadores en activo.';
      const profileHref = aside?.querySelector('a')?.getAttribute('href') || 'profesorado.html';
      aside?.remove();
      const filet = document.createElement('div');
      filet.className = 'team-filet';
      filet.innerHTML = `<span>${roleText}</span><a class="button secondary" href="${profileHref}">Ver profesorado <span class="arrow">↗</span></a>`;
      const facultyGrid = teamSection.querySelector('.faculty-grid');
      if (facultyGrid) {
        // Reuse the exact same faculty bento as the full Profesorado page so
        // the landing and the detailed page share one visual grammar.
        const bento = mountFacultyBento(facultyGrid);
        bento?.after(filet);
      } else {
        teamSection.append(filet);
      }
    }

    // Re-apply the hash after the bento modules have been reordered.
    if (location.hash) {
      window.setTimeout(() => {
        const target = document.querySelector(location.hash);
        if (target) target.scrollIntoView({ block: 'start', behavior: 'auto' });
      }, 40);
    }
  }

  if (current === 'profesorado.html') {
    const facultyGrid = document.querySelector('main .faculty-grid');
    mountFacultyBento(facultyGrid);
  }

  if (current === 'curso.html') {
    const courseTitle = document.querySelector('main .course-detail .section-head h2');
    if (courseTitle) courseTitle.innerHTML = 'Todos los<br>programas.';
    mountCourseAccordion();
    const courseDetail = document.querySelector('main .course-selector-shell');
    const orientation = courseDetail?.querySelector('.info-panel');
    // The orientation card is a true column anchor. It no longer receives a
    // content-dependent offset that could drift away from an open programme.
    orientation?.style.removeProperty('--course-orientation-offset');
  }

  if (current === 'live.html') {
    const liveIntro = document.querySelector('.live-intro');
    const featured = liveIntro?.querySelector('.live-card-featured');
    const liveHeading = liveIntro?.querySelector('.section-head h2');
    if (liveHeading) liveHeading.innerHTML = 'Live desde<br>el aula.';
    if (liveIntro && featured) {
      liveIntro.classList.add('live-cinema');
      liveIntro.querySelector('.section-head .button')?.remove();
      featured.removeAttribute('href');
      featured.removeAttribute('target');
      featured.removeAttribute('rel');
      featured.setAttribute('aria-label', 'Reproducción Live ProAudio');
    }
  }

  if (current === 'escuela.html') {
    const ctaTitle = document.querySelector('.cta h2');
    const ctaButton = document.querySelector('.cta .button');
    if (ctaTitle) ctaTitle.textContent = 'Es hora de ser Pro del Audio.';
    if (ctaButton) ctaButton.textContent = 'Ven a ProAudio ↗';
  }

  // Shared detail reader for the method cards. The cards stay light and
  // scannable in the grid; the full explanation opens only when requested.
  const detailModal = document.createElement('div');
  detailModal.className = 'detail-modal';
  detailModal.setAttribute('aria-hidden', 'true');
  detailModal.innerHTML = `
    <div class="detail-modal-backdrop" data-close-detail></div>
    <article class="detail-modal-panel" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <button class="detail-modal-close" type="button" aria-label="Cerrar detalle" data-close-detail>×</button>
      <div class="detail-modal-head"><span class="detail-modal-label"></span><span class="detail-modal-count"></span></div>
      <h2 id="detail-modal-title"></h2>
      <div class="detail-modal-rule"></div>
      <div class="detail-modal-copy"></div>
    </article>
  `;
  document.body.append(detailModal);
  const detailPanel = detailModal.querySelector('.detail-modal-panel');
  const detailTitle = detailModal.querySelector('#detail-modal-title');
  const detailLabel = detailModal.querySelector('.detail-modal-label');
  const detailCount = detailModal.querySelector('.detail-modal-count');
  const detailCopy = detailModal.querySelector('.detail-modal-copy');
  let detailLastFocus = null;
  const closeDetail = () => {
    setDialogActive(false);
    detailModal.classList.remove('is-open');
    detailModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('detail-modal-open');
    detailLastFocus?.focus?.();
  };
  const openDetail = ({ label, count, title, paragraphs }) => {
    detailLastFocus = document.activeElement;
    detailLabel.textContent = label;
    detailCount.textContent = count;
    detailTitle.textContent = title;
    detailCopy.innerHTML = paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
    detailModal.classList.add('is-open');
    detailModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('detail-modal-open');
    setDialogActive(true);
    detailPanel.scrollTop = 0;
    detailModal.querySelector('.detail-modal-close')?.focus();
  };
  detailModal.querySelectorAll('[data-close-detail]').forEach(button => button.addEventListener('click', closeDetail));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && detailModal.classList.contains('is-open')) closeDetail(); });

  const bindDetailCards = (cards, getDetail) => {
    cards.forEach((card, index) => {
      if (card.dataset.detailBound) return;
      card.dataset.detailBound = 'true';
      card.classList.add('detail-trigger');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      const action = document.createElement('span');
      action.className = 'detail-trigger-action';
      action.setAttribute('aria-hidden', 'true');
      action.textContent = '+';
      card.append(action);
      const activate = () => openDetail({ ...getDetail(card, index), count: `0${index + 1} / DETALLE` });
      card.addEventListener('click', activate);
      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate();
      });
    });
  };

  // Educational modules open in the shared reader. Keeping the explanation
  // in a modal prevents one selected card from stretching the whole grid.
  const bindInlineCards = (cards, getDetail, group) => {
    bindDetailCards(cards, (card, index) => ({ ...getDetail(card, index), count: `0${index + 1} / ${group.toUpperCase()}` }));
  };

  if (current === 'escuela.html') {
    const methodSection = Array.from(document.querySelectorAll('main > .section'))
      .find(section => section.querySelector('h2')?.textContent.includes('Aprender cerca'));
    const methodCopy = [
      ['AULA', 'Aprende en directo', ['Ve una decisión, pregunta por qué ocurre y pruébala en tu propio proyecto con la guía de un profesor.']],
      ['ESTUDIO', 'Practica en contexto', ['Escucha, compara y corrige dentro de un proyecto real para convertir cada hora de práctica en material audible.']],
      ['COMUNIDAD', 'Comparte proceso', ['Enseña un avance antes de cerrarlo y recibe feedback concreto sobre arreglo, energía, espacio y sonido.']],
      ['RUTA', 'Construye continuidad', ['Sal del curso con próximos pasos posibles: organizar proyectos, publicar, preparar una sesión o seguir desarrollando tu lenguaje.']]
    ];
    // The school method tiles are intentionally informational surfaces. They
    // do not open a reader and therefore do not receive disclosure controls.
  }

  if (current === 'index.html') {
    const schoolSection = document.querySelector('#escuela-home') || Array.from(document.querySelectorAll('main > .section'))
      .find(section => section.querySelector('h2')?.textContent.includes('escuela hecha'));
    const schoolCopy = [
      ['A / PRESENCIA', 'Presencia', ['La clase ocurre con atención real: alguien escucha tu proyecto, identifica dónde estás y te ayuda a elegir el siguiente movimiento.', 'No hay una ruta genérica separada de tu música. El acompañamiento parte de lo que estás intentando hacer y de lo que necesitas oír para avanzar.']],
      ['B / PRÁCTICA', 'Práctica', ['Cada concepto se convierte en una acción: editar, programar, grabar, mezclar, pinchar, comparar o terminar.', 'La práctica construye autonomía porque deja una referencia concreta de lo que has probado y de por qué funciona dentro de tu propio lenguaje.']],
      ['C / CRITERIO', 'Criterio', ['El criterio aparece cuando puedes explicar una decisión y escuchar sus consecuencias. Trabajamos el oído, el contexto y la intención antes que la acumulación de herramientas.', 'La comunidad ProAudio sirve para contrastar, compartir procesos y aprender a sostener una dirección sin perder curiosidad.']]
    ];
    if (schoolSection) bindInlineCards(Array.from(schoolSection.querySelectorAll('.feature-row')), (card, index) => ({ label: schoolCopy[index]?.[0] || 'ESCUELA', title: schoolCopy[index]?.[1] || card.querySelector('strong')?.textContent || 'ProAudio', paragraphs: schoolCopy[index]?.[2] || [card.querySelector('p')?.textContent || ''] }), 'school-practice');
  }

  const upoMark = document.querySelector('.upo-mark');
  if (upoMark) upoMark.classList.add('upo-image-fallback');

  // Native equivalent of the supplied BlurOutUp component. The current site
  // is intentionally dependency-free HTML/CSS/JS, so words are prepared in
  // the DOM and animated when their existing reveal wrapper enters the view.
  const motionTargets = document.querySelectorAll(
    '.reveal h1, .reveal h2, .reveal h3, .reveal p, .reveal .label, .reveal .step-num, .reveal strong'
  );
  document.querySelector('.hero-copy')?.setAttribute('data-blur-hero', 'true');
  motionTargets.forEach(target => {
    // Disclosure copy should appear immediately once its panel is opened.
    // Keep the editorial word-reveal reserved for the page surface itself.
    if (target.closest('.nb-acc-content, .course-accordion-description, .detail-inline, .spine-description, details, .faq-list')) return;
    if (target.dataset.blurPrepared) return;
    let wordIndex = 0;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      if (!node.nodeValue.trim() || node.parentElement?.closest('.arrow, .arrow-icon')) return;
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/\s+/.test(part)) {
          fragment.append(document.createTextNode(part));
        } else {
          const word = document.createElement('span');
          word.className = 'blur-word';
          word.style.setProperty('--blur-index', wordIndex++);
          word.textContent = part;
          fragment.append(word);
        }
      });
      node.replaceWith(fragment);
    });
    target.dataset.blurPrepared = 'true';
  });

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  document.querySelectorAll('[data-scroll]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.dataset.scroll);
    if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  }));

  const form = document.querySelector('#contact-form');
  const success = document.querySelector('.success-message');
  if (form && !form.querySelector('[name="privacyAccepted"]')) {
    const privacy = document.createElement('label');
    privacy.className = 'form-privacy';
    privacy.innerHTML = '<input type="checkbox" name="privacyAccepted" required><span>He leído la <a href="privacidad.html">política de privacidad</a> y acepto que ProAudio trate mis datos para responder a esta consulta.</span>';
    form.querySelector('.form-note')?.before(privacy);
  }
  if (form && success) form.addEventListener('submit', event => {
    event.preventDefault(); success.classList.add('visible');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });


  document.querySelectorAll('.live-video').forEach(frame => {
    if (frame.tagName !== 'IFRAME') {
      frame.autoplay = true;
      frame.muted = true;
      frame.loop = true;
      frame.playsInline = true;
      frame.controls = false;
      frame.play?.().catch(() => {});
      return;
    }
    try {
      // Keep a valid referrer so YouTube accepts the embed (Error 153 appears
      // when the player cannot verify the page hosting it).
      const url = new URL(frame.src);
      url.hostname = 'www.youtube.com';
      url.searchParams.set('autoplay', reduceMotion ? '0' : '1');
      url.searchParams.set('mute', '1');
      url.searchParams.set('controls', '0');
      url.searchParams.set('playsinline', '1');
      url.searchParams.set('enablejsapi', '1');
      url.searchParams.set('modestbranding', '1');
      url.searchParams.set('rel', '0');
      url.searchParams.set('loop', '1');
      url.searchParams.set('origin', window.location.origin);
      url.searchParams.set('widget_referrer', window.location.href);
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      frame.loading = 'eager';
      const requestPlay = () => {
        if (reduceMotion) return;
        try { frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), 'https://www.youtube.com'); } catch (error) { /* iframe may not be ready yet */ }
      };
      frame.addEventListener('load', requestPlay);
      frame.src = url.toString();
      window.setTimeout(requestPlay, 1000);
    } catch (error) { /* An empty or author-provided local source can stay untouched. */ }
  });

  // Reference footer: staggered blur reveal, once per column, with no motion
  // when the visitor requests it. Markup remains usable without JavaScript.
  const footerColumns = document.querySelectorAll('.reference-footer .footer-reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        footerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    footerColumns.forEach(column => footerObserver.observe(column));
  } else {
    footerColumns.forEach(column => column.classList.add('is-visible'));
  }

  // Honour reduced-motion for media as well as CSS transitions.
  if (reduceMotion) {
    document.querySelectorAll('video').forEach(video => {
      video.autoplay = false;
      video.pause();
    });
  }

  // Keep disclosure circles as the only directional affordance. Remove
  // legacy diagonal/upward arrow characters from all page copy, including
  // dynamically generated labels and footer links.
  const arrowWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const arrowTextNodes = [];
  while (arrowWalker.nextNode()) {
    const node = arrowWalker.currentNode;
    if (node.parentElement?.closest('script, style')) continue;
    if (/[↗↑]/.test(node.nodeValue)) arrowTextNodes.push(node);
  }
  arrowTextNodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/[↗↑]/g, ''); });
});

// Closing screen: expose the footer height so image + footer fill one viewport.
(() => {
  const footer = document.querySelector('.reference-footer');
  if (!footer) return;
  const update = () => document.documentElement.style.setProperty('--footer-h', `${footer.offsetHeight}px`);
  update();
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(footer);
})();

// Gentle screen snap (desktop): once scrolling has settled, ease to the nearest
// screen only if it is already close. Any new input cancels it, so it never fights the user.
(() => {
  const mq = window.matchMedia('(min-width: 861px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer = 0;
  let last = -1;
  const cancel = () => { clearTimeout(timer); cancelAnimationFrame(raf); raf = 0; last = -1; };
  const settle = () => {
    if (!mq.matches || reduce.matches || raf) return;
    const root = document.documentElement;
    if (root.classList.contains('course-module-open') || document.body.style.overflow === 'hidden') return;
    const chrome = parseFloat(getComputedStyle(root).getPropertyValue('--chrome-height')) || 74;
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    const reach = window.innerHeight * .09;
    let best = null;
    document.querySelectorAll('main > section').forEach(s => {
      const top = Math.min(max, Math.max(0, s.getBoundingClientRect().top + y - chrome));
      const d = Math.abs(top - y);
      if (d > 2 && d < reach && (!best || d < best.d)) best = { top, d };
    });
    if (best) glide(y, best.top);
  };
  // Slow ease-in-out glide; any user input stops it immediately.
  let raf = 0;
  const glide = (from, to) => {
    const start = performance.now();
    const dur = 650 + Math.min(350, Math.abs(to - from) * 2);
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      const e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      last = from + (to - from) * e;
      window.scrollTo(0, last);
      raf = t < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  };
  const onScroll = () => {
    if (window.scrollY === last) return;
    last = window.scrollY;
    clearTimeout(timer);
    timer = setTimeout(settle, 380);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(t => window.addEventListener(t, cancel, { passive: true }));
})();

// Live: one persistent YouTube player (IFrame API) with no YouTube chrome — just the clean video
// under our own text overlay. The playlist plays through by itself; picking an archive card loads that set.
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'live') return;
  if (!window.ProAudioConsent?.externalMedia) return;
  const featured = document.querySelector('.live-cinema .live-card-featured');
  const frame = featured?.querySelector('.live-frame');
  const section = Array.from(document.querySelectorAll('main > .section.path')).find(s => s.querySelector('.section-head'));
  const container = section?.querySelector('.container');
  if (!frame) return;
  const sessions = [
    ['nmN4vw-zTM4', 'Ibn Itaka', 'DJ set'],
    ['jyIKaEIB8xE', 'Holed Coin & Band', 'En directo en Radiopolis'],
    ['zwq1fG53heA', 'Zuri Cake', 'Proyecto Alumni'],
    ['hdRAMwrgh1M', 'Zemira', 'Proyecto Alumni'],
    ['VUi1Lhvcy00', 'Glitterbear', 'Proyecto Alumni'],
    ['-muSifVuRtM', 'Enrico · TodoModo Sound System', 'Proyecto Alumni'],
    ['2uqd_KYo_1M', 'lospiestorcidos', 'Proyecto Alumni'],
    ['I4Y-jK7G3Gg', 'Dalila', 'Proyecto Alumni'],
    ['oZDilJQUeZY', 'Clare', 'Proyecto Alumni'],
    ['OVNoejNN5xw', 'Sandra Lamb aka Sexy Sounds', 'Proyecto Alumni'],
    ['J4qhtbOuB7s', 'Lena Maria', 'Proyecto Alumni'],
    ['70b5w-KvDvU', 'Marina Lima', 'Proyecto Alumni'],
    ['QUHlCdOh-o0', 'Rise Black', 'Profesor · Proyecto Alumni'],
    ['7s2C2PrlB5Q', 'Boni G', 'DJ set'],
    ['jcaIyNfiBu0', 'Scan Mode', 'DJ set'],
    ['Zt0whi66fSI', 'Fonome', 'DJ set'],
    ['1IfQp4ZP-WY', 'Deshique', 'DJ set'],
    ['ZDZ0SfyvwuY', 'DJMike', 'DJ set'],
    ['Vh2YdoH74VM', 'RVDMNTL', 'DJ set'],
    ['E9kTlIHqM10', 'Pakito Calvo', 'DJ set'],
    ['s01AVkF66Qc', 'Álvaro Belero', 'Proyecto Alumni'],
    ['w4UpyCMVtbc', 'DJ Fuentes', 'Proyecto Alumni'],
    ['uli5QzisiYM', 'Jota', 'DJ set'],
    ['Wx-Rqz1lgrY', 'Subversive', 'DJ set'],
    ['RD__1Mv-DvQ', 'Nebulah', 'DJ set']
  ];
  const label = featured.querySelector('.live-card-meta .label');
  const heading = featured.querySelector('.live-card-meta h3');
  let current = 0;
  let player = null;
  let ready = false;

  // Stage: player mount, click layer (blocks YouTube hover UI) and the sound hint.
  frame.querySelectorAll('iframe, video').forEach(node => node.remove());
  frame.classList.add('is-archive');
  const stage = document.createElement('div');
  stage.className = 'live-stage-yt';
  stage.innerHTML = '<div class="live-yt-mount"><div id="live-yt"></div></div><button type="button" class="live-yt-layer" aria-label="Reproducir o pausar"></button><span class="live-yt-hint">Activar sonido</span>';
  frame.prepend(stage);
  const layer = stage.querySelector('.live-yt-layer');
  const hint = stage.querySelector('.live-yt-hint');

  const setMeta = index => {
    const [, name, kind] = sessions[index];
    if (label) label.textContent = kind.toUpperCase();
    if (heading) heading.textContent = name;
    list?.querySelectorAll('.live-archive-item').forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
  };
  const load = (index, withSound) => {
    current = (index + sessions.length) % sessions.length;
    setMeta(current);
    if (!ready) return;
    player.loadVideoById(sessions[current][0]);
    if (withSound) { player.unMute(); player.setVolume(100); hint.hidden = true; }
  };

  // First click unmutes; after that it toggles play / pause.
  layer.addEventListener('click', () => {
    if (!ready) return;
    if (player.isMuted()) { player.unMute(); player.setVolume(100); hint.hidden = true; return; }
    player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
  });

  const start = () => {
    player = new YT.Player('live-yt', {
      videoId: sessions[0][0],
      playerVars: { autoplay: 1, mute: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, fs: 0, disablekb: 1, cc_load_policy: 0, origin: location.origin },
      events: {
        onReady: () => { ready = true; player.mute(); player.playVideo(); },
        onStateChange: event => { if (event.data === 0) load(current + 1, !player.isMuted()); }
      }
    });
  };
  if (window.YT && window.YT.Player) start();
  else {
    window.onYouTubeIframeAPIReady = start;
    const api = document.createElement('script');
    api.src = 'https://www.youtube.com/iframe_api';
    document.head.append(api);
  }

  // Archive: every session of the ProAudio "Proyecto Alumni" playlist.
  let list = null;
  if (container) {
    list = document.createElement('div');
    list.className = 'live-archive';
    list.setAttribute('role', 'list');
    list.innerHTML = sessions.map(([id, name, kind], i) =>
      `<button type="button" class="live-archive-item" role="listitem" data-index="${i}" aria-pressed="false">` +
      `<span class="live-archive-thumb"><img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy"><span class="live-archive-play" aria-hidden="true"></span></span>` +
      `<span class="live-archive-num">${String(i + 1).padStart(2, '0')}</span><strong>${name}</strong><small>${kind}</small></button>`
    ).join('');
    container.append(list);
    list.addEventListener('click', event => {
      const button = event.target.closest('.live-archive-item');
      if (!button) return;
      load(Number(button.dataset.index), true);
      featured.closest('.live-cinema')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  setMeta(0);
});
