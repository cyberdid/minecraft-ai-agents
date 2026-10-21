// programs/106-place-bed-and-wait-beta.js
// 1. Place white_bed at (294, 72, -56) and set spawn
// 2. Wait for Beta to arrive at base chest (293, 72, -57) and re-arm

console.log('alpha at:', lib.fmt(bot.entity.position));

// 1. Place bed if in inventory
if (lib.count('white_bed') > 0) {
  console.log('Placing bed at (294, 72, -56)...');
  try {
    await lib.place('white_bed', 294, 72, -56);
    console.log('Bed placed!');
  } catch (e) {
    console.log('Bed place note:', e.message);
  }
}

// Set spawn
try {
  await lib.setSpawn();
  console.log('Spawn set at base!');
} catch (e) {
  console.log('Set spawn note:', e.message);
}

// 2. Wait for Beta to enter base
console.log('Waiting for Beta...');
let arrived = false;
const start = Date.now();
while (!isCancelled() && Date.now() - start < 45000) {
  const beta = bot.players.beta?.entity;
  if (beta && beta.position.distanceTo(bot.entity.position) < 6) {
    console.log('Beta is inside base! Pos:', lib.fmt(beta.position));
    bot.chat('alpha: Welcome back beta! Open base chest at (293, 72, -57) to grab stone pickaxes, sword, axe, iron leggings, and cobblestone.');
    arrived = true;
    break;
  }
  await sleep(3000);
}

console.log('Beta arrived:', arrived, '| Alpha inventory:', JSON.stringify(lib.inv()));
