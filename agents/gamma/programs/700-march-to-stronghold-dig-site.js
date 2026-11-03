// programs/700-march-to-stronghold-dig-site.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 700: MARCH TO STRONGHOLD DIG SITE (233, 70, -98) ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'Food:', bot.food, 'HP:', bot.health);

bot.chat('beta: gamma marching to join you at Stronghold site (233, y, -98)!');

// Step 1: Exit Base House
if (bot.entity.position.z < -53.8) {
  try {
    console.log('Exiting Base House through door (294, 72, -54)...');
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    console.log('goThroughDoor notice:', e.message);
  }
}

// Step 2: Waypoints across Overworld to Stronghold site (233, 70, -98)
const waypoints = [
  new Vec3(280, 71, -65),
  new Vec3(266, 70, -77),
  new Vec3(250, 70, -88),
  new Vec3(233, 70, -98)
];

for (let i = 0; i < waypoints.length && !isCancelled(); i++) {
  const wp = waypoints[i];
  console.log(`Marching to WP ${i + 1}/${waypoints.length}: ${lib.fmt(wp)}...`);

  try {
    await lib.goToXZ(wp.x, wp.z, { timeoutMs: 12000 });
  } catch (e) {
    console.log(`goToXZ to WP ${i + 1} err: ${e.message}, falling back to pathfinder...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }

  // Quick animal hunting for food along trail
  if (bot.food < 15) {
    const nearbyAnimal = Object.values(bot.entities).find(e =>
      e && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
      e.isValid &&
      bot.entity.position.distanceTo(e.position) <= 6.0
    );
    if (nearbyAnimal) {
      console.log(`Hunting ${nearbyAnimal.name} at ${lib.fmt(nearbyAnimal.position)} for food...`);
      try {
        await lib.equipWeapon();
        bot.attack(nearbyAnimal);
        await sleep(650);
        bot.attack(nearbyAnimal);
        await sleep(400);
        await lib.pickup(3.0);
      } catch (he) {}
    }

    // Eat any meat picked up
    for (const f of ['beef', 'porkchop', 'mutton', 'chicken', 'cooked_beef', 'cooked_porkchop', 'cooked_mutton']) {
      if (lib.count(f) > 0 && bot.food < 18) {
        console.log(`Eating ${f}...`);
        try { await lib.eat(); } catch (ee) {}
      }
    }
  }

  console.log(`Current Pos: ${lib.fmt(bot.entity.position)}, Food: ${bot.food}, HP: ${bot.health}`);
}

// Reached Stronghold Site (233, 70, -98)
console.log('=== REACHED STRONGHOLD SITE ===');
console.log('Final Pos:', lib.fmt(bot.entity.position), 'Distance to (233, 70, -98):', bot.entity.position.distanceTo(new Vec3(233, 70, -98)).toFixed(1));

// Check nearby players (Beta, Delta, Alpha)
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${name} is at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

bot.chat('team: gamma arrived at Stronghold site (233, 70, -98)! Ready to excavate End Portal room!');

// Equip iron armor, pickaxe, shield
try { await lib.equipArmor(); } catch (e) {}
const p = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (p) try { await bot.equip(p, 'hand'); } catch (e) {}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

return {
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  distToStronghold: bot.entity.position.distanceTo(new Vec3(233, 70, -98)),
  inv: lib.inv()
};
