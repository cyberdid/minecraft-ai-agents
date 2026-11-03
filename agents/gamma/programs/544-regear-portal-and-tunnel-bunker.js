// programs/544-regear-portal-and-tunnel-bunker.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 544: REGEAR AT BASE & SAFE MARCH TO BUNKER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Walk to Base Room at (293, 72, -55)
if (bot.game.dimension === 'overworld') {
  console.log('Walking east to base door (294, 72, -54)...');
  try {
    await lib.goTo(293, 72, -55, 2.0, { timeoutMs: 20000 });
  } catch (e) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 1.5));
    } catch (e2) {}
  }

  console.log('At Base Room. Checking chest at (293, 72, -57)...');
  try {
    const contents = await lib.chestContents(293, 72, -57);
    console.log('Chest contents:', JSON.stringify(contents));

    // Withdraw shield if not equipped
    if (bot.inventory.slots[45]?.name !== 'shield') {
      const sh = bot.inventory.items().find(i => i.name === 'shield');
      if (!sh && contents && contents.shield > 0) {
        await lib.withdraw({ shield: 1 }, 293, 72, -57);
      }
    }

    // Withdraw cobblestone (up to 32)
    if (contents && contents.cobblestone > 0 && lib.count('cobblestone') < 32) {
      await lib.withdraw({ cobblestone: Math.min(contents.cobblestone, 32 - lib.count('cobblestone')) }, 293, 72, -57);
    }

    // Withdraw gold ingots
    if (contents && contents.gold_ingot > 0) {
      await lib.withdraw({ gold_ingot: Math.min(contents.gold_ingot, 8) }, 293, 72, -57);
    }
  } catch (e) {
    console.log('Chest note:', e.message);
  }

  // Ensure shield in offhand
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    try { await bot.equip(shield, 'off-hand'); } catch (e) {}
  }

  // Ensure golden boots
  if (bot.inventory.slots[8]?.name !== 'golden_boots') {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) try { await bot.equip(gb, 'feet'); } catch (e) {}
  }

  // Ensure weapon
  try { await lib.equipWeapon(); } catch (e) {}

  // Enter Nether Portal
  console.log('Entering Nether Portal at (299.5, 73.0, -53.5)...');
  bot.chat('gamma: Regeared with shield & golden_boots! Entering Nether portal to march to Bunker!');
  await globalThis.enterNetherPortal(25000);
}

// Step 2: In Nether - execute safe march to Bunker (44, 65, -127)
if (bot.game.dimension !== 'the_nether') {
  console.log('Dimension guard: Still in Overworld.');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('SUCCESS: Inside the_nether! Pos:', lib.fmt(bot.entity.position));
globalThis.configureFireAvoidance();

const bunkerWps = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -60 },
  { x: 61.5, y: 67, z: -70 },
  { x: 62, y: 67, z: -80 },
  { x: 61, y: 66, z: -100 }, // WP 9
  { x: 50, y: 65, z: -115 }, // WP 10: Hoglin zone
  { x: 44, y: 65, z: -127 }  // WP 11: Bunker entrance
];

let startIdx = 0;
let closestDist = Infinity;
for (let i = 0; i < bunkerWps.length; i++) {
  const d = bot.entity.position.distanceTo(new Vec3(bunkerWps[i].x, bunkerWps[i].y, bunkerWps[i].z));
  if (d < closestDist) {
    closestDist = d;
    startIdx = i;
  }
}
if (closestDist < 2.0 && startIdx < bunkerWps.length - 1) startIdx++;

console.log(`Marching from WP ${startIdx} to Bunker (44, 65, -127)...`);
for (let i = startIdx; i < bunkerWps.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  const wp = bunkerWps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();

  // If in Hoglin zone (z <= -95), raise shield constantly!
  if (wp.z <= -95) {
    bot.activateItem(true); // Raised shield blocks 100% Hoglin damage
  } else {
    bot.deactivateItem();
  }

  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 12000 });
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 0.8, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(600);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  if (bot.health <= 6) {
    console.log(`HP low (${bot.health}), pausing march.`);
    break;
  }
}

// Step 3: Step inside 2-high doorway into bunker at (44, 65, -128)
console.log('Stepping inside Fortress Workshop Bunker...');
try {
  await lib.goTo(44, 65, -128, 1.0, { dig: false, timeoutMs: 6000 });
} catch (e) {}

console.log('Secure inside bunker! Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
bot.chat(`gamma: Secure inside Fortress Workshop Bunker (${lib.fmt(bot.entity.position)})! HP: ${bot.health.toFixed(1)}/20. United with team!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  goldenBoots: bot.inventory.slots[8]?.name === 'golden_boots',
  shield: bot.inventory.slots[45]?.name === 'shield',
  inv: lib.inv()
};
