// programs/061-hunt-and-quarry-with-gamma.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

await lib.equipWeapon();

// 1. Scan for nearby animals within 40 blocks
const animalNames = ['sheep', 'cow', 'pig', 'chicken'];
const animals = Object.values(bot.entities).filter(e => 
  animalNames.includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 48
).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${animals.length} animals near quarry`);

if (animals.length > 0) {
  const target = animals[0];
  console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    const hr = await lib.hunt(target.name, 1);
    console.log('Hunt result:', JSON.stringify(hr));
  } catch (err) {
    console.log('Hunt note:', err.message);
  }
}

// 2. Scan for iron ore and coal ore
const ironOres = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 32,
  count: 10
});
const coalOres = bot.findBlocks({
  matching: b => b.name === 'coal_ore' || b.name === 'deepslate_coal_ore',
  maxDistance: 32,
  count: 10
});
console.log(`Nearby ores at quarry: iron=${ironOres.length}, coal=${coalOres.length}`);

// Mine iron ore if found
for (const p of ironOres) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  console.log(`Mining iron ore at ${lib.fmt(p)}...`);
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {
    console.log('Dig iron note:', e.message);
  }
}

// Mine coal ore if found
for (const p of coalOres) {
  if (isCancelled() || lib.time().secondsUntilNight < 180 || lib.count('coal') >= 4) break;
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (e) {}
}

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Quarry status: raw_iron=${lib.count('raw_iron')}, coal=${lib.count('coal')}. Teaming up with Gamma!`);
