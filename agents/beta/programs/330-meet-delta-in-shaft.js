// programs/330-meet-delta-in-shaft.js
console.log('=== Step: Walk through corridor, meet Delta, ascend to portal site ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

bot.chat('beta: Delta, walking North to meet you at (304, 20, -32)! Holding 10 obsidian!');

// Configure movements: allow walking through shallow water!
const m = new Movements(bot, mcData);
m.canDig = true;
m.allowParkour = false;
m.allow1by1towers = true;
m.liquidsCost = 5; // allow walking through shallow water puddles!
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
bot.pathfinder.setMovements(m);

// 1. Walk towards (304, 20, -32) where the dry shaft connects
console.log('Walking towards shaft connection (304, 20, -32)...');
try {
  await lib.goTo(304, 20, -32, 3, { dig: true, timeoutMs: 40000 });
  console.log('Reached shaft connection:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft approach note:', e.message);
}

// 2. Check for Delta nearby
const delta = Object.values(bot.entities).find(e => e.type === 'player' && e.username.includes('delta'));
if (delta) {
  console.log(`Delta is nearby at ${lib.fmt(delta.position)}, dist: ${bot.entity.position.distanceTo(delta.position).toFixed(1)}m`);
  bot.chat(`beta: Delta! I am right here at ${lib.fmt(bot.entity.position)}!`);
}

// Pickup any food dropped
await lib.pickup(6);

// Eat if food in inventory
const foods = ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
for (const f of foods) {
  if (lib.count(f) > 0) {
    console.log(`Eating ${f}...`);
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log('Ate! Health:', bot.health, 'Food:', bot.food);
    } catch (err) {
      console.log('Eat note:', err.message);
    }
  }
}

// 3. Ascend shaft to y=51
console.log('Ascending shaft to (304, 51, -32)...');
try {
  await lib.goTo(304, 51, -32, 2, { dig: true, timeoutMs: 35000 });
  console.log('At shaft y=51:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Shaft y=51 note:', e.message);
}

// 4. Ascend to surface shaft top (302, 71, -44)
console.log('Ascending to surface shaft top (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 35000 });
  console.log('At surface shaft top!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Surface top note:', e.message);
}

// 5. Walk to portal site (298, 72, -53)
console.log('Walking to portal site (298, 72, -53)...');
try {
  await lib.goTo(298, 72, -53, 1, { timeoutMs: 20000 });
  console.log('At portal site! Ready to build and ignite!');
} catch (e) {
  console.log('Portal approach note:', e.message);
}

// 6. Build and Ignite Portal
if (lib.count('obsidian') >= 10 && bot.entity.position.distanceTo(new Vec3(298, 72, -54)) < 8) {
  console.log('Building portal frame with 10 obsidian...');
  try {
    const shape = lib.shapes.portal(298, 72, -54, 'x');
    const bRes = await lib.build(shape);
    console.log('Build result:', JSON.stringify(bRes));
  } catch (err) {
    console.log('Build note:', err.message);
  }

  console.log('Igniting Nether portal at (299, 72, -54)...');
  try {
    const lit = await lib.ignite(299, 72, -54);
    console.log('IGNITE RESULT:', lit);
    bot.chat(`beta: MILESTONE 7 ACHIEVED! NETHER PORTAL LIT! ${lit}`);
  } catch (err) {
    console.log('Ignite note:', err.message);
    try {
      const lit2 = await lib.ignite(300, 72, -54);
      console.log('IGNITE 2 RESULT:', lit2);
      bot.chat(`beta: MILESTONE 7 ACHIEVED! NETHER PORTAL LIT! ${lit2}`);
    } catch (e2) {
      console.log('Ignite 2 note:', e2.message);
    }
  }
}

// Verify
const p1 = bot.blockAt(new Vec3(299, 73, -54));
const p2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`VERIFICATION: Inner blocks: p1=${p1?.name}, p2=${p2?.name}`);

console.log('Final pos:', lib.fmt(bot.entity.position), 'inventory:', JSON.stringify(lib.inv()));
