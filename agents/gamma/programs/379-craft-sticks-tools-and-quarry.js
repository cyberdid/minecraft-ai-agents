// programs/379-craft-sticks-tools-and-quarry.js
console.log('=== CRAFT STICKS, STONE SWORDS & QUARRY COBBLESTONE ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Craft sticks from planks
if (lib.count('stick') < 4 && lib.count('oak_planks') >= 2) {
  console.log('Crafting sticks...');
  await lib.craft('stick', 4);
  console.log('Sticks now:', lib.count('stick'));
}

// 2. Mine cobblestone up to 32 with our stone pickaxe
const cobbleNeeded = Math.max(0, 32 - lib.count('cobblestone'));
if (cobbleNeeded > 0) {
  console.log(`Mining ${cobbleNeeded} cobblestone with stone pickaxe...`);
  await lib.collect('stone', cobbleNeeded);
  console.log('Total cobblestone:', lib.count('cobblestone'));
}

// 3. Craft 2 stone swords
if (lib.count('cobblestone') >= 4 && lib.count('stick') >= 2) {
  console.log('Crafting 2 stone swords...');
  await lib.craft('stone_sword', 2);
  console.log('Stone swords crafted! Count:', lib.count('stone_sword'));
}

// 4. Craft furnace
if (lib.count('cobblestone') >= 8 && lib.count('furnace') === 0) {
  console.log('Crafting furnace...');
  await lib.craft('furnace', 1);
  console.log('Furnace crafted!');
}

// 5. Scan for exposed iron ore
const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 3 });
console.log('Nearby iron ores:', ironOres.map(o => `${o.name} at ${lib.fmt(o.position)}`).join(', ') || 'none');
if (ironOres.length > 0 && ironOres[0].position.y >= 65) {
  try {
    await lib.dig(ironOres[0].position.x, ironOres[0].position.y, ironOres[0].position.z);
    await lib.pickup(4);
    if (lib.count('raw_iron') > 0 && lib.count('oak_planks') >= 6) {
      console.log('Smelting 1 raw iron for shield...');
      await lib.smelt('raw_iron', 'cobblestone', 1); // fallback fuel or planks
    }
  } catch (e) {
    console.log('Iron note:', e.message);
  }
}

// 6. Return to base
console.log('Returning to base shelter...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true, timeoutMs: 10000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -55.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// 7. Equip gear
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped gear! Tools:', JSON.stringify(lib.tools()), 'Offhand:', bot.inventory.slots[45]?.name);
} catch (e) {}

// 8. If night, sleep in bed
const t = lib.time();
console.log(`Time: ${t.timeOfDay}, canSleep: ${t.canSleep}, night in: ${t.secondsUntilNight}s`);
if (t.canSleep || t.timeOfDay >= 12542) {
  console.log('Sleeping in bed...');
  try { await lib.sleepInBed(); } catch (e) {}
}

console.log('Final inv:', JSON.stringify(lib.inv()));
console.log('Ending status:', JSON.stringify(lib.status()));
