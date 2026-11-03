// programs/728-receive-powder-and-craft-eyes.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 728: RECEIVE POWDER, CRAFT EYES & ASSIST TEAM ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

const start = Date.now();
const MAX_WAIT_MS = 35000;

while (Date.now() - start < MAX_WAIT_MS && !isCancelled()) {
  // Pickup drops inside/outside base
  try { await lib.pickup(5.0); } catch (e) {}

  // Check players in render
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== 'delta');
  for (const p of players) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem?.name}`);
  }

  // Check Base Chest (293, 72, -57)
  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      const items = chest.containerItems();

      const pow = items.find(i => i.name === 'blaze_powder');
      const rods = items.find(i => i.name === 'blaze_rod');
      const pearls = items.find(i => i.name === 'ender_pearl');
      const eyes = items.find(i => i.name === 'ender_eye');
      const food = items.find(i => ['cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));

      if (pow || rods || pearls || eyes) {
        console.log(`Chest contents: pow=${pow?.count}, rods=${rods?.count}, pearls=${pearls?.count}, eyes=${eyes?.count}`);
      }

      // If delta needs food
      if (food && bot.food < 18) {
        await chest.withdraw(food.type, null, Math.min(food.count, 6));
      }

      // If chest has blaze_powder AND ender_pearls, withdraw to craft
      if (pow && pearls) {
        const canCraft = Math.min(pow.count, pearls.count);
        await chest.withdraw(pow.type, null, canCraft);
        await chest.withdraw(pearls.type, null, canCraft);
      }

      chest.close();
    } catch (e) {
      console.log('Chest interaction:', e.message);
    }
  }

  // Craft blaze_rod if any in inventory
  if (lib.count('blaze_rod') > 0) {
    try {
      const r = lib.count('blaze_rod');
      await lib.craft('blaze_powder', r * 2);
      console.log(`Delta crafted ${r * 2} blaze_powder!`);
    } catch (e) {}
  }

  // Craft ender_eye if ingredients in inventory
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    console.log(`Delta crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      console.log(`Delta crafted ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}`);
      bot.chat(`delta: Crafted ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}!`);
    } catch (e) {
      console.log('Craft ender_eye error:', e.message);
    }
  }

  // Eat food if available
  for (const f of ['cooked_beef', 'cooked_porkchop', 'bread']) {
    if (lib.count(f) > 0 && bot.food < 18) {
      try { await lib.eat(); } catch (e) {}
    }
  }

  await sleep(1500);
}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Delta Final Inv:', JSON.stringify(lib.inv()));
return {
  deltaPos: bot.entity.position,
  eyes: lib.count('ender_eye'),
  hp: bot.health,
  food: bot.food
};
