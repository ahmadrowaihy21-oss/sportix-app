'use strict';
(() => {
  const dialog = document.getElementById('studio-film');
  const video = document.getElementById('studio-video');
  const replay = document.getElementById('replay-intro');
  const skip = document.getElementById('film-skip');
  const sound = document.getElementById('film-sound');
  const pause = document.getElementById('film-pause');
  const meter = document.getElementById('film-fill');
  const seenKey = 'rowaihy.opening-film.v1';
  let timeout, trigger, userPaused = false;
  let completedOnce = false;

  function seen() {
    try { return completedOnce || sessionStorage.getItem(seenKey) === 'seen'; }
    catch { return completedOnce; }
  }
  function markSeen() {
    completedOnce = true;
    try { sessionStorage.setItem(seenKey, 'seen'); } catch { /* Private mode. */ }
  }
  function closeFilm() {
    if (!dialog.open) return;
    dialog.close();
  }
  function cleanup() {
    clearTimeout(timeout);
    video.pause();
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
    else document.getElementById('main').focus({preventScroll:true});
  }
  function watchLoad() {
    clearTimeout(timeout);
    if (dialog.open && !userPaused) timeout = setTimeout(closeFilm, 6500);
  }
  function updateControls() {
    pause.textContent = userPaused ? 'Resume' : 'Pause';
    pause.setAttribute('aria-label', pause.textContent);
    sound.textContent = video.muted ? 'Unmute' : 'Mute';
    sound.setAttribute('aria-pressed', String(!video.muted));
  }

  function openFilm(manual) {
    if (dialog.open) return;
    trigger = manual ? replay : null;
    userPaused = false;
    video.muted = true;
    const mobile = window.matchMedia('(max-aspect-ratio: 4/5)').matches;
    const ext = video.canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"') ? 'mp4' : 'webm';
    const source = 'media/rowaihy-intro' + (mobile ? '-mobile' : '') + '.' + ext;
    if (video.getAttribute('src') !== source) video.src = source;
    else video.currentTime = 0;
    meter.style.transform = 'scaleX(0)';
    updateControls();
    dialog.showModal();
    skip.focus({preventScroll:true});
    watchLoad();
    video.play().catch(closeFilm);
  }
  replay.addEventListener('click', () => openFilm(true));
  skip.addEventListener('click', () => { markSeen(); closeFilm(); });
  dialog.addEventListener('cancel', markSeen);
  dialog.addEventListener('close', cleanup);
  video.addEventListener('playing', () => { clearTimeout(timeout); if (dialog.open) markSeen(); });
  video.addEventListener('waiting', watchLoad);
  video.addEventListener('error', closeFilm);
  video.addEventListener('ended', closeFilm);
  video.addEventListener('timeupdate', () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      meter.style.transform = 'scaleX(' + Math.min(1,video.currentTime/video.duration) + ')';
    }
  });
  sound.addEventListener('click', () => { video.muted = !video.muted; updateControls(); });
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) { clearTimeout(timeout); video.pause(); }
    else { watchLoad(); video.play().catch(closeFilm); }
    updateControls();
  });
  window.addEventListener('pagehide', closeFilm);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!seen() && !location.hash && !reduced.matches) openFilm(false);
})();
