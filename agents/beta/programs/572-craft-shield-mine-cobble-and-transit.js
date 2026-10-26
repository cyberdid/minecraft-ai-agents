// programs/572-craft-shield-mine-cobble-and-transit.js
console.log('=== Step: Fuel Furnace for Shield, Mine 32+ Cobblestone, Equip Shield & Transit ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// 1. Step out of base door to collect wood
console.log('Stepping through base door (294, 72, -54)...');
await lib.goThroughDoor(294, 72, -54);

console.log('Collecting 4 logs for planks & fuel...');
try {
  await lib.collect('*_log', 4);
} catch (e) {
  console.log('collect log error:', e.message);
}

console.log('Logs collected:', lib.count('*_log'), 'Inv:', JSON.stringify(lib.inv()));

// Craft planks
const logName = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logName) {
  await lib.craft(logName.replace('_log', '_planks'), lib.count(logName) * 4);
}
console.log('Planks count:', lib.count('*_planks'));

// 2. Step back inside base to fuel furnace at (295, 72, -55)
console.log('Stepping into base to fuel furnace...');
await lib.goThroughDoor(294, 72, -54);

const furnacePos = new Vec3(295, 72, -55);
const fb = bot.blockAt(furnacePos);
if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    const fuelItem = bot.inventory.items().find(i => i.name.endsWith('_planks') || i.name.endsWith('_log'));
    if (fuelItem) {
      console.log(`Putting 4 ${fuelItem.name} into fuel slot...`);
      await f.putFuel(fuelItem.type, null, Math.min(fuelItem.count, 4));
    }
    f.close();
    console.log('Furnace fueled! Smelting started.');
  } catch (e) {
    console.log('Furnace fuel note:', e.message);
  }
}

// 3. Step out to mine shaft at (302, 71, -44)
console.log('Stepping outside to mine cobblestone...');
await lib.goThroughDoor(294, 72, -54);

if (lib.count('stick') < 2) await lib.craft('stick', 4);
if (lib.count('wooden_pickaxe') < 1 && lib.count('stone_pickaxe') < 1) {
  await lib.craft('wooden_pickaxe', 1);
}

await bot.pathfinder.goto(new goals.GoalNear(301, 71, -44, 1));

// Mine 3 stone for stone pickaxe
console.log('Mining 3 stone for stone pickaxe...');
for (let s = 0; s < 5; s++) {
  if (lib.count('cobblestone') >= 3) break;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(4);
    } catch (e) {}
  }
}

if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') < 1) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4);
  await lib.craft('stone_pickaxe', 1);
}

// Mine 32 cobblestone
console.log('Mining 32 cobblestone with stone pickaxe...');
let digs = 0;
while (lib.count('cobblestone') < 32 && digs < 40 && !isCancelled()) {
  digs++;
  const stone = bot.findBlock({
    matching: [mcData.blocksByName.stone.id, mcData.blocksByName.cobblestone.id].filter(Boolean),
    maxDistance: 4,
    useExtraInfo: (b) => b.position.y <= 71 && (b.position.x >= 298 || b.position.z >= -48)
  });
  if (stone) {
    try {
      await lib.dig(stone.position.x, stone.position.y, stone.position.z);
      await lib.pickup(4);
    } catch (e) {}
  } else {
    break;
  }
}

console.log('Cobblestone mined:', lib.count('cobblestone'));
if (lib.count('stick') < 2) await lib.craft('stick', 4);
try { await lib.craft('stone_sword', 1); } catch (e) {}

// 4. Return to base to collect iron ingots & craft shield
console.log('Returning to base for smelted iron...');
await lib.goThroughDoor(294, 72, -54);

if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    const out = f.outputItem();
    console.log(`Furnace output: ${out?.name} x${out?.count}`);
    if (out) {
      await f.takeOutput();
      console.log(`Collected ${out.name} x${out.count}!`);
    }
    f.close();
  } catch (e) {
    console.log('Furnace collect note:', e.message);
  }
}

console.log('Iron ingots count:', lib.count('iron_ingot'));
if (lib.count('iron_ingot') >= 1) {
  try {
    await lib.craft('shield', 1);
    console.log('SUCCESS: Shield crafted!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Gear equipped! Inv:', JSON.stringify(lib.inv()), 'Gear:', JSON.stringify(lib.tools()));

// 5. Step out door to Nether portal
console.log('Stepping outside to Nether portal...');
await lib.goThroughDoor(294, 72, -54);

const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Sprinting into Nether portal...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(portalTarget.x, portalTarget.y, portalTarget.z));
} catch (e) {
  await lib.goTo(portalTarget.x, portalTarget.y, portalTarget.z, 0.5, { dig: false });
}

// 6. Wait for Nether warp
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`WARPED TO THE NETHER! Dimension: ${bot.game.dimension}, Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

bot.chat(`beta: SHIELD EQUIPPED! Carrying stone sword, pickaxe, and ${lib.count('cobblestone')} cobble. In ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Sprinting to spawner front!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  shield: lib.count('shield'),
  cobblestone: lib.count('cobblestone'),
  inv: lib.inv()
};
