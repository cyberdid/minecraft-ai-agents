// programs/383-slay-blaze-get-rod.js
console.log('=== Program 383: Slay Blaze & Acquire First Blaze Rod ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Equip iron sword and full armor + shield
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');
await lib.equipArmor();

// 2. Find target Blaze
const blazes = Object.values(bot.entities).filter(e => 
  e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 24
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Blazes in range: ${blazes.length}`);

if (blazes.length > 0) {
  const blaze = blazes[0];
  console.log(`Target Blaze at ${lib.fmt(blaze.position)} (dist: ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m)`);

  // Walk forward towards z=-136 to get within striking reach
  console.log('Closing distance to Blaze...');
  try {
    await bot.lookAt(blaze.position.offset(0, 0.9, 0), true);
    // Move along walkway
    bot.setControlState('forward', true);
    await sleep(900);
    bot.setControlState('forward', false);
  } catch (e) {}

  // Attack cycle
  console.log('Engaging Blaze with sword strikes...');
  for (let round = 0; round < 6; round++) {
    if (!bot.entities[blaze.id]) {
      console.log('Blaze entity no longer exists (defeated)!');
      break;
    }
    await bot.lookAt(blaze.position.offset(0, 0.8, 0), true);
    await bot.attack(blaze);
    await sleep(600);
  }

  // Pick up drops
  console.log('Collecting drops...');
  await sleep(600);
  await lib.pickup(8);

  const rods = lib.count('blaze_rod');
  console.log(`Blaze rods in inventory: ${rods}`);
  if (rods > 0) {
    bot.chat(`team: BLAZE ROD ACQUIRED! Alpha inventory has ${rods} blaze_rod!`);
  }
} else {
  console.log('No blazes immediately visible within 24m. Scanning corridor forward...');
  // Move along walkway towards (45, 65, -140)
  try {
    await lib.goTo(45, 65, -140, 2, { timeoutMs: 12000 });
  } catch (e) {
    console.log('Walkway advance note:', e.message);
  }
}

// 3. Scan for Blaze Spawner nearby
const spawners = bot.findBlocks({
  matching: mcData.blocksByName.spawner?.id,
  maxDistance: 32,
  count: 5
});
console.log(`Spawners in area: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`  >>> BLAZE SPAWNER: ${lib.fmt(sp)} <<<`);
  bot.chat(`team: BLAZE SPAWNER FOUND AT ${lib.fmt(sp)}!`);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha at Fortress (${lib.fmt(bot.entity.position)}): HP=${bot.health}/20, Food=${bot.food}/20, Blaze rods=${lib.count('blaze_rod')}.`);
