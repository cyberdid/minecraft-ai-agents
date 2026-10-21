const Vec3 = require('vec3');
const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = globalThis.mcData;

bot.chat("Building North and West walls of the cabin!");

// 1. Convert remaining dark_oak_log to planks
const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (log) {
  console.log(`Crafting planks from ${log.name}...`);
  await bot.clickWindow(log.slot, 0, 0);
  await bot.waitForTicks(2);
  await bot.clickWindow(1, 0, 0);
  await bot.waitForTicks(2);
  await bot.clickWindow(0, 0, 1);
  await bot.waitForTicks(4);
  if (bot.inventory.slots[1]) await bot.putAway(1);
}

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allow1by1towers = true;
bot.pathfinder.setMovements(moves);

async function placeBlockAt(targetPos, preferredPlank = 'dark_oak_planks') {
  const current = bot.blockAt(targetPos);
  if (current && current.name !== 'air' && current.name !== 'cave_air' && current.name !== 'short_grass') {
    console.log(`Block already solid at ${targetPos}: ${current.name}`);
    return true;
  }
  if (current && current.name === 'short_grass') {
    await bot.dig(current);
  }

  // Find solid neighbor
  const neighbors = [
    { off: new Vec3(0, -1, 0), face: new Vec3(0, 1, 0) },
    { off: new Vec3(1, 0, 0), face: new Vec3(-1, 0, 0) },
    { off: new Vec3(-1, 0, 0), face: new Vec3(1, 0, 0) },
    { off: new Vec3(0, 0, 1), face: new Vec3(0, 0, -1) },
    { off: new Vec3(0, 0, -1), face: new Vec3(0, 0, 1) }
  ];
  let refBlock = null, faceVec = null;
  for (const n of neighbors) {
    const b = bot.blockAt(targetPos.plus(n.off));
    if (b && b.boundingBox === 'block') {
      refBlock = b;
      faceVec = n.face;
      break;
    }
  }
  if (!refBlock) {
    console.log(`No solid neighbor found for ${targetPos}`);
    return false;
  }

  // Ensure bot is in reach but not inside targetPos
  if (bot.entity.position.distanceTo(targetPos) > 4) {
    await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 2.5));
  }
  const botFeet = bot.entity.position.floored();
  if (botFeet.x === targetPos.x && botFeet.z === targetPos.z) {
    await bot.pathfinder.goto(new goals.GoalNear(targetPos.x + 2, targetPos.y, targetPos.z, 1));
  }

  let item = bot.inventory.items().find(i => i.name === preferredPlank);
  if (!item) {
    item = bot.inventory.items().find(i => i.name.endsWith('_planks'));
  }
  if (!item) {
    console.log('Out of planks!');
    return false;
  }

  await bot.equip(item, 'hand');
  await bot.waitForTicks(2);
  try {
    await bot.placeBlock(refBlock, faceVec);
    console.log(`Placed ${item.name} at ${targetPos}`);
    await bot.waitForTicks(3);
    return true;
  } catch (err) {
    console.log(`Place error at ${targetPos}:`, err.message);
    return false;
  }
}

// Foundation blocks (Y=76)
const baseBlocks = [
  // North wall: Z = -23, X: 38..42
  new Vec3(38, 76, -23),
  new Vec3(39, 76, -23),
  new Vec3(40, 76, -23),
  new Vec3(41, 76, -23),
  new Vec3(42, 76, -23),
  // West wall: X = 38, Z: -22..-19
  new Vec3(38, 76, -22),
  new Vec3(38, 76, -21),
  new Vec3(38, 76, -20),
  new Vec3(38, 76, -19)
];

console.log('--- Placing Base Layer (Y=76) ---');
let placedCount = 0;
for (const p of baseBlocks) {
  if (isCancelled()) break;
  const ok = await placeBlockAt(p);
  if (ok) placedCount++;
}

// Second Layer (Y=77)
const layer2Blocks = [
  new Vec3(38, 77, -23),
  new Vec3(39, 77, -23),
  new Vec3(40, 77, -23), // Window space later, solid base for now
  new Vec3(41, 77, -23),
  new Vec3(42, 77, -23),
  new Vec3(38, 77, -22),
  new Vec3(38, 77, -21),
  new Vec3(38, 77, -20),
  new Vec3(38, 77, -19)
];

console.log('--- Placing Layer 2 (Y=77) ---');
for (const p of layer2Blocks) {
  if (isCancelled()) break;
  const ok = await placeBlockAt(p);
  if (ok) placedCount++;
}

const remainingPlanks = bot.inventory.items().filter(i => i.name.endsWith('_planks')).reduce((s, i) => s + i.count, 0);
console.log(`Finished batch. Total placed: ${placedCount}. Planks remaining: ${remainingPlanks}`);

bot.chat(`Placed ${placedCount} wall blocks! North and West walls rising.`);

return { placedCount, remainingPlanks };
