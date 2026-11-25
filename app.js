const $ = (selector) => document.querySelector(selector);
const titles = ['Momo', 'Momo#1', 'Logo-Collection', 'Towards Health', 'AI Creation', 'Thank'];
const dialog = $('dialog');
const galleries = {0: 'momo', 1: 'momo-1', 2: 'logo-collection', 3: 'towards-health'};
let selected = 0;
function showCover(index) {
  selected = (index + titles.length) % titles.length;
  const boards = $('#boards');
  boards.hidden = !galleries[selected];
  dialog.classList.toggle('reading', Boolean(galleries[selected]));
  if (Boolean(galleries[selected])) {
    if (boards.dataset.gallery !== galleries[selected]) {
      mediaObserver.disconnect();
      boards.replaceChildren(document.getElementById(galleries[selected] + '-boards').content.cloneNode(true));
      boards.querySelectorAll('video').forEach(video => mediaObserver.observe(video));
      boards.dataset.gallery = galleries[selected];
      boards.setAttribute('aria-label', titles[selected] + ' 项目画板');
    }
    boards.scrollTop = 0;
    return;
  }
  $('#preview').src = 'assets/project' + selected + '.webp';
  $('#preview').alt = titles[selected];
  $('#counter').textContent = (selected + 1) + ' / ' + titles.length;
}
const cards = [...document.querySelectorAll('.grid .chroma-card')];
cards.forEach((card,index) => {
  card.onclick = () => {
    showCover(index);
    stopGlide();
    dialog.showModal();
    if (galleries[index]) { $('#boards').scrollTop = 0; updateReadingProgress(); }
  };
});
const caption = $('.project-caption span');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let captionTimer;
let nextTitle = caption.textContent;
function setCaption(button) {
  const title = titles[cards.indexOf(button)] || '选择一个项目来查看';
  if (nextTitle === title) return;
  nextTitle = title;
  clearTimeout(captionTimer);
  caption.getAnimations().forEach(animation => animation.cancel());
  if (reduceMotion.matches) { caption.textContent = title; return; }
  const sharp = {opacity:1, filter:'blur(0px)'};
  const soft = {opacity:.15, filter:'blur(4px)'};
  caption.animate([sharp, soft], {duration:65, fill:'forwards'});
  captionTimer = setTimeout(() => {
    caption.getAnimations().forEach(animation => animation.cancel());
    caption.textContent = title;
    caption.animate([soft, sharp], {duration:145,easing:'ease-out'});
  },65);
}
for (const card of cards) {
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') setCaption(card);
  });
  card.addEventListener('focus', () => setCaption(card));
}
$('.grid').addEventListener('pointerleave', () => setCaption(null));
$('.grid').addEventListener('focusout', event => setCaption(event.relatedTarget?.closest?.('.grid button')));
function visibleBoard() {
  const pane = $('#boards');
  const middle = pane.getBoundingClientRect().top + pane.clientHeight / 2;
  const pages = [...pane.children];
  const index = pages.findIndex(page => page.getBoundingClientRect().bottom >= middle);
  return index < 0 ? pages.length - 1 : index;
}
function updateReadingProgress() {
  if (!dialog.open || !galleries[selected]) return;
  const pane = $('#boards');
  const limit = pane.scrollHeight - pane.clientHeight;
  $('#reading-progress').value = limit > 0 ? 100 * pane.scrollTop / limit : 0;
}
function stepPreview(delta) {
  if (!galleries[selected]) {
    showCover(selected + delta);
    updateReadingProgress();
    return;
  }
  const pane = $('#boards');
  const page = pane.children[visibleBoard() + delta];
  if (page) pane.scrollTop += page.getBoundingClientRect().top - pane.getBoundingClientRect().top;
}
$('#boards').addEventListener('scroll', updateReadingProgress, {passive:true});
$('#reading-progress').oninput = event => {
  stopGlide();
  const pane = $('#boards');
  pane.scrollTop = (pane.scrollHeight - pane.clientHeight) * event.target.valueAsNumber / 100;
};
new ResizeObserver(updateReadingProgress).observe($('#boards'));
dialog.addEventListener('close', () => {
  stopGlide();
  $('#boards video')?.pause();
});
const mediaObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting && dialog.open) entry.target.play().catch(() => {});
    else entry.target.pause();
  }
}, {root: $('#boards')});

$('#prev').onclick = () => stepPreview(-1);
$('#next').onclick = () => stepPreview(1);
const closeIcon = $('.close-icon');
$('.close').addEventListener('pointerenter', event => {
  if (!dialog.classList.contains('reading') || event.pointerType === 'touch' || reduceMotion.matches ||
      closeIcon.getAnimations().length) return;
  closeIcon.animate([
    { transform: 'rotate(0deg)', easing: 'cubic-bezier(.4,0,.15,1)' },
    { transform: 'rotate(377deg)', offset: .70, easing: 'ease-in-out' },
    { transform: 'rotate(356deg)', offset: .88, easing: 'ease-out' },
    { transform: 'rotate(360deg)' }
  ], 780);
});
$('.close').onclick = () => dialog.close();
dialog.onclick = event => { if (event.target === dialog) dialog.close(); };
dialog.onkeydown = event => {
  if (event.target.id === 'reading-progress') return;
  if (event.key === 'ArrowLeft') stepPreview(-1);
  if (event.key === 'ArrowRight') stepPreview(1);
};
let toast;
['passion2580163.cn', '18872962912', 'Oooo111'].forEach((value, index) => {
  const button = document.createElement('button');
  const image = new Image();
  image.src = 'assets/contact' + index + '.svg';
  image.alt = ['邮箱', '电话 / VX', '社交'][index] + '：' + value;
  button.title = '复制 ' + value;
  button.append(image);
  button.onclick = async () => {
    try { await navigator.clipboard.writeText(value); $('output').textContent = '已复制 ' + value; }
    catch { $('output').textContent = value; }
    clearTimeout(toast);
    toast = setTimeout(() => $('output').textContent = '', 2400);
  };
  $('.contacts').append(button);
});
let cursorsShown = false;
async function enterHome() {
  const product = $('.robert');
  const designer = $('.classoi');
  await Promise.allSettled([product.decode(), designer.decode()]);
  if (cursorsShown || document.body.dataset.page !== 'home') return;
  cursorsShown = true;
  document.body.classList.add('cursors-ready');
  if (reduceMotion.matches) return;
  for (const [image, start, duration, delay, easing] of [
    [product, 'translate(-34.375vw,1.25vw) rotate(-6deg)', 1680, 0, 'cubic-bezier(.19,.76,.34,1.055)'],
    [designer, 'translate(2.1875vw,-43.52vh) rotate(9deg)', 1860, 260, 'cubic-bezier(.33,.10,.23,1.13)']
  ]) {
    image.animate([{transform:start}, {transform:'none'}], {duration,delay,easing,fill:'backwards'});
  }
}
function navigate() {
  stopGlide();
  const id = ['home','work','about'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  document.body.dataset.page = id;
  document.querySelectorAll('main section').forEach(section => {
    section.hidden = id !== 'home' && section.id !== id;
  });
  document.querySelectorAll('nav a').forEach(link => {
    if (link.hash === '#' + id) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  $('.player').hidden = id === 'work';
  if (id === 'home') enterHome();
  document.title = id[0].toUpperCase() + id.slice(1) + ' · Skye Wang';
  setCaption(null);
  window.scrollTo(0,0);
  scheduleFade();
}
const fadeItems = [...document.querySelectorAll('#work h2, .project-caption, .grid button, .bio, .contacts button, .pink')];
let fadeFrame;
const portrait = $('.portrait');
if (!reduceMotion.matches) {
  portrait.classList.add('portrait-waiting');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.intersectionRatio >= .2)) return;
    observer.disconnect();
    portrait.classList.replace('portrait-waiting', 'portrait-entering');
  }, {threshold: .2});
  observer.observe(portrait);
  reduceMotion.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      portrait.classList.remove('portrait-waiting', 'portrait-entering');
    }
  });
}
function smoothProgress(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}
function scheduleFade() {
  if (fadeFrame) return;
  fadeFrame = requestAnimationFrame(() => {
    fadeFrame = 0;
    const page = document.scrollingElement;
    const height = page.clientHeight;
    const remaining = page.scrollHeight - height - page.scrollTop;
    if (remaining <= 1 || reduceMotion.matches || document.body.dataset.page !== 'home') {
      fadeItems.forEach(item => {
        item.style.removeProperty('opacity');
        item.style.removeProperty('translate');
      });
      return;
    }
    const depth = height * .50;
    const fadeStrength = smoothProgress(remaining / depth);
    const tops = fadeItems.map(item => item.getBoundingClientRect().top - (parseFloat(item.style.translate.split(" ")[1]) || 0));
    fadeItems.forEach((item, i) => {
      const revealed = smoothProgress((height - tops[i]) / depth);
      const opacity = 1 - (1 - revealed) * fadeStrength;
      item.style.opacity = String(opacity);
      item.style.translate = '0px ' + (24 * (1 - opacity)) + 'px';
    });
  });
}
// Ease wheel travel while keeping touch scrolling and browser zoom native.
let glideFrame = 0;
let targetY = 0;
let glideY = 0;
let lastFrameTime = 0;
function stopGlide() {
  cancelAnimationFrame(glideFrame);
  glideFrame = 0;
}
let glideSurface;
function advanceGlide(time) {
  const page = glideSurface;
  targetY = Math.min(targetY, page.scrollHeight - page.clientHeight);
  const distance = targetY - glideY;
  const elapsed = Math.max(1, time - lastFrameTime);
  lastFrameTime = time;
  if (Math.abs(distance) < .5) {
    page.scrollTop = targetY;
    glideFrame = 0;
    return;
  }
  const decay = page === document.scrollingElement ? 235 : 410;
  glideY += distance * (1 - Math.exp(-elapsed / decay));
  page.scrollTop = glideY;
  glideFrame = requestAnimationFrame(advanceGlide);
}
function handleWheel(event) {
  if (!event.cancelable || event.defaultPrevented || event.ctrlKey || event.shiftKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) || reduceMotion.matches ||
      (dialog.open ? !galleries[selected] : document.body.dataset.page !== 'home')) return;
  if (dialog.open && !dialog.contains(event.target)) return;
  const page = dialog.open ? $('#boards') : document.scrollingElement;
  if (page !== glideSurface) stopGlide();
  glideSurface = page;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page.clientHeight : 1;
  const delta = event.deltaY * unit;
  if (!delta) return;
  if (!glideFrame || Math.sign(delta) !== Math.sign(targetY - glideY)) {
    glideY = page.scrollTop;
    targetY = glideY;
  }
  const travel = dialog.open ? 1.85 : 1.4;
  targetY = Math.max(0, Math.min(page.scrollHeight - page.clientHeight, targetY + delta * travel));
  event.preventDefault();
  if (!glideFrame) {
    lastFrameTime = performance.now();
    glideFrame = requestAnimationFrame(advanceGlide);
  }
}
dialog.addEventListener('wheel', handleWheel, {passive:false});
window.addEventListener('wheel', event => {
  if (!dialog.open) handleWheel(event);
}, {passive:false});
for (const event of ['pointerdown', 'touchstart', 'keydown', 'resize']) {
  window.addEventListener(event, stopGlide, {passive:true});
}
reduceMotion.addEventListener('change', stopGlide);
window.addEventListener('scroll', scheduleFade, {passive:true});
window.addEventListener('resize', scheduleFade);
window.addEventListener('load', scheduleFade);
reduceMotion.addEventListener('change', scheduleFade);
window.addEventListener('hashchange',navigate);
navigate();
const audio = new Audio('assets/im-lost.mp3');
audio.preload = 'metadata';
const player = $('.player');
function updatePlayer() {
  const playing = !audio.paused && !audio.ended;
  player.querySelector('b').textContent = playing ? 'Ⅱ' : '▶';
  player.querySelector('.playback-status').textContent = playing ? 'Playing' : 'Paused';
  player.setAttribute('aria-pressed', String(playing));
  player.setAttribute('aria-label', (playing ? '暂停' : '播放') + " I'm Lost");
}
for (const event of ['playing','pause','ended']) audio.addEventListener(event, updatePlayer);
player.onclick = async () => {
  if (!audio.paused) { audio.pause(); return; }
  try { await audio.play(); }
  catch { updatePlayer(); $('output').textContent = '音乐加载失败，请再点一次播放'; }
};

const themeButton = $('.theme');
function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  themeButton.setAttribute('aria-pressed', String(dark));
  document.querySelector('meta[name="theme-color"]').content = dark ? '#131313' : '#ffffff';
}
applyTheme('light');
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  if (!reduceMotion.matches) {
    const direction = theme === 'dark' ? 1 : -1;
    for (const thumb of themeButton.querySelectorAll('.thumb')) {
      const incoming = thumb.closest('svg').classList.contains(theme === 'dark' ? 'night' : 'day');
      const offset = incoming ? -direction * 47 : 0;
      thumb.getAnimations().forEach(animation => animation.cancel());
      thumb.animate([
        { transform: 'translateX(' + offset + 'px)' },
        { transform: 'translateX(' + (offset + direction * 24) + 'px) scale(1.36,.88)', offset:.5 },
        { transform: 'translateX(' + (offset + direction * 47) + 'px)' }
      ], {duration:320, easing:'cubic-bezier(.4,0,.2,1)'});
    }
  }
  applyTheme(theme);
});

const thanksCard = cards[5];
const thanksTitle = document.createElement('span');
thanksTitle.className = 'thanks-title';
thanksTitle.textContent = 'thank*/';
thanksCard.querySelector('.chroma-media').append(thanksTitle);
thanksCard.onclick = null;
thanksCard.addEventListener('focus', () => {
  if (thanksCard.matches(':focus-visible')) thanksTitle.dispatchEvent(new PointerEvent('pointerenter', {pointerType:'mouse'}));
});
thanksCard.addEventListener('blur', () => thanksTitle.dispatchEvent(new Event('pointerleave')));

for (const link of [...document.querySelectorAll('header nav a'), thanksTitle]) {
  const label = link.textContent;
  const symbols = '!<>-_/[]{}=+*^?#';
  let timer;
  function resetLabel() {
    clearTimeout(timer);
    link.textContent = label;
  }
  function play() {
    resetLabel();
    if (reduceMotion.matches) return;
    const letters = [...label].map(letter => {
      const slot = document.createElement('span');
      slot.className = 'nav-letter encrypted';
      slot.textContent = letter;
      link.append(slot);
      return slot;
    });
    link.firstChild.remove();
    let frame = 0;
    function tick() {
      const revealed = Math.floor(frame * letters.length / 10);
      letters.forEach((slot, index) => {
        if (index < revealed) {
          slot.className = 'nav-letter revealed';
          slot.removeAttribute('data-symbol');
        } else {
          slot.dataset.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        }
      });
      frame++;
      timer = frame <= 10 ? setTimeout(tick, 45) : setTimeout(play, 1800);
    }
    tick();
  }
  link.setAttribute('aria-label', label);
  link.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') play();
  });
  link.addEventListener('pointerleave', resetLabel);
  link.addEventListener('pointercancel', resetLabel);
  reduceMotion.addEventListener('change', resetLabel);
}

const linkedGallery = Object.keys(galleries).find(index => '#' + galleries[index] === location.hash);
if (linkedGallery !== undefined) {
  history.replaceState(null, '', '#work');
  navigate();
  cards[linkedGallery].click();
}
