// programs/512-craft-shield-and-advance.js
console.log('=== Program 512: Craft Shield & Advance to Nether Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

bot.pathfinder.stop();
await sleep(100);

// 1. Setup furnace smelting before leaving to grab a log
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55)) || bot.blockAt(new Vec3(295, 72, -57));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    const rawIron = bot.inventory.items().find(i => i.name === 'raw_iron');
    const fuel = bot.inventory.items().find(i => i.name === 'wooden_pickaxe' || i.name === 'birch_planks');
    if (rawIron && fuel) {
      console.log(`Loading furnace: input=${rawIron.name}, fuel=${fuel.name}...`);
      await furnace.putInput(rawIron.type, null, rawIron.count);
      await furnace.putFuel(fuel.type, null, Math.min(2, fuel.count));
    }
    await furnace.close();
  } catch (e) {
    console.log('Furnace setup note:', e.message);
  }
}

// 2. Step outside to grab 1-2 logs for planks
console.log('Stepping outside to collect 1-2 logs...');
await passDoorOut();

const logs = bot.findBlocks({
  matching: b => b && b.name.endsWith('_log'),
  maxDistance: 32,
  count: 3
});
console.log(`Found ${logs.length} logs nearby.`);
for (const lp of logs) {
  if (lib.count('*_log') >= 2) break;
  try {
    console.log(`Mining log at ${lib.fmt(lp)}...`);
    await lib.dig(lp.x, lp.y, lp.z);
    await lib.pickup(4);
  } catch (err) {
    console.log(`Dig log note: ${err.message}`);
  }
}

// 3. Re-enter base
console.log('Returning inside base...');
try {
  await lib.goTo(294, 72, -52, 1);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
}
await passDoorIn();
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Craft planks
if (lib.count('*_log') > 0) {
  const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
  if (logItem) {
    await lib.craft('birch_planks', logItem.count * 4);
    console.log('Crafted planks! Total planks:', lib.count('*_planks'));
  }
}

// 5. Check furnace and collect iron ingot
if (furnaceBlock) {
  const furnace = await bot.openFurnace(furnaceBlock);
  console.log('Waiting for smelting to complete...');
  for (let i = 0; i < 20; i++) {
    if (furnace.outputItem() && furnace.outputItem().count >= 1) {
      console.log(`Furnace output ready: ${furnace.outputItem().name} x${furnace.outputItem().count}`);
      await furnace.takeOutput();
      break;
    }
    await sleep(1000);
  }
  await furnace.close();
}
console.log('Iron ingots in inv:', lib.count('iron_ingot'));

// 6. Craft Shield
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
} else {
  console.log(`Cannot craft shield yet: ingots=${lib.count('iron_ingot')}, planks=${lib.count('*_planks')}`);
}

// 7. Equip armor & shield
await lib.equipArmor();
await lib.equipWeapon();
console.log('Armor & Offhand equipped!');

// 8. Exit base and step into Nether portal
console.log('Stepping outside to Nether Portal at (299, 73, -54)...');
await passDoorOut();

try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
} catch (e) {
  console.log('Portal approach note:', e.message);
}

console.log('Entering Nether portal frame at (299.5, 73.0, -54.0)...');
await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Inside portal. Waiting for dimension shift to the_nether...');
const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether. Current dim: ${bot.game.dimension}`);
}

console.log('=== In The Nether! ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Armed with shield (offhand), stone gear, and ${lib.count('cobblestone')} cobble! Sprinting to Spawner front!`);

// 9. Step out of portal into Nether bunker
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 10. Sprint through safe covered East Ridge tunnel to Spawner Front
const waypoints = [
  new Vec3(50, 65, -6),
  new Vec3(63, 65, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -161)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // keep pitch low (y=64) to never trigger Enderman gaze
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

console.log('Arrived at Spawner Front bunker! Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
