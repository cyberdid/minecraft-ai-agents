// programs/441-enter-portal-and-march-with-delta.js
console.log('=== Program 441: Enter Portal & March with Delta to Mountain Breach ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk up steps at (299, 72, -53) into portal at (299.5, 73.0, -54.0)
console.log('Stepping into Nether portal at (299.5, 73.0, -54.0)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(800);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);
}

bot.pathfinder.setGoal(null);
bot.clearControlStates();

// 2. Wait for dimension transit (requires 80 ticks = 4.0s stationary)
console.log('Waiting stationary inside portal for dimension transit...');
for (let wait = 0; wait < 30; wait++) {
  if (bot.game.dimension === 'the_nether') {
    console.log('*** TRANSIT SUCCESSFUL! ALPHA IS IN THE NETHER! ***');
    break;
  }
  await sleep(500);
}

console.log('Dimension:', bot.game.dimension);
console.log('Alpha at:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether at ${lib.fmt(bot.entity.position)}! HP=${bot.health}, Food=${bot.food}. Marching along East Ridge to unite with Delta at mountain breach (44, 65, -148)!`);

  // Helper to clear fire
  async function clearFireAhead() {
    const fires = bot.findBlocks({
      matching: b => b.name === 'fire' || b.name === 'soul_fire',
      maxDistance: 8,
      count: 8
    });
    for (const fp of fires) {
      try { await bot.dig(bot.blockAt(fp)); } catch (e) {}
    }
  }

  // 3. Follow verified East Ridge trail to Fortress Workshop
  try { await lib.goTo(63, 64, -3, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(63, -3); } catch (e2) {} }
  try { await lib.goTo(62, 66, -30, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(62, -30); } catch (e2) {} }
  await clearFireAhead();
  try { await lib.goTo(61, 67, -60, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(61, -60); } catch (e2) {} }
  await clearFireAhead();
  try { await lib.goTo(54, 65, -90, 2, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(54, -90); } catch (e2) {} }
  await clearFireAhead();
  
  // Enter Fortress Workshop (paved gap at z=-122..-126)
  try { await lib.goTo(44, 65, -128, 1, { timeoutMs: 20000 }); } catch (e) { try { await lib.goToXZ(44, -128); } catch (e2) {} }
  
  // Advance along covered bridge to (44, 65, -147) — STOP AT z=-147!
  try { await lib.goTo(44, 65, -147, 0, { timeoutMs: 15000 }); } catch (e) { try { await lib.goToXZ(44, -147); } catch (e2) {} }

  console.log('Alpha at bridge front:', lib.fmt(bot.entity.position));
  bot.chat(`team: Alpha arrived at Fortress bridgehead ${lib.fmt(bot.entity.position)}! Partnering with Delta to pave z=-149 and breach mountain to Blaze Spawner (32, 68, -190)!`);
}

console.log('Final status:', JSON.stringify(lib.status()));
console.log('Final inventory:', JSON.stringify(lib.inv()));
