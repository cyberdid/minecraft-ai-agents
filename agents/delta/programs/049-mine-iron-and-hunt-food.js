// programs/049-mine-iron-and-hunt-food.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Scan for animals for food
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 48
);
console.log(`Nearby animals: ${animals.length}`);
if (animals.length > 0) {
  await lib.equipWeapon();
  console.log(`Hunting ${animals[0].name} at ${lib.fmt(animals[0].position)}...`);
  try {
    const hr = await lib.hunt(animals[0].name, 1);
    console.log('Hunt result:', JSON.stringify(hr));
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
}

// 2. Scan for iron ore on East hill
const ironOres = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 32,
  count: 10
});
console.log(`Found ${ironOres.length} iron ore blocks within 32m on East hill`);

for (const p of ironOres) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  console.log(`Mining iron ore at ${lib.fmt(p)}...`);
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (err) {
    console.log('Dig iron error:', err.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

bot.chat(`delta: East hill expedition update: raw_iron=${lib.count('raw_iron')}, food=${bot.food}/20. Mining with Alpha!`);
