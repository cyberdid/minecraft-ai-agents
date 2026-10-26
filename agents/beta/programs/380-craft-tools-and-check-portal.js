// programs/380-craft-tools-and-check-portal.js
console.log('=== Step: Exit base, chop 2 logs, craft stone tools, inspect portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Exit base through door
console.log('Going through base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Outside base! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Door exit note:', e.message);
  await lib.goTo(294, 72, -52, 1);
}

// 2. Find nearest log outdoors
const logs = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 32,
  count: 5
}).map(p => bot.blockAt(p)).filter(Boolean);

console.log(`Found ${logs.length} logs outdoors nearby.`);
if (logs.length > 0) {
  const targetLog = logs[0];
  console.log(`Mining log at ${lib.fmt(targetLog.position)} (${targetLog.name})...`);
  try {
    await lib.goTo(targetLog.position.x, targetLog.position.y, targetLog.position.z, 2, { timeoutMs: 15000 });
    await bot.dig(targetLog);
    await sleep(200);
    await lib.pickup(4);
    console.log('Mined log! Count:', lib.count(targetLog.name));
  } catch (err) {
    console.log('Mine log note:', err.message);
  }
}

// 3. Craft planks and sticks
const logType = ['birch_log', 'oak_log'].find(l => lib.count(l) > 0);
if (logType) {
  const plankType = logType.replace('_log', '_planks');
  try {
    await lib.craft(plankType, 1);
    console.log(`Crafted ${plankType}!`);
    await lib.craft('stick', 1);
    console.log('Crafted sticks! Count:', lib.count('stick'));
  } catch (err) {
    console.log('Craft wood note:', err.message);
  }
}

// 4. Craft stone_sword and stone_pickaxe
if (lib.count('stick') >= 1 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (err) {
    console.log('Craft sword note:', err.message);
  }
}

if (lib.count('stick') >= 2 && lib.count('cobblestone') >= 3) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (err) {
    console.log('Craft pickaxe note:', err.message);
  }
}

// 5. Inspect Nether portal at (298, 72, -54)
const pBlock1 = bot.blockAt(new Vec3(299, 73, -54));
const pBlock2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`Portal inspection: (299, 73, -54)=${pBlock1?.name}, (300, 73, -54)=${pBlock2?.name}`);

// 6. Enter base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Safely inside base!');
} catch (err) {
  console.log('Base return note:', err.message);
}

console.log('Beta final status: pos =', lib.fmt(bot.entity.position), 'inventory =', JSON.stringify(lib.inv()), 'gear =', JSON.stringify(lib.tools()));
bot.chat(`beta: Ready! Tools crafted: ${JSON.stringify(lib.tools())}. Portal verified: ${pBlock1?.name}. Standing by for team iron armor!`);
