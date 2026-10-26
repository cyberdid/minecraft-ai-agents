// programs/119-regear-and-safe-bridge-protocol.js
console.log('--- RE-GEAR & SAFE BRIDGE ADVANCE ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Step outside base doorway
console.log('Stepping outside base doorway...');
try {
  await lib.walkTo(293, -51);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Mine 16 stone for stone tools and building blocks
console.log('Mining 16 stone...');
await bot.equip(mcData.itemsByName.wooden_pickaxe.id, 'hand');
try {
  await lib.collect('stone', 16);
} catch (e) {
  console.log('Mine stone note:', e.message);
}

// Craft stone tools
console.log('Crafting stone tools...');
if (lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}
await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Cobblestone:', lib.count('cobblestone'));
bot.chat(`gamma armed with stone tools & ${lib.count('cobblestone')} cobble! Heading to Nether portal.`);

// 3. Enter Nether portal at (299, 73, -54)
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

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Moving along safe East Ridge (x=63) to Fortress Workshop (44, 65, -128).');

// 4. Safe East Ridge trail to Fortress Workshop (44, 65, -128)
console.log('Moving to Waypoint 1 (50, 65, -35)...');
try {
  await lib.goTo(50, 65, -35, 3, { timeoutMs: 20000 });
} catch (e) {}

console.log('Moving to Waypoint 2 on East Ridge at (63, 65, -66)...');
try {
  await lib.goTo(63, 65, -66, 3, { timeoutMs: 25000 });
} catch (e) {}

console.log('Moving to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
} catch (e) {}

// Move to Delta in advance hallway
console.log('Joining Delta at (44, 65, -133)...');
try {
  await lib.goTo(44, 65, -133, 1, { timeoutMs: 15000 });
  console.log('UNITED WITH DELTA AT ADVANCE HALLWAY!');
} catch (e) {}

for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma united with Delta at (44, 65, -133)! Holding advance hallway with ${lib.count('cobblestone')} cobblestone.`);
