/* 景品のリスト gold or normal*/
const prizeList = [
  { rank: 1,  name: '車',        type: 'gold' },
  { rank: 2,  name: '家',            type: 'gold' },
  { rank: 3,  name: '別荘',        type: 'gold' },
  { rank: 4,  name: '舟',      type: 'gold' },
  { rank: 5,  name: '馬',       type: 'gold' },
  { rank: 6,  name: 'アマギフ',type: 'gold' },
  { rank: 7,  name: 'ああああああああああ',          type: 'gold' },
  { rank: 8,  name: '高級お菓子',        type: 'gold' },
  { rank: 9,  name: 'カタログギフト',    type: 'gold' },
  { rank: 10, name: 'ブランドタオル',   type: 'gold' },

  { rank: 11, name: 'サラダ油セット',   type: 'normal' },
  { rank: 12, name: '洗剤詰め合わせ',   type: 'normal' },
  { rank: 13, name: 'ラーメンセット',   type: 'normal' },
  { rank: 14, name: 'お菓子詰め合わせ', type: 'normal' },
  { rank: 15, name: '日用品セット',     type: 'normal' },
];

const MAX_NUMBER = 75; // ビンゴ最大値
let drawnNumbers = [];
let isDrawing = false;

/**
 * クッキーに保存する
 */
function saveCookie(){
  document.cookie = "bingo=" + JSON.stringify(drawnNumbers) + "; max-age=31536000; path=/";
}

/**
 * クッキーから読み込む
 */
function loadCookie(){
  const match = document.cookie.match(/bingo=([^;]+)/);
  if(match){
    drawnNumbers = JSON.parse(match[1]);
    redrawHistory();
  }
}

/**
 * 履歴を再描画する
 */
function redrawHistory(){
  $('#history').empty();
  drawnNumbers.forEach(n => addBall(n));
}

/**
 * 履歴にボールを追加する
 * @param {int} num 
 */
function addBall(num){
  const group = Math.floor(num / 10); // 10単位

  const $ball = $('<div>')
    .addClass('ball')
    .addClass(`group-${group}`)
    .text(num);

  $('#history').append($ball);
}

$('#drawBtn').on('click', function(){
  lotteryStart();// 抽選を実行する
});

/**
 * 抽選を実行する
 * @returns void
 */
function lotteryStart(){
  if(isDrawing) return; // 抽選中は無効
  if(drawnNumbers.length >= MAX_NUMBER) return;

  playConfirmSound(); // 効果音を鳴らす

  isDrawing = true;
  $('#drawBtn').prop('disabled', true);

  let count = 0;
  const interval = setInterval(() => {
  const r = Math.floor(Math.random()*MAX_NUMBER)+1;
  $('#mainNumber').text(r);
  count++;

  if(count >= 10){
  clearInterval(interval);

  let final;
  do{
    final = Math.floor(Math.random()*MAX_NUMBER)+1;
  }while(drawnNumbers.includes(final));
    $('#mainNumber').text(final);
    drawnNumbers.push(final);
    addBall(final);
    saveData();


    // 確定後0.5秒はボタン無効
    setTimeout(() => {
      isDrawing = false;
      $('#drawBtn').prop('disabled', false);
      }, 200);
    }
  }, 100); // 10回で1秒  

}

/**
 * 効果音を鳴らす
 * @returns void
 */
function playConfirmSound(){
  if(!$('#soundcheck').prop('checked')) return; // 音OFFなら無効
  const se = document.getElementById('seConfirm');
  if(!se) return;
  se.currentTime = 0; // 連続再生対策
  const linkFileName = $("#sound-select").val();
  se.src = `./sound/${linkFileName}.mp3`;
  se.play();
}

$('#resetBtn').on('click', function(){
  if(!confirm('リセットしますか？')) return;
  drawnNumbers = [];
  saveData();
  $('#history').empty();
  $('#mainNumber').text('-');
});

/**
 * データを保存する
 * @returns void
 */
function saveData(){
  const data = JSON.stringify(drawnNumbers);

  if(location.protocol === 'file:'){
    // file:// 用
    localStorage.setItem('bingo', data);
  }else{
    // http(s):// 用
    document.cookie =
      "bingo=" + encodeURIComponent(data) +
      "; max-age=31536000; path=/";
  }
}

/**
 * データを読み込む
 * @returns void
 */
function loadData(){
  let data = null;

  if(location.protocol === 'file:'){
    data = localStorage.getItem('bingo');
  }else{
    const match = document.cookie.match(/bingo=([^;]+)/);
    if(match){
      data = decodeURIComponent(match[1]);
    }
  }

  if(data){
    drawnNumbers = JSON.parse(data);
    redrawHistory();
  }
}

/**
 * 景品リストを表示する
 * @returns void
 */
function renderPrizes(){
  const left = $('#prizeLeft');
  const right = $('#prizeRight');

  left.empty();
  right.empty();

  prizeList.forEach((p, i) => {
    const $item = $(`
      <div class="prize-item ${p.type}" data-rank="${p.rank}">
        <span class="rank">${p.rank}位</span>
        <span class="name">${p.name}</span>
        <span class="done">×</span>
      </div>
    `);

    // クリックで当選済みにする
    $item.on('click', function(){
      $(this).toggleClass('claimed');
    });

    setupPrizeEvents($item);

    // 左右に交互配置
    (i % 2 === 0 ? left : right).append($item);
  });

}


let clickTimer = null;

function setupPrizeEvents($item){
  // シングルクリック（予告）
  $item.on('click', function(){
    if(clickTimer) return;

    clickTimer = setTimeout(() => {
      clickTimer = null;

      // 他の予告を解除
      $('.prize-item.preview').removeClass('preview');

      // 既に当選済みなら無効
      if($(this).hasClass('claimed')) return;

      $(this).addClass('preview');
    }, 50);

  });

  // ダブルクリック（当選確定）
  $item.on('dblclick', function(){
    if(clickTimer){
      clearTimeout(clickTimer);
      clickTimer = null;
    }

    // 予告解除
    $(this).removeClass('preview');

    // 当選済みに
    $(this).addClass('claimed');
    
  });
}


// ページ読み込み時に実行する関数
renderPrizes();
loadData();