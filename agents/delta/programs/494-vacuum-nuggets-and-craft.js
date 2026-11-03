// programs/494-vacuum-nuggets-and-craft.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Find all dropped items within 24m
const items = Object.values(bot.entities).filter(e =>
  e.name === 'item' &&
  bot.entity.position.distanceTo(e.position) <= 24
);

console.log(`Found ${items.length} dropped items nearby:`, items.map(it => `${lib.fmt(it.position)} (${bot.entity.position.distanceTo(it.position).toFixed(1)}m)`).join(', '));

for (const it of items) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(it.position.x, it.position.y, it.position.z, 1.0));
    await sleep(200);
  } catch (e) {}
}

try { await lib.pickup(6.0); } catch (e) {}

const totalNuggets = lib.count('gold_nugget');
console.log(`Total gold nuggets in inventory after pickup: ${totalNuggets}`);

// 2. Craft ingots from nuggets
if (totalNuggets >= 9) {
  const ingots = Math.floor(totalNuggets / 9);
  try {
    await lib.craft('gold_ingot', ingots);
    console.log(`Crafted ${ingots} gold_ingot! Total ingots: ${lib.count('gold_ingot')}`);
    bot.chat(`delta: Crafted ${ingots} gold ingots! Total ingots: ${lib.count('gold_ingot')}.`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// 3. Craft golden_boots if 4+ ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
    bot.chat('delta: Crafted golden_boots! 100% Piglin neutrality ACTIVE!');
    const gb = bot.inventory.items().find(it => it.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

// 4. Equip best weapon & shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

// 5. Navigate safely back to Nether Base Camp bunker (41, 65, -6) to unite with Beta & Gamma
console.log('Navigating back to Nether Base Camp bunker (41, 65, -6)...');
globalThis.configureFireAvoidance();
const bunkerPos = new Vec3(41.0, 65.0, -6.0);
try {
  await bot.pathfinder.goto(new goals.GoalNear(bunkerPos.x, bunkerPos.y, bunkerPos.z, 2.0));
  console.log('Arrived at Nether Base Camp bunker! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goTo(41, 65, -6, 2.5, { timeoutMs: 12000 }); } catch (e2) {}
}

const finalIngots = lib.count('gold_ingot');
const finalBoots = lib.count('golden_boots');
const finalPearls = lib.count('ender_pearl');

bot.chat(`delta: United at Nether Bunker (41, 65, -6)! Golden Boots: ${finalBoots}, Gold Ingots: ${finalIngots}, Ender Pearls: ${finalPearls}/12.`);

return {
  pos: bot.entity.position,
  nuggets: lib.count('gold_nugget'),
  ingots: finalIngots,
  boots: finalBoots,
  pearls: finalPearls,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
