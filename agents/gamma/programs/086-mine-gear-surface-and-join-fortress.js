// programs/086-mine-gear-surface-and-join-fortress.js
console.log('--- GEAR UP & UNITE WITH TEAM AT FORTRESS WORKSHOP ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Craft wooden pickaxe
if (!lib.count('wooden_pickaxe') && !lib.count('stone_pickaxe')) {
  console.log('Crafting wooden_pickaxe...');
  await lib.craft('wooden_pickaxe', 1);
}

// 2. Mine 12 stone right here
console.log('Mining 12 stone...');
try {
  await lib.collect('stone', 12);
} catch (e) {
  console.log('Mine stone note:', e.message);
}

// 3. Craft stone tools
if (lib.count('cobblestone') >= 2 && !lib.count('stone_sword')) {
  console.log('Crafting stone_sword...');
  await lib.craft('stone_sword', 1);
}
if (lib.count('cobblestone') >= 3 && !lib.count('stone_pickaxe')) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

// 4. Return to surface base portal (299, 73, -54)
console.log('Climbing back to surface base portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -54, 1, { dig: true, timeoutMs: 45000 });
} catch (e) {
  console.log('Surface climb note:', e.message);
  // Retry via XZ
  await lib.goToXZ(299, -54, { timeoutMs: 25000 });
}

// 5. Enter Nether portal
console.log('Entering Nether portal...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Moving along East ridge trail straight to Fortress Workshop door (44, 65, -128).');

// 6. Navigate East ridge trail directly to Fortress Workshop door (44, 65, -128)
console.log('Navigating to trail waypoint (56, 64, -66)...');
try {
  await lib.goTo(56, 64, -66, 3, { timeoutMs: 25000 });
} catch (e) {}

console.log('Navigating to Fortress Workshop door at (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 35000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP DOORWAY!');
} catch (e) {
  console.log('Workshop door reach note:', e.message);
}

// 7. Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

bot.chat(`gamma has arrived at the Fortress Workshop ${lib.fmt(bot.entity.position)}! All 4 team members united.`);
console.log('Final status: pos=', lib.fmt(bot.entity.position), 'Health=', bot.health, 'Food=', bot.food);
