/* ===== 데이터 ===== */
var G = JSON.parse(localStorage.getItem('baseball1') || '[]');
var curIdx = 0;
var statsOpen = false;

/* 이름 매핑 */
var RN = {
  '1B':'1루타','2B':'2루타','3B':'3루타','HR':'홈런',
  'GO':'땅볼','FO':'뜬공','LO':'직선타','SO':'삼진',
  'BB':'볼넷','HBP':'사구','SF':'희플','SH':'희번','E':'실책','PR': '대주자'
};
var FN = {
  'P':'투수','C':'포수','1B':'1루수','2B':'2루수',
  '3B':'3루수','SS':'유격수','LF':'좌익수','CF':'중견수','RF':'우익수'
};

/* 저장 (항상 날짜순 정렬) */
function save() {
  G.sort(function(a, b) { return b.date.localeCompare(a.date); });
  localStorage.setItem('baseball1', JSON.stringify(G));
}

/* 칩 색상 */
function chipClass(r) {
  if ('1B 2B 3B HR'.indexOf(r) >= 0) return 'hit';
  if ('GO FO LO SO'.indexOf(r) >= 0) return 'out';
  if ('BB HBP'.indexOf(r) >= 0) return 'walk';
  return 'etc';
}

/* 스탯 계산 */
function calcStats() {
  var h=0, ab=0, pa=0, tb=0, bb=0, hbp=0, sf=0;
  var hr=0, so=0, rbi=0, runs=0, sb=0;
  var B = {'1B':1, '2B':2, '3B':3, 'HR':4};

  for (var i = 0; i < G.length; i++) {
    for (var j = 0; j < G[i].abs.length; j++) {
      var a = G[i].abs[j];
      pa++;
      if ('1B 2B 3B HR GO FO LO SO E'.indexOf(a.result) >= 0) ab++;
      if (B[a.result]) { h++; tb += B[a.result]; }
      if (a.result === 'HR') hr++;
      if (a.result === 'BB') bb++;
      if (a.result === 'HBP') hbp++;
      if (a.result === 'SF') sf++;
      if (a.result === 'SO') so++;
      rbi += (a.rbi || 0);
      if (a.run) runs++;
      sb += (a.sb || 0);
    }
  }

  var avg = ab ? h / ab : 0;
  var obp = (ab+bb+hbp+sf) ? (h+bb+hbp) / (ab+bb+hbp+sf) : 0;
  var slg = ab ? tb / ab : 0;

  return {
    avg:avg, obp:obp, slg:slg, ops:obp+slg,
    pa:pa, ab:ab, h:h, hr:hr, bb:bb, hbp:hbp,
    so:so, rbi:rbi, runs:runs, sb:sb
  };
}

/* 경기 요약 텍스트 */
function gameLine(g) {
  var ab=0, h=0, ri=0;
  for (var j = 0; j < g.abs.length; j++) {
    var a = g.abs[j];
    if ('1B 2B 3B HR GO FO LO SO E'.indexOf(a.result) >= 0) ab++;
    if ('1B 2B 3B HR'.indexOf(a.result) >= 0) h++;
    ri += (a.rbi || 0);
  }
  return ab + '타수 ' + h + '안타' + (ri ? ' ' + ri + '타점' : '');
}

/* 칩 서브텍스트 */
function chipSub(a) {
  var p = [];
  if (a.rbi) p.push(a.rbi + '타점');
  if (a.run) p.push('득점');
  if (a.sb) p.push(a.sb + '도루');
  return p.join('·');
}

/* 숫자 포맷 */
function fmt(n) {
  return n.toFixed(3).replace(/^0/, '');
}

/* 경기 추가 */
function addGame(date, opponent) {
  G.unshift({
    id: Date.now(),
    date: date,
    opponent: opponent || '',
    abs: [],
    memo: ''
  });
  curIdx = 0;
  save();
}

/* 경기 삭제 */
function removeGame(gid) {
  G = G.filter(function(g) { return g.id !== gid; });
  save();
}

/* 타석 추가 */
function addAB(gid, result, fielder, dir, soType) {
  var g = findGame(gid);
  if (!g) return;
  g.abs.push({
    id: Date.now(),
    result: result,
    fielder: fielder || '',
    dir: dir || '',
    soType: soType || '',
    rbi: 0,
    run: false,
    sb: 0,
    memo: ''
  });
  save();
}

/* 타석 수정 */
function updateAB(gid, aid, data) {
  var a = findAB(gid, aid);
  if (!a) return;
  if (data.rbi !== undefined) a.rbi = data.rbi;
  if (data.run !== undefined) a.run = data.run;
  if (data.sb !== undefined) a.sb = data.sb;
  if (data.memo !== undefined) a.memo = data.memo;
  save();
}

/* 타석 삭제 */
function removeAB(gid, aid) {
  var g = findGame(gid);
  if (!g) return;
  g.abs = g.abs.filter(function(a) { return a.id !== aid; });
  save();
}

/* 메모 저장 */
function saveMemo(gid, text) {
  var g = findGame(gid);
  if (!g) return;
  g.memo = text;
  save();
}

/* 유틸: 경기 찾기 */
function findGame(gid) {
  for (var i = 0; i < G.length; i++) {
    if (G[i].id === gid) return G[i];
  }
  return null;
}

/* 유틸: 타석 찾기 */
function findAB(gid, aid) {
  var g = findGame(gid);
  if (!g) return null;
  for (var j = 0; j < g.abs.length; j++) {
    if (g.abs[j].id === aid) return g.abs[j];
  }
  return null;
}
