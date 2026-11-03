// programs/702-surface-base-and-shield.js
console.log('=== Program 702: Enter Base, Lock Bed Spawn, & Find Iron/Shield ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Walk on surface to base entrance at (294, 72, -53)
console.log('Moving to base door at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1.5, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo door note:', e.message);
  try { await lib.goToXZ(294, -53, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('At base door area. Pos:', lib.fmt(bot.entity.position));

// Check door
const doorBlock = bot.findBlock({ matching: b => b && b.name.includes('door'), maxDistance: 5 });
if (doorBlock) {
  console.log(`Found door at ${lib.fmt(doorBlock.position)}: ${doorBlock.name}`);
  try {
    await lib.goThroughDoor(doorBlock.position.x, doorBlock.position.y, doorBlock.position.z);
    console.log('Stepped through door into base!');
  } catch (e) {
    console.log('Door passage note:', e.message);
  }
}

// 2. Lock bed spawn
const bed = bot.findBlock({ matching: b => b && b.name.includes('bed'), maxDistance: 6 });
if (bed) {
  console.log(`Found bed at ${lib.fmt(bed.position)}: ${bed.name}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(bed.position.x, bed.position.y, bed.position.z, 1.5));
    await lib.setSpawn();
    console.log('Bed spawn permanently locked!');
  } catch (e) {
    console.log('setSpawn note:', e.message);
  }
}

// 3. Inspect all chests in base
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 10 });
console.log(`Found ${chests.length} chests in base area:`);
for (const cp of chests) {
  try {
    const cb = bot.blockAt(cp);
    const chest = await bot.openChest(cb);
    console.log(`Chest at ${lib.fmt(cp)} contents:`);
    for (const item of chest.items()) {
      console.log(`- ${item.name} x${item.count}`);
      if (item.name.includes('iron') || item.name.includes('shield') || item.name.includes('gold') || item.name.includes('cooked')) {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        await chest.withdraw(item.type, null, item.count);
      }
    }
    await chest.close();
  } catch (e) {
    console.log(`Chest at ${lib.fmt(cp)} error:`, e.message);
  }
}

// 4. Craft shield if iron ingot + planks available
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    console.log('Crafted shield!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

try { await lib.equipArmor(); } catch (e) {}
console.log('Inv after base prep:', JSON.stringify(lib.inv()));
