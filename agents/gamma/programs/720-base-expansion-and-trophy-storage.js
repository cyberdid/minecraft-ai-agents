// programs/720-base-expansion-and-trophy-storage.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 720: BASE VICTORY CELEBRATION & TROPHY STORAGE ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

bot.chat('team: Celebrating victory at Base House! Storing 53 End Stone trophy blocks and preparing Milestone 13 Outer End Expedition!');

// Step inside base house if outside
const baseInside = new Vec3(293.5, 72.0, -55.5);
if (bot.entity.position.distanceTo(baseInside) > 2.0) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(baseInside.x, baseInside.y, baseInside.z, 0.8)); } catch (e2) {}
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// Check teammates in base
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, dist=${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m`);
  }
}

// Deposit End Stone trophy blocks into Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    console.log('Opening Base Chest (293, 72, -57)...');
    const chest = await bot.openChest(chestBlock);
    const cItems = chest.containerItems();
    console.log(`Chest has ${cItems.length}/27 slots filled.`);

    // If chest has space, deposit end_stone
    const es = bot.inventory.items().find(i => i.name === 'end_stone');
    if (es && cItems.length < 27) {
      console.log(`Depositing ${es.count} end_stone into Base Chest...`);
      await chest.deposit(es.type, null, es.count);
      bot.chat('gamma: Stored 53 End Stone trophy blocks in Base Chest!');
    }

    // Deposit excess cobblestone
    const cob = bot.inventory.items().find(i => i.name === 'cobblestone');
    if (cob && cob.count > 16 && cItems.length < 27) {
      await chest.deposit(cob.type, null, cob.count - 16);
    }

    chest.close();
  } catch (err) {
    console.log('Chest interaction notice:', err.message);
  }
}

// Re-equip best gear
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) try { await bot.equip(sh, 'off-hand'); } catch (e) {}

// Check if night
const time = bot.time.timeOfDay;
console.log(`Time of day: ${time}`);
if (time >= 12542 && time < 23460) {
  console.log('Night time! Sleeping in Bed 1 (294, 72, -55)...');
  try {
    const bed = bot.blockAt(new Vec3(294, 72, -55));
    if (bed) {
      await bot.sleep(bed);
      bot.chat('gamma: Sleeping in Bed 1 with team!');
    }
  } catch (se) {
    console.log('Sleep notice:', se.message);
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
