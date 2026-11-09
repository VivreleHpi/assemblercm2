export type AvatarType = 'deputee' | 'depute' | 'malik' | 'papa';

export interface AppState {
  userName: string;
  avatar: AvatarType;
  xp: number;
  completedSteps: number[];
  unlockedBadges: string[];
  fontSize: 'normal' | 'large' | 'xlarge';
  dysMode: boolean;
  classroomMode: boolean;
  soundEnabled: boolean;
  onboardingDone: boolean;
  finalQuizBestScore: number;
  finalQuizXpAwarded: boolean;
  diplomaUnlocked: boolean;
  diplomaUnlockMode: 'quiz' | 'teacher' | null;
  diplomaSchoolName: string;
}

const STORAGE_KEY = 'an_cm2_v2_state';

const DEFAULT_STATE: AppState = {
  userName: '',
  avatar: 'depute',
  xp: 0,
  completedSteps: [],
  unlockedBadges: [],
  fontSize: 'normal',
  dysMode: false,
  classroomMode: false,
  soundEnabled: true,
  onboardingDone: false,
  finalQuizBestScore: 0,
  finalQuizXpAwarded: false,
  diplomaUnlocked: false,
  diplomaUnlockMode: null,
  diplomaSchoolName: ''
};

export function initAppClient() {
  const globalDataEl = document.getElementById('app-global-data');
  const globalData = globalDataEl ? JSON.parse(globalDataEl.textContent || '{}') : {
    searchIndex: [],
    photos: [],
    badges: [],
    totalSteps: 12,
    steps: []
  };

  let state: AppState = loadState();
  let toastTimeout: number | undefined;
  let currentLightboxIndex = 0;
  let lastFocusedTrigger: HTMLElement | null = null;

  function loadState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      const parsed = JSON.parse(raw);
      const completedSteps = Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [];
      const unlockedBadges = Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [];
      const bestScore = typeof parsed.finalQuizBestScore === 'number' ? parsed.finalQuizBestScore : 0;
      const diplomaUnlocked =
        typeof parsed.diplomaUnlocked === 'boolean' ? parsed.diplomaUnlocked : bestScore >= 6;
      const diplomaUnlockMode =
        parsed.diplomaUnlockMode === 'quiz' || parsed.diplomaUnlockMode === 'teacher'
          ? parsed.diplomaUnlockMode
          : bestScore >= 6
            ? 'quiz'
            : null;
      const finalQuizXpAwarded =
        typeof parsed.finalQuizXpAwarded === 'boolean'
          ? parsed.finalQuizXpAwarded
          : bestScore >= 6 && unlockedBadges.includes('quiz');

      return {
        ...DEFAULT_STATE,
        ...parsed,
        completedSteps,
        unlockedBadges,
        finalQuizBestScore: bestScore,
        finalQuizXpAwarded,
        diplomaUnlocked,
        diplomaUnlockMode,
        diplomaSchoolName: typeof parsed.diplomaSchoolName === 'string' ? parsed.diplomaSchoolName : ''
      };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
    syncUI();
    window.dispatchEvent(new CustomEvent('an:state-updated', { detail: state }));
  }

  // Web Audio Synthesizer (zero external MP3 needed, works 100% offline)
  function playSound(type: 'bell' | 'drum' | 'success' | 'pop') {
    if (!state.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'bell') {
        [880, 1318.5, 1760].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.18 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.15);
        });
      } else if (type === 'drum') {
        for (let i = 0; i < 6; i++) {
          const t = now + i * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140 - i * 10, t);
          osc.frequency.exponentialRampToValueAtTime(55, t + 0.06);
          gain.gain.setValueAtTime(0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.065);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.07);
        }
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const t = now + i * 0.09;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.16, t);
          gain.gain.exponentialRampToValueAtTime(0.005, t + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.26);
        });
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // ignore audio context restrictions
    }
  }

  function showToast(title: string, desc: string) {
    const toast = document.getElementById('xp-toast');
    const titleEl = document.getElementById('xp-toast-title');
    const descEl = document.getElementById('xp-toast-desc');
    if (!toast || !titleEl || !descEl) return;

    titleEl.textContent = title;
    descEl.textContent = desc;
    toast.classList.remove('hidden');

    if (toastTimeout) window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      toast.classList.add('hidden');
    }, 3400);
  }

  function addXP(amount: number, reason: string) {
    state.xp += amount;
    saveState();
    playSound('success');
    showToast(`+${amount} XP gagnés !`, reason);
  }

  function unlockBadge(badgeId: string, customReason?: string): boolean {
    if (!badgeId) return false;
    if (state.unlockedBadges.includes(badgeId)) return false;
    state.unlockedBadges.push(badgeId);
    const badgeObj = (globalData.badges || []).find((b: { id: string; title: string }) => b.id === badgeId);
    const title = badgeObj ? badgeObj.title : badgeId;
    saveState();
    playSound('bell');
    showToast(`🏅 Nouveau badge : ${title}`, customReason || 'Consulte ton profil pour voir ta médaille !');
    return true;
  }

  function completeStep(stepNumber: number, xpReward = 20, badgeId?: string) {
    const isNewStep = !state.completedSteps.includes(stepNumber);
    if (isNewStep) {
      state.completedSteps.push(stepNumber);
      state.xp += xpReward;
    }
    if (badgeId && !state.unlockedBadges.includes(badgeId)) {
      state.unlockedBadges.push(badgeId);
    }
    saveState();
    if (isNewStep) {
      playSound('success');
      const badgeObj = badgeId
        ? (globalData.badges || []).find((b: { id: string; title: string }) => b.id === badgeId)
        : null;
      showToast(
        `Étape ${stepNumber} validée (+${xpReward} XP) !`,
        badgeObj ? `Médaille « ${badgeObj.title} » débloquée !` : 'Continue ton parcours de Député Junior !'
      );
    }
  }

  function completeFinalQuiz(score: number) {
    if (score > state.finalQuizBestScore) {
      state.finalQuizBestScore = score;
    }
    if (score >= 6) {
      state.diplomaUnlocked = true;
      state.diplomaUnlockMode = 'quiz';
      const isFirstFinalQuizReward = !state.finalQuizXpAwarded;
      if (isFirstFinalQuizReward) {
        state.xp += 50;
        state.finalQuizXpAwarded = true;
      }
      const isNewBadge = !state.unlockedBadges.includes('quiz');
      if (isNewBadge) {
        state.unlockedBadges.push('quiz');
      }
      saveState();
      if (isFirstFinalQuizReward || isNewBadge) {
        playSound('bell');
        showToast(
          isFirstFinalQuizReward ? '🎓 Grand Quiz réussi (+50 XP) !' : `🎓 Grand Quiz : ${score} / 8 !`,
          'Médaille « Grand Lauréat du Quiz Final » et Diplôme CM2 débloqués !'
        );
      }
    } else {
      saveState();
    }
  }

  function unlockDiplomaByTeacher() {
    state.diplomaUnlocked = true;
    if (!state.diplomaUnlockMode) {
      state.diplomaUnlockMode = 'teacher';
    }
    saveState();
  }

  function setDiplomaDetails(userName?: string, schoolName?: string) {
    if (typeof userName === 'string') {
      state.userName = userName.trim();
    }
    if (typeof schoolName === 'string') {
      state.diplomaSchoolName = schoolName.trim();
    }
    saveState();
  }

  function syncUI() {
    const html = document.documentElement;
    // Font size
    html.setAttribute('data-font-size', state.fontSize);
    document.querySelectorAll<HTMLButtonElement>('[data-font-size-btn]').forEach((btn) => {
      const active = btn.getAttribute('data-font-size-btn') === state.fontSize;
      btn.classList.toggle('bg-republic-900', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-paper', !active);
      btn.classList.toggle('text-ink', !active);
    });

    // Dys mode
    if (state.dysMode) {
      html.setAttribute('data-dys', 'true');
    } else {
      html.removeAttribute('data-dys');
    }
    const dysBtn = document.getElementById('toggle-dys-btn');
    if (dysBtn) {
      dysBtn.setAttribute('aria-pressed', String(state.dysMode));
      dysBtn.textContent = state.dysMode ? 'Activé ✓' : 'Désactivé';
      dysBtn.className = state.dysMode
        ? 'px-3 py-1.5 rounded-full border border-success/40 bg-success-light text-xs font-bold text-success min-h-[38px]'
        : 'px-3 py-1.5 rounded-full border border-line bg-paper text-xs font-bold text-ink min-h-[38px]';
    }

    // Classroom mode
    if (state.classroomMode) {
      html.setAttribute('data-classroom', 'true');
    } else {
      html.removeAttribute('data-classroom');
    }
    const classBtn = document.getElementById('toggle-classroom-btn');
    if (classBtn) {
      classBtn.setAttribute('aria-pressed', String(state.classroomMode));
      classBtn.textContent = state.classroomMode ? 'Activé ✓' : 'Désactivé';
      classBtn.className = state.classroomMode
        ? 'px-3 py-1.5 rounded-full border border-success/40 bg-success-light text-xs font-bold text-success min-h-[38px]'
        : 'px-3 py-1.5 rounded-full border border-line bg-paper text-xs font-bold text-ink min-h-[38px]';
    }

    // Sound toggle
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.setAttribute('aria-pressed', String(state.soundEnabled));
      soundBtn.textContent = state.soundEnabled ? 'Activé 🔔' : 'Muet 🔇';
      soundBtn.className = state.soundEnabled
        ? 'px-3 py-1.5 rounded-full border border-success/40 bg-success-light text-xs font-bold text-success min-h-[38px]'
        : 'px-3 py-1.5 rounded-full border border-line bg-paper text-xs font-bold text-ink min-h-[38px]';
    }

    // Header & Modal counters
    const doneCount = state.completedSteps.length;
    const pct = Math.round((doneCount / 12) * 100);
    const xpEl = document.getElementById('header-xp-count');
    if (xpEl) xpEl.textContent = String(state.xp);

    const badgeEl = document.getElementById('header-badge-count');
    if (badgeEl) badgeEl.textContent = `${state.unlockedBadges.length}/9`;

    const nameEl = document.getElementById('header-user-name');
    if (nameEl) nameEl.textContent = state.userName || 'Explorateur';

    const avatarKeys: AvatarType[] = ['deputee', 'depute', 'malik', 'papa'];
    const activeAvatar: AvatarType = avatarKeys.includes(state.avatar) ? state.avatar : 'depute';

    avatarKeys.forEach((key) => {
      document.getElementById(`header-avatar-${key}`)?.classList.toggle('hidden', activeAvatar !== key);
      document.getElementById(`modal-avatar-${key}`)?.classList.toggle('hidden', activeAvatar !== key);
      document.getElementById(`diploma-avatar-${key}`)?.classList.toggle('hidden', activeAvatar !== key);
    });

    const isGirl = activeAvatar === 'deputee';
    document.getElementById('onboarding-preview-deputee')?.classList.toggle('hidden', !isGirl);
    document.getElementById('onboarding-preview-depute')?.classList.toggle('hidden', isGirl);
    const rolePill = document.getElementById('onboarding-role-pill');
    if (rolePill) {
      rolePill.textContent = isGirl ? 'Future Députée Junior (Fille)' : 'Futur Député Junior (Garçon)';
    }

    const diplomaHeading = document.getElementById('diploma-main-heading');
    if (diplomaHeading) {
      diplomaHeading.textContent = isGirl
        ? 'DIPLÔME DE DÉPUTÉE JUNIOR CM2'
        : 'DIPLÔME DE DÉPUTÉ JUNIOR CM2';
    }

    const pctEl = document.getElementById('header-progress-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;

    const fillEl = document.getElementById('header-progress-fill');
    if (fillEl) fillEl.style.width = `${pct}%`;

    const progressBar = document.getElementById('header-progressbar');
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(doneCount));

    const progressHint = document.getElementById('header-progress-hint');
    if (progressHint) {
      progressHint.classList.toggle('hidden', doneCount > 0);
      if (doneCount > 0) {
        progressHint.textContent = `${doneCount} étape${doneCount > 1 ? 's' : ''} validée${doneCount > 1 ? 's' : ''} sur 12.`;
      } else {
        progressHint.textContent =
          '0 % tant qu’aucune étape n’est validée : réussis un mini-quiz « Je vérifie ».';
      }
    }

    // Modal stats
    const modalXp = document.getElementById('modal-xp-total');
    if (modalXp) modalXp.textContent = String(state.xp);
    const modalSteps = document.getElementById('modal-steps-done');
    if (modalSteps) modalSteps.textContent = `${doneCount}/12`;
    const modalBadges = document.getElementById('modal-badges-done');
    if (modalBadges) modalBadges.textContent = `${state.unlockedBadges.length}/9`;

    const profileInput = document.getElementById('profile-name-input') as HTMLInputElement | null;
    if (profileInput && document.activeElement !== profileInput) {
      profileInput.value = state.userName;
    }

    const onboardingInput = document.getElementById('onboarding-name-input') as HTMLInputElement | null;
    if (onboardingInput && document.activeElement !== onboardingInput) {
      onboardingInput.value = state.userName;
    }

    document.querySelectorAll<HTMLButtonElement>('[data-select-avatar]').forEach((btn) => {
      const isSelected = btn.getAttribute('data-select-avatar') === activeAvatar;
      btn.setAttribute('aria-pressed', String(isSelected));
      btn.classList.toggle('border-gold', isSelected);
      btn.classList.toggle('bg-gold-light', isSelected);
      btn.classList.toggle('border-line', !isSelected);
      btn.classList.toggle('bg-surface', !isSelected);
    });

    document.querySelectorAll<HTMLButtonElement>('[data-onboarding-avatar]').forEach((btn) => {
      const isSelected = btn.getAttribute('data-onboarding-avatar') === activeAvatar;
      btn.setAttribute('aria-pressed', String(isSelected));
      btn.classList.toggle('border-gold', isSelected);
      btn.classList.toggle('bg-gold-light', isSelected);
      btn.classList.toggle('border-line', !isSelected);
      btn.classList.toggle('bg-paper', !isSelected);
    });

    document.querySelectorAll<HTMLElement>('[data-avatar-pill]').forEach((pill) => {
      const target = pill.getAttribute('data-avatar-pill');
      const isSelected = target === activeAvatar;
      const isFemale = target === 'deputee';
      pill.textContent = isSelected
        ? isFemale
          ? 'Fille · Sélectionnée ✓'
          : 'Garçon · Sélectionné ✓'
        : isFemale
          ? 'Fille'
          : 'Garçon';
      pill.className = isSelected
        ? 'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold text-ink'
        : 'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface text-ink-muted border border-line';
    });

    // Badges cards across page & modal
    document.querySelectorAll<HTMLElement>('[data-badge-card]').forEach((card) => {
      const id = card.getAttribute('data-badge-card') || '';
      const unlocked = state.unlockedBadges.includes(id);
      card.setAttribute('data-unlocked', unlocked ? 'true' : 'false');
      card.className = `badge-card-item relative flex items-start gap-3.5 p-4 rounded-card border-2 transition-all ${unlocked ? 'bg-gold-light border-gold shadow-card' : 'bg-paper border-line'
        }`;
      const medal = card.querySelector('.badge-medal');
      if (medal) {
        medal.className = `badge-medal w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm transition-colors ${unlocked ? 'bg-gold text-ink border-ink/20' : 'bg-surface text-ink-muted border-line'
          }`;
      }
      const pill = card.querySelector('.badge-status-pill');
      if (pill && unlocked) {
        pill.textContent = 'Débloqué ✓';
        pill.className = 'badge-status-pill text-xs font-bold px-2 py-0.5 rounded-full shrink-0 bg-success-light text-success border border-success/30';
      }
    });

    // Step status badges on lesson header & home map
    document.querySelectorAll<HTMLElement>('[data-step-status-badge]').forEach((badge) => {
      const num = Number(badge.getAttribute('data-step-status-badge'));
      const done = state.completedSteps.includes(num);
      badge.classList.toggle('hidden', !done);
      badge.classList.toggle('inline-flex', done);
    });

    // Home page dynamic CTA & Map cards
    const homeHeroCta = document.getElementById('home-hero-primary-cta') as HTMLAnchorElement | null;
    const homeHeroCtaText = document.getElementById('home-hero-primary-cta-text');
    if (homeHeroCta && homeHeroCtaText && globalData.steps?.length) {
      if (doneCount > 0 && doneCount < 12) {
        const nextStepObj = globalData.steps.find((s: { number: number }) => !state.completedSteps.includes(s.number)) || globalData.steps[0];
        homeHeroCta.href = `/etape/${nextStepObj.slug}/`;
        homeHeroCtaText.textContent = `Continuer — Étape ${nextStepObj.number} : ${nextStepObj.title}`;
      } else if (doneCount >= 12) {
        homeHeroCta.href = '/etape/11-quiz-diplome/';
        homeHeroCtaText.textContent = 'Voir mon Diplôme de Député Junior';
      } else {
        homeHeroCta.href = '/etape/1-hemicycle/';
        homeHeroCtaText.textContent = 'Commencer le parcours (Étape 1)';
      }
    }

    document.querySelectorAll<HTMLElement>('[data-map-step-card]').forEach((card) => {
      const num = Number(card.getAttribute('data-map-step-card'));
      const done = state.completedSteps.includes(num);
      const pill = card.querySelector('[data-map-step-pill]');
      if (pill) {
        if (done) {
          pill.textContent = 'Terminée ✓';
          pill.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-success-light text-success border border-success/30';
        } else {
          pill.textContent = 'Disponible →';
          pill.className = 'text-xs font-bold px-2.5 py-1 rounded-full bg-gold-light text-ink border border-gold';
        }
      }
    });
  }

  // Modal helpers
  function openModal(id: string) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (document.activeElement instanceof HTMLElement) {
      lastFocusedTrigger = document.activeElement;
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (id === 'search-modal') {
      const input = document.getElementById('global-search-input') as HTMLInputElement | null;
      renderSearchResults('');
      setTimeout(() => input?.focus(), 50);
    } else {
      const focusable = modal.querySelector<HTMLElement>(
        'input, button:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      setTimeout(() => focusable?.focus(), 50);
    }
  }

  function closeModal(id: string) {
    const modal = document.getElementById(id);
    if (!modal || modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (lastFocusedTrigger && document.body.contains(lastFocusedTrigger)) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  }

  // Search Engine (safe DOM construction — zero innerHTML injection)
  function renderSearchResults(query: string) {
    const container = document.getElementById('global-search-results');
    if (!container) return;
    container.replaceChildren();

    const q = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const items = (globalData.searchIndex || []).filter((item: { title: string; description: string; keywords: string }) => {
      if (!q) return true;
      const hay = `${item.title} ${item.description} ${item.keywords}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return hay.includes(q);
    }).slice(0, 12);

    if (items.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'p-6 text-center text-sm text-ink-muted bg-paper rounded-xl border border-line';
      emptyBox.append('Aucun résultat pour « ');
      const strongEl = document.createElement('strong');
      strongEl.textContent = query;
      emptyBox.append(strongEl);
      emptyBox.append(' ». Essaie « Hémicycle », « loi », « Sénat » ou « Napoléon ».');
      container.appendChild(emptyBox);
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item: { type: string; title: string; description: string; url: string }) => {
      const link = document.createElement('a');
      link.href = item.url;
      link.className = 'block p-3.5 rounded-xl bg-paper hover:bg-republic-100/70 border border-line transition group';

      const topRow = document.createElement('div');
      topRow.className = 'flex items-center justify-between gap-2';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'font-display font-bold text-sm sm:text-base text-ink group-hover:text-republic-900';
      titleSpan.textContent = item.title;

      const typeSpan = document.createElement('span');
      typeSpan.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-surface text-republic-700 border border-line shrink-0';
      typeSpan.textContent = item.type;

      topRow.appendChild(titleSpan);
      topRow.appendChild(typeSpan);

      const descP = document.createElement('p');
      descP.className = 'text-xs sm:text-sm text-ink-muted mt-1 line-clamp-2';
      descP.textContent = item.description;

      link.appendChild(topRow);
      link.appendChild(descP);
      fragment.appendChild(link);
    });

    container.appendChild(fragment);
  }

  // Lightbox Engine
  function resolveImgBasePrefix(sampleSrc?: string): string {
    if (sampleSrc) {
      const match = sampleSrc.match(/^(.*?)\/img\//);
      if (match && match[1]) {
        return match[1].replace(/\/+$/, '');
      }
    }
    return '';
  }

  function openLightboxByPhotoId(photoId: string) {
    const photos = globalData.photos || [];
    const index = photos.findIndex((p: { id: string }) => p.id === photoId);
    currentLightboxIndex = index >= 0 ? index : 0;
    updateLightboxSlide();
    openModal('lightbox-modal');
  }

  function updateLightboxSlide() {
    const photos = globalData.photos || [];
    if (!photos.length) return;
    const photo = photos[currentLightboxIndex];
    const rawFile = (photo.baseName || photo.src || '').split('/').pop() || '';
    const cleanBaseName = rawFile.replace(/\.[a-z0-9]+$/i, '');
    const prefix = resolveImgBasePrefix(photo.src);
    const normalizedSrc = `${prefix}/img/${cleanBaseName}-1600.webp`.replace(/\/{2,}/g, '/');

    const imgEl = document.getElementById('lightbox-img') as HTMLImageElement | null;
    const titleEl = document.getElementById('lightbox-title');
    const counterEl = document.getElementById('lightbox-counter');
    const captionEl = document.getElementById('lightbox-caption');
    const authorEl = document.getElementById('lightbox-author');
    const licenseEl = document.getElementById('lightbox-license');
    const sourceLinkEl = document.getElementById('lightbox-source-link') as HTMLAnchorElement | null;

    if (imgEl) {
      imgEl.onerror = () => {
        const fallback = `${prefix}/img/${cleanBaseName}.jpg`.replace(/\/{2,}/g, '/');
        if (imgEl.src !== fallback) imgEl.src = fallback;
      };
      imgEl.src = normalizedSrc;
      imgEl.alt =
        photo.alt?.trim() ||
        photo.title?.trim() ||
        'Illustration du parcours Député Junior sur l’Assemblée nationale';
    }
    if (titleEl) titleEl.textContent = photo.title;
    if (counterEl) counterEl.textContent = `${currentLightboxIndex + 1} / ${photos.length}`;
    if (captionEl) captionEl.textContent = photo.caption;
    if (authorEl) authorEl.textContent = photo.author;
    if (licenseEl) licenseEl.textContent = photo.license;
    if (sourceLinkEl) {
      sourceLinkEl.href = photo.sourceUrl;
      const spanEl = sourceLinkEl.querySelector('span');
      if (spanEl) {
        const u = photo.sourceUrl || '';
        if (u.includes('commons.wikimedia.org') || u.includes('wikipedia.org')) {
          spanEl.textContent = 'Source Wikimedia Commons';
        } else if (u.includes('legifrance.gouv.fr')) {
          spanEl.textContent = 'Source officielle Légifrance';
        } else if (u.includes('parlementdesenfants.fr')) {
          spanEl.textContent = 'Site Parlement des enfants';
        } else {
          spanEl.textContent = 'Consulter la source officielle';
        }
      }
    }
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Open & Close Modals
    document.querySelectorAll<HTMLElement>('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-open-modal');
        if (target) openModal(target);
      });
    });

    document.querySelectorAll<HTMLElement>('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close-modal');
        if (target) closeModal(target);
      });
    });

    ['search-modal', 'profile-modal', 'lightbox-modal', 'onboarding-modal'].forEach((id) => {
      const modal = document.getElementById(id);
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(id);
      });
    });

    // Search input
    const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      renderSearchResults(searchInput.value);
    });

    // Keyboard shortcuts (Ctrl+K, Escape, Lightbox arrows)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal('search-modal');
      } else if (e.key === 'Escape') {
        ['search-modal', 'profile-modal', 'lightbox-modal', 'onboarding-modal'].forEach(closeModal);
        document.getElementById('settings-dropdown')?.classList.add('hidden');
        document.getElementById('settings-menu-button')?.setAttribute('aria-expanded', 'false');
      } else {
        const lb = document.getElementById('lightbox-modal');
        if (lb && !lb.classList.contains('hidden')) {
          const total = (globalData.photos || []).length || 8;
          if (e.key === 'ArrowRight') {
            currentLightboxIndex = (currentLightboxIndex + 1) % total;
            updateLightboxSlide();
          } else if (e.key === 'ArrowLeft') {
            currentLightboxIndex = (currentLightboxIndex - 1 + total) % total;
            updateLightboxSlide();
          }
        }
      }
    });

    // Lightbox Triggers & Prev/Next
    document.querySelectorAll<HTMLElement>('.lightbox-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-photo-id');
        if (id) openLightboxByPhotoId(id);
      });
    });

    document.getElementById('lightbox-prev-btn')?.addEventListener('click', () => {
      const total = (globalData.photos || []).length || 8;
      currentLightboxIndex = (currentLightboxIndex - 1 + total) % total;
      updateLightboxSlide();
    });
    document.getElementById('lightbox-next-btn')?.addEventListener('click', () => {
      const total = (globalData.photos || []).length || 8;
      currentLightboxIndex = (currentLightboxIndex + 1) % total;
      updateLightboxSlide();
    });

    // Settings Dropdown
    const settingsBtn = document.getElementById('settings-menu-button');
    const settingsDrop = document.getElementById('settings-dropdown');
    settingsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = settingsDrop?.classList.toggle('hidden');
      settingsBtn.setAttribute('aria-expanded', String(!isHidden));
    });
    document.getElementById('settings-close-btn')?.addEventListener('click', () => {
      settingsDrop?.classList.add('hidden');
      settingsBtn?.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', (e) => {
      if (settingsDrop && !settingsDrop.classList.contains('hidden')) {
        if (!settingsDrop.contains(e.target as Node) && e.target !== settingsBtn) {
          settingsDrop.classList.add('hidden');
          settingsBtn?.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Font Size, Dys, Classroom, Sound buttons
    document.querySelectorAll<HTMLButtonElement>('[data-font-size-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-font-size-btn') as 'normal' | 'large' | 'xlarge';
        if (size) {
          state.fontSize = size;
          saveState();
        }
      });
    });

    document.getElementById('toggle-dys-btn')?.addEventListener('click', () => {
      state.dysMode = !state.dysMode;
      saveState();
    });

    document.getElementById('toggle-classroom-btn')?.addEventListener('click', () => {
      state.classroomMode = !state.classroomMode;
      saveState();
    });

    document.getElementById('toggle-sound-btn')?.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      saveState();
      if (state.soundEnabled) playSound('pop');
    });

    // Profile Save & Avatar Selection
    document.getElementById('profile-save-btn')?.addEventListener('click', () => {
      const input = document.getElementById('profile-name-input') as HTMLInputElement | null;
      if (input) {
        state.userName = input.value.trim();
        state.onboardingDone = true;
        saveState();
        showToast('Profil enregistré !', state.userName ? `Bienvenue ${state.userName} !` : 'Profil mis à jour.');
      }
    });

    document.querySelectorAll<HTMLButtonElement>('[data-select-avatar]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const av = btn.getAttribute('data-select-avatar') as AvatarType;
        if (av) {
          state.avatar = av;
          saveState();
        }
      });
    });

    // Reset All Progress
    const handleReset = () => {
      if (window.confirm('Veux-tu vraiment effacer toute ta progression, tes XP et tes badges sur cet appareil ?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = { ...DEFAULT_STATE };
        saveState();
        window.location.reload();
      }
    };
    document.getElementById('reset-all-progress-btn')?.addEventListener('click', handleReset);
    document.getElementById('modal-reset-progress-btn')?.addEventListener('click', handleReset);

    // Toast close
    document.getElementById('xp-toast-close')?.addEventListener('click', () => {
      document.getElementById('xp-toast')?.classList.add('hidden');
    });

    // Sound Effect Triggers (MalikBubble bell / drum)
    document.querySelectorAll<HTMLElement>('[data-sound-trigger]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-sound-trigger') as 'bell' | 'drum';
        if (type) playSound(type);
      });
    });

    // Web Speech API (TTS)
    document.querySelectorAll<HTMLButtonElement>('.tts-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!('speechSynthesis' in window)) {
          showToast('Lecture vocale indisponible', 'Ton navigateur ne supporte pas la synthèse vocale.');
          return;
        }
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          btn.querySelector('span')?.replaceWith(Object.assign(document.createElement('span'), { textContent: 'Écouter' }));
          return;
        }
        const text = btn.getAttribute('data-tts-text') || '';
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.95;
        const span = btn.querySelector('span');
        const originalLabel = span?.textContent || 'Écouter';
        if (span) span.textContent = 'Arrêter ⏹';
        utterance.onend = () => {
          if (span) span.textContent = originalLabel;
        };
        utterance.onerror = () => {
          if (span) span.textContent = originalLabel;
        };
        window.speechSynthesis.speak(utterance);
      });
    });

    // Copy KeyPoints button
    document.querySelectorAll<HTMLButtonElement>('.copy-keypoints-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy-text') || '';
        try {
          await navigator.clipboard.writeText(text);
          showToast('Copié ! 📋', 'Les 3 phrases à retenir sont copiées dans le presse-papier.');
        } catch {
          showToast('Résumé prêt', 'Recopie ces 3 phrases dans ton cahier d’EMC.');
        }
      });
    });

    // Onboarding Modal (Passeport Citoyen : 1. Fille/Garçon + Prénom -> 2. Mission)
    let onboardingStep = 1;
    const updateOnboardingScreen = () => {
      document.querySelectorAll<HTMLElement>('[data-onboarding-screen]').forEach((el) => {
        el.classList.toggle('hidden', Number(el.getAttribute('data-onboarding-screen')) !== onboardingStep);
      });
      const ind = document.getElementById('onboarding-step-indicator');
      if (ind) ind.textContent = `Passeport Citoyen · Étape ${onboardingStep} / 2`;
      const prev = document.getElementById('onboarding-prev-btn');
      if (prev) prev.classList.toggle('invisible', onboardingStep === 1);
      const next = document.getElementById('onboarding-next-btn');
      if (next) next.textContent = onboardingStep === 2 ? 'Commencer l’aventure ! 🚀' : 'Valider & Continuer →';
    };

    document.querySelectorAll<HTMLElement>('[data-open-onboarding]').forEach((btn) => {
      btn.addEventListener('click', () => {
        onboardingStep = 1;
        updateOnboardingScreen();
        openModal('onboarding-modal');
      });
    });

    document.getElementById('onboarding-skip-btn')?.addEventListener('click', () => {
      state.onboardingDone = true;
      saveState();
      closeModal('onboarding-modal');
    });

    document.getElementById('onboarding-prev-btn')?.addEventListener('click', () => {
      if (onboardingStep > 1) {
        onboardingStep--;
        updateOnboardingScreen();
      }
    });

    document.getElementById('onboarding-next-btn')?.addEventListener('click', () => {
      const nameInput = document.getElementById('onboarding-name-input') as HTMLInputElement | null;
      if (nameInput && nameInput.value.trim()) {
        state.userName = nameInput.value.trim();
      }
      if (onboardingStep < 2) {
        onboardingStep++;
        saveState();
        updateOnboardingScreen();
      } else {
        state.onboardingDone = true;
        saveState();
        closeModal('onboarding-modal');
        const defaultRole = state.avatar === 'deputee' ? 'Députée Junior' : 'Député Junior';
        showToast(
          `Bienvenue ${state.userName || defaultRole} !`,
          'Commence par l’Étape 1 pour découvrir l’Hémicycle.'
        );
      }
    });

    document.querySelectorAll<HTMLButtonElement>('[data-onboarding-avatar]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const av = btn.getAttribute('data-onboarding-avatar') as AvatarType;
        if (av) {
          state.avatar = av;
          saveState();
        }
      });
    });

    // MicroQuiz Engine
    document.querySelectorAll<HTMLElement>('.microquiz-container').forEach((quizEl) => {
      const stepNumber = Number(quizEl.getAttribute('data-step-number'));
      const xpReward = Number(quizEl.getAttribute('data-xp-reward') || 20);
      const badgeId = quizEl.getAttribute('data-badge-id') || undefined;
      const questionEls = quizEl.querySelectorAll<HTMLElement>('.microquiz-question');
      const summaryEl = quizEl.querySelector<HTMLElement>('.microquiz-summary');
      const resetBtn = quizEl.querySelector<HTMLButtonElement>('.microquiz-reset-btn');
      const classroomRevealBtn = quizEl.querySelector<HTMLButtonElement>('.microquiz-classroom-reveal-btn');
      const solvedSet = new Set<number>();
      let classroomRevealed = false;

      classroomRevealBtn?.addEventListener('click', () => {
        classroomRevealed = !classroomRevealed;
        const span = classroomRevealBtn.querySelector('span');
        if (span) {
          span.textContent = classroomRevealed
            ? '🙈 Mode Classe : Masquer le corrigé'
            : '👁️ Mode Classe : Afficher le corrigé';
        }
        questionEls.forEach((qEl) => {
          const correctIndex = Number(qEl.getAttribute('data-correct-index'));
          const explanation = qEl.getAttribute('data-explanation') || '';
          const feedbackEl = qEl.querySelector<HTMLElement>('.microquiz-feedback');
          const options = qEl.querySelectorAll<HTMLButtonElement>('.microquiz-option');
          if (classroomRevealed) {
            options.forEach((b) => {
              const idx = Number(b.getAttribute('data-option-index'));
              const statusIcon = b.querySelector('.option-status-icon');
              if (idx === correctIndex) {
                b.className =
                  'microquiz-option text-left w-full px-4 py-3 rounded-btn bg-success-light border-2 border-success text-ink font-bold text-sm sm:text-base transition flex items-center justify-between gap-3 min-h-[48px]';
                if (statusIcon) statusIcon.textContent = '✓ Réponse exacte';
              } else {
                b.className =
                  'microquiz-option text-left w-full px-4 py-3 rounded-btn bg-surface opacity-60 border border-line text-ink-muted text-sm sm:text-base transition flex items-center justify-between gap-3 min-h-[48px]';
                if (statusIcon) statusIcon.textContent = '';
              }
            });
            if (feedbackEl) {
              feedbackEl.className =
                'microquiz-feedback mt-3.5 p-3.5 rounded-xl bg-success-light border border-success/40 text-ink text-sm font-medium leading-relaxed';
              feedbackEl.innerHTML = `<strong class="text-success">✓ Corrigé Enseignant :</strong> ${explanation}`;
            }
          } else {
            feedbackEl?.classList.add('hidden');
            options.forEach((b) => {
              b.className =
                'microquiz-option text-left w-full px-4 py-3 rounded-btn bg-surface hover:bg-republic-100/70 border-2 border-line text-ink font-medium text-sm sm:text-base transition flex items-center justify-between gap-3 min-h-[48px]';
              const statusIcon = b.querySelector('.option-status-icon');
              if (statusIcon) statusIcon.textContent = '';
            });
          }
        });
      });

      questionEls.forEach((qEl) => {
        const qIndex = Number(qEl.getAttribute('data-q-index'));
        const correctIndex = Number(qEl.getAttribute('data-correct-index'));
        const explanation = qEl.getAttribute('data-explanation') || '';
        const feedbackEl = qEl.querySelector<HTMLElement>('.microquiz-feedback');
        const options = qEl.querySelectorAll<HTMLButtonElement>('.microquiz-option');

        options.forEach((optBtn) => {
          optBtn.addEventListener('click', () => {
            const chosenIndex = Number(optBtn.getAttribute('data-option-index'));
            const isCorrect = chosenIndex === correctIndex;

            if (isCorrect) {
              playSound('pop');
              solvedSet.add(qIndex);
              options.forEach((b) => {
                const idx = Number(b.getAttribute('data-option-index'));
                const statusIcon = b.querySelector('.option-status-icon');
                if (idx === correctIndex) {
                  b.className =
                    'microquiz-option text-left w-full px-4 py-3 rounded-btn bg-success-light border-2 border-success text-ink font-bold text-sm sm:text-base transition flex items-center justify-between gap-3 min-h-[48px]';
                  if (statusIcon) statusIcon.textContent = '✓ Exact';
                } else {
                  b.className =
                    'microquiz-option text-left w-full px-4 py-3 rounded-btn bg-surface opacity-60 border border-line text-ink-muted text-sm sm:text-base transition flex items-center justify-between gap-3 min-h-[48px]';
                }
              });

              if (feedbackEl) {
                feedbackEl.className =
                  'microquiz-feedback mt-3.5 p-3.5 rounded-xl bg-success-light border border-success/40 text-ink text-sm font-medium leading-relaxed';
                feedbackEl.innerHTML = `<strong class="text-success">✓ Bonne réponse !</strong> ${explanation}`;
              }

              if (solvedSet.size === questionEls.length) {
                summaryEl?.classList.remove('hidden');
                completeStep(stepNumber, xpReward, badgeId);
              }
            } else {
              optBtn.className =
                'microquiz-option text-left w-full px-4 py-3 rounded-btn bg-error-light border-2 border-error text-ink font-semibold text-sm sm:text-base transition flex items-center justify-between gap-3 min-h-[48px]';
              const statusIcon = optBtn.querySelector('.option-status-icon');
              if (statusIcon) statusIcon.textContent = '✗ Essaie encore';
              if (feedbackEl) {
                feedbackEl.className =
                  'microquiz-feedback mt-3.5 p-3.5 rounded-xl bg-error-light border border-error/40 text-ink text-sm font-medium leading-relaxed';
                feedbackEl.innerHTML = `<strong class="text-error">Pas tout à fait !</strong> Relis bien l’indice : ${explanation} <em>Clique sur la bonne réponse pour valider la question.</em>`;
              }
            }
          });
        });
      });

      resetBtn?.addEventListener('click', () => {
        solvedSet.clear();
        summaryEl?.classList.add('hidden');
        questionEls.forEach((qEl) => {
          qEl.querySelector<HTMLElement>('.microquiz-feedback')?.classList.add('hidden');
          qEl.querySelectorAll<HTMLButtonElement>('.microquiz-option').forEach((b) => {
            b.className =
              'microquiz-option text-left w-full px-4 py-3 rounded-btn bg-surface hover:bg-republic-100/70 border-2 border-line text-ink font-medium text-sm sm:text-base transition flex items-center justify-between gap-3 min-h-[48px]';
            const statusIcon = b.querySelector('.option-status-icon');
            if (statusIcon) statusIcon.textContent = '';
          });
        });
      });
    });
  }

  // Expose API globally for interactive step islands
  (window as unknown as Record<string, unknown>).ANApp = {
    getState: () => state,
    addXP,
    unlockBadge,
    completeStep,
    completeFinalQuiz,
    unlockDiplomaByTeacher,
    setDiplomaDetails,
    playSound,
    showToast,
    openLightboxByPhotoId,
    setFinalQuizScore: (score: number) => {
      completeFinalQuiz(score);
    }
  };

  syncUI();
  setupEventListeners();
  window.dispatchEvent(new CustomEvent('an:ready', { detail: state }));

  // Register Service Worker for offline PWA use in classroom
  if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => reg.update())
        .catch(() => { });
    });
  }
}

