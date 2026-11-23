const menu = document.querySelector('.mega');
document.addEventListener('click', event => {
  if (!menu.contains(event.target)) menu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    const mobile = document.querySelector('[data-nav-toggle]');
    (mobile.offsetWidth ? mobile : menu.querySelector('summary')).focus();
  }
});
document.querySelectorAll('[data-explorer]').forEach(explorer => {
  const sections = [...explorer.querySelectorAll('details')];
  sections[0].open = true;
  sections.forEach(section => section.addEventListener('toggle', () => {
    if (section.open) sections.filter(other => other !== section).forEach(other => other.open = false);
  }));
});
const quiz = document.querySelector('#readiness');
if (quiz) {
  const output = quiz.querySelector('[role=status]');
  const resultActions = quiz.querySelector('[data-result-actions]');
  quiz.addEventListener('change', () => {
    resultActions.hidden = true;
    quiz.querySelector('progress').value = quiz.querySelectorAll(':checked').length;
    output.textContent = '';
  });
  quiz.addEventListener('submit', event => {
    event.preventDefault();
    const actions = [
      'Review allowed incoming connections with your network administrator.',
      'Check default settings and remove unused software on a sample device.',
      'Compare privileged accounts with current staff roles.',
      'Check the protection status of managed devices.',
      'List unsupported software and outstanding security updates.'
    ];
    const gaps = [...quiz.querySelectorAll('fieldset')].flatMap((field, index) => {
      const answer = field.querySelector(':checked').value;
      if (answer === 'Yes') return [];
      return [field.querySelector('legend').textContent + ' (' + answer + '). ' + actions[index]];
    });
    output.textContent = gaps.length ? gaps.join('\n') : 'All five areas marked as covered. Gather supporting evidence before a formal assessment.';
    resultActions.hidden = false;
  });
  quiz.querySelector('[data-share-summary]').addEventListener('click', () => {
    // Transfer only after the visitor chooses to share. Keep findings out of URLs.
    try {
      sessionStorage.setItem('enquiry-readiness', output.textContent);
      location.assign('contact.html?service=Cyber+Essentials+readiness&summary=1');
    } catch {
      output.textContent += '\nCopy these findings into your enquiry if you would like to share them.';
    }
  });
}
const business = document.querySelector('#business');
if (business) {
  const form = business.form;
  const params = new URLSearchParams(location.search);
  const service = params.get('service');
  const need = form.elements.namedItem('need');
  if ([...need.options].some(option => option.value === service)) need.value = service;
  if (params.get('summary') === '1') {
    try {
      const summary = sessionStorage.getItem('enquiry-readiness');
      if (summary) form.elements.namedItem('message').value = summary;
      sessionStorage.removeItem('enquiry-readiness');
    } catch { /* The enquiry can still be written manually. */ }
  }
  const person = document.querySelector('#person');
  const send = form.querySelector('[type=submit]');
  const forward = document.querySelector('#forward');
  const back = document.querySelector('#back');
  forward.hidden = back.hidden = false;
  function showContacts(active) {
    business.hidden = active;
    person.hidden = send.hidden = !active;
    document.querySelector('#form-stage').textContent = active ? 'Step 2 of 2 · Contact details' : 'Step 1 of 2 · Your business';
  }
  showContacts(false);
  forward.onclick = () => {
    const message = business.querySelector('textarea');
    message.value = message.value.trim();
    if (message.reportValidity()) {
      showContacts(true);
      person.querySelector('input').focus();
    }
  };
  back.onclick = () => {
    showContacts(false);
    business.querySelector('select').focus();
  };
  form.addEventListener('reset', () => showContacts(false));
}

function addWorkspace(explorer, title, label) {
  const panels = [...explorer.querySelectorAll('details')];
  const workspace = document.createElement('div');
  workspace.className = 'workspace';
  const navigation = document.createElement('div');
  navigation.className = 'workspace-nav';
  const heading = document.createElement('h3');
  heading.textContent = title;
  navigation.append(heading);
  const article = document.createElement('article');
  article.setAttribute('aria-live', 'polite');
  const category = document.createElement('small');
  category.textContent = label;
  const name = document.createElement('h3');
  const copy = document.createElement('p');
  article.append(category, name, copy);
  const buttons = panels.map(panel => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = panel.querySelector('summary').textContent;
    button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      name.textContent = button.textContent;
      copy.textContent = panel.querySelector('p').textContent;
    });
    navigation.append(button);
    return button;
  });
  workspace.append(navigation, article);
  explorer.replaceChildren(workspace);
  buttons[0].click();
}
const explorer = document.querySelector('[data-explorer]');
if (explorer && location.pathname.endsWith('sharepoint.html')) {
  addWorkspace(explorer, 'Staff portal', 'Example workspace');
}
if (explorer && location.pathname.endsWith('microsoft-cloud.html')) {
  addWorkspace(explorer, 'Connected services', 'Microsoft cloud explorer');
}
if (explorer && location.pathname.endsWith('dspt.html')) {
  const progress = document.createElement('progress');
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  progress.max = explorer.querySelectorAll('details').length;
  progress.value = 0;
  progress.setAttribute('aria-label', 'Preparation stages reviewed');
  explorer.before(status, progress);
  function updateProgress() {
    progress.value = explorer.querySelectorAll(':checked').length;
    status.textContent = progress.value + ' of ' + progress.max + ' preparation stages reviewed';
  }
  explorer.querySelectorAll('details').forEach(stage => {
    const label = document.createElement('label');
    const check = document.createElement('input');
    check.type = 'checkbox';
    label.append(check, ' Mark this stage as reviewed');
    stage.append(label);
    check.addEventListener('change', updateProgress);
  });
  updateProgress();
}

function setupHeroWords(hero) {
  const word = hero.querySelector('[data-hero-word]');
  const orbitLinks = [...hero.querySelectorAll('.orbit a')];
  const controls = hero.querySelector('.orbit-controls');
  const toggle = controls.querySelector('[data-cycle]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const phrases = ['Simplified.', 'Connected.', 'Protected.', 'Supported.'];
  let index = 0;
  let paused = motion.matches;
  let visible = true;
  let timer;
  let hovered = null;
  let focused = null;

  function render(next) {
    if (next === index) return;
    index = next;
    const letters = Array.from(phrases[index], (char, position) => {
      const span = document.createElement('span');
      span.textContent = char;
      if (!motion.matches) {
        span.animate([
          { opacity: 0, transform: 'translateY(.25em)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 310, delay: position * 30, fill: 'backwards', easing: 'ease-out' });
      }
      return span;
    });
    word.replaceChildren(...letters);
    orbitLinks.forEach((link, i) => link.classList.toggle('lit', i + 1 === index));
  }

  function schedule() {
    clearTimeout(timer);
    if (paused || !visible || document.hidden || focused !== null || hovered !== null) return;
    timer = setTimeout(() => {
      render((index + 1) % phrases.length);
      schedule();
    }, 3600);
  }

  function syncSelection() {
    const selection = focused ?? hovered;
    if (selection !== null) render(selection);
    schedule();
  }

  orbitLinks.forEach((link, i) => {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = i + 1;
      syncSelection();
    });
    link.addEventListener('pointerleave', () => { hovered = null; syncSelection(); });
    link.addEventListener('focus', () => { focused = i + 1; syncSelection(); });
    link.addEventListener('blur', () => { focused = null; syncSelection(); });
  });
  function updatePlayback() {
    toggle.textContent = paused ? '▶' : 'Ⅱ';
    toggle.setAttribute('aria-label', paused ? 'Play headline animation' : 'Pause headline animation');
    schedule();
  }
  toggle.addEventListener('click', () => { paused = !paused; updatePlayback(); });
  controls.querySelector('[data-next]').addEventListener('click', () => {
    render((index + 1) % phrases.length);
    schedule();
  });
  motion.addEventListener('change', () => { paused = motion.matches; updatePlayback(); });
  document.addEventListener('visibilitychange', schedule);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }).observe(hero);
  controls.hidden = false;
  updatePlayback();
}

const homepageHero = document.querySelector('.lead');
if (homepageHero) setupHeroWords(homepageHero);
