console.log('=== DELTA: PILLBOX DEFENSE & BLAZE FARMING ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Ensure shield in offhand and iron_sword in hand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
  const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
  if (sword) await bot.equip(sword, 'hand');
} catch (e) {}

// Settle inside pillbox facing spawner at (32, 68, -190)
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
bot.activateItem(true); // Raise shield

const start = Date.now();
let lastAttack = 0;
let kills = 0;
let rods = lib.count('blaze_rod');

while (Date.now() - start < 40000 && !isCancelled()) {
  if (bot.health <= 6) {
    bot.activateItem(true);
    await sleep(1000);
    continue;
  }

  // Keep position locked inside pillbox
  if (bot.entity.position.distanceTo(new Vec3(37.0, 66.0, -187.0)) > 1.5) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(37.0, 66.0, -187.0, 0.4));
    } catch (e) {}
  }

  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, 1.2, 0), true);

    if (dist <= 4.5 && Date.now() - lastAttack > 650) {
      bot.deactivateItem();
      bot.attack(target);
      lastAttack = Date.now();
      bot.activateItem(true); // Re-raise shield immediately!
      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze slain! Kills: ${kills}`);
      }
    } else {
      bot.activateItem(true);
    }
  } else {
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Safe pickup inside pillbox
  try {
    const count = await lib.pickup(3.0);
    if (count > 0) console.log(`Picked up ${count} items!`);
  } catch (e) {}

  await sleep(150);
}

bot.deactivateItem();

const newRods = lib.count('blaze_rod');
console.log(`Farming complete. Rods: ${newRods}, Kills: ${kills}, HP: ${bot.health}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  kills,
  rods: newRods,
  pearls: lib.count('ender_pearl')
};
