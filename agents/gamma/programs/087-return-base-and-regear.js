// programs/087-return-base-and-regear.js
console.log('--- RETURN TO BASE & RE-GEAR FOR BLAZE SPAWNER ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Climb back to surface base door (294, 72, -54)
console.log('Climbing to surface base door...');
try {
  await lib.goTo(294, 72, -54, 1, { dig: true, timeoutMs: 40000 });
} catch (e) {
  console.log('Climb note:', e.message);
  await lib.goToXZ(294, -54, { timeoutMs: 20000 });
}

console.log('At base exterior/door. Entering base...');
await lib.goThroughDoor(294, 72, -54);
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Craft wooden pickaxe using table at (295, 72, -56)
await lib.ensureTable();
if (!lib.count('wooden_pickaxe') && !lib.count('stone_pickaxe')) {
  console.log('Crafting wooden_pickaxe...');
  await lib.craft('wooden_pickaxe', 1);
}

// 3. Step out briefly to mine 12 stone for stone tools
console.log('Exiting to mine 12 stone for tools...');
await lib.goThroughDoor(294, 72, -54);
try {
  await lib.collect('stone', 12);
} catch (e) {
  console.log('Collect stone note:', e.message);
}

// 4. Return inside and craft stone tools
await lib.goThroughDoor(294, 72, -54);
if (lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_axe', 1);
}

console.log('Equipped tools:', JSON.stringify(lib.tools()));
console.log('Inventory now:', JSON.stringify(lib.inv()));

// 5. Check nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat('Gamma armed with stone sword & pickaxe at base! Ready to assault Blaze Spawner at (32, 68, -190) with team.');
