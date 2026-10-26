// programs/467-check-nether-camp.js
console.log('=== Program 467: Nether Base Camp Status ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = p.entity.position.distanceTo(bot.entity.position);
    console.log(`Player ${name} visible at: ${lib.fmt(p.entity.position)} (dist ${dist.toFixed(1)}m)`);
  } else {
    console.log(`Player ${name} not visible`);
  }
}

// 2. Check nearby chests
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 16, count: 5 });
console.log(`Chests found in Nether camp: ${chests.length}`);
for (const cp of chests) {
  try {
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log(`Chest at ${lib.fmt(cp)}:`, JSON.stringify(contents));
  } catch (e) {}
}

// 3. Check dropped items near camp
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
console.log(`Dropped items near camp (${items.length}):`);
for (const it of items) {
  console.log(`- Item at ${lib.fmt(it.position)}`);
}

bot.chat('beta: Alpha is at Nether Base Camp (40, 65, -7)! Let us unite along East Ridge to mountain breach!');
