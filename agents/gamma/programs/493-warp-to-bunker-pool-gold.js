// programs/493-warp-to-bunker-pool-gold.js
console.log('=== GAMMA: WARP TO NETHER BUNKER & POOL GOLD ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Enter Nether portal from Overworld base
if (bot.game.dimension === 'overworld') {
  bot.chat('gamma: Full 20/20 HP & Food! Warping through portal to Nether bunker (41, 65, -6) to pool gold with Alpha & Beta!');

  // Exit base door if inside
  if (bot.entity.position.z < -53.2) {
    try {
      await lib.door(294, 72, -54, true);
      await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52.5, 0.5));
      await lib.door(294, 72, -54, false);
    } catch (e) {
      try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
    }
  }

  // Walk into portal block at (299.5, 73.0, -53.5)
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -53.5, 0.4));
  } catch (e) {
    await lib.goToXZ(299.5, -53.5, { timeoutMs: 5000 });
  }

  const portalCenter = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(portalCenter, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < 72.8) bot.setControlState('jump', true);
  await sleep(350);
  bot.clearControlStates();

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(250);
  }
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Failed to warp to Nether. Pos:', lib.fmt(bot.entity.position));
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('WARP SUCCESS! In the_nether at:', lib.fmt(bot.entity.position));

// 2. Step out of portal into bunker floor at (41, 65, -6)
await sleep(400);
await bot.lookAt(new Vec3(41.0, 65.0, -6.0), true);
bot.setControlState('forward', true);
await sleep(800);
bot.setControlState('forward', false);

// 3. Vacuum any dropped items on the bunker floor (nuggets, ingots)
try {
  await lib.pickup(5.0);
} catch (e) {}

const currentIngots = lib.count('gold_ingot');
const currentNuggets = lib.count('gold_nugget');
console.log(`Bunker gold: ${currentIngots} ingots, ${currentNuggets} nuggets`);
bot.chat(`gamma: Reunited with team at Nether bunker (41, 65, -6)! Gamma holds ${currentIngots} gold ingots, ${currentNuggets} nuggets.`);

// 4. Locate Crafting Table at (41, 65, -6)
const tableBlock = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 8 });
if (tableBlock) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(tableBlock.position.x, tableBlock.position.y, tableBlock.position.z, 1.2));
  } catch (e) {}

  // If Gamma has 9+ nuggets, craft an ingot
  if (lib.count('gold_nugget') >= 9) {
    try {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
      console.log('Crafted gold ingot from nuggets! Total ingots:', lib.count('gold_ingot'));
    } catch (e) {}
  }

  // If Gamma has 4+ ingots, craft golden_boots!
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      await lib.equipArmor();
      bot.chat('gamma: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% Piglin neutrality ACTIVE!');
      console.log('*** GOLDEN BOOTS EQUIPPED! PIGLIN NEUTRALITY ACTIVE! ***');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }
}

// 5. Look for Alpha or nearby teammates to pool gold
const alphaEntity = Object.values(bot.entities).find(e =>
  e.isValid && e.type === 'player' && e.username === 'alpha' && bot.entity.position.distanceTo(e.position) <= 8
);

if (alphaEntity && lib.count('golden_boots') === 0 && lib.count('gold_ingot') === 3) {
  console.log('Alpha is adjacent at bunker! Coordinating gold pooling...');
  bot.chat('gamma: Alpha, pooling gold at bunker table (41, 65, -6) to complete golden_boots for Piglin neutrality!');
  // Toss 1 ingot to Alpha or pick up dropped ingot
  await sleep(2000);
  try { await lib.pickup(5.0); } catch (e) {}
}

// 6. Check for Piglins nearby for bartering if we have gold ingots and neutrality
const barteringIngots = lib.count('gold_ingot');
if (barteringIngots > 0) {
  const piglins = Object.values(bot.entities).filter(e =>
    e.isValid && e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 16
  );
  if (piglins.length > 0) {
    console.log(`Found ${piglins.length} Piglins nearby! Bartering...`);
    const piglin = piglins[0];
    try {
      await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.0));
      const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (goldItem) {
        bot.chat('gamma: Tossing gold ingot to Piglin for Ender Pearl barter!');
        await bot.lookAt(piglin.position, true);
        await bot.toss(goldItem.type, null, 1);
        await sleep(8000);
        await lib.pickup(5.0);
      }
    } catch (e) {}
  }
}

const finalBoots = lib.count('golden_boots');
const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Team coordination complete. Golden Boots: ${finalBoots}, Ender Pearls: ${finalPearls}/12, Barter Ingots: ${finalIngots}, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  boots: finalBoots,
  ingots: finalIngots,
  pearls: finalPearls,
  inv: lib.inv()
};
