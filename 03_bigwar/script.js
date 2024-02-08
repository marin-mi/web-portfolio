let playerHp = 100;
let enemyHp = 50;

const playerHpElement = document.getElementById('playerHp');
const enemyHpElement = document.getElementById('enemyHp');
const attackButton = document.getElementById('attackButton');

attackButton.addEventListener('click', () => {
    // 豚の攻撃
    enemyHp -= 20;
    enemyHpElement.textContent = `HP: ${enemyHp}`;
    if (enemyHp <= 0) {
        alert('敵を倒した！');
        attackButton.disabled = true; // ゲーム終了
        return;
    }

    // 敵の反撃
    playerHp -= 5;
    playerHpElement.textContent = `HP: ${playerHp}`;
    if (playerHp <= 0) {
        alert('あなたは敗れた...');
        attackButton.disabled = true; // ゲーム終了
    }
});
