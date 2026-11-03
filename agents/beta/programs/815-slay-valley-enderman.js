// programs/815-slay-valley-enderman.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 815: Slay 15m Enderman for Ender Pearl ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure iron sword equipped in hand
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) { try { await bot.equip(gb, 'feet'); } catch (e) {} }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

// Find the Enderman within 20m
const endermen = Object.values(bot.entities).filter(e => 
  e.name === 'enderman' && 
  bot.entity.position.distanceTo(e.position) <= 22
);
console.log(`Endermen in immediate reach (${endermen.length}):`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

if (endermen.length === 0) {
  console.log('No Enderman within 22m, expanding search to 40m...');
  const anyEnderman = Object.values(bot.entities).filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 40);
  console.log(`Endermen within 40m (${anyEnderman.length}):`, anyEnderman.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));
}

let pearlsBefore = lib.count('ender_pearl');

if (endermen.length > 0) {
  const target = endermen[0];
  console.log(`Engaging Enderman at ${lib.fmt(target.position)}! Provoking gaze...`);
  bot.chat(`Beta: Provoking Enderman at ${lib.fmt(target.position)} from safe 2-high covered ridge!`);

  // Stare at head (y + 2.7) to provoke
  await bot.lookAt(target.position.offset(0, 2.7, 0), true);
  await sleep(1000);

  // Combat loop
  const startCombat = Date.now();
  let hits = 0;
  let lastHit = 0;

  while (Date.now() - startCombat < 20000 && !isCancelled()) {
    // Find nearest valid enderman
    const currentEnderman = Object.values(bot.entities).find(e => 
      e.name === 'enderman' && 
      e.isValid && 
      (e.health === undefined || e.health > 0) &&
      bot.entity.position.distanceTo(e.position) <= 18
    );

    if (!currentEnderman) {
      console.log('No live Enderman detected within 18m, ending combat loop.');
      break;
    }

    const dist = bot.entity.position.distanceTo(currentEnderman.position);
    await bot.lookAt(currentEnderman.position.offset(0, 1.8, 0), true);

    if (dist <= 4.2 && Date.now() - lastHit > 650) {
      bot.deactivateItem();
      bot.attack(currentEnderman);
      lastHit = Date.now();
      hits++;
      console.log(`Hit Enderman! (Hit #${hits}, dist: ${dist.toFixed(1)}m)`);
      await sleep(100);
      bot.activateItem(true);
    } else {
      bot.activateItem(true);
    }

    await sleep(80);
  }

  // Vacuum drops
  await lib.pickup(6.0);

  const pearlsAfter = lib.count('ender_pearl');
  if (pearlsAfter > pearlsBefore) {
    bot.chat(`Beta: SUCCESS! Slew Enderman and harvested Ender Pearl! Total: ${pearlsAfter}/12! Milestone 9 progressing!`);
    console.log(`SUCCESS! Harvested Ender Pearl! Total now: ${pearlsAfter}/12`);
  } else {
    console.log('Enderman fight complete. Checking inventory...');
  }
}

// Check nearby drops
await lib.pickup(5.0);

console.log('=== Program 815 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls in inv:', lib.count('ender_pearl'));
console.log('Inventory:', lib.inv());

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ender_pearls: lib.count('ender_pearl'),
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  inv: lib.inv()
};
