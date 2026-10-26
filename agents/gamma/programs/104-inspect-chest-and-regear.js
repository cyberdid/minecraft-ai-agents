// programs/104-inspect-chest-and-regear.js
console.log('--- BASE RE-GEAR & NETHER ENTRY ---');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Inspect base chest at (293, 72, -57)
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest contents:', JSON.stringify(chest));

const toWithdraw = {};
for (const [k, v] of Object.entries(chest)) {
  if (/pickaxe|sword|axe|shield|bread|beef|porkchop|cobble|plank|log/.test(k) && v > 0) {
    toWithdraw[k] = Math.min(v, 32);
  }
}

if (Object.keys(toWithdraw).length > 0) {
  console.log('Withdrawing from chest:', JSON.stringify(toWithdraw));
  await lib.withdraw(toWithdraw, 293, 72, -57);
}

// 2. Step outside base doorway to (294, 72, -51)
console.log('Stepping outside through doorway to (294, 72, -51)...');
await lib.walkTo(294, -51);
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. If we still need tools, quickly collect 4 logs and stone
if (!lib.count('*_pickaxe')) {
  console.log('Collecting 4 logs outside...');
  try {
    const logs = await lib.collect('*_log', 4);
    const logType = Object.keys(logs)[0] || 'birch_log';
    await lib.craft(logType.replace('_log', '_planks'), 12);
    await lib.craft('stick', 4);
    await lib.craft('wooden_pickaxe', 1);
    await lib.collect('stone', 8);
    await lib.craft('stone_pickaxe', 1);
    await lib.craft('stone_sword', 1);
  } catch (e) {
    console.log('Tool craft note:', e.message);
  }
}

console.log('Gear now:', JSON.stringify(lib.tools()));
console.log('Inv now:', JSON.stringify(lib.inv()));

// 4. Move along z=-51 to x=299, then north into portal at (299, 73, -54)
console.log('Walking east along z=-51 to x=299...');
await lib.walkTo(299, -51);
console.log('At (299, -51). Walking north into portal at (299, 73, -54)...');
await lib.walkTo(299, -54);

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat(`gamma arrived in the Nether at ${lib.fmt(bot.entity.position)}! Advancing along East ridge to Fortress Workshop.`);
