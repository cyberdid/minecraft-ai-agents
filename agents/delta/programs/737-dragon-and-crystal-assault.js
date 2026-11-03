// programs/737-dragon-and-crystal-assault.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 737: DRAGON & CRYSTAL ASSAULT IN THE END ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Keep gaze tilted slightly down to avoid looking at Endermen heads
await bot.look(bot.entity.yaw, 0.35, true);

// 1. Scan for Ender Dragon
const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
if (dragon) {
  const dist = bot.entity.position.distanceTo(dragon.position);
  console.log(`\n*** ENDER DRAGON LOCATED ***`);
  console.log(`Pos: ${lib.fmt(dragon.position)}, Distance: ${dist.toFixed(1)}m, HP: ${dragon.health}/200`);
  bot.chat(`delta: Dragon at ${lib.fmt(dragon.position)}! HP: ${dragon.health}/200`);
} else {
  console.log('No Ender Dragon detected in entity render yet.');
}

// 2. Scan for End Crystals
const crystals = Object.values(bot.entities)
  .filter(e => e.name === 'end_crystal' && e.isValid)
  .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`\nEnd Crystals in render: ${crystals.length}`);
for (const c of crystals) {
  const dist = bot.entity.position.distanceTo(c.position);
  console.log(`- Crystal at ${lib.fmt(c.position)} (dist: ${dist.toFixed(1)}m)`);
}

// 3. Scan for teammates
console.log('\n--- Teammates in The End ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}m, held=${p.heldItem?.name}`);
}

// 4. Configure pathfinder for End Stone terrain
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// 5. Combat / Advance toward Central Bedrock Fountain (0, 65, 0)
const fountain = new Vec3(0.0, 65.0, 0.0);
console.log(`Advancing toward central bedrock fountain at ${lib.fmt(fountain)}...`);

try {
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

const startCombat = Date.now();
const COMBAT_DURATION = 35000;

while (Date.now() - startCombat < COMBAT_DURATION && !isCancelled()) {
  const curDragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
  
  if (curDragon) {
    const dPos = curDragon.position;
    const dDist = bot.entity.position.distanceTo(dPos);
    
    // If Dragon is near ground / perching (y < 75 and dist < 25)
    if (dPos.y <= 75 && dDist <= 20) {
      console.log(`DRAGON LOW/PERCHING at ${lib.fmt(dPos)} (dist: ${dDist.toFixed(1)}m)! Engaging!`);
      
      // Face dragon body
      await bot.lookAt(dPos.offset(0, 1.5, 0), true);
      
      if (dDist <= 5.0) {
        // Melee critical strike!
        bot.deactivateItem();
        try { await lib.equipWeapon(); } catch (e) {}
        bot.setControlState('jump', true);
        await sleep(150);
        bot.attack(curDragon);
        bot.setControlState('jump', false);
        console.log(`STRIKE on Dragon! HP: ${curDragon.health}`);
        bot.chat(`delta: Hit Dragon! HP: ${curDragon.health}/200!`);
        await sleep(400);
      } else {
        // Approach dragon
        try {
          await bot.pathfinder.goto(new goals.GoalNear(dPos.x, Math.max(65, dPos.y), dPos.z, 3.5));
        } catch (e) {}
      }
    } else {
      // Approach center (0, 65, 0)
      if (bot.entity.position.distanceTo(fountain) > 8.0) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(fountain.x, fountain.y, fountain.z, 6.0));
        } catch (e) {}
      }
    }
  } else {
    // Move toward fountain
    if (bot.entity.position.distanceTo(fountain) > 8.0) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(fountain.x, fountain.y, fountain.z, 6.0));
      } catch (e) {}
    }
  }

  // Check nearby crystal for explosion hit if close
  const nearCrystal = crystals.find(c => c.isValid && bot.entity.position.distanceTo(c.position) <= 5.0);
  if (nearCrystal) {
    console.log(`End Crystal in melee range at ${lib.fmt(nearCrystal.position)}! Striking with raised shield!`);
    await bot.lookAt(nearCrystal.position, true);
    bot.activateItem(true); // Raise shield
    await sleep(200);
    bot.deactivateItem();
    bot.attack(nearCrystal);
    bot.activateItem(true);
    await sleep(500);
  }

  await sleep(250);
}

const finalDragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
console.log('\n=== Combat Round End ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
if (finalDragon) {
  console.log(`Dragon HP: ${finalDragon.health}/200`);
} else {
  console.log('Dragon status: not in render or defeated!');
}

return {
  pos: bot.entity.position,
  dragonHP: finalDragon?.health,
  hp: bot.health,
  food: bot.food
};
