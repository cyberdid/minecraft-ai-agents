// programs/540-craft-tools-mine-cobble-unite-at-bridgehead.js
console.log('=== Program 540: Craft Tools, Mine Cobble & Unite at Bridgehead ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

bot.pathfinder.stop();
await sleep(100);

// 1. Craft planks from whatever log we hold
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  console.log(`Crafting ${plankName}...`);
  await lib.craft(plankName, logItem.count * 4);
}
console.log('Planks count:', lib.count('*_planks'));

// 2. Craft sticks and wooden pickaxe
if (lib.count('stick') < 2) await lib.craft('stick', 4);
if (!lib.count('wooden_pickaxe') && !lib.count('stone_pickaxe')) {
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
}

// 3. Step outside base door to stone cliff (268, 71, -55)
console.log('Stepping outside base door...');
await passDoorOut();

console.log('Walking to stone cliff...');
try {
  await lib.goToXZ(268, -55);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(268, 71, -55, 2));
}

// 4. Mine 25 cobblestone
const stoneIds = [mcData.blocksByName.stone?.id, mcData.blocksByName.andesite?.id, mcData.blocksByName.diorite?.id].filter(Boolean);
const positions = bot.findBlocks({ matching: stoneIds, maxDistance: 16, count: 35 });
let mined = 0;
for (const sp of positions) {
  if (lib.count('cobblestone') >= 25) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    await lib.pickup(3);
    mined++;
  } catch (err) {}
}
console.log(`Mined ${mined} stone. Total cobble: ${lib.count('cobblestone')}`);

// 5. Return inside base to craft stone tools
try {
  await lib.goTo(294, 72, -52, 1);
  await passDoorIn();
} catch (e) {}

if (lib.count('stick') < 4) await lib.craft('stick', 4);
if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
}
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
}

// Check furnace for iron
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
      await furnace.takeOutput();
      console.log('Took iron ingot from furnace!');
    } else if (furnace.inputItem() && furnace.inputItem().name === 'raw_iron') {
      const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plank) {
        await furnace.putFuel(plank.type, null, 1);
        for (let i = 0; i < 12; i++) {
          await sleep(1000);
          if (furnace.outputItem() && furnace.outputItem().count >= 1) {
            await furnace.takeOutput();
            break;
          }
        }
      }
    }
    await furnace.close();
  } catch (err) {}
}

if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
}
await lib.equipArmor();
await lib.equipWeapon();
console.log('Gear equipped! Tools:', JSON.stringify(lib.tools()));

// 6. Step into Nether portal at (299, 73, -54)
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

const start = Date.now();
while (bot.game.dimension !== 'the_nether' && (Date.now() - start < 15000)) {
  await sleep(500);
}

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether. Dim: ${bot.game.dimension}`);
}

console.log('=== In The Nether! ===');
bot.chat(`alpha: In Nether with ${lib.count('shield') ? 'SHIELD' : 'stone sword'} and ${lib.count('cobblestone')} cobble! Sprinting to bridgehead!`);

// 7. Step out of portal into bunker
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 8. Strict y=65 tunnel route to Spawner bridgehead
const waypoints = [
  new Vec3(50, 65, -7),
  new Vec3(63, 65, -7),
  new Vec3(63, 65, -22),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),
  new Vec3(61, 66, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -148),
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -174),
  new Vec3(39, 65, -176) // Spawner Bridgehead
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
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
bot.chat(`alpha: United at Spawner Bridgehead ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble! Ready to breach Spawner!`);
console.log('Final inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));
