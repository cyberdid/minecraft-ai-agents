// programs/541-fast-netherrack-assault.js
console.log('=== Program 541: Fast Gear, Netherrack Mine & Spawner Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(100);

// 1. Step outside base door to grab 2 logs
console.log('Stepping outside for logs...');
await passDoorOut();

try {
  await lib.collect('*_log', 2);
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('Collect log note:', e.message);
}

// 2. Step back inside base to craft tools
try {
  await lib.goTo(294, 72, -52, 1);
  await passDoorIn();
} catch (e) {}

const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  await lib.craft(plankName, logItem.count * 4);
}
console.log('Planks in inv:', lib.count('*_planks'));

if (lib.count('stick') < 4) await lib.craft('stick', 4);
if (!lib.count('wooden_pickaxe')) await lib.craft('wooden_pickaxe', 1);
if (!lib.count('wooden_sword')) await lib.craft('wooden_sword', 1);
await lib.equipWeapon();
console.log('Crafted basic gear. Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 3. Step into Nether portal at (299, 73, -54)
console.log('Exiting base to Nether portal...');
await passDoorOut();

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
bot.chat('alpha: In Nether! Mining netherrack in bunker and advancing along safe z<=-8 trail!');

// 4. Step out of portal into bunker at (40, 65, -8)
await bot.lookAt(new Vec3(40.5, 65.0, -8.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 5. Mine 25 netherrack blocks right here in the bunker
console.log('Mining 25 netherrack for bridge/walls...');
let mined = 0;
while (lib.count('netherrack') < 25 && mined < 30 && !isCancelled()) {
  const nr = bot.findBlock({
    matching: mcData.blocksByName.netherrack.id,
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y >= 64 && b.position.y <= 66
  });
  if (!nr) break;
  try {
    await bot.dig(nr);
    mined++;
    await sleep(50);
  } catch (e) {
    break;
  }
}
await lib.pickup(4);
console.log(`Netherrack in inventory: ${lib.count('netherrack')}`);

// 6. Configure pathfinder to strictly avoid fire, soul fire, and lava
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
bot.pathfinder.setMovements(moves);

// 7. Advance through proven safe waypoints (Beta/Delta route: z <= -8)
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
  new Vec3(37, 65, -181) // Spawner Front
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
bot.chat(`alpha: United at Spawner Front ${lib.fmt(bot.entity.position)} with ${lib.count('netherrack')} netherrack! Breaching Spawner!`);

// 8. Slay Blazes & farm Blaze Rods
await lib.equipWeapon();
for (let r = 0; r < 8; r++) {
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
    bot.chat(`alpha: BLAZE ROD HARVESTED! Total: ${lib.count('blaze_rod')}!`);
    break;
  }
}

console.log('Final inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
