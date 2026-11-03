// programs/628-eat-heal-and-harvest-blaze-rods.js
console.log('=== Program 628: Eat Food to Heal & Slay Blazes for Milestone 8 ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Inv:', JSON.stringify(lib.inv()));

bot.clearControlStates();
bot.pathfinder.stop();
await sleep(100);

// --- Phase 1: Eat porkchops to restore food and regenerate health ---
console.log('--- Phase 1: Eating porkchop to heal ---');
while (bot.food < 18 && lib.count('porkchop') > 0) {
  console.log(`Eating porkchop (current food: ${bot.food})...`);
  try {
    await lib.eat('porkchop');
    await sleep(500);
  } catch (e) {
    console.log('Eat note:', e.message);
    break;
  }
}
console.log('Food after eating:', bot.food, 'Health:', bot.health);

// Equip stone sword
await lib.equipWeapon();
console.log('Holding weapon:', bot.inventory.selectedItem?.name);

// Wait 4 seconds for natural regeneration if food is full
if (bot.food >= 18 && bot.health < 18) {
  console.log('Regenerating health...');
  for (let s = 0; s < 6; s++) {
    await sleep(1000);
    if (bot.health >= 18) break;
  }
  console.log('Regenerated Health:', bot.health);
}

// Check nearby hostiles and drops
const blazesNearby = Object.values(bot.entities).filter(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 8);
console.log(`Blazes nearby (${blazesNearby.length}):`, blazesNearby.map(b => `${lib.fmt(b.position)} dist=${bot.entity.position.distanceTo(b.position).toFixed(1)}m HP=${b.metadata?.[9] || '?'}`));

// --- Phase 2: Slay Blazes & Harvest 7+ Blaze Rods ---
console.log('=== Phase 2: Slaying Blazes for 7+ Blaze Rods ===');
let rounds = 0;
while (rounds < 80 && !isCancelled()) {
  rounds++;
  // Target nearest Blaze
  const blaze = bot.nearestEntity(e => e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 5.8);
  if (blaze) {
    console.log(`[Round ${rounds}] Striking Blaze at dist ${bot.entity.position.distanceTo(blaze.position).toFixed(1)}m...`);
    await lib.equipWeapon();
    await bot.lookAt(blaze.position.offset(0, 0.5, 0), true);
    bot.attack(blaze);
    await sleep(620);
  } else {
    // If wither skeleton close by, eliminate it
    const ws = bot.nearestEntity(e => e.name === 'wither_skeleton' && bot.entity.position.distanceTo(e.position) < 4.0);
    if (ws) {
      console.log(`Striking Wither Skeleton at dist ${bot.entity.position.distanceTo(ws.position).toFixed(1)}m...`);
      await lib.equipWeapon();
      await bot.lookAt(ws.position.offset(0, 1.0, 0), true);
      bot.attack(ws);
      await sleep(620);
    } else {
      await sleep(350);
    }
  }

  // Scoop drops every few strikes
  if (rounds % 2 === 0) {
    const gained = await lib.pickup(6);
    if (gained > 0) {
      console.log('Drops scooped! Blaze Rods count:', lib.count('blaze_rod'), 'Inv:', JSON.stringify(lib.inv()));
    }
  }

  // Check Milestone 8
  if (lib.count('blaze_rod') >= 7) {
    console.log('====================================');
    console.log('MILESTONE 8 COMPLETE! 7+ BLAZE RODS!');
    console.log('====================================');
    bot.chat(`beta: MILESTONE 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods from Spawner!`);
    break;
  }
}

// Final pickup
await lib.pickup(8);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  health: bot.health,
  food: bot.food,
  inv: lib.inv()
};
