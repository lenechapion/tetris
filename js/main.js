//スコア
let score;

// 落下サイクル(指定ミリ秒ごとに１つ下に落ちる)
const fallSpeed = 300;

// タイマーID
let timerId = NaN;

// ゲームオーバーフラグ
let isGameOver = false;

// １ブロックのサイズ
const blockSize = 30;

// ゲームボードの大きさ（ブロック何個分か）
const boardRow = 20;
const boardCol = 10;

// キャンバス準備
const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");

// キャンバスサイズ設定
const canvasW = blockSize * boardCol;
const canvasH = blockSize * boardRow;

cvs.width = canvasW;
cvs.height = canvasH;

const container = document.getElementById("container");
container.style.width = canvasW + "px";

// テトリミノの設定
const tetSize = 4;

const tetTypes = [ // ７種類のミノの形と色を用意
    {},
    {
        type:
            [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
            ],
        color: "purple"
    },
    {
        type:
            [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0],
            ],
        color: "red"
    },
    {
        type:
            [
                [0, 0, 0, 0],
                [1, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
            ],
        color: "blue"
    },
    {
        type:
            [
                [0, 0, 0, 0],
                [0, 0, 1, 1],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
            ],
        color: "green"
    },
    {
        type:
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
        color: "skyblue"
    },
    {
        type:
            [
                [0, 0, 0, 0],
                [1, 1, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 0],
            ],
        color: "coral"
    },
    {
        type:
            [
                [0, 0, 0, 0],
                [0, 0, 1, 0],
                [1, 1, 1, 0],
                [0, 0, 0, 0],
            ],
        color: "orange"
    },
];
// 選択されたテトリミノ
let tet;
// 選択されたテトリミノのインデックス
let tet_idx;

// 操作中テトリミノのオフセット
let offsetX = 0;
let offsetY = 0;

// ボード本体
const board = [];

function draw() {
    // 背景描画
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // ボードに存在しているブロックを塗る
    for (let y = 0; y < boardRow; y++) {
        for (let x = 0; x < boardCol; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }

    // テトリミノ描画
    for (let y = 0; y < tetSize; y++) {
        for (let x = 0; x < tetSize; x++) {
            if (tet[y][x]) {
                drawBlock(offsetX + x, offsetY + y);
            }
        }
    }
    //スコア描画
    drawScore();

    // ゲームオーバー時に「GAME OVER」の文字を表示
    if (isGameOver) {
        const s = "GAME OVER";
        ctx.font = "40px 'MS ゴシック'"; // 文字の大きさ、フォント設定
        const w = ctx.measureText(s).width; // 表示される文字の幅を調べて設定
        const x = canvasW / 2 - w / 2; // 描画するx座標
        const y = canvasH / 2 - 20; // 描画するy座標
        ctx.fillStyle = "white"; // 文字色
        ctx.fillText(s, x, y);
    }
}

// ブロック一つ描画
function drawBlock(x, y, idx = tet_idx) {
    let px = x * blockSize;
    let py = y * blockSize;

    ctx.fillStyle = tetTypes[idx].color;
    ctx.fillRect(px, py, blockSize, blockSize);

    ctx.strokeStyle = "black";
    ctx.strokeRect(px, py, blockSize, blockSize);
}

function drawScore() {
    const s = "SCORE:" + score;
    ctx.font = "29px 'MS ゴシック'";
    const w = ctx.measureText(s).width;
    const x = 9;
    const y = 34;
    ctx.fillStyle = "white";
    ctx.fillText(s, x, y);
}

// 操作方向に移動出来るか確認
function canMove(dx, dy, nowTet = tet) {
    for (let y = 0; y < tetSize; y++) {
        for (let x = 0; x < tetSize; x++) {
            if (nowTet[y][x]) {
                let nx = offsetX + x + dx;
                let ny = offsetY + y + dy;
                if (ny < 0 || nx < 0 || ny >= boardRow || nx >= boardCol || board[ny][nx]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 回転処理
function createRotateTet() {
    // 新規ミノ用の配列用意
    let newTet = [];
    for (let y = 0; y < tetSize; y++) {
        newTet[y] = [];
        for (let x = 0; x < tetSize; x++) {
            // 時計周りに90度回転させる
            newTet[y][x] = tet[tetSize - 1 - x][y];
        }
    }
    return newTet;
}
// 移動操作
document.addEventListener("keydown", (e) => {
    if (isGameOver) return;
    switch (e.key) {
        case "ArrowLeft":
        case "a":
            if (canMove(-1, 0)) offsetX--;
            break
        case "ArrowRight":
        case "d":
            if (canMove(1, 0)) offsetX++;
            break
        case "ArrowUp":
        case "w":
            if (canMove(0, -1)) offsetY--;
            break
        case "ArrowDown":
        case "s":
            if (canMove(0, 1)) offsetY++;
            break
        case " ":// Spaceキーは半角空白
            newTet = createRotateTet();
            if (canMove(0, 0, newTet)) tet = newTet;
            break;
    }
    draw();

});

//ゲームオーバー時にEnterを押すと最初から開始
document.addEventListener("keydown", (e) => {
    if (isGameOver) {
        switch (e.key) {
            case "Enter":
                init();
                break;
        }
    }
});

// テトリミノの配列 をボード座標に書き写す
function fixTet() {
    for (let y = 0; y < tetSize; y++) {
        for (let x = 0; x < tetSize; x++) {
            if (tet[y][x]) {
                // ボードに書き込む
                board[offsetY + y][offsetX + x] = tet_idx;
            }
        }
    }
}

// 揃ったラインを消す
function clearLine() {
    // ボードの一番上の行から順番にチェック
    for (let y = 0; y < boardRow; y++) {
        // １列揃ってると仮定して、trueにしておく。
        let isLineOK = true;
        // 列に０が入ってるかチェック
        for (let x = 0; x < boardCol; x++) {
            if (board[y][x] == 0) {
                // 揃っていないのでfalseにしてbreakする
                isLineOK = false;
                break;
            }
        }

        // １列揃っていたら（falseになってなかったら）
        if (isLineOK) {
            // 揃っている行から上に向かってfor文を回す
            for (let ny = y; ny > 0; ny--) {
                for (let nx = 0; nx < boardCol; nx++) {
                    // 1列上の情報をコピーする
                    board[ny][nx] = board[ny - 1][nx];
                }
            }
            score += 1000;
        }
    }
}

// 自動落下
function dropTet() {
    if (isGameOver) return;
    // 下に移動できるなら
    if (canMove(0, 1)) {
        offsetY++;
    } else {
        // 落下出来なければ固定
        fixTet();
        // 揃ったラインがあったら消す
        clearLine();
        // 次のミノをランダムに用意
        tet_idx = randomIdx();
        tet = tetTypes[tet_idx].type;
        // offsetを初期位置に戻す
        initStartPos();

        // 次のtetを出せなかったらフラグをtrueにする
        if (!(canMove(0, 0))) {
            isGameOver = true;
            clearInterval(timerId);
        }
    }
    draw();
}
// テトリミノの初期出現位置を設定（ボード中央の一番上）
function initStartPos() {
    offsetX = boardCol / 2 - tetSize / 2;
    offsetY = 0;
}


// ランダムな整数を１つ決める（テトリミノが７種類なので、1～7で出す）
function randomIdx() {
    idx = Math.floor(Math.random() * (tetTypes.length - 1)) + 1;
    return idx;
}

// 初期化処理
function init() {
    //スコアを０にする
    score = 0;

    //フラグをfalseにする
    isGameOver = false;

    // ボードを０で埋める
    for (let y = 0; y < boardRow; y++) {
        board[y] = [];
        for (let x = 0; x < boardCol; x++) {
            board[y][x] = 0;
        }
    }
    // 最初のミノをランダムに用意
    tet_idx = randomIdx();
    tet = tetTypes[tet_idx].type;

    // ミノの出現位置設定
    initStartPos();

    // 自動落下開始
    timerId = setInterval(dropTet, fallSpeed);

    draw();
}