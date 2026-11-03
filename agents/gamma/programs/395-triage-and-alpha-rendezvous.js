// programs/395-triage-and-alpha-rendezvous.js
console.log('=== GAMMA TRIAGE & STATUS CHECK ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Check teammates
for (const name of ['alpha', 'beta', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)} dist=${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  } else if (p) {
    console.log(`Teammate ${name}: online (out of range)`);
  } else {
    console.log(`Teammate ${name}: offline`);
  }
}

// Check if Alpha is nearby and can share food
const alpha = bot.players.alpha?.entity;
if (alpha && alpha.position.distanceTo(bot.entity.position) < 10) {
  bot.chat('gamma: alpha, I am at (44, 65, -169) at 1.5 HP! Can you toss cooked food?');
} else {
  bot.chat('gamma: Holding safe position at blast wall (44, 65, -169). HP 1.5.');
}

// Craft a chest from 8 oak planks and place it on the tunnel wall to safeguard items
if (lib.count('chest') === 0 && lib.count('oak_planks') >= 8) {
  console.log('Crafting chest to safeguard gear...');
  try {
    await lib.craft('chest', 1);
    console.log('Chest crafted!');
  } catch (e) {
    console.log('Chest craft note:', e.message);
  }
}

// If chest crafted, place it at (44, 65, -168) and deposit spare swords/cobble
if (lib.count('chest') > 0) {
  try {
    const chestSpot = new Vec3(44, 65, -168);
    const b = bot.blockAt(chestSpot);
    if (b && (b.name === 'air' || b.name === 'cave_air')) {
      await lib.place('chest', chestSpot.x, chestSpot.y, chestSpot.z);
      console.log('Safeguard chest placed at (44, 65, -168)!');
      // Deposit spare gear
      await lib.deposit({
        stone_sword: 3,
        stone_pickaxe: 1,
        wooden_pickaxe: 'all',
        soul_sand: 'all'
      }, chestSpot.x, chestSpot.y, chestSpot.z);
      console.log('Deposited spare gear into safeguard chest!');
    }
  } catch (e) {
    console.log('Place chest note:', e.message);
  }
}

console.log('Ending inv:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
