// programs/019-hunt-food-near-shaft.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
}

// Find animals near shaft / base
const animalNames = ['cow', 'pig', 'sheep', 'chicken'];
const animals = Object.values(bot.entities).filter(e => 
  animalNames.includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 64
).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${animals.length} animals:`, animals.map(a => `${a.name} at ${lib.fmt(a.position)} (${a.position.distanceTo(bot.entity.position).toFixed(1)}m)`).join(', '));

if (animals.length > 0) {
  await lib.equipWeapon();
  const target = animals[0];
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    const r = await lib.hunt(target.name, 1);
    console.log('Hunt result:', JSON.stringify(r));
  } catch (err) {
    console.log('Hunt error:', err.message);
  }
}

// If we have raw meat, walk to base to smelt
const rawFood = Object.keys(lib.inv()).find(k => 
  ['beef', 'raw_beef', 'porkchop', 'raw_porkchop', 'mutton', 'raw_mutton', 'chicken', 'raw_chicken'].includes(k)
);

if (rawFood && lib.inv()[rawFood] > 0) {
  console.log('Heading to base to smelt...');
  const doorPos = new Vec3(294, 72, -54);
  const door = bot.blockAt(doorPos);
  if (door && !door.getProperties().open) {
    await bot.activateBlock(door);
    await sleep(200);
  }
  await lib.walkTo(294, -56);
  if (door && bot.blockAt(doorPos).getProperties().open) {
    await bot.activateBlock(bot.blockAt(doorPos));
  }
  
  console.log(`Smelting ${lib.inv()[rawFood]} of ${rawFood}...`);
  try {
    await lib.smelt(rawFood, 'oak_planks', lib.inv()[rawFood]);
  } catch (e) {
    console.log('Smelt error:', e.message);
  }

  // Deposit in chest
  const cooked = Object.keys(lib.inv()).filter(k => k.startsWith('cooked_'));
  for (const c of cooked) {
    await lib.deposit({ [c]: 'all' }, 293, 72, -57);
  }
  bot.chat(`delta: Cooked meat deposited in chest for Beta!`);
} else {
  console.log('No raw meat to smelt yet.');
}

console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat('delta: Standing by at portal frame (298, 72, -54). Ready for Beta to assemble & light!');
