// programs/407-chop-wood-and-hunt.js
console.log('=== Step: Chop wood, craft sticks/pickaxe, and hunt animals ===');
console.log('Current outside pos:', lib.fmt(bot.entity.position));

// 1. Find and chop logs nearby (within 25m)
const logBlocks = bot.findBlocks({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 25,
  count: 4
});
console.log(`Found ${logBlocks.length} log blocks.`);
for (const lp of logBlocks) {
  if (isCancelled() || lib.count('birch_log') + lib.count('oak_log') >= 4) break;
  try {
    console.log(`Navigating to log at ${lib.fmt(lp)}...`);
    await lib.goTo(lp.x, lp.y, lp.z, 2);
    await lib.dig(lp.x, lp.y, lp.z);
    console.log(`Mined log at ${lib.fmt(lp)}!`);
  } catch (e) {
    console.log('Log mine error:', e.message);
  }
}

// 2. Craft planks and sticks in inventory (2x2 grid)
let logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  const pr = bot.recipesFor(mcData.itemsByName[plankName]?.id || mcData.itemsByName.oak_planks.id, null, 1, null)[0];
  if (pr) {
    await bot.craft(pr, 2, null);
    console.log(`Crafted ${plankName}! Total: ${lib.count(plankName)}`);
  }
  const sr = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, null)[0];
  if (sr) {
    await bot.craft(sr, 2, null);
    console.log(`Crafted sticks! Total: ${lib.count('stick')}`);
  }
}

// 3. Hunt animals North of base (z between -50 and -100)
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 40
);
console.log(`Found ${animals.length} animals within 40m`);

let hunted = 0;
for (const a of animals) {
  if (isCancelled() || hunted >= 4) break;
  try {
    console.log(`Hunting ${a.name} at ${lib.fmt(a.position)}...`);
    const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
    if (sword) await bot.equip(sword, 'hand');
    await lib.goTo(a.position.x, a.position.y, a.position.z, 2);
    await bot.attack(a);
    await sleep(400);
    hunted++;
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// Collect meat drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
  } catch (e) {}
}

const meatCount = lib.count('beef') + lib.count('mutton') + lib.count('porkchop') + lib.count('chicken');
console.log(`Stage finished. Logs=${lib.count('birch_log')+lib.count('oak_log')}, Sticks=${lib.count('stick')}, Raw Meat=${meatCount}, Pos=${lib.fmt(bot.entity.position)}`);
bot.chat(`beta: Gathering outdoors: logs=${lib.count('birch_log')+lib.count('oak_log')}, sticks=${lib.count('stick')}, meat=${meatCount}, pos=${lib.fmt(bot.entity.position)}.`);
