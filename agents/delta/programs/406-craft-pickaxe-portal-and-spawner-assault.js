// programs/406-craft-pickaxe-portal-and-spawner-assault.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Move to base shelter crafting table at (295, 72, -56)
console.log('Moving to base shelter at (294, 72, -55)...');
try {
  await lib.goTo(294, 72, -55, 1, { dig: true, timeoutMs: 12000 });
} catch (e) {
  console.log('Base entry note:', e.message);
}

// 2. Craft sticks and stone_pickaxe
if (lib.count('stick') < 2 && lib.count('*_planks') > 0) {
  try { await lib.craft('stick', 4); } catch (e) {}
}
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (e) {
    console.log('Craft pickaxe note:', e.message);
  }
}

// Equip stone sword
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

console.log('Inventory before portal:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);

// 3. Step directly into purple portal at (299.5, 73.0, -54.0)
console.log('Stepping into purple portal block at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { dig: true, timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// 4. Await Nether dimension transition
console.log('Awaiting Nether teleportation...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(300);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Teleportation not complete.');
  return;
}

bot.chat('delta: In Nether armed with stone_sword! Fast-marching to Spawner Pillbox to claim Milestone 8!');

// 5. Step out of Nether bunker
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1200);
bot.setControlState('forward', false);

// 6. Fast march safe trail to Spawner Pillbox at (36, 66, -187)
const waypoints = [
  new Vec3(46, 65, -7),
  new Vec3(54, 65, -7),
  new Vec3(63, 64, -7),   // Tunnel entrance
  new Vec3(63, 65, -20),  // Inside tunnel
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127), // Fortress Workshop Outpost
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -163),
  new Vec3(44, 65, -174), // Spawner Bridgehead
  new Vec3(37, 65, -177), // Cross-bridge under roof
  new Vec3(36, 66, -187)  // Spawner Pillbox wall where team fights
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 7000 });
  } catch (err) {
    await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 1, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at Spawner Pillbox! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 7. Equip weapon & armor, check drops
try { await lib.pickup(5); } catch (e) {}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 8. Stationary Blaze combat loop with hit-and-heal
console.log('Engaging Blazes through firing slit alongside teammates...');
const combatStart = Date.now();
let lastAttack = 0;
let killed = 0;

while (!isCancelled() && Date.now() - combatStart < 50000) {
  // If health drops below 12, step back under roof to heal
  if (bot.health < 12) {
    console.log(`HP low (${bot.health}/20). Stepping back to (38, 65, -177) to heal...`);
    try { await lib.goTo(38, 65, -177, 1, { timeoutMs: 3000 }); } catch (e) {}
    await sleep(4000);
    try { await lib.goTo(36, 66, -187, 1, { timeoutMs: 3000 }); } catch (e) {}
    continue;
  }
  
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && e.health > 0)
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  
  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    if (dist <= 4.2 && Date.now() - lastAttack > 650) {
      await bot.lookAt(target.position.offset(0, target.height * 0.7, 0), true);
      bot.attack(target);
      lastAttack = Date.now();
      console.log(`Attacked Blaze at dist ${dist.toFixed(1)}m (Blaze HP: ${target.health})`);
      if (target.health <= 0) {
        killed++;
        console.log(`Blaze eliminated! Total: ${killed}`);
      }
    }
  }
  
  if (Math.random() < 0.2) {
    try { await lib.pickup(4); } catch (e) {}
  }
  
  await sleep(150);
}

try { await lib.pickup(5); } catch (e) {}

const currentRods = lib.count('blaze_rod');
console.log(`Combat round complete. Rods in hand: ${currentRods}, HP: ${bot.health}/20`);
bot.chat(`delta: Spawner engagement round complete! Rods in hand: ${currentRods}, HP: ${bot.health}/20`);
