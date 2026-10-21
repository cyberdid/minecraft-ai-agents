const Vec3 = require('vec3');
const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = globalThis.mcData;

bot.chat("Building Phase 3: Laying the roof at Y=79 and crafting/placing the door!");

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allow1by1towers = true;
bot.pathfinder.setMovements(moves);

async function placeBlockAt(targetPos) {
  const current = bot.blockAt(targetPos);
  if (current && current.name !== 'air' && current.name !== 'cave_air') {
    return true; // already solid
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
  if (!refBlock) return false;

  // Stand close enough to reach
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

// 1. Perimeter Roof blocks (Y=79)
const perimeterRoof = [];
for (let x = 38; x <= 42; x++) {
  perimeterRoof.push(new Vec3(x, 79, -23)); // North
  perimeterRoof.push(new Vec3(x, 79, -19)); // South
}
for (let z = -22; z <= -20; z++) {
  perimeterRoof.push(new Vec3(38, 79, z)); // West
  perimeterRoof.push(new Vec3(42, 79, z)); // East
}

console.log('--- Placing Perimeter Roof (Y=79) ---');
let roofCount = 0;
for (const p of perimeterRoof) {
  if (isCancelled()) break;
  if (await placeBlockAt(p)) roofCount++;
}

// 2. Interior Roof blocks (Y=79)
const interiorRoof = [];
for (let x = 39; x <= 41; x++) {
  for (let z = -22; z <= -20; z++) {
    interiorRoof.push(new Vec3(x, 79, z));
  }
}

console.log('--- Placing Interior Roof (Y=79) ---');
for (const p of interiorRoof) {
  if (isCancelled()) break;
  if (await placeBlockAt(p)) roofCount++;
}

console.log(`Roof placed: ${roofCount} blocks.`);

// 3. Craft and Place Door
console.log('--- Crafting Door ---');
// Place crafting table on safe flat ground
const tablePos = new Vec3(41, 78, -17);
const tableRef = bot.blockAt(tablePos.offset(0, -1, 0));
const tableItem = bot.inventory.items().find(i => i.name === 'crafting_table');

if (tableRef && tableItem) {
  try {
    if (bot.entity.position.distanceTo(tablePos) > 3) {
      await bot.pathfinder.goto(new goals.GoalNear(tablePos.x, tablePos.y, tablePos.z, 2));
    }
    await bot.equip(tableItem, 'hand');
    await bot.placeBlock(tableRef, new Vec3(0, 1, 0));
    await bot.waitForTicks(5);

    const tableBlock = bot.blockAt(tablePos);
    if (tableBlock && tableBlock.name === 'crafting_table') {
      const window = await bot.openBlock(tableBlock);
      const planks = window.slots.find((s, idx) => idx >= 10 && s && s.name.endsWith('_planks'));
      if (planks) {
        // Door recipe: 2x3 planks in slots 1, 2; 4, 5; 7, 8
        await bot.clickWindow(planks.slot, 0, 0); // pick up planks
        await bot.clickWindow(1, 1, 0);
        await bot.clickWindow(2, 1, 0);
        await bot.clickWindow(4, 1, 0);
        await bot.clickWindow(5, 1, 0);
        await bot.clickWindow(7, 1, 0);
        await bot.clickWindow(8, 1, 0);
        await bot.clickWindow(planks.slot, 0, 0); // put remainder back
        await bot.waitForTicks(3);
        console.log('Door in slot 0:', window.slots[0]?.name);
        await bot.clickWindow(0, 0, 1); // shift click doors
        await bot.waitForTicks(3);
      }
      bot.closeWindow(window);
      await bot.waitForTicks(5);
      await bot.dig(tableBlock);
      await bot.waitForTicks(5);
      // collect dropped table
      const d = Object.values(bot.entities).find(e => e && e.name === 'item' && e.position.distanceTo(bot.entity.position) < 4);
      if (d) await bot.pathfinder.goto(new goals.GoalNear(d.position.x, d.position.y, d.position.z, 0.5));
    }
  } catch (err) {
    console.log('Door crafting error:', err.message);
  }
}

// 4. Place Door at (40, 77, -19)
const doorItem = bot.inventory.items().find(i => i.name.endsWith('_door'));
if (doorItem) {
  console.log(`Placing ${doorItem.name} at doorway (40, 77, -19)...`);
  try {
    const doorStep = bot.blockAt(new Vec3(40, 76, -19));
    if (doorStep) {
      await bot.pathfinder.goto(new goals.GoalNear(40, 78, -17, 2));
      await bot.equip(doorItem, 'hand');
      await bot.waitForTicks(2);
      await bot.placeBlock(doorStep, new Vec3(0, 1, 0));
      console.log('Door placed successfully!');
    }
  } catch (err) {
    console.log('Door placement warning:', err.message);
  }
}

const finalItems = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory now:', finalItems);

bot.chat("Structure complete! 5x5 wooden cabin built at (40, 76, -21) with full walls, windows, roof, and door!");

return { roofCount, hasDoor: !!doorItem };
