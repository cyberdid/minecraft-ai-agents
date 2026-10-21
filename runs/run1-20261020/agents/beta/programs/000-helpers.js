const { Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data')(bot.version);

globalThis.mcData = mcData;

globalThis.clearCraftingGrid = async function() {
  for (let s = 1; s <= 4; s++) {
    if (bot.inventory.slots[s]) {
      try {
        await bot.putAway(s);
        await bot.waitForTicks(2);
      } catch (e) {}
    }
  }
};

globalThis.initPathfinder = function() {
  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allow1by1towers = true;
  moves.scaffoldingBlocks = [
    mcData.blocksByName.dirt?.id,
    mcData.blocksByName.cobblestone?.id,
    mcData.blocksByName.oak_planks?.id
  ].filter(Boolean);
  bot.pathfinder.setMovements(moves);
  return moves;
};

globalThis.goTo = async function(target, range = 1.5) {
  globalThis.initPathfinder();
  let x, y, z;
  if (target.x !== undefined) {
    x = target.x; y = target.y; z = target.z;
  } else if (Array.isArray(target)) {
    [x, y, z] = target;
  }
  const goal = new goals.GoalNear(x, y, z, range);
  await bot.pathfinder.goto(goal);
};

globalThis.collectDrops = async function(radius = 10) {
  const drops = Object.values(bot.entities).filter(e => {
    if (!e || e.name !== 'item' || !e.position) return false;
    return e.position.distanceTo(bot.entity.position) <= radius;
  });
  for (const item of drops) {
    if (isCancelled()) break;
    try {
      await globalThis.goTo(item.position, 0.8);
      await bot.waitForTicks(3);
    } catch (err) {}
  }
};

globalThis.equipBestTool = async function(block) {
  const items = bot.inventory.items();
  if (items.length === 0) return;
  const bName = block.name;
  let toolSuffix = null;
  if (bName.includes('log') || bName.includes('wood') || bName.includes('planks')) toolSuffix = '_axe';
  else if (bName.includes('stone') || bName.includes('cobble') || bName.includes('ore') || bName.includes('granite') || bName.includes('diorite') || bName.includes('andesite')) toolSuffix = '_pickaxe';
  else if (bName.includes('dirt') || bName.includes('grass') || bName.includes('sand') || bName.includes('gravel')) toolSuffix = '_shovel';

  if (toolSuffix) {
    const tool = items.find(i => i.name.endsWith(toolSuffix));
    if (tool) {
      await bot.equip(tool, 'hand');
      return;
    }
  }
};

globalThis.digBlockAt = async function(pos) {
  const block = bot.blockAt(pos);
  if (!block || block.name === 'air' || block.name === 'cave_air') return false;
  if (bot.entity.position.distanceTo(block.position.offset(0.5, 0.5, 0.5)) > 4) {
    await globalThis.goTo(block.position, 2.5);
  }
  await globalThis.equipBestTool(block);
  await bot.lookAt(block.position.offset(0.5, 0.5, 0.5));
  await bot.dig(block);
  await bot.waitForTicks(2);
  await globalThis.collectDrops(5);
  return true;
};

globalThis.getNearbyHostiles = function(radius = 16) {
  const hostiles = ['zombie', 'skeleton', 'creeper', 'spider', 'witch', 'drowned', 'enderman'];
  return Object.values(bot.entities).filter(e => {
    if (!e || !e.position) return false;
    const isHostile = hostiles.includes(e.name?.toLowerCase());
    const dist = e.position.distanceTo(bot.entity.position);
    return isHostile && dist <= radius;
  });
};

console.log('Helpers updated on beta globalThis.');
