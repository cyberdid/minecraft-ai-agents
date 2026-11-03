console.log('=== DELTA: PIGLIN BARTERING ROUNDS ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, Gold ingots: ${lib.count('gold_ingot')}`);

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Move to bartering position near Beta at (43.5, 67.0, -118.0)
const barterSpot = new Vec3(43.5, 67.0, -118.0);
console.log(`Approaching bartering spot at ${lib.fmt(barterSpot)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(barterSpot.x, barterSpot.y, barterSpot.z, 1.5));
} catch (e) {
  console.log('Pathfinder notice:', e.message);
  try {
    await lib.goToXZ(barterSpot.x, barterSpot.z, { timeoutMs: 6000 });
  } catch (e2) {}
}

console.log(`At bartering location: ${lib.fmt(bot.entity.position)}`);

// Find Piglins within 8m
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 8.0
);

console.log(`Piglins within 8m: ${piglins.length}`);
for (const p of piglins) {
  console.log(`  Piglin id=${p.id} at ${lib.fmt(p.position)} (dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m)`);
}

let startPearls = lib.count('ender_pearl');

// Barter all available gold ingots (up to 3)
const totalIngots = lib.count('gold_ingot');
for (let round = 1; round <= totalIngots && !isCancelled(); round++) {
  const target = piglins[0] || Object.values(bot.entities).find(e => e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 10.0);
  if (!target) {
    console.log('No Piglin in range for barter.');
    break;
  }

  const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
  if (!ingot) {
    console.log('No more gold ingots in inventory.');
    break;
  }

  console.log(`--- Barter Round ${round}/${totalIngots} with Piglin id=${target.id} at ${lib.fmt(target.position)} ---`);
  await bot.lookAt(target.position.offset(0, 1.0, 0), true);

  try {
    await bot.toss(ingot.type, null, 1);
    bot.chat(`delta: Tossed gold ingot #${round} to neutral Piglin! Admiring...`);
    console.log('Tossed gold ingot. Waiting 6.5s for barter trade...');
    await sleep(6500);

    const picked = await lib.pickup(6.0);
    console.log(`Picked up barter drops: ${picked}`);
  } catch (err) {
    console.log('Barter error:', err.message);
  }

  const curPearls = lib.count('ender_pearl');
  if (curPearls > startPearls) {
    bot.chat(`delta: PEARL SECURED! Total Ender Pearls: ${curPearls}/12!`);
    console.log(`PEARL SECURED! Total Ender Pearls: ${curPearls}/12!`);
    startPearls = curPearls;
  }
}

try { await lib.pickup(8.0); } catch (e) {}

const finalPearls = lib.count('ender_pearl');
console.log(`Delta Barter Session Complete! Ender Pearls: ${finalPearls}/12, Remaining Gold: ${lib.count('gold_ingot')}`);
bot.chat(`delta: Barter session complete! Ender Pearls: ${finalPearls}/12, Remaining Gold: ${lib.count('gold_ingot')}.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  pearls: finalPearls,
  gold: lib.count('gold_ingot'),
  inv: lib.inv()
};
