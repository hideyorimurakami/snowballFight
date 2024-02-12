
let Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

// エンジンの作成
let engine = Engine.create(),
    world = engine.world;

// レンダラーの作成
let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 400,
        background: '#eeeeee',
        wireframes: false
    }
});

$(document).ready(function () {
    // スタートボタンをクリックしたときのイベントハンドラー
    $('#start-button').click(function () {
        // ゲーム開始の処理をここに書く
        startGame();

        // ボタンを非表示にする（ゲームが開始されたらもう不要なため）
        $(this).hide();
    });
});

// ゲームを開始する関数
function startGame() {


    // プレイヤーオブジェクトの作成
    let player = Bodies.rectangle(100, 310, 50, 50, {
        isStatic: true,
        render: {
            sprite: {
                texture: 'player.png',  // ここにプレイヤーのPNG画像のパスを指定
                xScale: 0.5,
                yScale: 0.5
            }
        }
    });
    let player2 = Bodies.rectangle(700, 310, 50, 50, {
        isStatic: true,
        render: {
            sprite: {
                texture: 'player.png',  // ここにプレイヤーのPNG画像のパスを指定
                xScale: 0.5,
                yScale: 0.5
            }
        }
    });

    // 障害物の作成
    let obstacles = [
        Bodies.rectangle(250, 300, 50, 150, { isStatic: true, render: { fillStyle: '#ffffff' } }),
        Bodies.rectangle(400, 270, 50, 200, { isStatic: true, render: { fillStyle: '#ffffff' } }),
        Bodies.rectangle(550, 300, 50, 150, { isStatic: true, render: { fillStyle: '#ffffff' } })
    ];

    // 地面の作成
    let ground = Bodies.rectangle(400, 400, 810, 60, { isStatic: true });

    // 壁の作成
    let walls = [
        Bodies.rectangle(0, 0, 20, 1000, { isStatic: true }),
        Bodies.rectangle(800, 0, 20, 1000, { isStatic: true }),
        Bodies.rectangle(400, -100, 810, 60, { isStatic: true })
    ];

    // 雪玉1を作成し、ワールドに追加する関数
    function createSnowballForPlayer1() {
        let snowball1 = Bodies.circle(player.position.x - 20, player.position.y - 60, 20, {
            isStatic: true,
            restitution: 0.8,
            render: {
                fillStyle: '#ffffff'
            },
            collisionFilter: {
                category: 0x0002, // 雪玉1のカテゴリを設定
                mask: 0x0001 // プレイヤーとは衝突しない
            }
        });

        World.add(world, snowball1);
        return snowball1;
    }



    // 雪玉2を作成し、ワールドに追加する関数
    function createSnowballForPlayer2() {
        let snowball2 = Bodies.circle(player2.position.x + 20, player2.position.y - 60, 20, {
            isStatic: true,
            restitution: 0.8,
            render: {
                fillStyle: '#ffffff'
            },
        });
        World.add(world, snowball2);
        return snowball2;
    }



    // ワールドにオブジェクトを追加
    World.add(world, [player, player2, ...obstacles, ground, ...walls]);

    // レンダリングとエンジンの実行
    Render.run(render);
    Engine.run(engine);

    // 雪玉1の作成
    let snowball1 = createSnowballForPlayer1();
    // 雪玉2の作成
    let snowball2 = createSnowballForPlayer2();

    let gameRunning = true;

    // ゲームのメインループ
    function gameLoop() {
        if (gameRunning) {
            Engine.update(engine);
            requestAnimationFrame(gameLoop);
        }
    }

    // ゲーム開始時にメインループを呼び出す
    requestAnimationFrame(gameLoop);


    // プレイヤー2の雪玉を投げる処理
    function autoThrowSnowball(snowball) {
        // 雪玉が静的（停止）状態であれば投げる
        if (snowball.isStatic) {
            // 静的状態を解除
            Matter.Body.setStatic(snowball, false);

            // 力の方向をランダムに生成
            let force = {
                x: -0.05 * (0.5 + Math.random()), // 左方向にランダムな力
                y: -0.05 * (0.5 + Math.random())  // 上方向にランダムな力
            };

            // 雪玉に力を加えて投げる
            Matter.Body.applyForce(snowball, snowball.position, force);
        }
    }

    // プレイヤー2の雪玉を投げるためのタイマーID
    let player2TimerId;

    // プレイヤー2の雪玉の自動投げを開始
    player2TimerId = setInterval(function () {
        autoThrowSnowball(snowball2);
    }, 4000); // 4秒ごとに実行


    // ライフを保持する変数（初期化）
    let life1 = 3;
    let life2 = 3;

    // ライフをデクリメントして表示をアップデートする関数
    function decreaseLife1() {
        life1--; // ライフを1減らす
        updateLifeDisplay1(); // ライフ表示をアップデートする
        checkGameOver();
    }

    // ライフ表示を更新する関数
    function updateLifeDisplay1() {
        // スコア表示要素のテキストコンテンツを更新
        document.getElementById('life1').textContent = '❤️'.repeat(life1);
    }

    // ライフをデクリメントして表示をアップデートする関数
    function decreaseLife2() {
        life2--; // ライフを1減らす
        updateLifeDisplay2(); // ライフ表示をアップデートする
        checkGameOver();
    }

    // ライフ表示を更新する関数
    function updateLifeDisplay2() {
        // スコア表示要素のテキストコンテンツを更新
        document.getElementById('life2').textContent = '❤️'.repeat(life2);
    }


    // 衝突イベントのリスナーを追加
    Events.on(engine, 'collisionStart', function (event) {
        let pairs = event.pairs;



        // 衝突ペアをループして、雪玉が含まれているか確認
        for (let i = 0, j = pairs.length; i != j; ++i) {
            let pair = pairs[i];

            //  プレイヤー2に雪玉1が当たったか確認
            if ((pair.bodyA === snowball1 && pair.bodyB === player2) ||
                (pair.bodyA === player2 && pair.bodyB === snowball1)) {
                // ライフを減らす
                decreaseLife1();
            }

            // プレイヤー1に雪玉2が当たったか確認
            if ((pair.bodyA === snowball2 && pair.bodyB === player) ||
                (pair.bodyA === player && pair.bodyB === snowball2)) {
                // ライフを減らす
                decreaseLife2();
            }

            // ペアのどちらかがプレイヤー1の雪玉であれば
            if (pair.bodyA === snowball1 || pair.bodyB === snowball1) {
                // 雪玉をワールドから削除
                World.remove(world, snowball1);

                // 新しい雪玉を生成
                snowball1 = createSnowballForPlayer1();
                break; // ループを抜ける
            }
            // ペアのどちらかがプレイヤー2の雪玉であれば
            else if (pair.bodyA === snowball2 || pair.bodyB === snowball2) {
                // 雪玉をワールドから削除
                World.remove(world, snowball2);

                // 新しい雪玉を生成
                snowball2 = createSnowballForPlayer2();
                break; // ループを抜ける
            }
        }
    });



    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

    // マウスイベントで特定のボディだけを選択
    Events.on(mouseConstraint, 'mousedown', function (event) {
        let mousePosition = mouseConstraint.mouse.position;
        let bodiesUnderMouse = Matter.Query.point(world.bodies, mousePosition);

        // 雪玉1がマウスの位置にあるかチェック
        let isSnowball1UnderMouse = bodiesUnderMouse.some(body => body === snowball1);

        // 雪玉1でなければ、掴むボディをnullに設定して操作を無効にする
        if (!isSnowball1UnderMouse) {
            mouseConstraint.body = null;
        } else {
            // 掴んだ雪玉が静的なら動的に切り替える
            Matter.Body.setStatic(snowball1, false);
        }
    });

    // ワールドにマウス制約を追加
    World.add(world, mouseConstraint);

    // マウスの可視化（オプション）
    render.mouse = mouse;

    // ゲームが終了したかどうかをチェックし、結果を表示する関数
    function checkGameOver() {
        if (life2 === 0) {
            document.getElementById('result').textContent = 'YOU LOSE';
            // ゲームの終了処理をここに追加
            gameRunning = false; // ゲームループを停止
            // その他の終了処理
            finalizeGame();
        } else if (life1 === 0) {
            document.getElementById('result').textContent = 'YOU WIN!!';
            // ゲームの終了処理をここに追加
            gameRunning = false; // ゲームループを停止
            // その他の終了処理
            finalizeGame();
        }
    }

    // ゲームの最終処理を行う関数
    function finalizeGame() {
        // プレイヤー2の自動操作を停止
        clearInterval(player2TimerId);

        // マウスイベントを削除して操作を無効にする
        World.remove(world, mouseConstraint);

    }
}
