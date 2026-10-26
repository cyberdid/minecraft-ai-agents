// programs/222-craft-stone-gear-and-advance-to-spawner.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.pathfinder.stop();
await sleep(300);

// 1. Craft oak_planks from oak_log
if (lib.count('oak_log') > 0) {
  try {
    await lib.craft('oak_planks', lib.count('oak_log') * 4);
    console.log('Crafted planks! Total:', lib.count('oak_planks'));
  } catch (e) {}
}

// 2. Craft wooden_pickaxe if no stone_pickaxe
if (lib.count('stone_pickaxe') === 0 && lib.count('wooden_pickaxe') === 0) {
  try {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('wooden_pickaxe', 1);
    console.log('Crafted wooden_pickaxe!');
  } catch (e) {}
}

// 3. Mine 5 stone
console.log('Mining 5 stone for stone pickaxe & sword...');
bot.chat('delta: Crafting stone tools and mining 30 cobblestone for Nether spawner battlements...');
try {
  await lib.collect('stone', 5);
} catch (e) {}

// 4. Craft stone_pickaxe and stone_sword
try {
  if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4);
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  }
  if (lib.count('cobblestone') >= 2 && lib.count('stone_sword') === 0) {
    if (lib.count('stick') < 1) await lib.craft('stick', 4);
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  }
} catch (e) {}

// 5. Mine 30 cobblestone with stone pickaxe
if (lib.count('stone_pickaxe') > 0) {
  console.log('Mining 30 building cobblestone with stone pickaxe...');
  try {
    await lib.collect('stone', 30);
    console.log('Cobblestone collected! Total:', lib.count('cobblestone'));
  } catch (e) {}
}

console.log('Inventory before portal:', JSON.stringify(lib.inv()));
console.log('Gear before portal:', JSON.stringify(lib.tools()));

// 6. Walk to Nether portal at (298, 73, -54)
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

// 7. Wait for dimension change
const startDim = bot.game.dimension;
console.log('Inside portal frame, transiting to Nether...');
bot.chat('delta: Inside Nether portal frame! Transiting now with stone tools and cobblestone...');

for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

// 8. Check if in Nether
if (!bot.game.dimension.includes('nether')) {
  console.log('Not yet in Nether, current pos:', lib.fmt(bot.entity.position));
  return;
}

bot.chat(`delta: Arrived in Nether at ${lib.fmt(bot.entity.position)}! Advancing along covered East Ridge tunnel to join Gamma at mountain breach (44, 65, -149).`);
await lib.equipWeapon();

// 9. East Ridge covered tunnel waypoints to mountain breach
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
  new Vec3(44, 65, -149),
  new Vec3(44, 65, -160)
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
bot.chat(`delta: Mountain tunnel reached at ${lib.fmt(bot.entity.position)}! Distance to Blaze Spawner: ${dist.toFixed(1)}m. Cobblestone=${lib.count('cobblestone')}. United with Gamma!`);
