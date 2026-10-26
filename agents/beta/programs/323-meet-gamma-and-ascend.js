// programs/323-meet-gamma-and-ascend.js
console.log('=== Meet Gamma and climb to base ===');
console.log('Beta pos:', lib.fmt(bot.entity.position), 'onGround:', bot.entity.onGround);

// Find Gamma entity
const gamma = Object.values(bot.entities).find(e => e.type === 'player' && e.username.includes('gamma'));
if (gamma) {
  console.log(`Gamma is at ${lib.fmt(gamma.position)}, dist: ${bot.entity.position.distanceTo(gamma.position).toFixed(1)}m`);
  bot.chat(`beta: Gamma, I see you! I am at ${lib.fmt(bot.entity.position)}. Please toss food!`);
} else {
  console.log('Gamma not yet in entity range.');
  bot.chat(`beta: Freed from block! At (297, 39, 2). Climbing up towards shaft (302, 50, -20)!`);
}

// Pickup any items dropped nearby
await lib.pickup(6);

// Check if we got food
const foodNames = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken', 'bread', 'apple', 'beef', 'mutton', 'porkchop', 'chicken'];
for (const f of foodNames) {
  if (lib.count(f) > 0) {
    console.log(`Beta has food: ${f}x${lib.count(f)}! Eating...`);
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log('Ate food! New food level:', bot.food, 'health:', bot.health);
    } catch (err) {
      console.log('Eat note:', err.message);
    }
  }
}

// Climb towards main shaft (302, 55, -20)
const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = false;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
m.liquidsCost = 100;
bot.pathfinder.setMovements(m);

console.log('Climbing towards (302, 55, -20)...');
try {
  await lib.goTo(302, 55, -20, 3, { dig: true, timeoutMs: 35000 });
  console.log('Reached y=55:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Climb y=55 note:', e.message);
}

// Climb towards shaft top (302, 71, -44)
console.log('Climbing towards surface (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 35000 });
  console.log('At surface shaft top:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Climb surface note:', e.message);
}

console.log('Beta current pos:', lib.fmt(bot.entity.position), 'inventory:', JSON.stringify(lib.inv()));
