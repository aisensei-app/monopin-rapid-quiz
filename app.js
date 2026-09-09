(() => {
  const root = document.querySelector('#app');
  const $ = (s) => document.querySelector(s);
  const shuffle = (items) => [...items].sort(() => Math.random() - .5);
  let game = [];
  let answers = [];
  let index = 0;
  let timer;

  function top() {
    clearInterval(timer);
    root.innerHTML = `<section class="card top-card"><div class="pin-mark"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div><p class="eyebrow">3 SECONDS × 10 QUESTIONS</p><h1>瞬発力で、<br>答えを刺そう。</h1><p class="lead">知ってる問題も、知らない問題も。<br>3秒で、何点取れる？</p><button class="primary" id="start">スタート！</button><p class="rule">全10問　・　1問3秒　・　1点</p></section>`;
    $('#start').onclick = countdown;
  }
  function countdown() {
    let n = 3;
    root.innerHTML = `<section class="countdown"><div class="count-circle" id="number">${n}</div><p>集中して、いこう。</p></section>`;
    const t = setInterval(() => { n--; const el=$('#number'); if(n>0) el.textContent=n; else { clearInterval(t); el.textContent='START'; el.classList.add('start-word'); setTimeout(begin, 580); } }, 750);
  }
  function begin() {
    // 全問と選択肢を開始時に一括で確定。ゲーム中に通信は発生しません。
    game = shuffle(window.RAPID_QUIZ_QUESTIONS).slice(0, 10).map(q => ({...q, a:shuffle(q.a)}));
    answers = Array(10).fill(null); index = 0; showQuestion();
  }
  function showQuestion() {
    clearInterval(timer);
    const q = game[index];
    root.innerHTML = `<section class="game-card slide-in"><div class="game-head"><span class="tag">${q.c}</span><strong>${index + 1}<i> / 10</i></strong></div><div class="timer-track"><div id="timer-bar"></div></div><p class="timer-copy">のこり <b id="seconds">3.0</b> 秒</p><h2>${q.q}</h2><div class="choices">${q.a.map((a,i)=>`<button class="choice ${answers[index]===a?'selected':''}" data-answer="${a}"><span class="choice-letter">${['A','B','C','D'][i]}</span>${a}<span class="choice-pin" aria-hidden="true"><span class="pin-halo"></span><svg class="pin-marker" viewBox="2 1 20 21" preserveAspectRatio="xMidYMax meet" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></span></button>`).join('')}</div><p class="hint">答えにピンを刺そう（何度でも変更OK）</p></section>`;
    document.querySelectorAll('.choice').forEach(b => b.onclick = (e) => {
      answers[index] = b.dataset.answer;
      document.querySelectorAll('.choice').forEach(x=>x.classList.toggle('selected',x===b));
      const rect = b.getBoundingClientRect();
      let px = 50, py = 55;
      if (e.clientX || e.clientY) {
        px = Math.max(8, Math.min(92, (e.clientX - rect.left) / rect.width * 100));
        py = Math.max(20, Math.min(90, (e.clientY - rect.top) / rect.height * 100));
      }
      const pin = b.querySelector('.choice-pin');
      pin.style.left = px + '%'; pin.style.top = py + '%';
    });
    const started = performance.now();
    const lerp = (a,b,t) => { const pa=a.match(/\w\w/g).map(x=>parseInt(x,16)), pb=b.match(/\w\w/g).map(x=>parseInt(x,16)); return `rgb(${pa.map((c,i)=>Math.round(c+(pb[i]-c)*t)).join(',')})`; };
    timer = setInterval(() => {
      const remain = Math.max(0, 3000 - (performance.now() - started));
      const frac = 1 - remain / 3000;
      $('#timer-bar').style.width = `${remain / 30}%`; $('#timer-bar').style.background = lerp('3fb87f','f19a60', frac); $('#seconds').textContent = (remain/1000).toFixed(1);
      if (!remain) { clearInterval(timer); next(); }
    }, 35);
  }
  function next() { index++; if(index === 10) results(); else { root.classList.add('slide-out'); setTimeout(()=>{ root.classList.remove('slide-out'); showQuestion(); }, 240); } }
  function results() {
    const score = game.reduce((n,q,i)=>n + (answers[i]===q.x),0);
    const perfect = score === 10;
    root.innerHTML = `<section class="card result-card">${perfect?'<div class="confetti" aria-hidden="true">✦ ✦ ✦ ✦ ✦ ✦ ✦</div>':''}<p class="eyebrow">RESULT</p><h1>${perfect?'Perfect!':'おつかれさま！'}</h1><div class="score"><strong>${score}</strong><span>/ 10</span></div><p class="lead">${perfect?'10問すべて、きれいに刺さった！':'結果を見て、次の授業でまた会おう。'}</p><div class="answers"><h3>答え合わせ</h3>${game.map((q,i)=>`<article><b class="${answers[i]===q.x?'ok':'no'}">${answers[i]===q.x?'○':'×'}</b><div><p>${q.q}</p><small>正解：<strong>${q.x}</strong></small></div></article>`).join('')}</div><button class="secondary" id="home">TOPに戻る</button></section>`;
    $('#home').onclick = top;
  }
  top();
})();
