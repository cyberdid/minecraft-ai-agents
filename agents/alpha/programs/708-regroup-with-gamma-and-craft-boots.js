// programs/708-regroup-with-gamma-and-craft-boots.js
console.log('=== Program 708: Regroup with Gamma & Pool Gold at Bunker ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield
bot.activateItem(true);
globalThis.configureFireAvoidance();

// 2. Return directly to bunker table at (42, 60, -6)
const tablePos = new Vec3(42, 60, -6);
console.log(`Walking to bunker Crafting Table ${lib.fmt(tablePos)}...`);
try {
  await bot.pathfinder.goto(new goals.GoalNear(tablePos.x, tablePos.y, tablePos.z, 1.2));
} catch (e) {
  try {
    await lib.goTo(tablePos.x, tablePos.y, tablePos.z, 1.5, { timeoutMs: 6000 });
  } catch (e2) {
    console.log('Path error:', e2.message);
  }
}

console.log('Alpha at bunker table:', lib.fmt(bot.entity.position));

// Vacuum any dropped items on bunker floor
await lib.pickup(5.0);

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${dist}m), held: ${p.entity.heldItem?.name}`);
  }
}

// Check Alpha's gold
const nuggets = lib.count('gold_nugget');
let ingots = lib.count('gold_ingot');
console.log(`Alpha holds: ${ingots} gold ingots, ${nuggets} gold nuggets`);

// Craft ingots if Alpha has 9+ nuggets
if (nuggets >= 9) {
  const toCraft = Math.floor(nuggets / 9);
  try {
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots!`);
  } catch (e) {}
}

ingots = lib.count('gold_ingot');

// Check if Alpha has 4+ ingots to craft golden_boots
let hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
if (ingots >= 4 && !hasBoots) {
  console.log('Alpha has 4+ ingots! Crafting golden_boots...');
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! 100% Piglin neutrality ACTIVE!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;

// If Alpha doesn't have 4 ingots but Gamma is right here with 3 ingots:
// Toss 1 ingot to Gamma so Gamma can immediately craft golden_boots!
const gamma = bot.players['gamma']?.entity;
if (gamma && bot.entity.position.distanceTo(gamma.position) <= 5.0 && ingots >= 1 && !hasBoots) {
  const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
  if (ingot) {
    console.log('Tossing 1 gold ingot to Gamma so Gamma can craft golden_boots...');
    await bot.lookAt(gamma.position.offset(0, 1.0, 0), true);
    try {
      await bot.toss(ingot.type, null, 1);
      bot.chat('alpha: Tossed 1 gold ingot to Gamma! Gamma, craft golden_boots at (42, 60, -6)!');
      await sleep(1500);
      await lib.pickup(4.0);
    } catch (err) {
      console.log('Toss error:', err.message);
    }
  }
}

const finalPearls = lib.count('ender_pearl');
console.log(`=== Status: Boots = ${hasBoots}, Ingots = ${lib.count('gold_ingot')}, Pearls = ${finalPearls}/12 ===`);
bot.chat(`alpha: At bunker (42, 60, -6). Golden Boots: ${hasBoots ? 'EQUIPPED' : 'PENDING'}, Ingots: ${lib.count('gold_ingot')}, Pearls: ${finalPearls}/12`);
console.log('=== Program 708 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
