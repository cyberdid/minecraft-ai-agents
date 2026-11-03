// programs/546-coordinate-barter-with-beta.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 546: COORDINATE BARTER WITH BETA & ALPHA ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Walk to Crafting Table at (44, 65, -134)
try {
  await lib.goTo(44, 65, -134, 1.0, { dig: false, timeoutMs: 5000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44, 65, -134, 1.0));
  } catch (e2) {}
}

console.log('At Crafting Table pos:', lib.fmt(bot.entity.position));

// Vacuum any dropped nuggets/ingots/food from team mining
await lib.pickup(5.0);

// Check if any nuggets can be crafted into ingots
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  try {
    const crafts = Math.floor(nuggets / 9);
    await lib.craft('gold_ingot', crafts);
    console.log(`Crafted ${crafts} gold_ingot! Total: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft note:', e.message);
  }
}

// Step 2: Check teammates at bunker
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// Step 3: Advance along covered tunnel to (44, 65, -145) for bartering
console.log('Advancing along covered tunnel to (44, 65, -145)...');
try {
  await lib.goTo(44, 65, -145, 1.2, { dig: false, timeoutMs: 8000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(44, 65, -145, 1.0));
  } catch (e2) {}
}

console.log('At Covered Tunnel Trading Post. Pos:', lib.fmt(bot.entity.position));

// Step 4: Scan for neutral Piglins
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 20
);
console.log(`Piglins within 20m (${piglins.length}):`);
for (const p of piglins) {
  const d = bot.entity.position.distanceTo(p.position).toFixed(1);
  console.log(`  - Piglin at ${lib.fmt(p.position)} (${d}m)`);
}

// Step 5: Execute bartering loop if gold ingots present
const ingots = lib.count('gold_ingot');
console.log(`Available gold ingots: ${ingots}`);

if (ingots > 0 && piglins.length > 0) {
  const pg = piglins[0];
  console.log(`Executing bartering rounds with Piglin at ${lib.fmt(pg.position)}...`);
  bot.chat(`gamma: Bartering ${ingots} gold ingots with neutral Piglin for Milestone 9 Ender Pearls!`);

  for (let r = 0; r < ingots && !isCancelled(); r++) {
    try {
      const ingot = bot.inventory.items().find(i => i.name === 'gold_ingot');
      if (!ingot) break;

      await bot.lookAt(pg.position.offset(0, 1.0, 0), true);
      await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
      bot.tossStack(bot.heldItem);
      console.log(`Barter ${r + 1}/${ingots} tossed! Awaiting drop inspection (8s)...`);
      await sleep(8000);
      const picked = await lib.pickup(5.0);
      console.log(`Round ${r + 1} picked up ${picked} items! Current pearls: ${lib.count('ender_pearl')}`);
    } catch (e) {
      console.log('Barter error:', e.message);
    }
  }
}

// Step 6: Scan for Endermen in covered tunnel or visible from doorway
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24
);

if (endermen.length > 0) {
  const em = endermen[0];
  console.log(`Enderman spotted at ${lib.fmt(em.position)}! Slaying safely under 2-high ceiling!`);
  bot.chat('gamma: Slaying Enderman from safe 2-high ceiling in covered tunnel!');

  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');

  // Aggro by staring at eyes
  await bot.lookAt(em.position.offset(0, 2.8, 0), true);
  await sleep(500);

  const startFight = Date.now();
  while (Date.now() - startFight < 12000 && em.isValid && !isCancelled()) {
    const d = bot.entity.position.distanceTo(em.position);
    if (d <= 4.2) {
      bot.attack(em);
      await sleep(650);
    } else {
      await bot.lookAt(em.position.offset(0, 2.8, 0), true);
      await sleep(200);
    }
  }

  await sleep(800);
  await lib.pickup(5.0);
}

const curPearls = lib.count('ender_pearl');
console.log(`=== END 546: Ender Pearls: ${curPearls}/12, HP: ${bot.health.toFixed(1)}, Food: ${bot.food} ===`);

bot.chat(`gamma: Covered Tunnel status — Pearls: ${curPearls}/12, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  piglinsCount: piglins.length,
  endermenCount: endermen.length,
  pearls: curPearls,
  inv: lib.inv()
};
