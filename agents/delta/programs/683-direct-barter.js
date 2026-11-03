console.log('=== DELTA: DIRECT PIGLIN BARTERING ===');

// Check golden boots
const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
if (boots && bot.inventory.slots[8]?.name !== 'golden_boots') {
  await bot.equip(boots, 'feet');
  console.log('Equipped golden_boots to feet');
}

const initialPearls = lib.count('ender_pearl');
console.log(`Starting pearls: ${initialPearls}, gold ingots: ${lib.count('gold_ingot')}`);

let ingotsLeft = lib.count('gold_ingot');

for (let round = 1; round <= 3 && ingotsLeft > 0 && !isCancelled(); round++) {
  // Find adult piglins nearby
  const piglins = Object.values(bot.entities).filter(e =>
    e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 6.0
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (piglins.length === 0) {
    console.log('No piglins within 6m. Searching up to 12m...');
    const farther = Object.values(bot.entities).filter(e =>
      e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12.0
    ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
    if (farther.length === 0) {
      console.log('No piglins found nearby.');
      break;
    }
    console.log(`Moving towards piglin at ${lib.fmt(farther[0].position)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(farther[0].position.x, farther[0].position.y, farther[0].position.z, 2.5));
    } catch (e) {}
    continue;
  }

  const target = piglins[0];
  console.log(`Round ${round}: Selected Piglin id=${target.id} at ${lib.fmt(target.position)} (dist: ${bot.entity.position.distanceTo(target.position).toFixed(1)}m)`);

  const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
  if (!goldItem) {
    console.log('No gold_ingot in inventory.');
    break;
  }

  await bot.equip(goldItem, 'hand');
  await bot.lookAt(target.position.offset(0, (target.height || 1.95) * 0.7, 0), true);
  await sleep(200);

  console.log(`Calling bot.activateEntity on Piglin id=${target.id}...`);
  try {
    await bot.activateEntity(target);
    bot.chat(`delta: Handed gold ingot to Piglin id=${target.id}! Bartering...`);
  } catch (err) {
    console.log('activateEntity error:', err.message);
    // Fallback: toss 1 ingot right at piglin
    console.log('Fallback: tossing 1 ingot at piglin');
    await bot.toss(goldItem.type, null, 1);
  }

  // Piglins take about 6 to 8 seconds to inspect gold and drop barter items
  console.log('Waiting 8.5s for bartering animation and drop...');
  await sleep(8500);

  // Pick up drops
  console.log('Vacuuming drops with lib.pickup(4.0)...');
  try {
    await lib.pickup(4.0);
  } catch (e) {}

  const currentPearls = lib.count('ender_pearl');
  if (currentPearls > initialPearls) {
    bot.chat(`delta: Got Ender Pearls! Inventory now has ${currentPearls} ender_pearls!`);
    console.log(`Ender Pearls increased! Now: ${currentPearls}`);
  }

  ingotsLeft = lib.count('gold_ingot');
  console.log(`Round ${round} finished. Remaining gold ingots: ${ingotsLeft}`);
}

const finalPearls = lib.count('ender_pearl');
console.log(`Barter session finished. Final pearls: ${finalPearls}, remaining gold: ${lib.count('gold_ingot')}`);
return {
  pearls: finalPearls,
  gold: lib.count('gold_ingot'),
  inv: lib.inv()
};
