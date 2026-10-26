// programs/544-craft-shield-and-blaze-assault.js
console.log('=== Program 544: Craft Shield & Blaze Assault ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.pathfinder.stop();
await sleep(100);

// 1. Enter base shelter
console.log('Walking to base door at (294, 72, -52)...');
try {
  await lib.goTo(294, 72, -52, 1);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
}

await passDoorIn();
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Craft planks and sticks at crafting table (295, 72, -56)
const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (log) {
  await lib.craft(log.name.replace('_log', '_planks'), log.count * 4);
}
console.log('Planks in inv:', lib.count('*_planks'));

if (lib.count('stick') < 4) await lib.craft('stick', 4);

// 3. Craft stone tools
if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone pickaxe!');
}
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
  console.log('Crafted 2 stone swords!');
}
await lib.equipWeapon();

// 4. Check furnace for iron and craft shield
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
      await furnace.takeOutput();
      console.log('Took smelted iron ingot!');
    } else if (furnace.inputItem() && furnace.inputItem().name === 'raw_iron') {
      const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plank) {
        await furnace.putFuel(plank.type, null, 1);
        for (let i = 0; i < 11; i++) {
          await sleep(1000);
          if (furnace.outputItem() && furnace.outputItem().count >= 1) {
            await furnace.takeOutput();
            console.log('Took freshly smelted iron ingot!');
            break;
          }
        }
      }
    }
    await furnace.close();
  } catch (err) {
    console.log('Furnace check note:', err.message);
  }
}

if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipment ready! Tools:', JSON.stringify(lib.tools()));

// 5. Step out of base and enter Nether portal at (299, 73, -54)
console.log('Exiting base to Nether portal...');
await passDoorOut();

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
} catch (e) {}

console.log('Stepping into Nether portal frame...');
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
bot.chat(`alpha: Armed with ${lib.count('shield') ? 'SHIELD (offhand)' : 'stone sword'} and ${lib.count('cobblestone')} cobble! Advancing to Spawner!`);

// 6. Step out of bunker at (40, 65, -8)
await bot.lookAt(new Vec3(40.5, 65.0, -8.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 7. Configure pathfinder fire avoidance
const moves = new Movements(bot, mcData);
if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = false;
bot.pathfinder.setMovements(moves);

// 8. Safe waypoints bypassing soul fire to Spawner Bridgehead
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
  new Vec3(44, 65, -174)
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

console.log('Arrived at Spawner Bridgehead! Pos:', lib.fmt(bot.entity.position));
bot.chat(`alpha: At Spawner Bridgehead ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble! Slaying Blazes!`);

// 9. Scan for Blazes and strike through slit
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
