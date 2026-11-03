// programs/394-spawner-combat-and-harvest.js
console.log('=== SPAWNER BALCONY COMBAT & HARVEST ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Check teammates at spawner front
for (const name of ['alpha', 'beta', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name}: pos=${lib.fmt(p.entity.position)} dist=${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

// 2. Equip best weapon
await lib.equipWeapon();

// 3. Ensure cobblestone guardrail at x=35 is solid
// Seal any gaps to prevent falling into the abyss
const p = bot.entity.position.floored();
console.log('Checking protective barrier...');
try {
  // If pit at (33, 66, -187) is open, seal it
  const pit = bot.blockAt(new Vec3(33, 66, -187));
  if (pit && (pit.name === 'air' || pit.name === 'cave_air')) {
    console.log('Sealing pit at (33, 66, -187) with cobblestone...');
    await lib.place('cobblestone', 33, 66, -187);
  }
} catch (e) {
  console.log('Barrier check note:', e.message);
}

// 4. Combat loop: target Blazes within reach while staying safely at x=35..36
bot.chat('gamma: Slaying Blazes from behind pillbox wall at (36, 66, -187)!');
const deadline = Date.now() + 45000;
let rodsBefore = lib.count('blaze_rod');
let kills = 0;

while (Date.now() < deadline && !isCancelled()) {
  // Check health
  if (bot.health <= 10) {
    console.log(`Health warning: HP=${bot.health}. Falling back to safe covered tunnel!`);
    bot.chat('gamma: HP low, tactical retreat to blast wall at (44, 65, -169)!');
    try {
      await lib.goTo(44, 65, -169, 1.5, { timeoutMs: 6000 });
    } catch (e) {}
    break;
  }

  // Find nearby blazes within melee reach (<= 4.5 blocks)
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) <= 4.5);
  if (blaze) {
    console.log(`Blaze in reach at ${lib.fmt(blaze.position)} (dist ${blaze.position.distanceTo(bot.entity.position).toFixed(1)})! Attacking...`);
    await bot.lookAt(blaze.position.offset(0, 1.2, 0), true);
    bot.attack(blaze);
    await sleep(650);
    bot.attack(blaze);
    await sleep(650);
  } else {
    // Check if drops are within reach
    try {
      const gained = await lib.pickup(4);
      if (gained > 0) {
        console.log(`Picked up items: ${gained}`);
      }
    } catch (e) {}
    await sleep(800);
  }

  // Check rods gained
  const rodsNow = lib.count('blaze_rod');
  if (rodsNow > rodsBefore) {
    console.log(`*** BLAZE ROD HARVESTED! Total: ${rodsNow} ***`);
    bot.chat(`gamma: Harvested Blaze Rod! Total in inventory: ${rodsNow}`);
    rodsBefore = rodsNow;
  }
}

// 5. Final pickup and status
try { await lib.pickup(6); } catch (e) {}
const finalRods = lib.count('blaze_rod');
console.log(`Combat complete. Blaze rods: ${finalRods}, HP: ${bot.health}`);
console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));

return {
  rods: finalRods,
  hp: bot.health,
  pos: bot.entity.position,
  inv: lib.inv()
};
