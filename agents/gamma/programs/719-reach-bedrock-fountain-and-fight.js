// programs/719-reach-bedrock-fountain-and-fight.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 719: ADVANCE TO BEDROCK FOUNTAIN & FIGHT DRAGON ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// Step 1: Survey surface height from x=24 down to x=0 at z=0
for (let x = 24; x >= 0; x -= 2) {
  let surfaceY = null;
  for (let y = 70; y >= 55; y--) {
    const b = bot.blockAt(new Vec3(x, y, 0));
    if (b && b.boundingBox === 'block') {
      surfaceY = y;
      break;
    }
  }
  console.log(`x=${x}, z=0: surface at y=${surfaceY}`);
}

// Equip pickaxe to dig any blocking blocks at head/feet
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));

// Advance West to x=4.0
bot.chat('gamma: Marching directly to Bedrock Fountain (3, 59, 0) to strike Dragon!');

for (let targetX = Math.floor(bot.entity.position.x) - 1; targetX >= 3 && !isCancelled(); targetX--) {
  console.log(`Mining/advancing to x=${targetX}...`);
  // Clear blocks at targetX at current y and y+1
  const curY = Math.floor(bot.entity.position.y);
  for (const dy of [1, 0, 2]) {
    const b = bot.blockAt(new Vec3(targetX, curY + dy, 0));
    if (b && b.boundingBox === 'block' && b.name !== 'bedrock') {
      if (pick) await bot.equip(pick, 'hand');
      try { await bot.dig(b); } catch (e) {}
    }
  }

  // Step forward
  await bot.lookAt(new Vec3(targetX + 0.5, curY, 0.5), true);
  bot.setControlState('forward', true);
  if (bot.entity.isCollidedHorizontally) {
    bot.setControlState('jump', true);
    await sleep(150);
    bot.setControlState('jump', false);
  }
  await sleep(250);
  bot.clearControlStates();
}

console.log('Pos near Bedrock Fountain:', lib.fmt(bot.entity.position));

// Equip netherite sword and shield for combat
const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
if (ns) await bot.equip(ns, 'hand');
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh) await bot.equip(sh, 'off-hand');

// Combat loop: Engage Dragon
console.log('Engaging Ender Dragon with Netherite Sword!');
const combatStart = Date.now();
let hits = 0;

while (Date.now() - combatStart < 15000 && bot.game.dimension === 'the_end' && !isCancelled()) {
  const dragon = Object.values(bot.entities).find(e => e && e.name === 'ender_dragon' && e.isValid);
  if (dragon) {
    const dist = bot.entity.position.distanceTo(dragon.position);
    // Face dragon
    await bot.lookAt(dragon.position.offset(0, (dragon.height || 4) * 0.5, 0), true);

    if (dist <= 7.0) {
      console.log(`DRAGON WITHIN REACH (dist=${dist.toFixed(1)}m)! Striking!`);
      bot.deactivateItem();
      bot.setControlState('jump', true);
      await sleep(100);
      bot.attack(dragon);
      bot.setControlState('jump', false);
      hits++;
      bot.activateItem(true); // Raise shield immediately
      await sleep(550);
    } else {
      // Shield raised facing dragon
      bot.activateItem(true);
    }
  }
  await sleep(100);
}

bot.deactivateItem();
console.log(`Combat end. Landed ${hits} hits on Ender Dragon!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  hits
};
