// programs/725-craft-eyes-and-gear.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 725: CRAFT EYES OF ENDER & PREP EXPEDITION ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

const start = Date.now();
const MAX_WAIT = 25000;

while (Date.now() - start < MAX_WAIT && !isCancelled()) {
  // Check players in render
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== 'delta');
  for (const p of players) {
    console.log(`Player ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem?.name}`);
  }

  // Vacuum drops
  try { await lib.pickup(5.0); } catch (e) {}

  // Check Base Chest
  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    try {
      const chest = await bot.openChest(cb);
      const items = chest.containerItems();

      // Look for blaze_powder, blaze_rod, ender_pearl, food, iron armor
      for (const it of items) {
        if (['blaze_powder', 'blaze_rod', 'ender_pearl', 'ender_eye', 'cooked_beef', 'cooked_porkchop', 'bread'].includes(it.name)) {
          console.log(`Chest has ${it.name} x${it.count}`);
        }
      }

      // Withdraw blaze_powder or blaze_rod
      const bp = items.find(i => i.name === 'blaze_powder');
      if (bp) {
        console.log(`Withdrawing ${bp.count} blaze_powder...`);
        await chest.withdraw(bp.type, null, bp.count);
      }
      const br = items.find(i => i.name === 'blaze_rod');
      if (br) {
        console.log(`Withdrawing ${br.count} blaze_rod...`);
        await chest.withdraw(br.type, null, br.count);
      }
      const ep = items.find(i => i.name === 'ender_pearl');
      if (ep) {
        console.log(`Withdrawing ${ep.count} ender_pearl...`);
        await chest.withdraw(ep.type, null, ep.count);
      }
      const fd = items.find(i => ['cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
      if (fd && bot.food < 18) {
        await chest.withdraw(fd.type, null, Math.min(fd.count, 8));
      }

      chest.close();
    } catch (e) {
      console.log('Chest error:', e.message);
    }
  }

  // If we have blaze_rod, craft blaze_powder
  if (lib.count('blaze_rod') > 0) {
    try {
      const r = lib.count('blaze_rod');
      await lib.craft('blaze_powder', r * 2);
      console.log(`Crafted ${r * 2} blaze_powder! Total now: ${lib.count('blaze_powder')}`);
    } catch (e) {
      console.log('Craft blaze_powder error:', e.message);
    }
  }

  // If we have blaze_powder and ender_pearl, craft ender_eye!
  const powderCount = lib.count('blaze_powder');
  const pearlCount = lib.count('ender_pearl');
  if (powderCount > 0 && pearlCount > 0) {
    const toCraft = Math.min(powderCount, pearlCount);
    console.log(`Crafting ${toCraft} ender_eye (powder=${powderCount}, pearls=${pearlCount})...`);
    try {
      await lib.craft('ender_eye', toCraft);
      console.log(`SUCCESS: Delta crafted ${toCraft} ender_eye! Total in inv: ${lib.count('ender_eye')}`);
      bot.chat(`delta: Milestone 10: Crafted ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}!`);
    } catch (e) {
      console.log('Craft ender_eye error:', e.message);
    }
  }

  // Eat if food
  if (bot.food < 18) {
    for (const f of ['cooked_beef', 'cooked_porkchop', 'bread']) {
      if (lib.count(f) > 0) {
        try { await lib.eat(); } catch (e) {}
      }
    }
  }

  await sleep(1500);
}

console.log('Delta final inv:', lib.inv());
return {
  eyes: lib.count('ender_eye'),
  powder: lib.count('blaze_powder'),
  pearls: lib.count('ender_pearl'),
  hp: bot.health,
  food: bot.food
};
