// programs/272-craft-weapons-in-overworld.js
console.log('=== CRAFT WEAPONS & RESUPPLY BEFORE NETHER COMBAT ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Walk to accessible birch tree at (270, 72..74, -52)
console.log('Walking to tree at (272, 72, -52)...');
try {
  await lib.goTo(272, 72, -52, 2, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(272, -52, { timeoutMs: 8000 }); } catch (e2) {}
}

// 2. Chop 3 trunk logs from ground level
for (const y of [72, 73, 74]) {
  const b = bot.blockAt(new Vec3(270, y, -52));
  if (b && b.name.includes('log')) {
    console.log(`Chop log at (270, ${y}, -52)...`);
    try { await lib.dig(270, y, -52); } catch (e) {}
  }
}
await sleep(300);
await lib.pickup(6);
console.log('Logs collected:', lib.count('*_log'));

// 3. Craft planks, sticks, wooden pickaxe
const logKey = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logKey) {
  const plankName = logKey.replace('_log', '_planks');
  await lib.craft(plankName, 12);
  await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe ready! Inv:', JSON.stringify(lib.inv()));
}

// 4. Walk to hillside stone outcrop at (297, 68, -58)
console.log('Walking to stone outcrop at (297, 68, -58)...');
try {
  await lib.goTo(297, 68, -58, 2, { timeoutMs: 12000 });
} catch (e) {
  try { await lib.goToXZ(297, -58, { timeoutMs: 6000 }); } catch (e2) {}
}

// Mine 10 stone
const stoneP = [
  new Vec3(297, 68, -58), new Vec3(296, 67, -58), new Vec3(298, 68, -57),
  new Vec3(297, 67, -51), new Vec3(298, 67, -55), new Vec3(296, 68, -57),
  new Vec3(297, 68, -56), new Vec3(298, 68, -58), new Vec3(299, 68, -57)
];
for (const p of stoneP) {
  if (lib.count('cobblestone') >= 8) break;
  const b = bot.blockAt(p);
  if (b && b.name === 'stone') {
    try { await lib.dig(p.x, p.y, p.z); } catch (e) {}
  }
}
await sleep(300);
await lib.pickup(6);
console.log('Cobblestone mined:', lib.count('cobblestone'));

// 5. Enter base house to craft stone tools at table (295, 72, -56)
console.log('Entering base house...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 8000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.walkTo(295.5, -55.5, 3000); } catch (e2) {}
}

// Check furnace for iron ingot
for (const fp of [new Vec3(295, 72, -55), new Vec3(295, 72, -54)]) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      if (f.outputItem()) await f.takeOutput();
      f.close();
    } catch (e) {}
  }
}

// Craft stone tools
if (lib.count('cobblestone') >= 5) {
  if (lib.count('stick') < 4) await lib.craft('stick', 4);
  try {
    if (lib.count('stone_pickaxe') === 0) await lib.craft('stone_pickaxe', 1);
    if (lib.count('stone_sword') === 0) await lib.craft('stone_sword', 1);
  } catch (e) {}
}

// Craft shield if iron ingot available
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try { await lib.craft('shield', 1); } catch (e) {}
}

// Equip weapon and shield
try { await lib.equipWeapon(); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}

console.log('=== GEAR SUMMARY ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma armed for combat: ${bot.entity.equipment[0]?.name || 'pickaxe'} in hand, offhand: ${bot.entity.equipment[1]?.name || 'empty'}, cobble x${lib.count('cobblestone')}. Stepping into portal!`);
