// programs/355-eat-bread-and-hunt.js
console.log('=== EAT BREAD AND HUNT ===');
console.log('Food before:', bot.food, 'HP:', bot.health, 'Holding:', bot.heldItem?.name);

// Step 1: Consume bread
try {
  const breadId = mcData.itemsByName.bread.id;
  await bot.equip(breadId, 'hand');
  await bot.consume();
  console.log('Consumed bread successfully! Food now:', bot.food);
} catch (e) {
  console.log('Bread consume note:', e.message);
  try { await lib.eat(); } catch (e2) {}
}
console.log('Food after eating bread:', bot.food, 'HP:', bot.health);

// Step 2: Scan for all animals within 64 blocks
const animalTypes = ['cow', 'pig', 'sheep', 'chicken', 'rabbit'];
const targets = Object.values(bot.entities)
  .filter(e => e && animalTypes.includes(e.name) && e.position.distanceTo(bot.entity.position) < 64)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Animals in 64m: ${targets.length}`);
for (const t of targets) {
  console.log(`- ${t.name} at ${lib.fmt(t.position)} dist ${t.position.distanceTo(bot.entity.position).toFixed(1)}`);
}

// Hunt animals
if (targets.length > 0) {
  for (const t of targets.slice(0, 4)) {
    if (!t.isValid || isCancelled()) break;
    console.log(`Hunting ${t.name}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(t.position.x, t.position.y, t.position.z, 2));
      await lib.equipWeapon();
      const dline = Date.now() + 6000;
      while (t.isValid && Date.now() < dline) {
        bot.attack(t);
        await sleep(550);
      }
      await lib.pickup(6);
    } catch (err) {
      console.log('Hunt error:', err.message);
    }
  }
}

// Step 3: Check raw meat and cook
const rawMeats = ['beef', 'mutton', 'porkchop', 'chicken'].filter(m => lib.count(m) > 0);
console.log('Raw meat gained:', rawMeats.map(m => `${m} x${lib.count(m)}`).join(', '));

if (rawMeats.length > 0) {
  for (const m of rawMeats) {
    const qty = lib.count(m);
    try {
      console.log(`Cooking ${qty}x ${m}...`);
      await lib.smelt(m, 'birch_planks', qty);
    } catch (e) {
      console.log(`Smelt note:`, e.message);
    }
  }

  // Feast on cooked food!
  for (let i = 0; i < 5; i++) {
    if (bot.food >= 20) break;
    try { await lib.eat(); } catch (e) { break; }
  }
}

console.log('Final status:', JSON.stringify(lib.status()));
