// programs/542-obtain-tools-and-assault-spawner.js
console.log('=== Program 542: Obtain Tools & Spawner Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(100);

// 1. Ensure stone_pickaxe and stone_sword using lib.obtain
if (!lib.count('stone_pickaxe')) {
  console.log('Obtaining stone_pickaxe...');
  await lib.obtain('stone_pickaxe', 1);
}

if (lib.count('stone_sword') < 2) {
  console.log('Obtaining 2 stone_swords...');
  await lib.obtain('stone_sword', 2);
}

// 2. Ensure at least 15 cobblestone
if (lib.count('cobblestone') < 15) {
  console.log('Mining 15 cobblestone...');
  await lib.obtain('cobblestone', 15);
}

await lib.equipWeapon();
console.log('Gear ready! Tools:', JSON.stringify(lib.tools()), 'Cobble:', lib.count('cobblestone'));

// 3. Step into Nether portal at (299, 73, -54)
console.log('Approaching Nether portal at (299, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
} catch (e) {}

await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Waiting for dimension shift to the_nether...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether. Current dim: ${bot.game.dimension}`);
}

console.log('=== In The Nether! ===');
bot.chat('alpha: In Nether with stone swords & cobble! Advancing along safe z<=-8 trail to Spawner!');

// 4. Step out of portal bunker into covered tunnel at (40, 65, -8)
await bot.lookAt(new Vec3(40.5, 65.0, -8.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 5. Configure pathfinder to strictly avoid all fire & lava
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
bot.pathfinder.setMovements(moves);

// 6. Safe waypoints bypassing soul fire (Delta/Beta route: z <= -8)
const safeWaypoints = [
  new Vec3(46, 65, -8),
  new Vec3(52, 65, -8),
  new Vec3(63, 64, -8),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -174),
  new Vec3(37, 65, -181) // Spawner Frontline!
];

for (let i = 0; i < safeWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = safeWaypoints[i];
  console.log(`Advancing to WP ${i + 1}/${safeWaypoints.length}: ${lib.fmt(wp)}...`);
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (e) {
    console.log(`WP note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x + 0.5, 64.0, wp.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(400);
    bot.setControlState('forward', false);
  }
}

console.log('Arrived at Spawner Front! Pos:', lib.fmt(bot.entity.position));
bot.chat(`alpha: United at Spawner Front ${lib.fmt(bot.entity.position)}! Slaying Blazes!`);

// 7. Slay Blazes & farm Blaze Rods
await lib.equipWeapon();
for (let r = 0; r < 10; r++) {
  if (isCancelled()) break;
  const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && e.isValid);
  if (blazes.length > 0) {
    const target = blazes[0];
    const d = bot.entity.position.distanceTo(target.position);
    console.log(`Targeting Blaze at ${lib.fmt(target.position)} (dist ${d.toFixed(1)}m)...`);
    if (d <= 4.5) {
      await bot.lookAt(target.position.offset(0, target.height * 0.5, 0), true);
      bot.attack(target);
      await sleep(600);
    }
  } else {
    await sleep(1000);
  }
  await lib.pickup(5);
  if (lib.count('blaze_rod') > 0) {
    console.log(`Blaze Rods collected: ${lib.count('blaze_rod')}!`);
    bot.chat(`alpha: BLAZE ROD HARVESTED! Total: ${lib.count('blaze_rod')}! Milestone 8 underway!`);
    break;
  }
}

console.log('Final inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
