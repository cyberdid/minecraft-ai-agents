// programs/077-quick-tools-and-nether-rush.js
console.log('--- QUICK STONE TOOLS & NETHER ADVANCE ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Craft wooden pickaxe
if (!lib.count('wooden_pickaxe') && !lib.count('stone_pickaxe')) {
  console.log('Crafting wooden_pickaxe...');
  await lib.craft('wooden_pickaxe', 1);
}

// 2. Step outside to mine 8 stone for cobblestone
console.log('Stepping outside door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);

console.log('Mining 8 stone...');
try {
  await lib.collect('stone', 8);
  console.log('Cobblestone count:', lib.count('cobblestone'));
} catch (e) {
  console.log('Stone mine note:', e.message);
}

// 3. Step back into base to craft stone sword & pickaxe
await lib.goThroughDoor(294, 72, -54);
if (lib.count('cobblestone') >= 2) {
  await lib.craft('stone_sword', 1);
}
if (lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat('gamma armed with stone tools and 100+ stone blocks! Entering Nether portal now to reinforce bridgehead at (45, 65, -131).');

// 4. Step out and enter Nether portal
await lib.goThroughDoor(294, 72, -54);
console.log('Approaching portal at (299, 73, -54)...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));

console.log('Inside portal frame! Waiting for Nether transition...');
const startTransit = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - startTransit < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (String(bot.game.dimension).includes('nether')) {
  console.log('In the Nether at:', lib.fmt(bot.entity.position));
  bot.chat(`gamma back in the Nether at ${lib.fmt(bot.entity.position)}! Advancing North to Fortress bridgehead (45, 65, -131).`);
} else {
  console.log('Transit note: dim is still', bot.game.dimension);
}
