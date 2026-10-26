// programs/276-march-to-spawner-front.js
console.log('=== MARCH TO FORTRESS & SPAWNER FRONT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Equip best weapon
await lib.equipWeapon();
console.log('Weapon equipped:', bot.entity.equipment[0]?.name);

bot.chat('gamma marching along Safe East Ridge to Fortress Workshop & Spawner Front!');

// 2. Strict waypoints along East Ridge to Fortress Bunker, then into advance tunnel
const waypoints = [
  { name: 'Ridge South', pos: new Vec3(62.5, 66, -30) },
  { name: 'Ridge Mid-South', pos: new Vec3(62.5, 66, -55) },
  { name: 'Ridge Mid-North', pos: new Vec3(62.5, 67, -80) },
  { name: 'Ridge North Bend', pos: new Vec3(61.5, 66, -100) },
  { name: 'Fortress Approach', pos: new Vec3(50.0, 65, -115) },
  { name: 'Fortress Workshop Bunker', pos: new Vec3(44.0, 65, -127) },
  { name: 'Covered Tunnel Mid', pos: new Vec3(44.0, 65, -145) },
  { name: 'Covered Tunnel North', pos: new Vec3(44.0, 65, -160) },
  { name: 'Frontline Blast Wall', pos: new Vec3(44.0, 65, -169) }
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  // Dimension Guard
  if (!String(bot.game.dimension).includes('nether')) {
    console.log('Dimension guard triggered: Not in Nether! Aborting.');
    return;
  }

  const wp = waypoints[i];
  const d = bot.entity.position.distanceTo(wp.pos).toFixed(1);
  console.log(`[WP ${i + 1}/${waypoints.length}] Moving to ${wp.name} at ${lib.fmt(wp.pos)} (dist: ${d}m)...`);

  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 16000 });
    console.log(`Reached ${wp.name} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 12000 });
      console.log(`Reached ${wp.name} via goToXZ at ${lib.fmt(bot.entity.position)}`);
    } catch (e2) {
      console.log(`Navigation note for ${wp.name}: ${e2.message}`);
    }
  }

  // Combat check if hostiles are close
  const nearHostile = bot.nearestEntity(e => 
    (e.name === 'blaze' || e.name === 'wither_skeleton' || e.name === 'skeleton' || e.name === 'zombified_piglin') &&
    e.position.distanceTo(bot.entity.position) < 6
  );
  if (nearHostile && nearHostile.name !== 'zombified_piglin') {
    console.log(`Hostile in melee range: ${nearHostile.name} at ${lib.fmt(nearHostile.position)}! Attacking...`);
    await bot.lookAt(nearHostile.position);
    for (let h = 0; h < 5 && nearHostile.isValid && !isCancelled(); h++) {
      bot.attack(nearHostile);
      await sleep(650);
    }
    await lib.pickup(6);
  }

  // Pickup dropped loot along tunnel
  if (i >= 5) {
    try {
      await lib.pickup(6);
      await lib.equipArmor();
      await lib.equipWeapon();
    } catch (e) {}
  }

  // Milestone log at Workshop Bunker
  if (i === 5) {
    console.log('\n--- CHECKPOINT: Fortress Workshop Bunker reached! ---');
    console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
    bot.chat(`gamma reached Fortress Workshop at ${lib.fmt(bot.entity.position)}! Advancing down covered tunnel.`);
  }
}

console.log('\n=== ADVANCE REACHED DESTINATION ===');
console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Mainhand:', bot.entity.equipment[0]?.name);
console.log('Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv:', JSON.stringify(lib.inv()));

// Scan Blaze Spawner
const spawnerPos = new Vec3(32, 68, -190);
const distSpawner = bot.entity.position.distanceTo(spawnerPos).toFixed(1);
console.log(`Distance to Blaze Spawner (32, 68, -190): ${distSpawner}m`);

// Scan Blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.position.distanceTo(bot.entity.position) < 25);
console.log(`Blazes within 25m (${blazes.length}):`, blazes.map(b => `${lib.fmt(b.position)} dist=${bot.entity.position.distanceTo(b.position).toFixed(1)}m`));

// Scan teammates
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`Teammate ${p.username} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m held=${p.entity.heldItem?.name || 'none'}`);
  }
}

// Scan ground for floor towards spawner
console.log('--- Inspecting floor ahead from z=-169 to z=-180 ---');
for (let z = Math.floor(bot.entity.position.z); z >= Math.floor(bot.entity.position.z) - 10; z--) {
  const b = bot.blockAt(new Vec3(Math.floor(bot.entity.position.x), 64, z));
  console.log(`Floor at (${Math.floor(bot.entity.position.x)}, 64, ${z}): ${b ? b.name : 'air'}`);
}

bot.chat(`gamma at Frontline (${lib.fmt(bot.entity.position)})! Spawner dist: ${distSpawner}m, Blazes: ${blazes.length}, Cobble: ${lib.count('cobblestone')}.`);
