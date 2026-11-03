// programs/714-target-nearest-end-crystal.js
console.log('=== END CRYSTAL TARGETING ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

const crystals = Object.values(bot.entities)
  .filter(e => e && e.name === 'end_crystal' && e.isValid)
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Active End Crystals found: ${crystals.length}`);
for (const c of crystals) {
  const dist = bot.entity.position.distanceTo(c.position);
  console.log(`Crystal ID ${c.id} at ${lib.fmt(c.position)}, dist=${dist.toFixed(1)}m`);
}

// Find Dragon
const dragon = Object.values(bot.entities).find(e => e && e.name === 'ender_dragon' && e.isValid);
if (dragon) {
  console.log(`Ender Dragon at ${lib.fmt(dragon.position)}, dist=${bot.entity.position.distanceTo(dragon.position).toFixed(1)}m`);
}

// Check closest crystal
const targetCrystal = crystals[0];
if (targetCrystal) {
  console.log(`Targeting closest crystal at ${lib.fmt(targetCrystal.position)}!`);
  // If we have bow and arrows, shoot at crystal
  if (lib.count('bow') > 0 && lib.count('arrow') > 0) {
    console.log('Equipping bow and aiming at crystal...');
    const bow = bot.inventory.items().find(i => i.name === 'bow');
    await bot.equip(bow, 'hand');
    // Aim directly at crystal center
    await bot.lookAt(targetCrystal.position.offset(0, 1.0, 0), true);
    console.log('Drawing bow...');
    bot.activateItem();
    await sleep(1200); // Full charge
    console.log('Releasing arrow at crystal!');
    bot.deactivateItem();
    await sleep(1000);
  }
}

// Re-check crystals
const remaining = Object.values(bot.entities).filter(e => e && e.name === 'end_crystal' && e.isValid);
console.log(`Remaining crystals after strike: ${remaining.length}`);

// Re-equip sword and shield
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

return {
  pos: bot.entity.position,
  initialCrystals: crystals.length,
  remainingCrystals: remaining.length,
  dragon: dragon ? lib.fmt(dragon.position) : null
};
