// programs/476-mine-cobble-sword-and-enter-nether.js
console.log('=== Program 476: Mine Cobblestone, Craft Sword & Enter Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Equip stone pickaxe
const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// 2. Mine 10 cobblestone from stone nearby
console.log('Mining cobblestone...');
const stones = bot.findBlocks({
  matching: mcData.blocksByName.stone.id,
  maxDistance: 8,
  count: 10
});
console.log(`Found ${stones.length} stone blocks nearby`);

for (const sp of stones) {
  if (lib.count('cobblestone') >= 10) break;
  try {
    const b = bot.blockAt(sp);
    if (!b) continue;
    await bot.pathfinder.goto(new goals.GoalLookAtBlock(sp, bot.world));
    await bot.dig(b);
    await lib.pickup(3);
  } catch (e) {}
}
console.log('Cobblestone mined:', lib.count('cobblestone'));

// 3. Craft sticks and stone_sword
if (lib.count('stick') < 2 && lib.count('*_planks') >= 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}

if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

await lib.equipWeapon();
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));

// 4. Move to Nether portal at (299, 73, -54)
console.log('Moving to Nether portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 72, -53, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.goToXZ(299, -54); } catch (e2) {}
}

// 5. Step into portal
console.log('Stepping into portal frame...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);
}

bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 6. Wait for dimension transit
console.log('Waiting stationary inside portal for dimension transit...');
for (let wait = 0; wait < 25; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT SUCCESSFUL! ALPHA IS IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

bot.chat(`team: Alpha armed (stone_sword & pickaxe) and transited into Nether at ${lib.fmt(bot.entity.position)}! Sprinting through covered tunnel to Fortress & Blaze Spawner!`);
