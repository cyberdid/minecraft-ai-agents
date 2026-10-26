// programs/522-gear-up-shield-and-enter-nether.js
console.log('=== Program 522: Complete Gear-up, Shield Craft & Nether Transit ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

bot.pathfinder.stop();
await sleep(100);

// 1. Check furnace at (295, 72, -55)
const furnacePos = new Vec3(295, 72, -55);
let hasIron = lib.count('iron_ingot') >= 1;
try {
  await bot.pathfinder.goto(new goals.GoalNear(furnacePos.x, furnacePos.y, furnacePos.z, 2));
  const furnaceBlock = bot.blockAt(furnacePos);
  if (furnaceBlock) {
    const furnace = await bot.openFurnace(furnaceBlock);
    console.log(`Furnace: input=${furnace.inputItem()?.name} x${furnace.inputItem()?.count}, fuel=${furnace.fuelItem()?.name} x${furnace.fuelItem()?.count}, output=${furnace.outputItem()?.name} x${furnace.outputItem()?.count}`);
    if (furnace.outputItem() && furnace.outputItem().name === 'iron_ingot') {
      await furnace.takeOutput();
      console.log('Collected iron_ingot from furnace!');
      hasIron = true;
    }
    await furnace.close();
  }
} catch (e) {
  console.log('Furnace check note:', e.message);
}

// 2. Collect 4 logs using lib.collect
console.log('Collecting 4 logs...');
try {
  await lib.collect('*_log', 4);
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('lib.collect note:', e.message);
}

// 3. Craft planks, sticks, wooden pickaxe
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

// 4. Mine 20 cobblestone from hillside (x <= 275)
console.log('Finding stone blocks on hillside...');
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
console.log(`Found ${hillStone.length} stone blocks on hillside.`);
let mined = 0;
for (const sp of hillStone) {
  if (lib.count('cobblestone') >= 20) break;
  try {
    await lib.dig(sp.x, sp.y, sp.z);
    await lib.pickup(3);
    mined++;
  } catch (err) {
    // continue
  }
}
console.log(`Mined ${mined} stone. Cobblestone in inv: ${lib.count('cobblestone')}`);

// 5. Craft stone pickaxe and 2 stone swords
if (lib.count('stick') < 4) await lib.craft('stick', 4);
if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3) {
  await lib.craft('stone_pickaxe', 1);
  console.log('Crafted stone pickaxe!');
}
if (lib.count('stone_sword') < 2 && lib.count('cobblestone') >= 4) {
  await lib.craft('stone_sword', 2);
  console.log('Crafted 2 stone swords!');
}

// 6. Smelt iron if needed and craft Shield
if (!hasIron && lib.count('iron_ingot') === 0) {
  // Check if furnace has raw_iron waiting for fuel
  try {
    await bot.pathfinder.goto(new goals.GoalNear(furnacePos.x, furnacePos.y, furnacePos.z, 2));
    const furnaceBlock = bot.blockAt(furnacePos);
    if (furnaceBlock) {
      const furnace = await bot.openFurnace(furnaceBlock);
      if (furnace.inputItem() && furnace.inputItem().name === 'raw_iron') {
        const plank = bot.inventory.items().find(i => i.name.endsWith('_planks'));
        if (plank) {
          console.log('Fueling furnace with 1 plank...');
          await furnace.putFuel(plank.type, null, 1);
          console.log('Waiting for iron smelting...');
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
    }
  } catch (err) {
    console.log('Smelt note:', err.message);
  }
}

if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  console.log('SHIELD CRAFTED!');
}

// 7. Equip armor & shield & weapon
await lib.equipArmor();
await lib.equipWeapon();
console.log('Equipped gear! Tools:', JSON.stringify(lib.tools()));

// 8. Step into Nether portal at (299, 73, -54)
console.log('Approaching Nether portal at (299, 73, -54)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(299.5, 72.0, -52.5, 1));
} catch (e) {
  console.log('Portal approach note:', e.message);
}

console.log('Stepping into Nether portal block...');
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

console.log('=== Successfully entered the_nether! ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));
bot.chat(`alpha: Re-armed with stone tools, ${lib.count('cobblestone')} cobble, and ${lib.count('shield') ? 'SHIELD' : 'stone sword'}! Advancing to Spawner!`);
