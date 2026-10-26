// programs/112-open-door-and-gear.js
console.log('--- OPEN DOOR & GATHER GEAR OUTSIDE ---');
console.log('Starting pos:', lib.fmt(bot.entity.position));

// 1. Open the door at (294, 72, -54)
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
console.log(`Door block at (294, 72, -54): ${door?.name}`);
if (door && door.name.includes('door')) {
  console.log('Activating door to open it...');
  try {
    await bot.activateBlock(door);
    console.log('Door activated (opened)!');
  } catch (e) {
    console.log('Door note:', e.message);
  }
}

// 2. Step outside to (294, 72, -51)
console.log('Walking outside through doorway...');
try {
  await lib.goTo(294, 72, -51, 1, { timeoutMs: 15000 });
} catch (e) {
  // If goTo balks, use direct movement keys
  await bot.lookAt(new Vec3(294, 72, -51));
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Collect 6 logs
console.log('Collecting 6 logs outside...');
const logs = await lib.collect('*_log', 6);
const logType = Object.keys(logs)[0] || 'birch_log';
console.log('Logs collected:', JSON.stringify(logs));

// 4. Craft planks, sticks, wooden pickaxe
await lib.craft(logType.replace('_log', '_planks'), 16);
await lib.craft('stick', 8);
await lib.craft('wooden_pickaxe', 1);

// 5. Mine 20 stone for cobblestone
console.log('Mining 20 stone...');
await lib.collect('stone', 20);

// 6. Craft stone tools
console.log('Crafting stone tools...');
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
await lib.craft('stone_axe', 1);
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Equipped tools:', JSON.stringify(lib.tools()));
console.log('Cobblestone count:', lib.count('cobblestone'));
bot.chat(`gamma armed with stone tools and ${lib.count('cobblestone')} cobble! Heading into Nether portal for Blaze Spawner.`);

// 7. Approach and enter Nether portal at (299, 73, -54)
console.log('Approaching Nether portal...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 15000 });
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {}

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (String(bot.game.dimension).includes('nether')) {
  console.log('IN THE NETHER AT:', lib.fmt(bot.entity.position));
  bot.chat(`gamma in the Nether with cobblestone! Advancing along safe East Ridge to Fortress Workshop.`);
} else {
  console.log('Transit note: Still in', bot.game.dimension, 'at', lib.fmt(bot.entity.position));
}
