console.log('=== DELTA: PERMANENT GOLDEN BOOTS & PILLBOX DEFENSE ===');

// Step 1: Equip golden_boots onto feet (moves iron_boots into inventory)
const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
if (gb) {
  console.log('Equipping golden_boots on feet...');
  try {
    await bot.equip(gb, 'feet');
    await sleep(350);
    console.log('Golden boots equipped!');
  } catch (e) {
    console.log('Equip error:', e.message);
  }
}

// Step 2: Toss iron_boots out so auto-armor can never swap them back!
const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
if (ib) {
  console.log('Tossing iron_boots permanently...');
  try {
    await bot.toss(ib.type, null, 1);
    console.log('Iron boots tossed!');
  } catch (e) {}
}

// Step 3: Verify boots equipped
console.log('Feet slot item:', bot.inventory.slots[8]?.name);

// Step 4: Pillbox active combat and defense
console.log('Stationed inside Pillbox, looking at Spawner (32, 68, -190)...');
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
bot.activateItem(true); // Raise shield

const start = Date.now();
let kills = 0;
let lastAttack = 0;

while (Date.now() - start < 20000 && !isCancelled()) {
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, 1.2, 0), true);

    if (dist <= 4.5 && Date.now() - lastAttack > 650) {
      bot.deactivateItem();
      bot.attack(target);
      lastAttack = Date.now();
      bot.activateItem(true); // Re-raise shield immediately!
      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze slain! Kills: ${kills}`);
      }
    } else {
      bot.activateItem(true);
    }
  } else {
    bot.activateItem(true);
  }

  // Pickup any safe drops
  try { await lib.pickup(3.0); } catch (e) {}
  await sleep(150);
}

bot.deactivateItem();

bot.chat(`delta: Golden boots locked on feet! Pillbox secured. Blaze Rods: ${lib.count('blaze_rod')}, Pearls: ${lib.count('ender_pearl')}. Ready for bartering!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  feet: bot.inventory.slots[8]?.name,
  rods: lib.count('blaze_rod'),
  pearls: lib.count('ender_pearl'),
  ingots: lib.count('gold_ingot')
};
