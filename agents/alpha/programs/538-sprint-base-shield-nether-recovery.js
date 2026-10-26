// programs/538-sprint-base-shield-nether-recovery.js
console.log('=== Program 538: Sprint to Base, Shield Up, Nether Recovery ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Daylight remaining:', lib.time().secondsUntilNight);

bot.pathfinder.stop();
await sleep(100);

bot.chat('alpha: Sprinting East from spawn to base camp at (294, 72, -55)!');

// 1. Sprint East across Overworld to Base Camp
const overworldWaypoints = [
  new Vec3(160, 64, -40),
  new Vec3(210, 64, -45),
  new Vec3(260, 63, -50),
  new Vec3(290, 72, -54)
];

for (let i = 0; i < overworldWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = overworldWaypoints[i];
  console.log(`Heading to WP ${i + 1}/${overworldWaypoints.length}: ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 3));
  } catch (e) {
    console.log(`Path note to ${lib.fmt(wp)}: ${e.message}`);
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(2200);
    bot.setControlState('forward', false);
    bot.setControlState('sprint', false);
  }
}

console.log('Arrived outside base at:', lib.fmt(bot.entity.position));

// 2. Step inside base through door at (294, 72, -54)
try {
  await passDoorIn();
} catch (e) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (err) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Set spawn on bed
try {
  await lib.setSpawn();
  console.log('Spawn set at base bed!');
} catch (e) {
  console.log('Bed spawn note:', e.message);
}

// 4. Check furnace at (295, 72, -55) and chest at (293, 72, -57)
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem()) {
      console.log(`Took ${furnace.outputItem().name} x${furnace.outputItem().count} from furnace!`);
      await furnace.takeOutput();
    }
    await furnace.close();
  } catch (e) {}
}

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    for (const item of chest.containerItems()) {
      if (item.name.includes('iron') || item.name.includes('shield') || item.name.includes('sword') || item.name.includes('pickaxe') || item.name.includes('cobble')) {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        await chest.withdraw(item.type, null, item.count);
      }
    }
    await chest.close();
  } catch (e) {}
}

// 5. If we have iron and planks, craft shield
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  await lib.craft('shield', 1);
  console.log('Shield crafted!');
}
await lib.equipArmor();
await lib.equipWeapon();
console.log('Gear equipped! Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

// 6. Step outside to Nether portal at (299, 73, -54)
console.log('Exiting base to Nether Portal at (299, 73, -54)...');
await passDoorOut();

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
} catch (e) {}

console.log('Entering Nether portal frame at (299.5, 73.0, -54.0)...');
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
console.log('Alpha at:', lib.fmt(bot.entity.position));
bot.chat('alpha: In Nether! Rushing to recover dropped gear at z=-21 and reinforce bridgehead!');

// 7. Step out of portal bunker into covered tunnel
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 8. Sprint to z=-21 to recover dropped gear (19 cobble, stone swords, pickaxe)
console.log('Moving through tunnel to recover drop at (63.3, 65.0, -21.8)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(63, 65, -21, 2));
} catch (e) {
  await bot.lookAt(new Vec3(63.5, 65.0, -21.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

const picked = await lib.pickup(8);
console.log(`Recovered drop! Picked: ${picked}. Cobblestone: ${lib.count('cobblestone')}`);
await lib.equipArmor();
await lib.equipWeapon();

// 9. Advance along the safe covered East Ridge tunnel to bridgehead at (44, 65, -174)
const netherWaypoints = [
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -174)
];

for (let i = 0; i < netherWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = netherWaypoints[i];
  console.log(`Advancing to WP ${i + 1}/${netherWaypoints.length}: ${lib.fmt(wp)}...`);
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
console.log('Final inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
