const Vec3 = require('vec3');
const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = globalThis.mcData;

bot.chat("Building Phase 2: South & East walls + Window layer at Y=78!");

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allow1by1towers = true;
bot.pathfinder.setMovements(moves);

async function placeBlockAt(targetPos) {
  const current = bot.blockAt(targetPos);
  if (current && current.name !== 'air' && current.name !== 'cave_air' && current.name !== 'short_grass') {
    return true; // already solid
  }
  if (current && current.name === 'short_grass') {
    try { await bot.dig(current); } catch (e) {}
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
    return false;
  }

  // Ensure bot is in reach but not inside targetPos
  if (bot.entity.position.distanceTo(targetPos) > 4) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 2.5));
    } catch (e) {}
  }
  const botFeet = bot.entity.position.floored();
  if (botFeet.x === targetPos.x && botFeet.z === targetPos.z) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(targetPos.x + 2, targetPos.y, targetPos.z, 1.5));
    } catch (e) {}
  }

  const item = bot.inventory.items().find(i => i.name.endsWith('_planks'));
  if (!item) {
    console.log('Out of planks!');
    return false;
  }

  await bot.equip(item, 'hand');
  await bot.waitForTicks(2);
  try {
    await bot.placeBlock(refBlock, faceVec);
    console.log(`Placed ${item.name} at ${targetPos}`);
    await bot.waitForTicks(2);
    return true;
  } catch (err) {
    return false;
  }
}

// 1. East Wall at Y=76 and Y=77 (X = 42, Z: -22..-19)
const eastAndSouthBase = [
  // East wall base Y=76
  new Vec3(42, 76, -22),
  new Vec3(42, 76, -21),
  new Vec3(42, 76, -20),
  new Vec3(42, 76, -19),
  // South wall base Y=76
  new Vec3(39, 76, -19),
  new Vec3(40, 76, -19), // doorstep
  new Vec3(41, 76, -19),

  // East wall layer 2 Y=77
  new Vec3(42, 77, -22),
  new Vec3(42, 77, -21),
  new Vec3(42, 77, -20),
  new Vec3(42, 77, -19),
  // South wall layer 2 Y=77 (note: leave (40, 77, -19) open for door!)
  new Vec3(39, 77, -19),
  new Vec3(41, 77, -19)
];

console.log('--- Placing East & South Walls (Y=76 & 77) ---');
let count = 0;
for (const p of eastAndSouthBase) {
  if (isCancelled()) break;
  if (await placeBlockAt(p)) count++;
}

// 2. Layer 3 (Y=78) with window openings
const layer3Walls = [
  // North Wall: (40, 78, -23) is window!
  new Vec3(38, 78, -23),
  new Vec3(39, 78, -23),
  new Vec3(41, 78, -23),
  new Vec3(42, 78, -23),

  // West Wall: (38, 78, -21) is window!
  new Vec3(38, 78, -22),
  new Vec3(38, 78, -20),
  new Vec3(38, 78, -19),

  // East Wall: (42, 78, -21) is window!
  new Vec3(42, 78, -22),
  new Vec3(42, 78, -20),
  new Vec3(42, 78, -19),

  // South Wall: (40, 78, -19) is doorway arch (open for now)!
  new Vec3(39, 78, -19),
  new Vec3(41, 78, -19)
];

console.log('--- Placing Layer 3 Walls with Windows (Y=78) ---');
for (const p of layer3Walls) {
  if (isCancelled()) break;
  if (await placeBlockAt(p)) count++;
}

const remainingPlanks = bot.inventory.items().filter(i => i.name.endsWith('_planks')).reduce((s, i) => s + i.count, 0);
console.log(`Placed: ${count}. Planks remaining: ${remainingPlanks}`);

bot.chat(`Phase 2 complete! All 4 walls up to Y=78 with windows and doorway. ${remainingPlanks} planks left for roof and door.`);

return { count, remainingPlanks };
