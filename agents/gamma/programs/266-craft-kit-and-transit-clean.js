// programs/266-craft-kit-and-transit-clean.js
console.log('=== CRAFT KIT & NETHER TRANSIT (PROVEN PROTOCOL) ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time until night:', lib.time().secondsUntilNight);

// 1. Step through base door to outside
console.log('Stepping through base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// 2. Walk directly to untouched birch tree at (272, 72, -52)
console.log('Walking to tree at (272, 72, -52)...');
await lib.goTo(272, 72, -52, 2, { timeoutMs: 15000 });

// 3. Dig 3 trunk logs from ground level
const treeCoords = [
  new Vec3(270, 72, -52),
  new Vec3(270, 73, -52),
  new Vec3(270, 74, -52)
];

for (const p of treeCoords) {
  const b = bot.blockAt(p);
  if (b && b.name.includes('log')) {
    console.log(`Mining ${b.name} at ${lib.fmt(p)}...`);
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
}
await sleep(300);
await lib.pickup(6);
console.log('Logs collected:', lib.count('*_log'));

// 4. Craft planks, sticks, wooden pickaxe
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  const plankName = logName.replace('_log', '_planks');
  console.log(`Crafting ${plankName}...`);
  await lib.craft(plankName, 12);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));
}

// 5. Mine 16 stone on hillside
console.log('Mining 16 stone with wooden pickaxe...');
try {
  await lib.collect('stone', 16, { maxBelow: 4 });
} catch (e) {
  console.log('Stone collect note:', e.message);
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 6. Enter base to craft stone tools at table (295, 72, -56)
console.log('Returning to base house crafting table...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(295.5, -55.5, 3000); } catch (e2) {}
}

if (lib.count('cobblestone') >= 5) {
  console.log('Crafting stone tools...');
  if (lib.count('stick') < 4) {
    const plankName = Object.keys(lib.inv()).find(k => k.endsWith('_planks'));
    if (plankName) await lib.craft('stick', 4);
  }
  try {
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
    await lib.equipWeapon();
    console.log('Stone tools crafted and equipped!');
  } catch (e) {
    console.log('Tool craft error:', e.message);
  }
}

console.log('=== GEAR READY ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Cobblestone:', lib.count('cobblestone'));

bot.chat(`gamma geared: ${JSON.stringify(lib.tools())}, cobble x${lib.count('cobblestone')}! Heading to Nether portal.`);

// 7. Step outside door to Nether portal at (299.5, 73.0, -53.5)
console.log('Stepping outside door to portal...');
try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}

console.log('Walking to exact center of Nether portal (299.5, 73.0, -53.5)...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });
} catch (e) {
  await lib.walkTo(299.5, -52.0, 3000);
}

bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Inside portal! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);
console.log('Standing still for dimension change...');

const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
if (String(bot.game.dimension).includes('nether')) {
  console.log('=== NETHER ARRIVAL SUCCESSFUL ===');
  await sleep(400);
  await lib.walkTo(40.5, -6.5, 2000);
  bot.clearControlStates();

  console.log('Nether bunker pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Cobblestone:', lib.count('cobblestone'));

  bot.chat(`gamma safely in Nether bunker (40, 65, -7)! Armed with stone gear & ${lib.count('cobblestone')} cobble. Ready to pave road!`);
}
