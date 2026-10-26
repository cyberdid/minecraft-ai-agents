// programs/024-hill-hunt-and-mine.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Scan for nearby animals within 30 blocks
const foodAnimals = Object.values(bot.entities)
  .filter(e => e.name && ['chicken', 'cow', 'sheep', 'pig'].includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 30)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${foodAnimals.length} nearby food animals:`, foodAnimals.map(a => `${a.name} at ${lib.fmt(a.position)}`));

for (const a of foodAnimals.slice(0, 3)) {
  console.log(`Attacking ${a.name}...`);
  await lib.equipWeapon();
  try {
    await bot.pathfinder.goto(new goals.GoalNear(a.position.x, a.position.y, a.position.z, 2));
  } catch (e) {}
  const aid = a.id;
  const deadline = Date.now() + 8000;
  while (bot.entities[aid] && Date.now() < deadline && !isCancelled()) {
    await bot.lookAt(a.position.offset(0, a.height * 0.5, 0));
    bot.attack(a);
    await sleep(550);
  }
  await sleep(400);
  await lib.pickup(6);
}

console.log('Inventory after hunt:', JSON.stringify(lib.inv()));

// 2. Scan for ores on this hill
const ironOres = bot.findBlocks({ matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore', maxDistance: 32, count: 20 });
const coalOres = bot.findBlocks({ matching: b => b.name === 'coal_ore' || b.name === 'deepslate_coal_ore', maxDistance: 32, count: 20 });

console.log(`Found ${ironOres.length} iron ores:`, ironOres.map(p => lib.fmt(p)));
console.log(`Found ${coalOres.length} coal ores:`, coalOres.map(p => lib.fmt(p)));

// 3. Mine coal if exposed
for (const p of coalOres.slice(0, 5)) {
  if (lib.count('coal') >= 8) break;
  console.log(`Mining coal at ${lib.fmt(p)}...`);
  try {
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig coal error:', e.message);
  }
}

// 4. Mine iron if exposed
for (const p of ironOres.slice(0, 5)) {
  console.log(`Mining iron at ${lib.fmt(p)}...`);
  try {
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig iron error:', e.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
bot.chat(`gamma on East hill: food=${lib.count('*_beef') + lib.count('*_chicken') + lib.count('*_mutton')}, coal=${lib.count('coal')}, iron=${lib.count('raw_iron')}`);
