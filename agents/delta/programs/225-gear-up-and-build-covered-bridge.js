// programs/225-gear-up-and-build-covered-bridge.js
console.log('Delta pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(300);

// 1. Walk to Base Camp door (294, 73, -54)
console.log('Walking to base door...');
const doorPos = new Vec3(294, 73, -54);
try {
  await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2);
} catch (e) {
  await bot.lookAt(doorPos, true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(4000);
  bot.setControlState('forward', false);
  bot.setControlState('sprint', false);
}

// 2. Enter base shelter through door
const door = bot.blockAt(doorPos) || bot.blockAt(new Vec3(294, 72, -54));
if (door && door.name.includes('door')) {
  try {
    await lib.goThroughDoor(door.position.x, door.position.y, door.position.z);
  } catch (err) {
    await lib.goTo(293, 72, -55, 1);
  }
} else {
  await lib.goTo(293, 72, -55, 1);
}

console.log('Inside base pos:', lib.fmt(bot.entity.position));

// 3. Check chest for cooked food and eat
try {
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    const chest = await bot.openChest(chestBlock);
    const items = chest.containerItems();
    for (const item of items) {
      if (['cooked_porkchop', 'cooked_beef', 'bread', 'apple'].includes(item.name)) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name} x${item.count}`);
      }
    }
    chest.close();
  }
} catch (e) {}

if (bot.food < 20) {
  try {
    await lib.eat();
    console.log('Ate food! Food now:', bot.food);
  } catch (e) {}
}

// 4. Craft planks, sticks, wooden pickaxe
try {
  if (lib.count('oak_log') > 0) await lib.craft('oak_planks', lib.count('oak_log') * 4);
  if (lib.count('stick') < 4) await lib.craft('stick', 4);
  if (lib.count('wooden_pickaxe') === 0 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  }
} catch (e) {}

// 5. Mine 5 stone, craft stone pickaxe & stone sword
console.log('Mining 5 stone for stone pickaxe & sword...');
try {
  await lib.collect('stone', 5);
} catch (e) {}

try {
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  }
  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  }
} catch (e) {}

// 6. Mine 32 cobblestone with stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  console.log('Mining 32 building cobblestone...');
  bot.chat('delta: Mining 32 cobblestone to build covered bridge to Blaze Spawner...');
  try {
    await lib.collect('stone', 32);
    console.log('Cobblestone collected! Total:', lib.count('cobblestone'));
  } catch (e) {}
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));
console.log('Gear before portal:', JSON.stringify(lib.tools()));

// 7. Walk to Nether portal at (298, 73, -54)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(298, 73, -54, 1);
} catch (e) {}

const portalBlock = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 8,
  count: 3
})[0] || new Vec3(298, 73, -54);

try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalBlock.x, portalBlock.y, portalBlock.z));
} catch (e) {
  await lib.goTo(portalBlock.x, portalBlock.y, portalBlock.z, 0);
}

// 8. Wait for dimension change
const startDim = bot.game.dimension;
console.log('Inside portal frame, transiting to Nether...');
bot.chat('delta: Inside Nether portal frame! Transiting now with stone tools and 32 cobblestone...');

for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 9. Check if in Nether
if (!bot.game.dimension.includes('nether')) {
  console.log('Not yet in Nether, current pos:', lib.fmt(bot.entity.position));
  return;
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Advancing through covered tunnel to mountain breach (44, 65, -159).`);
await lib.equipWeapon();

// 10. East Ridge covered tunnel waypoints to mountain tunnel
const ridgeWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(63, 66, -20),
  new Vec3(63, 66, -35),
  new Vec3(62, 67, -50),
  new Vec3(61, 67, -65),
  new Vec3(54, 65, -90),
  new Vec3(44, 66, -127),
  new Vec3(44, 65, -135),
  new Vec3(44, 65, -146),
  new Vec3(44, 65, -150),
  new Vec3(44, 65, -159)
];

for (const wp of ridgeWaypoints) {
  if (isCancelled()) break;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {}

  const hostiles = lib.hostiles(8);
  for (const h of hostiles) {
    if (h.dist < 4 && !['zombified_piglin'].includes(h.name)) {
      try {
        await lib.fight(4, 4);
      } catch (e) {}
    }
  }
}

const spawnerTarget = new Vec3(32, 68, -190);
const dist = bot.entity.position.distanceTo(spawnerTarget);
console.log(`Final pos in Nether: ${lib.fmt(bot.entity.position)}, Distance to Blaze Spawner: ${dist.toFixed(1)}m`);
bot.chat(`delta: Safely stationed at mountain tunnel front ${lib.fmt(bot.entity.position)}! Distance: ${dist.toFixed(1)}m. Cobblestone=${lib.count('cobblestone')}. Ready to seal spawner box!`);
