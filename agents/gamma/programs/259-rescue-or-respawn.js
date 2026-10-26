// programs/259-rescue-or-respawn.js
console.log('=== RESCUE OR RESPAWN CHECK ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));

// Hostiles
const hostiles = lib.hostiles(16);
console.log(`Hostiles nearby (${hostiles.length}):`, hostiles.map(h => `${h.name} at dist ${h.dist.toFixed(1)}m`));

// If we are far from base (x < 250 in overworld) and have empty inventory:
if (bot.game.dimension === 'minecraft:overworld' && bot.entity.position.x < 250) {
  console.log('Far from base in overworld with empty inventory!');
  // If hostiles are hitting us, respawning at base bed (294, 72, -55) is instant
  if (hostiles.length > 0 && bot.health < 15) {
    console.log('Allowing clean respawn at base bed...');
    // Stand still to respawn at base
    await sleep(4000);
  } else {
    console.log('Sprinting East towards base (294, 72, -54)...');
    try {
      await lib.goToXZ(294, -54, { timeoutMs: 25000 });
    } catch (e) {
      console.log('goToXZ note:', e.message);
    }
  }
}

console.log('Pos now:', lib.fmt(bot.entity.position));
console.log('HP now:', bot.health);
