// programs/544-night-skip-and-cook.js
console.log('=== Step: Night Skip with Team & Morning Regroup ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();

// 1. Wait until tick 12541 (nightfall)
console.log(`Waiting for nightfall (current: ${bot.time.timeOfDay}, target: 12541)...`);
while (bot.time.timeOfDay < 12541 || bot.time.timeOfDay > 23458) {
  if (isCancelled()) break;
  await sleep(1000);
}

console.log(`Nightfall reached! timeOfDay: ${bot.time.timeOfDay}. Finding bed to sleep...`);

// 2. Find available bed
const beds = bot.findBlocks({ matching: b => b.name.includes('bed'), maxDistance: 5, count: 5 });
console.log(`Found ${beds.length} beds:`, beds.map(p => lib.fmt(p)));

let slept = false;
for (const bp of beds) {
  const bBlock = bot.blockAt(bp);
  console.log(`Trying bed at ${lib.fmt(bp)}...`);
  try {
    await bot.sleep(bBlock);
    console.log(`SUCCESS: Sleeping in bed at ${lib.fmt(bp)}!`);
    slept = true;
    break;
  } catch (err) {
    console.log(`Bed at ${lib.fmt(bp)} note:`, err.message);
  }
}

if (slept) {
  console.log('Waiting for dawn...');
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    console.log(`Sleep check: timeOfDay=${bot.time.timeOfDay}, isSleeping=${bot.isSleeping}`);
    if (bot.time.timeOfDay < 1000 || bot.time.timeOfDay >= 23458) {
      console.log('DAWN REACHED!');
      break;
    }
  }
}

if (bot.isSleeping) {
  try { await bot.wake(); } catch (e) {}
}

// Lock spawn point
try { await lib.setSpawn(); } catch (e) {}

// Check furnaces for cooked food
const furnaceIds = [mcData.blocksByName.furnace.id, mcData.blocksByName.lit_furnace?.id].filter(Boolean);
const furnaces = bot.findBlocks({ matching: furnaceIds, maxDistance: 6, count: 5 });
for (const fp of furnaces) {
  try {
    const f = await bot.openFurnace(bot.blockAt(fp));
    if (f.outputItem()) {
      console.log(`Taking furnace output: ${f.outputItem().name} x${f.outputItem().count}`);
      try { await f.takeOutput(); } catch (e) {}
    }
    await f.close();
  } catch (e) {}
}

// Check chests for tools or food
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
for (const cp of chests) {
  try {
    const c = await bot.openChest(bot.blockAt(cp));
    const items = c.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'cobblestone', 'cooked_porkchop', 'cooked_beef', 'bread'].includes(it.name)) {
        try { await c.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await c.close();
  } catch (e) {}
}

// Eat if food in inventory and food < 20
const foodItem = bot.inventory.items().find(i => ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple'].includes(i.name));
if (foodItem && bot.food < 20) {
  try {
    await bot.equip(foodItem, 'hand');
    await bot.consume();
    console.log('Ate food! New food level:', bot.food);
  } catch (e) {}
}

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== 'beta') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Final Inventory:', inv || 'empty');
console.log('Final Pos:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay, 'HP:', bot.health);
bot.chat(`beta: Awake at dawn with team! Time=${bot.time.timeOfDay}. Geared: (${inv}). Ready to advance!`);

return {
  timeOfDay: bot.time.timeOfDay,
  inv
};
