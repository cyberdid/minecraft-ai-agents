// programs/224-gather-wood-and-stone.js
console.log('=== GATHER WOOD AND STONE KIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Step through door to outside
console.log('Stepping through base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door note:', e.message);
  try { await lib.walkTo(294.5, -52.0, 3000); } catch (e2) {}
}

// 2. Collect 8 logs
console.log('Collecting 8 logs...');
try {
  const gotLogs = await lib.collect('*_log', 8);
  console.log('Collected logs:', JSON.stringify(gotLogs));
} catch (e) {
  console.log('Log collect error:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logType) {
  const plankName = logType.replace('_log', '_planks');
  console.log(`Crafting planks from ${logType}...`);
  await lib.craft(plankName, 16);
  await lib.craft('stick', 8);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Wooden pickaxe crafted!');
}

// 4. Collect 24 stone
console.log('Collecting 24 stone...');
try {
  const gotStone = await lib.collect('stone', 24);
  console.log('Collected stone:', JSON.stringify(gotStone));
} catch (e) {
  console.log('Stone collect error:', e.message);
}

// 5. Craft stone tools: pickaxe, sword, axe
if (lib.count('cobblestone') >= 8) {
  console.log('Crafting stone tools...');
  try {
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
    await lib.craft('stone_axe', 1);
    console.log('Stone tools crafted!');
  } catch (e) {
    console.log('Stone tools craft error:', e.message);
  }
}

// 6. Return inside base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 12000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Return door error:', e.message);
  try {
    await lib.walkTo(295.5, -55.5, 3000);
  } catch (e2) {}
}

// Ensure door is closed
try { await lib.door(294, 72, -54, false); } catch (e) {}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Time remaining until night:', lib.time().secondsUntilNight);

bot.chat(`gamma re-armed: stone tools crafted, cobblestone x${lib.count('cobblestone')}, wood x${lib.count('*_planks')}`);
