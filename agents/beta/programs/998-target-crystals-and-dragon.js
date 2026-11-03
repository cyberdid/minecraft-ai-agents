console.log('=== Program 998: Target Crystals & Dragon ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// Equip netherite_sword or iron_sword as weapon
const nSword = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (nSword) {
  await bot.equip(nSword, 'hand');
  console.log('Equipped NETHERITE SWORD!');
} else {
  try { await lib.equipWeapon(); } catch (e) {}
}

// Equip shield in off-hand
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// Keep pitch slightly downward to NEVER look at Endermen heads
await bot.look(bot.entity.yaw, -0.2, true);

// 1. Scan for Ender Dragon
const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
if (dragon) {
  const dDist = bot.entity.position.distanceTo(dragon.position);
  console.log(`Ender Dragon at ${lib.fmt(dragon.position)} (dist: ${dDist.toFixed(1)}m, HP: ${dragon.health})`);
}

// 2. Scan for End Crystals
const crystals = Object.values(bot.entities)
  .filter(e => e.name === 'end_crystal' && e.isValid)
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Found ${crystals.length} End Crystals:`);
for (const c of crystals) {
  const dist = bot.entity.position.distanceTo(c.position);
  console.log(`  - Crystal at ${lib.fmt(c.position)} (dist: ${dist.toFixed(1)}m)`);
}

// 3. Target nearest crystal with bow or crossbow if we have arrows
const bow = bot.inventory.items().find(i => i.name === 'bow' || i.name === 'crossbow');
const hasArrows = lib.count('arrow') > 0;

if (crystals.length > 0 && bow && hasArrows) {
  const targetCrystal = crystals[0];
  const dist = bot.entity.position.distanceTo(targetCrystal.position);
  console.log(`Targeting nearest End Crystal at ${lib.fmt(targetCrystal.position)} (dist: ${dist.toFixed(1)}m) with ${bow.name}...`);

  await bot.equip(bow, 'hand');
  await bot.lookAt(targetCrystal.position.offset(0, 1.0, 0), true);

  if (bow.name === 'crossbow') {
    // Crossbow charging: hold right-click for 1.3s, then release to load, then click to fire
    bot.activateItem();
    await sleep(1300);
    bot.deactivateItem();
    await sleep(100);
    bot.activateItem();
    await sleep(200);
    bot.deactivateItem();
  } else {
    // Bow: draw for 1.1s, then release
    bot.activateItem();
    await sleep(1100);
    bot.deactivateItem();
  }

  bot.chat(`Beta: Shot at End Crystal at ${lib.fmt(targetCrystal.position)}!`);
  await sleep(1000);
}

// 4. Melee Ender Dragon if in range
if (dragon) {
  const dist = bot.entity.position.distanceTo(dragon.position);
  if (dist <= 6.0) {
    console.log(`DRAGON IN MELEE RANGE (${dist.toFixed(1)}m)! Striking with Netherite Sword!`);
    if (nSword) await bot.equip(nSword, 'hand');
    await bot.lookAt(dragon.position.offset(0, 1.5, 0), true);
    bot.attack(dragon);
    await sleep(500);
    bot.attack(dragon);
    bot.chat('Beta: Striking Ender Dragon with Netherite Sword!');
  }
}

// Re-equip weapon
if (nSword) await bot.equip(nSword, 'hand');

return {
  pos: bot.entity.position,
  dragon: !!dragon,
  crystalsRemaining: crystals.length,
  hp: bot.health,
  food: bot.food
};
