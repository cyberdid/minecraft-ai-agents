// programs/385-mine-quarry-stairs.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// 1. Step down into the quarry shaft
console.log('Stepping down into quarry shaft...');
try {
  await lib.goTo(301, 68, -45, 1, { dig: false, timeoutMs: 6000 });
} catch (e) {
  // If goTo balks, step directly
  await bot.lookAt(new Vec3(301.5, 68.0, -45.5), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

console.log('New pos:', lib.fmt(bot.entity.position));

// 2. Find stone blocks within 4m reach
const stoneId = mcData.blocksByName.stone.id;
let mined = 0;
for (let attempt = 0; attempt < 10; attempt++) {
  if (lib.count('cobblestone') >= 6) break;
  const stoneBlocks = bot.findBlocks({
    matching: stoneId,
    maxDistance: 4,
    count: 5
  });
  
  if (stoneBlocks.length === 0) {
    console.log('No stone in 4m reach, stepping slightly deeper...');
    bot.setControlState('forward', true);
    await sleep(500);
    bot.setControlState('forward', false);
    continue;
  }
  
  for (const p of stoneBlocks) {
    if (lib.count('cobblestone') >= 6) break;
    const b = bot.blockAt(p);
    if (b && bot.canDigBlock(b)) {
      console.log(`Digging ${b.name} at ${lib.fmt(p)}...`);
      await bot.dig(b);
      mined++;
    }
  }
  await lib.pickup(3);
}

console.log(`Mined stone. Cobble count: ${lib.count('cobblestone')}`);

// 3. Ascend back to surface base at (293, 72, -56)
console.log('Ascending back to surface base...');
try {
  await lib.goTo(294, 72, -56, 1.5, { dig: true, timeoutMs: 12000 });
} catch (e) {
  console.log('Ascent note:', e.message);
}

// 4. Craft planks & sticks
const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (log) {
  try { await lib.craft(log.name.replace('_log', '_planks'), 4); } catch (e) {}
}
if (lib.count('stick') < 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

// 5. Craft stone sword
if (lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('SUCCESS: Stone sword crafted!');
  } catch (e) {
    console.log(`Craft stone_sword note: ${e.message}`);
  }
}

try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

console.log('Final inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
