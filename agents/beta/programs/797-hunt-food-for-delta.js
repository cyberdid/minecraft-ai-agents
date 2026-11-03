// programs/797-hunt-food-for-delta.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 797: Hunt Food for Delta & Team ===');
console.log('Pos:', lib.fmt(bot.entity.position));

bot.chat('Beta: Delta, hang tight! Hunting fresh steaks and mutton right now to feed you!');

// Find peaceful animals near base
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 45
);
console.log(`Found ${animals.length} animals nearby:`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`).join(', '));

// Equip iron sword
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// Step outside through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

// Hunt 4 animals
let hunted = 0;
for (const aType of ['cow', 'sheep', 'pig']) {
  if (hunted >= 4 || isCancelled()) break;
  try {
    console.log(`Hunting ${aType}...`);
    await lib.hunt(aType, 2);
    hunted += 2;
  } catch (e) {
    console.log(`Hunt ${aType} notice:`, e.message);
  }
}

// Pickup drops
await lib.pickup(8);

console.log('Inventory raw meat:', lib.count('raw_beef') + lib.count('raw_mutton') + lib.count('raw_porkchop'));

// Step back into base to furnace at (295, 72, -55)
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(295, 72, -55, 1.5); } catch (e2) {}
}

// Smelt raw meat in furnace
const rawCount = lib.count('raw_beef') + lib.count('raw_mutton') + lib.count('raw_porkchop');
if (rawCount > 0) {
  console.log(`Smelting ${rawCount} raw meat in furnace...`);
  // Ensure we have fuel: check planks or wood in chest or inv
  if (lib.count('*_planks') < 4 && lib.count('coal') === 0 && lib.count('charcoal') === 0) {
    // Check chest
    const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
    if (chestBlock) {
      try {
        const chest = await bot.openChest(chestBlock);
        const fuel = chest.items().find(i => i.name.endsWith('_planks') || i.name.endsWith('_log') || i.name === 'coal');
        if (fuel) await chest.withdraw(fuel.type, null, Math.min(fuel.count, 6));
        await chest.close();
      } catch (e) {}
    }
  }

  for (const meat of ['raw_beef', 'raw_mutton', 'raw_porkchop']) {
    if (lib.count(meat) > 0) {
      try {
        await lib.smelt(meat, '*_planks', lib.count(meat));
      } catch (e) {
        console.log(`Smelt ${meat} error:`, e.message);
      }
    }
  }
}

// Check total cooked food
const totalCooked = lib.count('cooked_beef') + lib.count('cooked_mutton') + lib.count('cooked_porkchop');
console.log(`Total cooked food ready: ${totalCooked}`);

// Share with Delta if Delta is nearby
const delta = bot.nearestEntity(e => e.type === 'player' && e.username === 'delta');
if (delta && totalCooked > 0) {
  console.log(`Delta is at ${lib.fmt(delta.position)}! Tossing food to Delta...`);
  await bot.lookAt(delta.position.offset(0, 1.4, 0), true);
  const cooked = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop'].includes(i.name));
  if (cooked) {
    const tossCount = Math.ceil(cooked.count / 2);
    try {
      await bot.toss(cooked.type, null, tossCount);
      bot.chat(`Beta: Delta, tossed ${tossCount} cooked steaks/mutton at your feet! Eat up and heal!`);
    } catch (e) {
      console.log('Toss error:', e.message);
    }
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  cooked_food: lib.count('cooked_beef') + lib.count('cooked_mutton') + lib.count('cooked_porkchop')
};
