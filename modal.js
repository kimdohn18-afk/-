/* ===== 모달 열기/닫기 ===== */
function openModal(html) {
  document.getElementById('modalBox').innerHTML = html;
  document.getElementById('modalBg').classList.add('show');
}
function closeModal() {
  document.getElementById('modalBg').classList.remove('show');
}
document.getElementById('modalBg').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('fabBtn').addEventListener('click', function() {
  openNG();
});

/* ===== 새 경기 ===== */
function openNG() {
  var today = new Date().toISOString().slice(0, 10);
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">새 경기</div>';
  h += '<input type="date" class="modal-input" id="ngDate" value="' + today + '">';
  h += '<input type="text" class="modal-input" id="ngOpp" placeholder="상대팀 (선택)">';
  h += '<button class="modal-primary" onclick="doMkGame()">경기 만들기</button>';
  openModal(h);
}
function doMkGame() {
  var d = document.getElementById('ngDate').value;
  if (!d) { alert('날짜를 선택하세요'); return; }
  addGame(d, document.getElementById('ngOpp').value);
  closeModal();
  renderAll();
}

/* ===== 타석 입력 변수 ===== */
var abGid = null, abR = '', abF = '', abD = '', abSO = '';
var abRbi = 0, abRun = 0;

/* 타석 입력 시작 */
function openAB(gid) {
  abGid = gid; abR = ''; abF = ''; abD = ''; abSO = '';
  abRbi = 0; abRun = 0;
  showStep1();
}

/* 1단계: 결과 선택 */
function showStep1() {
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">타석 결과</div>';
  h += '<div class="modal-label">안타</div><div class="modal-grid">';
  h += '<button class="modal-btn" onclick="pR(\'1B\')">1루타</button>';
  h += '<button class="modal-btn" onclick="pR(\'2B\')">2루타</button>';
  h += '<button class="modal-btn" onclick="pR(\'3B\')">3루타</button>';
  h += '<button class="modal-btn" onclick="pR(\'HR\')">홈런</button></div>';
  h += '<div class="modal-label">아웃</div><div class="modal-grid">';
  h += '<button class="modal-btn" onclick="pR(\'GO\')">땅볼</button>';
  h += '<button class="modal-btn" onclick="pR(\'FO\')">뜬공</button>';
  h += '<button class="modal-btn" onclick="pR(\'LO\')">직선타</button>';
  h += '<button class="modal-btn" onclick="pR(\'SO\')">삼진</button></div>';
  h += '<div class="modal-label">출루</div><div class="modal-grid">';
  h += '<button class="modal-btn" onclick="pR(\'BB\')">볼넷</button>';
  h += '<button class="modal-btn" onclick="pR(\'HBP\')">사구</button></div>';
  h += '<div class="modal-label">기타</div><div class="modal-grid">';
  h += '<button class="modal-btn" onclick="pR(\'SF\')">희플</button>';
  h += '<button class="modal-btn" onclick="pR(\'SH\')">희번</button>';
  h += '<button class="modal-btn" onclick="pR(\'E\')">실책</button></div>';
  h += '<button class="modal-btn" onclick="pR(\'PR\')">대주자</button></div>';
  openModal(h);
}

/* 결과 분기 */
function pR(r) {
  abR = r;
   if (r === 'BB' || r === 'HBP' || r === 'PR') { doAddAB(); return; }
  if (r === 'SO') { showStepSO(); return; }
  if (r === 'HR') { showStepHR(); return; }
  showStep2();
}

/* 홈런: 타점 선택 */
function showStepHR() {
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">홈런 타점</div>';
  h += '<div class="modal-grid">';
  h += '<button class="modal-btn" onclick="pickHRrbi(1)">솔로</button>';
  h += '<button class="modal-btn" onclick="pickHRrbi(2)">2점</button>';
  h += '<button class="modal-btn" onclick="pickHRrbi(3)">3점</button>';
  h += '<button class="modal-btn" onclick="pickHRrbi(4)">만루</button>';
  h += '</div>';
  openModal(h);
}

/* 홈런: 방향 선택 */
function pickHRrbi(n) {
  abRbi = n;
  abRun = 1;
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">홈런 방향</div>';
  h += '<div class="modal-grid">';
  h += '<button class="modal-btn" onclick="pickHRdir(\'좌\')">좌측</button>';
  h += '<button class="modal-btn" onclick="pickHRdir(\'좌중\')">좌중간</button>';
  h += '<button class="modal-btn" onclick="pickHRdir(\'중\')">중앙</button>';
  h += '<button class="modal-btn" onclick="pickHRdir(\'우중\')">우중간</button>';
  h += '<button class="modal-btn" onclick="pickHRdir(\'우\')">우측</button>';
  h += '</div>';
  openModal(h);
}

/* 홈런: 방향 확정 → 저장 */
function pickHRdir(dir) {
  abD = dir;
  abF = '';
  doAddAB();
}

/* 2단계: 수비수 선택 */
function showStep2() {
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">수비수</div>';
  h += '<div class="field-wrap">';
  h += '<svg viewBox="0 0 260 260"><path d="M130 245 L8 120 L130 5 L252 120 Z" fill="#e8f5e9" stroke="#a5d6a7" stroke-width="2"/>';
  h += '<path d="M130 245 L60 170 L130 100 L200 170 Z" fill="#f1f8e9" stroke="#c5e1a5" stroke-width="1"/></svg>';
  h += '<button class="field-pos" style="top:200px;left:110px" onclick="pF(\'C\')">포</button>';
  h += '<button class="field-pos" style="top:153px;left:110px" onclick="pF(\'P\')">투</button>';
  h += '<button class="field-pos" style="top:155px;left:168px" onclick="pF(\'1B\')">1B</button>';
  h += '<button class="field-pos" style="top:116px;left:148px" onclick="pF(\'2B\')">2B</button>';
  h += '<button class="field-pos" style="top:121px;left:68px" onclick="pF(\'SS\')">유</button>';
  h += '<button class="field-pos" style="top:155px;left:44px" onclick="pF(\'3B\')">3B</button>';
  h += '<button class="field-pos" style="top:46px;left:22px" onclick="pF(\'LF\')">좌</button>';
  h += '<button class="field-pos" style="top:14px;left:110px" onclick="pF(\'CF\')">중</button>';
  h += '<button class="field-pos" style="top:46px;left:192px" onclick="pF(\'RF\')">우</button>';
  h += '</div>';
  openModal(h);
}
function pF(f) {
  abF = f;
  showStep3();
}

/* 3단계: 타구 방향 */
function showStep3() {
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">타구 방향 (' + (FN[abF] || abF) + ')</div>';
  h += '<div class="modal-grid" style="justify-content:center">';
  h += '<button class="modal-btn" onclick="pD(\'좌\')">좌측</button>';
  h += '<button class="modal-btn" onclick="pD(\'앞\')">앞</button>';
  h += '<button class="modal-btn" onclick="pD(\'정위치\')">정위치</button>';
  h += '<button class="modal-btn" onclick="pD(\'뒤\')">뒤</button>';
  h += '<button class="modal-btn" onclick="pD(\'우\')">우측</button>';
  h += '</div>';
  openModal(h);
}
function pD(d) {
  abD = d;
  doAddAB();
}

/* 삼진 종류 */
function showStepSO() {
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">삼진 종류</div>';
  h += '<div class="modal-grid">';
  h += '<button class="modal-btn" onclick="pSO(\'헛스윙\')">헛스윙</button>';
  h += '<button class="modal-btn" onclick="pSO(\'루킹\')">루킹</button></div>';
  openModal(h);
}
function pSO(t) {
  abSO = t;
  doAddAB();
}

/* 타석 저장 */
function doAddAB() {
  var id = addAB(abGid, abR, abF, abD, abSO);
  if (abR === 'HR' && id) {
    var a = findAB(abGid, id);
    if (a) {
      a.rbi = abRbi;
      a.run = true;
      a.dir = abD;
      save();
    }
  }
  abRbi = 0; abRun = 0;
  closeModal();
  renderAll();
}

/* ===== 타석 상세 ===== */
var dtGid = null, dtAid = null, dtRbi = 0, dtRun = false, dtSB = 0;

function openDetail(gid, aid) {
  dtGid = gid; dtAid = aid;
  var a = findAB(gid, aid);
  if (!a) return;
  dtRbi = a.rbi || 0;
  dtRun = !!a.run;
  dtSB = a.sb || 0;

  var isHR = (a.result === 'HR');
  var sub = '';
  if (a.fielder) sub += (FN[a.fielder] || a.fielder);
  if (a.dir) sub += (sub ? ' · ' : '') + a.dir;
  if (a.soType) sub = a.soType;
  if (isHR) sub = dtRbi + '점 홈런' + (a.dir ? ' · ' + a.dir : '');

  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div style="text-align:center;padding:8px 0 14px">';
  h += '<div style="font-size:20px;font-weight:700">' + (RN[a.result] || a.result) + '</div>';
  h += '<div style="font-size:13px;color:#888;margin-top:3px">' + sub + '</div></div>';

  if (isHR) {
    h += '<div class="detail-row"><label>타점</label><div class="detail-btns">';
    for (var n = 1; n <= 4; n++) {
      h += '<button class="det-btn' + (n === dtRbi ? ' on' : '') + '" onclick="setRbi(' + n + ')">' + n + '</button>';
    }
    h += '</div></div>';
  } else {
    h += '<div class="detail-row"><label>타점</label><div class="detail-btns">';
    for (var n = 0; n <= 3; n++) {
      h += '<button class="det-btn' + (n === dtRbi ? ' on' : '') + '" onclick="setRbi(' + n + ')">' + n + '</button>';
    }
    h += '</div></div>';
    h += '<div class="detail-row"><label>득점</label><div class="detail-btns">';
    h += '<button class="det-btn' + (!dtRun ? ' on' : '') + '" onclick="setRun(false)">✕</button>';
    h += '<button class="det-btn' + (dtRun ? ' on' : '') + '" onclick="setRun(true)">○</button>';
    h += '</div></div>';
    h += '<div class="detail-row"><label>도루</label><div class="detail-btns">';
    for (var n = 0; n <= 3; n++) {
      h += '<button class="det-btn' + (n === dtSB ? ' on' : '') + '" onclick="setSB(' + n + ')">' + n + '</button>';
    }
    h += '</div></div>';
  }

  h += '<textarea class="modal-textarea" id="dtMemo" placeholder="이 타석 메모" style="height:60px;margin-top:10px">' + (a.memo || '') + '</textarea>';
  h += '<div style="display:flex;gap:8px;margin-top:12px">';
  h += '<button class="modal-primary" style="flex:1" onclick="svDt()">저장</button>';
  h += '<button class="modal-del" onclick="dlAB()">삭제</button></div>';
  openModal(h);
}

function setRbi(n) {
  dtRbi = n;
  var rows = document.querySelectorAll('.detail-btns');
  if (rows[0]) {
    rows[0].querySelectorAll('.det-btn').forEach(function(b, i) {
      var isHR = (findAB(dtGid, dtAid).result === 'HR');
      var val = isHR ? i + 1 : i;
      b.classList.toggle('on', val === n);
    });
  }
}

function setRun(v) {
  dtRun = v;
  var rows = document.querySelectorAll('.detail-btns');
  if (rows[1]) {
    var btns = rows[1].querySelectorAll('.det-btn');
    if (btns[0]) btns[0].classList.toggle('on', !v);
    if (btns[1]) btns[1].classList.toggle('on', v);
  }
}

function setSB(n) {
  dtSB = n;
  var rows = document.querySelectorAll('.detail-btns');
  if (rows[2]) {
    rows[2].querySelectorAll('.det-btn').forEach(function(b, i) {
      b.classList.toggle('on', i === n);
    });
  }
}

function svDt() {
  var memo = document.getElementById('dtMemo').value;
  var a = findAB(dtGid, dtAid);
  var data = { rbi: dtRbi, run: dtRun, sb: dtSB, memo: memo };
  if (a && a.result === 'HR') data.run = true;
  updateAB(dtGid, dtAid, data);
  closeModal();
  renderAll();
}

function dlAB() {
  if (!confirm('이 타석을 삭제할까요?')) return;
  removeAB(dtGid, dtAid);
  closeModal();
  renderAll();
}

/* ===== 경기 메모 ===== */
var meGid = null;

function openMemo(gid) {
  meGid = gid;
  var g = findGame(gid);
  if (!g) return;
  var h = '<button class="modal-close" onclick="closeModal()">✕</button>';
  h += '<div class="modal-title">경기 총평</div>';
  h += '<textarea class="modal-textarea" id="meText" placeholder="오늘 경기 총평, 컨디션, 느낀점...">' + (g.memo || '') + '</textarea>';
  h += '<button class="modal-primary" onclick="doSvMemo()">저장</button>';
  openModal(h);
}

function doSvMemo() {
  saveMemo(meGid, document.getElementById('meText').value);
  closeModal();
  renderAll();
}
