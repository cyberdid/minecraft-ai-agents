// programs/704-warp-to-bunker-and-pool-gold.js
console.log('=== Program 704: Warp to Nether Bunker & Pool Gold for Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Ensure shield is in offhand
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 2. Warp into Nether
if (bot.game.dimension === 'overworld') {
  console.log('Stepping through Overworld Nether Portal...');
  bot.chat('alpha: Warping to Nether bunker (41, 65, -6) to pool gold with team and craft golden boots!');
  await globalThis.enterNetherPortal();
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  // Actively raise shield against Ghasts!
  bot.activateItem(true);
  globalThis.configureFireAvoidance();

  // Walk directly into Nether bunker at (41, 65, -6)
  console.log('Walking into Nether Base Camp bunker (41, 65, -6)...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -6.0, 1.0));
  } catch (e) {
    try {
      await lib.goTo(41, 65, -6, 1.2, { timeoutMs: 6000 });
    } catch (e2) {}
  }

  console.log('Alpha safe inside bunker at:', lib.fmt(bot.entity.position));

  // Check nearby teammates
  for (const name of ['beta', 'gamma', 'delta']) {
    const p = bot.players[name]?.entity;
    if (p) {
      console.log(`Teammate ${name}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem?.name}`);
    }
  }

  // Vacuum any dropped items on bunker floor
  await lib.pickup(5.0);

  // Check if Gamma is nearby and needs 1 gold ingot to craft golden_boots
  const gammaEntity = bot.players['gamma']?.entity;
  if (gammaEntity && bot.entity.position.distanceTo(gammaEntity.position) <= 4.0 && lib.count('gold_ingot') >= 2) {
    console.log('Gamma nearby! Tossing 1 gold ingot to Gamma so Gamma can craft golden_boots...');
    const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await bot.lookAt(gammaEntity.position.offset(0, 1.0, 0), true);
      try {
        await bot.toss(ingot.type, null, 1);
        bot.chat('alpha: Tossed 1 gold ingot to Gamma for golden_boots! Craft and suit up!');
        await sleep(1000);
      } catch (err) {}
    }
  }

  // Check Alpha gold status
  const nuggets = lib.count('gold_nugget');
  let ingots = lib.count('gold_ingot');
  console.log(`Alpha holds: ${ingots} gold ingots, ${nuggets} gold nuggets`);

  // Craft ingots from nuggets if we have 9+
  if (nuggets >= 9) {
    const toCraft = Math.floor(nuggets / 9);
    try {
      await lib.craft('gold_ingot', toCraft);
      console.log(`Crafted ${toCraft} gold ingots!`);
    } catch (e) {}
  }

  ingots = lib.count('gold_ingot');
  // Craft golden_boots if Alpha has 4+ ingots
  if (ingots >= 4 && lib.count('golden_boots') === 0 && bot.inventory.slots[8]?.name !== 'golden_boots') {
    console.log('Crafting golden_boots at bunker workbench...');
    try {
      await lib.craft('golden_boots', 1);
      const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
      if (boots) await bot.equip(boots, 'feet');
      bot.chat('alpha: [SUIT UP] golden_boots crafted and equipped! Piglin neutrality ACTIVE!');
    } catch (e) {
      console.log('Craft boots note:', e.message);
    }
  }

  const bootsWorn = bot.inventory.slots[8]?.name === 'golden_boots';
  console.log('Boots worn (slot 8):', bot.inventory.slots[8]?.name, 'Neutrality:', bootsWorn);

  // If Alpha has extra ingots and Piglin neutrality, look for Piglins to barter!
  if (bootsWorn && lib.count('gold_ingot') > 0) {
    const piglins = Object.values(bot.entities)
      .filter(e => e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 16);
    console.log(`Piglins within 16m: ${piglins.length}`);
    if (piglins.length > 0) {
      const pig = piglins[0];
      await bot.pathfinder.goto(new goals.GoalNear(pig.position.x, pig.position.y, pig.position.z, 3.0));
      const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (ingot) {
        await bot.lookAt(pig.position.offset(0, 1.2, 0), true);
        await bot.toss(ingot.type, null, 1);
        bot.chat('alpha: Bartering gold ingot with Piglin!');
        await sleep(6500);
        await lib.pickup(5.0);
      }
    }
  }

  // Scan Endermen for hunting
  const endermen = Object.values(bot.entities)
    .filter(e => e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12);
  if (endermen.length > 0) {
    const em = endermen[0];
    console.log(`Enderman nearby at ${lib.fmt(em.position)}!`);
    await lib.equipWeapon();
    await bot.lookAt(em.position.offset(0, 0.4, 0), true);
    bot.attack(em);
    await sleep(500);
    bot.attack(em);
    await lib.pickup(4.0);
  }

  const pearls = lib.count('ender_pearl');
  console.log(`=== Milestone 9 Status: Pearls held = ${pearls}/12, Boots = ${bootsWorn} ===`);
  bot.chat(`alpha: Team regrouped at bunker (41, 65, -6)! Ender Pearls: ${pearls}/12, Gold Ingots: ${lib.count('gold_ingot')}`);
}

console.log('=== Program 704 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Inv:', lib.inv());
