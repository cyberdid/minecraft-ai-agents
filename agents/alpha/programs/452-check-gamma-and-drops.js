// programs/452-check-gamma-and-drops.js
console.log('=== Program 452: Check Gamma & Drops ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check nearby entities (players & items)
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const dist = p.entity.position.distanceTo(bot.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist ${dist.toFixed(1)}m)`);
  }
}

const drops = Object.values(bot.entities).filter(e => e.name === 'item');
console.log(`Found ${drops.length} dropped items nearby`);
for (const d of drops) {
  const dist = d.position.distanceTo(bot.entity.position);
  console.log(`Dropped item at ${lib.fmt(d.position)} (dist ${dist.toFixed(1)}m)`);
}

// 2. Check base chest again in case Gamma deposited anything
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest:', JSON.stringify(chest));
  const toWithdraw = {};
  for (const k of ['stone_pickaxe', 'stone_sword', 'cobblestone', 'iron_pickaxe', 'iron_sword', 'bread']) {
    if (chest[k] > 0) toWithdraw[k] = chest[k];
  }
  if (Object.keys(toWithdraw).length > 0) {
    await lib.withdraw(toWithdraw, 293, 72, -57);
    console.log('Withdrew from chest:', JSON.stringify(toWithdraw));
  }
} catch (e) {
  console.log('Chest check note:', e.message);
}

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
