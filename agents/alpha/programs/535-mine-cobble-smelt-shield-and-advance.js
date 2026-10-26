// programs/535-mine-cobble-smelt-shield-and-advance.js
console.log('=== Program 535: Mine Cobble, Smelt Shield & Advance ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', bot.inventory.items().map(i => `${i.name} x${i.count}`).join(', '));

bot.pathfinder.stop();
await sleep(100);

// 1. Walk directly to the stone cliff at (268, 71, -55)
console.log('Walking to stone cliff at (268, 71, -55)...');
try {
  await lib.goToXZ(268, -55);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(268, 71, -55, 2));
}

console.log('At stone cliff:', lib.fmt(bot.entity.position));

// 2. Find and mine 25 cobblestone
const stoneIds = [
  mcData.blocksByName.stone?.id,
  mcData.blocksByName.andesite?.id,
  mcData.blocksByName.diorite?.id
].filter(Boolean);

const positions = bot.findBlocks({
  matching: stoneIds,
  maxDistance: 16,
  count: 35
});
console.log(`Found ${positions.length} stone blocks in reach.`);

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

// 3. Return to base interior at (294, 72, -55)
console.log('Returning to base interior...');
try {
  await lib.goTo(294, 72, -52, 1);
  await passDoorIn();
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(294.5, 72.0, -55.5, 1));
}

// 4. Craft stone tools at base crafting table (295, 72, -56)
console.log('Crafting stone tools...');
if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone pickaxe!');
}
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
  console.log('Crafted 2 stone swords!');
}
await lib.equipWeapon();

// 5. Check furnace at (295, 72, -55) and smelt/collect iron for Shield
const furnaceBlock = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBlock) {
  try {
    const furnace = await bot.openFurnace(furnaceBlock);
    console.log(`Furnace: in=${furnace.inputItem()?.name} x${furnace.inputItem()?.count}, fuel=${furnace.fuelItem()?.name} x${furnace.fuelItem()?.count}, out=${furnace.outputItem()?.name} x${furnace.outputItem()?.count}`);
    
    if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
      await furnace.takeOutput();
      console.log('Collected iron_ingot from furnace output!');
    } else if (furnace.inputItem() && furnace.inputItem().name === 'raw_iron') {
      const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
      if (plank) {
        console.log('Fueling furnace with 1 plank...');
        await furnace.putFuel(plank.type, null, 1);
        console.log('Waiting for smelting...');
        for (let i = 0; i < 12; i++) {
          await sleep(1000);
          if (furnace.outputItem() && furnace.outputItem().count >= 1) {
            await furnace.takeOutput();
            console.log('Took smelted iron ingot!');
            break;
          }
        }
      }
    }
    await furnace.close();
  } catch (err) {
    console.log('Furnace note:', err.message);
  }
}

// 6. Craft Shield
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
}
await lib.equipArmor();
await lib.equipWeapon();
console.log('Gear equipped! Tools:', JSON.stringify(lib.tools()));

// 7. Step into Nether portal at (299, 73, -54)
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
bot.chat(`alpha: Armed with ${lib.count('shield') ? 'SHIELD' : 'swords'} and ${lib.count('cobblestone')} cobble! Advancing along sealed West corridor to Spawner!`);

// 8. Step out of portal bunker into covered tunnel
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 9. Sprint through safe covered East Ridge tunnel to bridgehead at (44, 65, -174)
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
  new Vec3(44, 65, -165),
  new Vec3(44, 65, -174)
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);
  // Pitch down to y=64 to prevent Enderman gaze
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
