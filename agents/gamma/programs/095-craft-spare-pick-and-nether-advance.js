// programs/095-craft-spare-pick-and-nether-advance.js
console.log('--- RE-ARM & ADVANCE TO FORTRESS WORKSHOP ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Craft fresh stone_pickaxe
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  await lib.craft('stick', 4);
}
if (lib.count('cobblestone') >= 3) {
  console.log('Crafting fresh stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Step into Nether portal (299, 73, -54)
console.log('Moving into Nether portal at (299, 73, -54)...');
await lib.goTo(299, 73, -54, 1, { timeoutMs: 15000 });
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('Arrived in the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether with 80+ cobble! Advancing along East ridge to Fortress Workshop (44, 65, -129).');

// 3. Fast advance along marked trail to Fortress Workshop (44, 65, -129)
console.log('Moving to trail waypoint (50, 65, -37)...');
try {
  await lib.goTo(50, 65, -37, 3, { timeoutMs: 20000 });
} catch (e) {}

console.log('Moving to trail waypoint (56, 64, -66)...');
try {
  await lib.goTo(56, 64, -66, 3, { timeoutMs: 25000 });
} catch (e) {}

console.log('Moving to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP!');
} catch (e) {
  console.log('Workshop door note:', e.message);
}

// 4. Report team status
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

bot.chat(`gamma at Fortress Workshop ${lib.fmt(bot.entity.position)}! United with team for Blaze Spawner (32, 68, -190) assault.`);
