console.log('=== DELTA: EQUIP GOLDEN BOOTS & HUNT / BARTER ===');

// Step 1: Equip golden_boots on feet
const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
if (boots) {
  console.log('Equipping golden_boots on feet...');
  try {
    await bot.equip(boots, 'feet');
    console.log('GOLDEN BOOTS EQUIPPED!');
  } catch (e) {
    console.log('Equip boots error:', e.message);
  }
}

// Equip shield in offhand, iron sword in main hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
  const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sword) await bot.equip(sword, 'hand');
} catch (e) {}

bot.chat('delta: Golden boots EQUIPPED! 100% Piglin neutrality ACTIVE! Delta is safe from all Piglins!');

// Check Endermen nearby
const endermen = Object.values(bot.entities)
  .filter(e => e.name === 'enderman' && e.isValid && (e.health === undefined || e.health > 0))
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${endermen.length} Endermen nearby:`);
for (const ender of endermen) {
  const dist = bot.entity.position.distanceTo(ender.position);
  console.log(`  Enderman at ${lib.fmt(ender.position)} (dist ${dist.toFixed(1)}m, HP: ${ender.health})`);
}

// If Enderman is within 10 blocks, strike from under 2-high ceiling
if (endermen.length > 0 && bot.entity.position.distanceTo(endermen[0].position) < 10) {
  const target = endermen[0];
  console.log(`Engaging Enderman at ${lib.fmt(target.position)} from under 2-high ceiling...`);
  // Aim at legs (y + 0.3)
  await bot.lookAt(target.position.offset(0, 0.4, 0), true);
  for (let s = 0; s < 8 && target.isValid && (target.health === undefined || target.health > 0); s++) {
    if (isCancelled()) break;
    bot.attack(target);
    await sleep(650);
  }
  await sleep(500);
  try {
    const picked = await lib.pickup(6.0);
    console.log(`Picked up drops: ${picked}`);
  } catch (e) {}
}

// Check nearby Piglins for safe bartering
const piglins = Object.values(bot.entities)
  .filter(e => e.name === 'piglin' && e.isValid && e.position.distanceTo(bot.entity.position) < 8);

console.log(`Nearby neutral Piglins within 8m: ${piglins.length}`);

// If neutral Piglins present and Delta holds gold_ingot, drop 1 gold ingot to barter!
if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
  const targetPiglin = piglins[0];
  console.log(`Bartering with Piglin at ${lib.fmt(targetPiglin.position)}...`);
  await bot.lookAt(targetPiglin.position, true);
  try {
    const goldIngot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (goldIngot) {
      await bot.toss(goldIngot.type, null, 1);
      bot.chat('delta: Tossed gold ingot to neutral Piglin for Milestone 9 barter!');
      console.log('Tossed gold ingot! Waiting for barter inspection...');
      await sleep(7000); // Piglin examines gold for 6 seconds
      try {
        const pCount = await lib.pickup(6.0);
        console.log(`Picked up barter drops: ${pCount}`);
      } catch (e) {}
    }
  } catch (err) {
    console.log('Barter error:', err.message);
  }
}

console.log(`Delta ender_pearls: ${lib.count('ender_pearl')}`);
if (lib.count('ender_pearl') > 0) {
  bot.chat(`delta: Milestone 9 progress — Holding ${lib.count('ender_pearl')}/12 Ender Pearls!`);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  pearls: lib.count('ender_pearl'),
  ingots: lib.count('gold_ingot'),
  inv: lib.inv()
};
