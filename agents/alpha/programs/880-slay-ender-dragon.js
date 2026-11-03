// programs/880-slay-ender-dragon.js
console.log('=== Program 880: Slay Ender Dragon [Free the End] ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension !== 'the_end') {
  console.log('Not in the_end dimension! Currently in:', bot.game.dimension);
} else {
  bot.chat('alpha: In The End! Hunting Ender Dragon with Netherite Sword at central fountain (0, 65, 0)!');

  // 1. Equip Netherite Sword and armor
  const sword = bot.inventory.items().find(i => i.name.includes('netherite_sword') || i.name.includes('sword'));
  if (sword) await bot.equip(sword, 'hand');
  try { await lib.equipArmor(); } catch (e) {}

  // 2. Keep gaze low to avoid Enderman aggro
  await bot.look(-Math.PI / 2, 0.35, true);

  // 3. Move to central bedrock fountain (0, 65, 0) if not already nearby
  const distToCenter = bot.entity.position.distanceTo(new Vec3(0, 65, 0));
  console.log(`Distance to central fountain: ${distToCenter.toFixed(1)}m`);
  
  if (distToCenter > 12.0) {
    console.log('Moving toward central fountain (0, 65, 0)...');
    const moves = new Movements(bot, mcData);
    moves.canDig = false;
    moves.allowParkour = true;
    bot.pathfinder.setMovements(moves);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(0, 65, 0, 8.0));
    } catch (e) {}
  }

  // 4. Combat loop against Ender Dragon
  console.log('Commencing Ender Dragon combat loop...');
  const startCombat = Date.now();
  let hits = 0;

  while (Date.now() - startCombat < 90000 && bot.game.dimension === 'the_end' && !isCancelled()) {
    const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
    
    if (dragon) {
      const dist = bot.entity.position.distanceTo(dragon.position);
      const isPerching = dragon.position.y <= 75 && Math.hypot(dragon.position.x, dragon.position.z) <= 12;

      if (isPerching && dist <= 7.0) {
        console.log(`DRAGON IS PERCHING! Distance: ${dist.toFixed(1)}m! Slicing with Netherite Sword!`);
        await bot.lookAt(dragon.position.offset(0, 1.5, 0), true);
        
        // Jump attack for critical damage
        bot.setControlState('jump', true);
        await sleep(150);
        bot.attack(dragon);
        bot.setControlState('jump', false);
        hits++;

        bot.chat(`alpha: Strike ${hits}! Slashed Ender Dragon with Netherite Sword! HP: ${dragon.health}/200!`);
        await sleep(600); // Sword attack cooldown
      } else if (isPerching && dist > 7.0) {
        // Move closer to perching dragon
        await bot.lookAt(dragon.position, true);
        bot.setControlState('forward', true);
        await sleep(300);
        bot.clearControlStates();
      } else {
        // Dragon is circling overhead: hold safe position near (0, 65, 0)
        // Keep gaze low
        await bot.look(bot.entity.yaw, 0.35, true);
        await sleep(250);
      }
    } else {
      // Dragon not found or defeated!
      console.log('No Ender Dragon detected! Checking for exit portal or victory...');
      await sleep(1000);
    }

    // Health check
    if (bot.health <= 6) {
      console.log(`HP low (${bot.health}), taking defensive stance...`);
      await sleep(2000);
    }
  }

  console.log(`Combat loop finished. Total hits: ${hits}, final HP: ${bot.health}`);
}
