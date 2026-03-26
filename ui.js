/* ===== 스탯 바 ===== */
function renderStats() {
  var s = calcStats();

  document.getElementById('statsMain').innerHTML =
    '<div class="stat-item"><div class="stat-val">' + fmt(s.avg) + '</div><div class="stat-lbl">타율</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + fmt(s.obp) + '</div><div class="stat-lbl">출루</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + fmt(s.slg) + '</div><div class="stat-lbl">장타</div></div>' +
    '<div class="stat-item"><div class="stat-val">' + fmt(s.ops) + '</div><div class="stat-lbl">OPS</div></div>';

  document.getElementById('statsDtl').innerHTML =
    '<div class="stat-item"><div class="stat-val2">' + s.pa + '</div><div class="stat-lbl">타석</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.ab + '</div><div class="stat-lbl">타수</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.h + '</div><div class="stat-lbl">안타</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.hr + '</div><div class="stat-lbl">홈런</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.bb + '</div><div class="stat-lbl">볼넷</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.hbp + '</div><div class="stat-lbl">사구</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.so + '</div><div class="stat-lbl">삼진</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.rbi + '</div><div class="stat-lbl">타점</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.runs + '</div><div class="stat-lbl">득점</div></div>' +
    '<div class="stat-item"><div class="stat-val2">' + s.sb + '</div><div class="stat-lbl">도루</div></div>';
}

/* 스탯 토글 */
document.getElementById('statsBox').addEventListener('click', function() {
  statsOpen = !statsOpen;
  document.getElementById('statsDtl').classList.toggle('open', statsOpen);
  document.getElementById('statsTgl').textContent = statsOpen ? '▲ 접기' : '▼ 상세';
});

/* ===== 카드 렌더링 ===== */
function renderCards() {
  var w = document.getElementById('cardArea');
  var c = document.getElementById('cardCnt');

  if (!G.length) {
    w.innerHTML = '<div class="empty-msg">+ 버튼으로 첫 경기를 추가하세요</div>';
    c.textContent = '';
    return;
  }
  if (curIdx >= G.length) curIdx = G.length - 1;
  if (curIdx < 0) curIdx = 0;

  var html = '';
  for (var i = 0; i < G.length; i++) {
    var g = G[i];
    var diff = i - curIdx;
    var st, zi, pe = 'auto';

    if (diff === 0) {
      st = 'transform:scale(1);opacity:1';
      zi = 20;
    } else if (diff === 1) {
      st = 'transform:translateX(26px) scale(.95) rotateY(-3deg);opacity:.6';
      zi = 15;
    } else if (diff === 2) {
      st = 'transform:translateX(48px) scale(.9) rotateY(-5deg);opacity:.3';
      zi = 10;
    } else if (diff === -1) {
      st = 'transform:translateX(-26px) scale(.95) rotateY(3deg);opacity:.6';
      zi = 15;
    } else {
      st = 'transform:translateX(' + (diff > 0 ? 65 : -65) + 'px) scale(.85);opacity:0';
      zi = 0;
      pe = 'none';
    }

    /* 타석 칩 */
    var chips = '';
    for (var j = 0; j < g.abs.length; j++) {
      var a = g.abs[j];
      var sub = chipSub(a);
      chips += '<span class="ab-chip ' + chipClass(a.result) + '" onclick="event.stopPropagation();openDetail(' + g.id + ',' + a.id + ')">';
      chips += '<span class="chip-main">' + (RN[a.result] || a.result) + '</span>';
      if (sub) chips += '<span class="chip-sub">' + sub + '</span>';
      chips += '</span>';
    }
    if (!chips) chips = '<span style="color:#ccc;font-size:12px">타석을 추가하세요</span>';

    /* 메모 영역 */
    var memo = '<div class="memo-section">';
    memo += '<div class="memo-title">총평</div>';
    if (g.memo) {
      memo += '<div class="memo-text">' + g.memo + '</div>';
    } else {
      memo += '<div class="memo-empty" onclick="event.stopPropagation();openMemo(' + g.id + ')">터치하여 총평 작성</div>';
    }

    /* 타석별 메모 */
    var abMemos = '';
    for (var j = 0; j < g.abs.length; j++) {
      var a = g.abs[j];
      if (a.memo) {
        abMemos += '<div class="memo-ab-item"><b>' + (RN[a.result] || a.result) + '</b> ' + a.memo + '</div>';
      }
    }
    if (abMemos) memo += '<div class="memo-ab-list">' + abMemos + '</div>';
    memo += '</div>';

    /* 카드 조립 */
    html += '<div class="game-card" style="' + st + ';z-index:' + zi + ';pointer-events:' + pe + '">';
    html += '<div class="card-title">' + g.date + (g.opponent ? ' vs ' + g.opponent : '') + '</div>';
    html += '<div class="card-line">' + gameLine(g) + '</div>';
    html += '<div class="ab-list">' + chips + '</div>';
    html += memo;
    html += '<div class="card-btns">';
    html += '<button class="btn-sm" onclick="event.stopPropagation();openAB(' + g.id + ')">+ 타석</button>';
    html += '<button class="btn-sm" onclick="event.stopPropagation();openMemo(' + g.id + ')">메모</button>';
    html += '<button class="btn-sm btn-del" onclick="event.stopPropagation();delGame(' + g.id + ')">삭제</button>';
    html += '</div></div>';
  }

  w.innerHTML = html;
  c.textContent = (curIdx + 1) + ' / ' + G.length;
}

/* 카드 이동 */
function navCard(dir) {
  if (!G.length) return;
  curIdx = Math.max(0, Math.min(G.length - 1, curIdx + dir));
  renderCards();
}

/* 터치 스와이프 */
var touchX = 0, touchY = 0, swiping = false;
document.getElementById('cardArea').addEventListener('touchstart', function(e) {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
  swiping = true;
});
document.getElementById('cardArea').addEventListener('touchmove', function(e) {
  if (!swiping) return;
  var dx = Math.abs(e.touches[0].clientX - touchX);
  var dy = Math.abs(e.touches[0].clientY - touchY);
  if (dx > dy && dx > 10) e.preventDefault();
}, {passive: false});
document.getElementById('cardArea').addEventListener('touchend', function(e) {
  if (!swiping) return;
  swiping = false;
  var dx = e.changedTouches[0].clientX - touchX;
  if (dx > 50) navCard(1);
  if (dx < -50) navCard(-1);
});

/* 전체 렌더링 */
function renderAll() {
  renderStats();
  renderCards();
}

/* 경기 삭제 */
function delGame(gid) {
  if (!confirm('이 경기를 삭제할까요?')) return;
  removeGame(gid);
  renderAll();
}

/* 초기 렌더링 */
renderAll();
