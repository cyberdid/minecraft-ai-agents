// programs/697-request-food-and-check-mobs.js
bot.chat('beta: Please toss 4-6 cooked food to me, my food is 5/20!');

const nearbyAnimals = Object.values(bot.entities).filter(e =>
  e && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
  bot.entity.position.distanceTo(e.position) < 32
);

console.log(`Nearby animals: ${nearbyAnimals.length}`);
for (const a of nearbyAnimals) {
  console.log(`Animal ${a.name} at ${lib.fmt(a.position)} dist=${bot.entity.position.distanceTo(a.position).toFixed(1)}m`);
}

// Check if any teammate dropped food
const groundItems = Object.values(bot.entities).filter(e =>
  e && e.name === 'item' &&
  bot.entity.position.distanceTo(e.position) < 5
);
console.log(`Ground items nearby: ${groundItems.length}`);
for (const gi of groundItems) {
  console.log(`Ground item at ${lib.fmt(gi.position)}`);
}

// Pickup nearby dropped items
try { await lib.pickup(4); } catch (e) {}

// Check if we have any food now
const foods = ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton', 'cooked_chicken', 'apple', 'beef', 'porkchop', 'mutton'];
for (const f of foods) {
  if (lib.count(f) > 0) {
    console.log(`Found ${f} x${lib.count(f)}! Eating...`);
    try { await lib.eat(); } catch (e) {}
  }
}

console.log('Food now:', bot.food, 'HP:', bot.health);
return { food: bot.food, hp: bot.health, inv: lib.inv() };
