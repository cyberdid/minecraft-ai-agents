// programs/235-get-food-and-return-to-base.js
console.log('=== FIND FOOD AND RETURN TO BASE ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Scan for animals or food plants
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position.distanceTo(bot.entity.position) < 60
);
console.log(`Animals within 60m (${animals.length}):`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`));

// Check for sweet berry bushes or crops nearby
const foodBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'sweet_berry_bush' || b.name === 'wheat' || b.name === 'carrots' || b.name === 'potatoes'),
  maxDistance: 32,
  count: 5
});
console.log(`Food blocks nearby (${foodBlocks.length}):`, foodBlocks.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Hunt if animals found
if (animals.length > 0) {
  console.log(`Hunting ${animals[0].name}...`);
  try {
    await lib.hunt(animals[0].name, 2);
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// 2. Return to base house
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 25000 });
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Go to door note:', e.message);
  try {
    await lib.walkTo(294.5, -53.5, 5000);
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}

// 3. Check chest at (293, 72, -57) for food
try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  console.log('\nBase chest contents:');
  for (const item of chest.items()) {
    console.log(` - ${item.name} x${item.count}`);
    if (['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple', 'baked_potato'].includes(item.name)) {
      console.log(`Withdrawing ${item.name}...`);
      await chest.withdraw(item.type, null, item.count);
    }
  }
  await chest.close();
} catch (e) {
  console.log('Chest check note:', e.message);
}

// 4. Smelt any raw meat
const rawMeats = ['beef', 'porkchop', 'mutton', 'chicken'];
for (const rm of rawMeats) {
  const count = lib.count(rm);
  if (count > 0 && lib.count('coal') > 0) {
    console.log(`Smelting ${count} ${rm}...`);
    try {
      await lib.smelt(rm, 'coal', count);
    } catch (e) {
      console.log(`Smelt ${rm} error:`, e.message);
    }
  }
}

// 5. Eat food
try {
  await lib.eat();
} catch (e) {
  console.log('Eat note:', e.message);
}

console.log('Status: Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma at base: HP ${bot.health}/20, Food ${bot.food}/20, cobble x${lib.count('cobblestone')}, ready for Nether bridge`);
