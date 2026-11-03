// programs/705-obtain-shield-and-regear.js
console.log('=== Program 705: Obtain Shield & Return to Base ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);

bot.clearControlStates();
bot.pathfinder.stop();

// 1. Return to Base at (294, 72, -53)
console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 2.0, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo note:', e.message);
  try { await lib.goToXZ(294, -53, { timeoutMs: 15000 }); } catch (e2) {}
}

console.log('At Base! Pos:', lib.fmt(bot.entity.position));

// 2. Obtain a shield
if (lib.count('shield') === 0) {
  console.log('Obtaining shield via lib.obtain...');
  try {
    await lib.obtain('shield', 1);
    console.log('Obtained shield successfully!');
  } catch (err) {
    console.log('lib.obtain shield error:', err.message);
  }
}

// 3. Equip armor & shield
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Final Inv:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  shield: lib.count('shield'),
  blaze_rods: lib.count('blaze_rod'),
  inv: lib.inv()
};
