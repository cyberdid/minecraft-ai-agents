// programs/083-enter-nether-and-mine-gold.js
console.log('--- ENTERING NETHER VIA LIB.GOTO ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Dim:', bot.game.dimension);

// 1. Move to portal using lib.goTo with dig: true
console.log('Moving to portal at (299, 73, -54)...');
await lib.goTo(299, 73, -54, 1, { dig: true });

console.log('At portal! Standing inside portal frame...');
// Step directly into the portal block
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));

console.log('Waiting for Nether transition...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not reach the Nether within 30s');
}

console.log('Arrived in the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in Nether bunker (40, 65, -7)! Mining gold for boots.');

// 2. Deposit spare wooden pickaxe into bunker chest at (39, 65, -8)
try {
  const b = bot.blockAt(new Vec3(39, 65, -8));
  if (b && b.name === 'chest') {
    await lib.deposit({ wooden_pickaxe: 1 }, 39, 65, -8);
    console.log('Deposited spare pickaxe for Beta in bunker chest!');
  }
} catch (e) {
  console.log('Chest deposit note:', e.message);
}

// 3. Scan for nether_gold_ore near bunker
console.log('Scanning for nether_gold_ore within 24m...');
const goldOres = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 24,
  count: 10
});

console.log(`Found ${goldOres.length} nether_gold_ore veins nearby!`);

// 4. Mine gold ore until we have at least 36 gold nuggets
await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');

for (const gp of goldOres) {
  if (lib.count('gold_nugget') >= 36) break;
  if (isCancelled()) break;
  console.log(`Mining nether_gold_ore at ${lib.fmt(gp)}...`);
  try {
    await lib.dig(gp.x, gp.y, gp.z);
    await sleep(300);
    await lib.pickup(5);
  } catch (e) {
    console.log(`Dig gold ore note: ${e.message}`);
  }
}

console.log(`Gold nuggets collected: ${lib.count('gold_nugget')}`);

// 5. Craft gold ingots and golden boots if enough nuggets
if (lib.count('gold_nugget') >= 36) {
  console.log('Crafting 4 gold ingots...');
  await lib.craft('gold_ingot', 4);
  console.log('Crafting golden_boots...');
  await lib.craft('golden_boots', 1);
  await lib.equipArmor();
  console.log('GOLDEN BOOTS EQUIPPED! Piglins are now 100% neutral!');
  bot.chat('gamma crafted & equipped GOLDEN BOOTS! Piglins are now neutral.');
} else {
  console.log(`Currently have ${lib.count('gold_nugget')} nuggets.`);
  bot.chat(`gamma mined ${lib.count('gold_nugget')} gold nuggets at bunker.`);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
