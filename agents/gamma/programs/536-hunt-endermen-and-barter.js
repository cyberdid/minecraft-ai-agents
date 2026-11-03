// programs/536-hunt-endermen-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 536: HUNT ENDERMEN & MARCH COVERED TRAIL ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Ensure golden boots and offhand shield
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}
try { await lib.equipWeapon(); } catch (e) {}

globalThis.configureFireAvoidance();
bot.chat('gamma: Marching safe East Ridge trail in Soul Sand Valley hunting Endermen for Milestone 9!');

// Safe waypoints from portal to covered tunnel
const wps = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -70 },
  { x: 62, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 },
  { x: 50, y: 65, z: -115 },
  { x: 44, y: 65, z: -127 }, // Bunker
  { x: 44, y: 65, z: -145 }  // Covered Tunnel
];

let pearlsBefore = lib.count('ender_pearl');

for (let i = 0; i < wps.length && !isCancelled(); i++) {
  const wp = wps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z)); // Keep gaze low

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 10000 });
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 0.8, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(600);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  // Scan for Endermen in Soul Sand Valley
  const endermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24
  );

  if (endermen.length > 0 && bot.health >= 15) {
    const targetEnderman = endermen[0];
    const dist = bot.entity.position.distanceTo(targetEnderman.position);
    console.log(`Enderman spotted at ${lib.fmt(targetEnderman.position)} (dist: ${dist.toFixed(1)}m)!`);

    // Verify 2-high protective ceiling or build one
    const headBlock = bot.blockAt(bot.entity.position.offset(0, 2, 0));
    const isProtected = headBlock && headBlock.name !== 'air';

    // If standing under ceiling or at covered section (z <= -115 or protected)
    if (isProtected || wp.z <= -115) {
      console.log('Engaging Enderman safely from under protective ceiling!');
      bot.chat(`gamma: Engaging Enderman from protective cover at ${lib.fmt(bot.entity.position)}!`);

      // Look at Enderman eyes to aggro
      await bot.lookAt(targetEnderman.position.offset(0, 2.8, 0), true);
      await sleep(500);

      const combatStart = Date.now();
      while (Date.now() - combatStart < 12000 && targetEnderman.isValid && !isCancelled()) {
        const d = bot.entity.position.distanceTo(targetEnderman.position);
        if (d <= 4.2) {
          try { await lib.equipWeapon(); } catch (e) {}
          bot.attack(targetEnderman);
          await sleep(650);
        } else {
          await bot.lookAt(targetEnderman.position.offset(0, 2.8, 0), true);
          await sleep(250);
        }
      }
      await sleep(1000);
      await lib.pickup(5.0);

      const curPearls = lib.count('ender_pearl');
      if (curPearls > pearlsBefore) {
        bot.chat(`gamma: Harvested Ender Pearl! Total: ${curPearls}/12!`);
        pearlsBefore = curPearls;
      }
    }
  }

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), pausing march.`);
    break;
  }
}

// Final status at tunnel
await lib.pickup(5.0);
const curPearls = lib.count('ender_pearl');
console.log(`=== END 536: Pearls: ${curPearls}/12, HP: ${bot.health.toFixed(1)}, Food: ${bot.food}, Pos: ${lib.fmt(bot.entity.position)} ===`);

bot.chat(`gamma: Stationed at ${lib.fmt(bot.entity.position)}. Pearls: ${curPearls}/12, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: curPearls,
  inv: lib.inv()
};
