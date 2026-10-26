// programs/534-sleep-rearm-and-nether-advance.js
console.log('=== Program 534: Sleep, Re-arm & Nether Advance ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Time until night:', lib.time().secondsUntilNight);

bot.pathfinder.stop();
await sleep(100);

// 1. If night is approaching or here, sleep in bed to skip night
if (lib.time().secondsUntilNight < 30 || lib.time().canSleep) {
  console.log('Waiting for night / sleeping in bed at (294, 72, -55)...');
  while (!lib.time().canSleep && lib.time().secondsUntilNight > 0) {
    await sleep(1000);
  }
  try {
    await lib.sleepInBed();
    console.log('Slept in bed! Night skipped.');
    bot.chat('alpha: Slept in base bed! Night skipped to dawn.');
  } catch (err) {
    console.log('Sleep attempt note:', err.message);
  }
}

console.log('Daylight remaining:', lib.time().secondsUntilNight);

// 2. Collect 4 logs
console.log('Collecting 4 logs...');
try {
  await lib.collect('*_log', 4);
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('lib.collect note:', e.message);
}

// 3. Return inside base and craft planks and wooden pickaxe
try {
  await lib.goTo(294, 72, -52, 1);
  await passDoorIn();
} catch (e) {}

const logCount = lib.count('*_log');
if (logCount > 0) {
  await lib.craft('birch_planks', logCount * 4);
}
console.log('Planks count:', lib.count('*_planks'));

if (!lib.count('wooden_pickaxe') && !lib.count('stone_pickaxe')) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden pickaxe!');
}

// 4. Mine 25 cobblestone from hillside at x <= 275
console.log('Mining cobblestone on hillside...');
const stoneIds = [
  mcData.blocksByName.stone?.id,
  mcData.blocksByName.andesite?.id,
  mcData.blocksByName.diorite?.id
].filter(Boolean);

const positions = bot.findBlocks({
  matching: stoneIds,
  maxDistance: 24,
  count: 35
});
const hillStone = positions.filter(p => p.x <= 275);
let mined = 0;
for (const sp of hillStone) {
  if (lib.count('cobblestone') >= 25) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    await lib.pickup(3);
    mined++;
  } catch (err) {}
}
console.log(`Mined ${mined} stone. Cobblestone in inv: ${lib.count('cobblestone')}`);

// 5. Return inside base to craft stone tools & shield
try {
  await lib.goTo(294, 72, -52, 1);
  await passDoorIn();
} catch (e) {}

if (lib.count('stick') < 4) await lib.craft('stick', 4);
if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone pickaxe!');
}
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
  console.log('Crafted 2 stone swords!');
}

// Check furnace for smelted iron
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
  } catch (err) {
    console.log('Furnace note:', err.message);
  }
}

if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Gear equipped! Tools:', JSON.stringify(lib.tools()));
console.log('Alpha ready: Cobble =', lib.count('cobblestone'), 'HP =', bot.health);
