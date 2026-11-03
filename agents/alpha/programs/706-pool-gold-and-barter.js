// programs/706-pool-gold-and-barter.js
console.log('=== Program 706: Pool Gold & Barter for Ender Pearls ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain active shield
bot.activateItem(true);
globalThis.configureFireAvoidance();

// 2. Vacuum drops around bunker floor
await lib.pickup(6.0);

// 3. Inspect teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && bot.entity.position.distanceTo(p.entity.position) <= 12) {
    console.log(`Teammate ${name} within ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m: pos=${lib.fmt(p.entity.position)}`);
  }
}

// 4. Craft ingots if Alpha has 9+ nuggets
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const ingots = Math.floor(nuggets / 9);
  try {
    await lib.craft('gold_ingot', ingots);
    console.log(`Crafted ${ingots} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

// 5. If Alpha has 4+ ingots, craft and equip golden_boots
let ingots = lib.count('gold_ingot');
let hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;

if (ingots >= 4 && !hasBoots) {
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
    bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglin neutrality ACTIVE!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
console.log('Golden boots status:', hasBoots ? 'EQUIPPED (slot 8)' : 'NOT YET');

// 6. Share gold with Gamma if Gamma is close and Alpha has 2 ingots
const gamma = bot.players['gamma']?.entity;
if (gamma && bot.entity.position.distanceTo(gamma.position) <= 4.0 && ingots >= 2 && !hasBoots) {
  const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
  if (ingot) {
    await bot.lookAt(gamma.position.offset(0, 1, 0), true);
    await bot.toss(ingot.type, null, 1);
    bot.chat('alpha: Tossed 1 gold ingot to Gamma for golden_boots!');
  }
}

// 7. If wearing golden boots and holding gold ingots, barter with Piglins!
if (hasBoots && lib.count('gold_ingot') > 0) {
  const piglins = Object.values(bot.entities)
    .filter(e => e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24);

  if (piglins.length > 0) {
    const pig = piglins[0];
    console.log(`Approaching Piglin at ${lib.fmt(pig.position)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(pig.position.x, pig.position.y, pig.position.z, 3.0));
      const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (ingot) {
        await bot.lookAt(pig.position.offset(0, 1.2, 0), true);
        await bot.toss(ingot.type, null, 1);
        bot.chat('alpha: Bartering gold ingot with Piglin!');
        await sleep(6500);
        await lib.pickup(5.0);
      }
    } catch (e) {}
  }
}

// 8. Enderman check in Soul Sand Valley
const endermen = Object.values(bot.entities)
  .filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12);
if (endermen.length > 0) {
  const em = endermen[0];
  console.log(`Enderman spotted at ${lib.fmt(em.position)}!`);
  await lib.equipWeapon();
  await bot.lookAt(em.position.offset(0, 0.4, 0), true);
  bot.attack(em);
  await sleep(500);
  bot.attack(em);
  await lib.pickup(4.0);
}

const pearls = lib.count('ender_pearl');
console.log(`=== Milestone 9 Progress: Alpha holds ${pearls}/12 Ender Pearls ===`);
bot.chat(`alpha: Status at bunker: Ender Pearls: ${pearls}/12, Boots: ${hasBoots ? 'YES' : 'NO'}, Ingots: ${lib.count('gold_ingot')}`);
console.log('=== Program 706 Complete ===');
