// programs/426-advance-to-bunker.js
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check surrounding ground items
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 12);
console.log(`Found ${items.length} items nearby`);
if (items.length > 0) {
  try {
    const p = await lib.pickup(4);
    console.log(`Picked up ${p} items!`);
  } catch (e) {}
}

// 2. Check path ahead to (44, 65, -127)
console.log('Moving into Fortress Workshop Bunker at (44, 65, -127)...');
try {
  await lib.goTo(44, 65, -127, 1.5, { dig: false, timeoutMs: 8000 });
} catch (e) {
  console.log('Advance note:', e.message);
  await bot.lookAt(new Vec3(44.5, 66, -127), true);
  bot.setControlState('forward', true);
  await sleep(1200);
  bot.setControlState('forward', false);
}

console.log('Current Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. From bunker (44, 65, -127), advance down covered corridor
if (bot.entity.position.distanceTo(new Vec3(44, 65, -127)) < 4) {
  console.log('Inside Fortress Workshop Bunker! Advancing along covered corridor to z=-160...');
  try {
    await lib.goTo(44, 65, -160, 2.0, { dig: false, timeoutMs: 10000 });
  } catch (e) {}
  try {
    await lib.goTo(44, 65, -169, 1.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {}
  try {
    await lib.goTo(38, 65, -176, 1.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {}
  try {
    await lib.goTo(36.5, 66, -186, 1.0, { dig: false, timeoutMs: 6000 });
  } catch (e) {}
}

console.log('Final Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Inv:', JSON.stringify(lib.inv()));
return { pos: bot.entity.position, hp: bot.health, dim: bot.game.dimension };
