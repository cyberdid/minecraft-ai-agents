// programs/539-sleep-rearm-and-tunnel-advance.js
console.log('=== Program 539: Sleep, Re-arm & Tunnel Advance ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Time until night:', lib.time().secondsUntilNight);

bot.pathfinder.stop();
await sleep(100);

// 1. Enter base shelter
console.log('Entering base shelter at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -52, 1);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -52, 2));
}

await passDoorIn();
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Sleep in bed if night is here or close
if (lib.time().secondsUntilNight < 30 || lib.time().canSleep) {
  console.log('Sleeping in bed to skip night...');
  while (!lib.time().canSleep && lib.time().secondsUntilNight > 0) {
    await sleep(1000);
  }
  try {
    await lib.sleepInBed();
    console.log('Slept in bed! Dawn reset.');
    bot.chat('alpha: Slept in base bed! Dawn reset.');
  } catch (err) {
    console.log('Sleep note:', err.message);
  }
}

// 3. Harvest 3 logs outside
console.log('Stepping outside for 3 logs...');
await passDoorOut();
try {
  await lib.collect('*_log', 3);
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('Collect log note:', e.message);
}

// 4. Return inside base, craft planks & wooden pickaxe
try {
  await lib.goTo(294, 72, -52, 1);
  await passDoorIn();
} catch (e) {}

const logs = lib.count('*_log');
if (logs > 0) await lib.craft('birch_planks', logs * 4);
if (!lib.count('wooden_pickaxe') && !lib.count('stone_pickaxe')) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
}

// 5. Step out and mine 20 cobblestone at cliff (268, 71, -55)
await passDoorOut();
console.log('Walking to stone cliff...');
try {
  await lib.goToXZ(268, -55);
} catch (e) {
  await bot.pathfinder.goto(new goals.GoalNear(268, 71, -55, 2));
}

const stoneIds = [mcData.blocksByName.stone?.id, mcData.blocksByName.andesite?.id, mcData.blocksByName.diorite?.id].filter(Boolean);
const positions = bot.findBlocks({ matching: stoneIds, maxDistance: 16, count: 30 });
let mined = 0;
for (const sp of positions) {
  if (lib.count('cobblestone') >= 20) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    await lib.pickup(3);
    mined++;
  } catch (err) {}
}
console.log(`Mined ${mined} cobblestone. Total: ${lib.count('cobblestone')}`);

// 6. Return inside base to craft stone tools & shield
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

// Furnace smelting for shield
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

// 7. Step into Nether portal at (299, 73, -54)
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
bot.chat(`alpha: In Nether with ${lib.count('shield') ? 'SHIELD' : 'swords'} and ${lib.count('cobblestone')} cobble! Advancing through safe tunnel!`);

// 8. Step out of portal into bunker
await bot.lookAt(new Vec3(40.5, 65.0, -5.0), true);
bot.setControlState('forward', true);
await sleep(600);
bot.setControlState('forward', false);

// 9. Follow strict y=65 tunnel route through soul sand hill!
const strictTunnelWaypoints = [
  new Vec3(50, 65, -7),
  new Vec3(63, 65, -7),  // Tunnel mouth at y=65
  new Vec3(63, 65, -22), // Tunnel exit at y=65
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

for (let i = 0; i < strictTunnelWaypoints.length; i++) {
  if (isCancelled()) break;
  const wp = strictTunnelWaypoints[i];
  console.log(`Advancing to WP ${i + 1}/${strictTunnelWaypoints.length}: ${lib.fmt(wp)}...`);
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
