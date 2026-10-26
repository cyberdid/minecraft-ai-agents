// programs/009-hunt-food-and-wool.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Check for nearby animals from base
const animals = Object.values(bot.entities).filter(e => 
  ['sheep', 'cow', 'pig', 'chicken'].includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 64
).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${animals.length} animals within 64m:`, animals.map(a => `${a.name} at ${lib.fmt(a.position)} (${a.position.distanceTo(bot.entity.position).toFixed(1)}m)`).join(', '));

// Step outside to hunt if safe
const doorPos = new Vec3(294, 72, -54);
if (animals.length > 0 && lib.time().secondsUntilNight > 100) {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
  
  // Hunt up to 3 nearest animals
  for (let i = 0; i < Math.min(3, animals.length); i++) {
    if (isCancelled() || lib.time().secondsUntilNight < 90) break;
    const target = animals[i];
    console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
    try {
      const res = await lib.hunt(target.name, 1);
      console.log('Hunt result:', JSON.stringify(res));
    } catch (err) {
      console.log(`Hunt error for ${target.name}:`, err.message);
    }
  }

  // Return inside base
  console.log('Returning to base...');
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} else {
  console.log('No animals or not enough daylight');
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Time now:', JSON.stringify(lib.time()));

// If we got raw meat, let us smelt it in the furnace!
const rawFood = Object.keys(lib.inv()).find(k => k.startsWith('raw_') || k === 'beef' || k === 'mutton' || k === 'porkchop' || k === 'chicken');
if (rawFood && lib.inv()[rawFood] > 0) {
  console.log(`Smelting ${lib.inv()[rawFood]} of ${rawFood}...`);
  try {
    const smeltRes = await lib.smelt(rawFood, 'oak_planks', lib.inv()[rawFood]);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (err) {
    console.log('Smelt error:', err.message);
  }
}

// Check if we can craft a bed
const woolTypes = Object.keys(lib.inv()).filter(k => k.endsWith('_wool'));
console.log('Wool in inv:', woolTypes.map(w => `${w}: ${lib.count(w)}`));

bot.chat(`delta: Back at base! Inv: ${JSON.stringify(lib.inv())}`);
