// programs/545-scan-team-and-bunker-pearl-hunt.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 545: BUNKER TEAM SCAN & ENDER PEARL HUNT ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Scan teammates inside bunker
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Teammates united at Bunker (${teammates.length}):`);
for (const t of teammates) {
  const d = bot.entity.position.distanceTo(t.position).toFixed(1);
  console.log(`  - ${t.username} at ${lib.fmt(t.position)} (${d}m), held: ${t.heldItem?.name}`);
}

// 2. Safe pickup any dropped items in bunker
const picked = await lib.pickup(4.0);
if (picked > 0) console.log(`Picked up ${picked} items in bunker! Inventory:`, lib.inv());

// 3. Scan for Endermen visible from bunker within 32m
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Endermen detected nearby (${endermen.length}):`);
for (const em of endermen) {
  const d = bot.entity.position.distanceTo(em.position).toFixed(1);
  console.log(`  - Enderman at ${lib.fmt(em.position)} (${d}m)`);
}

// 4. Scan for Piglins in tunnel within 32m
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 32
);
console.log(`Piglins detected nearby (${piglins.length}):`);
for (const pg of piglins) {
  const d = bot.entity.position.distanceTo(pg.position).toFixed(1);
  console.log(`  - Piglin at ${lib.fmt(pg.position)} (${d}m)`);
}

// 5. If Enderman detected and we are safe under 2-high bunker ceiling (y=65..66, roof at y=67)
if (endermen.length > 0) {
  const em = endermen[0];
  console.log(`Aggroing Enderman at ${lib.fmt(em.position)} from under 2-high bunker roof!`);
  bot.chat(`gamma: Staring at Enderman from safe 2-high bunker doorway at (44, 65, -127)!`);

  // Stand inside doorway
  try {
    await lib.goTo(44.5, 65, -127.5, 0.8, { dig: false, timeoutMs: 3000 });
  } catch (e) {}

  // Equip iron sword
  const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sw) await bot.equip(sw, 'hand');

  // Look at Enderman eyes to aggro
  await bot.lookAt(em.position.offset(0, 2.8, 0), true);
  await sleep(600);

  // Attack loop while Enderman charges 2-high doorway
  const combatStart = Date.now();
  let hits = 0;
  while (Date.now() - combatStart < 12000 && em.isValid && !isCancelled()) {
    const d = bot.entity.position.distanceTo(em.position);
    if (d <= 4.2) {
      bot.attack(em);
      hits++;
      await sleep(650);
    } else {
      await bot.lookAt(em.position.offset(0, 2.8, 0), true);
      await sleep(200);
    }
  }

  await sleep(800);
  await lib.pickup(4.0);
  console.log(`Combat finished. Hits: ${hits}, Current Ender Pearls: ${lib.count('ender_pearl')}`);
}

// 6. Check if any gold ingots can be bartered with Piglins
const ingots = lib.count('gold_ingot');
if (ingots > 0 && piglins.length > 0) {
  const pg = piglins[0];
  console.log(`Tossing gold ingot to Piglin at ${lib.fmt(pg.position)}...`);
  try {
    await bot.lookAt(pg.position.offset(0, 1.0, 0), true);
    await bot.equip(mcData.itemsByName.gold_ingot.id, 'hand');
    bot.tossStack(bot.heldItem);
    await sleep(8000);
    await lib.pickup(5.0);
  } catch (e) {}
}

const curPearls = lib.count('ender_pearl');
const curRods = lib.count('blaze_rod');
bot.chat(`gamma: Bunker status update — Pearls: ${curPearls}/12, Rods: ${curRods}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  teammatesCount: teammates.length,
  endermenCount: endermen.length,
  piglinsCount: piglins.length,
  pearls: curPearls,
  inv: lib.inv()
};
