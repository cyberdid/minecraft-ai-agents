// programs/339-build-bunker-and-farm-blazes.js
console.log('=== BUILD BUNKER & FARM BLAZES ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Offhand:', bot.inventory.slots[45]?.name || 'none');
console.log('Cobblestone:', lib.count('cobblestone'));

// Equip weapon & shield
await lib.equipArmor();
await lib.equipWeapon();

// 1. Move to safe bunker spot at (35, 67, -186)
try {
  await lib.goTo(35, 67, -186, 0.5, { timeoutMs: 4000 });
} catch (e) {}

// 2. Place cobblestone blast wall at (34, 68..69, -187..-188)
// Check if blocks can be placed against the floor at y=67
const wallSpots = [
  new Vec3(34, 68, -187),
  new Vec3(34, 69, -187),
  new Vec3(34, 68, -188),
  new Vec3(34, 69, -188)
];

for (const p of wallSpots) {
  const current = bot.blockAt(p);
  if (current && current.name === 'air' && lib.count('cobblestone') > 0) {
    try {
      console.log(`Placing cobblestone blast block at ${lib.fmt(p)}...`);
      await lib.place('cobblestone', p.x, p.y, p.z);
    } catch (e) {
      console.log(`Place wall note at ${lib.fmt(p)}:`, e.message);
    }
  }
}

console.log('Blast wall placed! Remaining cobble:', lib.count('cobblestone'));

// 3. Scan for nearby Blazes
function getNearbyBlazes() {
  const list = Object.values(bot.entities).filter(e => {
    if (!e || e.name !== 'blaze' || !e.position) return false;
    return bot.entity.position.distanceTo(e.position) <= 8;
  });
  list.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  return list;
}

// 4. Engage and slay Blazes through the firing slit
const fightStart = Date.now();
let slayed = 0;

console.log('Engaging Blazes safely behind cover...');
while (Date.now() - fightStart < 35000 && !isCancelled() && bot.health > 4) {
  const blazes = getNearbyBlazes();
  if (blazes.length === 0) {
    console.log('No Blazes in melee reach, waiting behind cover...');
    await sleep(1500);
    continue;
  }

  const target = blazes[0];
  const dist = bot.entity.position.distanceTo(target.position);
  console.log(`Targeting Blaze ${target.id} at ${lib.fmt(target.position)} (dist: ${dist.toFixed(1)}m)...`);

  if (dist <= 4.5) {
    // Attack Blaze through the firing opening
    await bot.lookAt(target.position.offset(0, target.height * 0.5, 0), true);
    bot.attack(target);
    await sleep(600);
  } else {
    // Raise shield and wait for it to approach
    await bot.lookAt(target.position, true);
    bot.activateItem(true); // Raise shield in offhand
    await sleep(800);
    bot.deactivateItem();
  }

  // Pick up any dropped Blaze Rods
  await lib.pickup(5);
  const rods = lib.count('blaze_rod');
  if (rods > 0) {
    console.log(`BLAZE ROD HARVESTED! Total in inventory: ${rods}`);
  }
}

// Final pickup
await sleep(300);
await lib.pickup(6);

console.log('\n=== STATUS AFTER FARMING ROUND ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Blaze rods:', lib.count('blaze_rod'));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma report: Slaying round finished at Spawner! Harvested rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20, Cobble: ${lib.count('cobblestone')}`);
