// programs/416-retrieve-drops-and-request-food.js
console.log('=== Program 416: Retrieve Surface Drops & Request Food ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Move to surface drop at (315, 70, -47)
console.log('Moving to surface drop at (315, 70, -47)...');
try {
  await lib.goTo(315, 70, -47, 2, { timeoutMs: 15000 });
  console.log('Reached drop location! Position:', lib.fmt(bot.entity.position));
  await sleep(300);
  await lib.pickup(10);
  console.log('Inventory after pickup:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Pickup at 315 note:', e.message);
}

// 2. Scan for any more surface drops within 32 blocks (where y >= 64, avoiding aquifer)
const surfaceDrops = Object.values(bot.entities).filter(e => 
  e && (e.name === 'item' || e.type === 'object') && e.position &&
  e.position.y >= 64 && bot.entity.position.distanceTo(e.position) < 32
);
console.log(`Found ${surfaceDrops.length} surface drop(s) nearby:`);
for (const sd of surfaceDrops) {
  console.log(`- Item at ${lib.fmt(sd.position)} (dist: ${bot.entity.position.distanceTo(sd.position).toFixed(1)}m)`);
  try {
    await lib.goTo(sd.position.x, sd.position.y, sd.position.z, 1, { timeoutMs: 8000 });
    await lib.pickup(6);
  } catch (err) {}
}

console.log('Inventory after all surface pickups:', JSON.stringify(lib.inv()));

// 3. If any edible item is in inventory, eat it now!
const allItems = bot.inventory.items();
const edibleNames = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'mutton', 'porkchop', 'rotten_flesh'];
for (const item of allItems) {
  if (edibleNames.includes(item.name)) {
    console.log(`Eating ${item.name} to restore hunger...`);
    await globalThis.safeEat(item.name);
    console.log('Food now:', bot.food, 'Health:', bot.health);
  }
}

// 4. Ask teammates for food in chat
bot.chat('team: Alpha hunger is at 2/20! Beta or Gamma, if you have any food or meat, please drop it at base for Alpha!');

// 5. Return inside base
console.log('Returning inside base...');
try {
  await lib.goTo(294.5, 72, -52, 1, { timeoutMs: 15000 });
  await globalThis.passDoorIn();
  console.log('Safely inside base at:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54); } catch (e2) {}
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Final status:', JSON.stringify(lib.status()));
