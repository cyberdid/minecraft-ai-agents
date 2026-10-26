// programs/004-craft-tools-and-hunt.js
console.log('Time start:', JSON.stringify(lib.time()));

// Craft sticks
if (lib.count('stick') < 8) {
  await lib.craft('stick', 8);
}

// Craft stone tools
if (!lib.count('stone_sword')) {
  await lib.craft('stone_sword', 1);
}
if (!lib.count('stone_pickaxe')) {
  await lib.craft('stone_pickaxe', 1);
}
if (!lib.count('stone_axe')) {
  await lib.craft('stone_axe', 1);
}

await lib.equipWeapon();
console.log('Tools crafted:', JSON.stringify(lib.tools()));

bot.chat('delta: Base chest has no food. Crafting tools done, now hunting animals for meat and wool!');

// Find nearest animal
const animalNames = ['sheep', 'cow', 'pig', 'chicken'];
for (let i = 0; i < 4; i++) {
  if (isCancelled()) break;
  if (lib.time().secondsUntilNight < 90) {
    console.log('Night approaching! Heading to base.');
    break;
  }
  
  // Find closest animal
  const nearby = Object.values(bot.entities)
    .filter(e => animalNames.includes(e.name) && e.position)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (nearby.length === 0) {
    console.log('No animals in immediate view, trying lib.hunt on sheep/cow');
    try {
      await lib.hunt('sheep', 1);
    } catch (e) {
      console.log('Hunt sheep failed:', e.message);
      try {
        await lib.hunt('cow', 1);
      } catch (e2) {
        console.log('Hunt cow failed:', e2.message);
      }
    }
    continue;
  }

  const target = nearby[0];
  console.log(`Hunting nearest animal: ${target.name} at distance ${target.position.distanceTo(bot.entity.position).toFixed(1)}`);
  try {
    const res = await lib.hunt(target.name, 1);
    console.log('Hunt result:', JSON.stringify(res));
  } catch (err) {
    console.log(`Hunt error on ${target.name}:`, err.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Time now:', JSON.stringify(lib.time()));
