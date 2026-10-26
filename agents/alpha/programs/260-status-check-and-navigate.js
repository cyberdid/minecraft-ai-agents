// programs/260-status-check-and-navigate.js
console.log('=== Program 260: Inspect Status & Players ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'hp:', bot.health, 'food:', bot.food);

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m held=${p.entity.heldItem?.name}`);
  } else {
    console.log(`Player ${name} entity not nearby`);
  }
}

// Check nearby hostiles
const hostiles = Object.values(bot.entities).filter(e => e.type === 'mob' && e.name !== 'sheep' && e.name !== 'cow' && e.name !== 'pig' && e.name !== 'chicken' && bot.entity.position.distanceTo(e.position) < 20);
for (const h of hostiles) {
  console.log(`Hostile: ${h.name} at ${lib.fmt(h.position)} dist=${bot.entity.position.distanceTo(h.position).toFixed(1)}m`);
}

// Ask beta obsidian count
bot.chat('beta: What is your obsidian count? Base portal frame is ready at (298, 72, -54).');

// Wait 4 seconds to listen
await sleep(4000);

console.log('Done 260.');
