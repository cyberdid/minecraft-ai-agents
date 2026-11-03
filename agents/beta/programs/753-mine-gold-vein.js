// programs/753-mine-gold-vein.js
// Stage 3 (Milestone 9): Mine Nether Gold Ore vein at (31..32, 69, -23..-25)
console.log('=== Program 753: Mine Nether Gold Ore Vein ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Fire extinguisher
async function clearFireAhead() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
}

const moves = new Movements(bot, mcData);
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

// Target gold vein positions
const vein = [
  new Vec3(32, 69, -23),
  new Vec3(31, 69, -23),
  new Vec3(32, 69, -24),
  new Vec3(31, 69, -24),
  new Vec3(32, 69, -25)
];

console.log('Navigating toward gold vein at (33, 68, -23)...');
await clearFireAhead();

try {
  await bot.pathfinder.goto(new goals.GoalNear(33.0, 68.0, -23.0, 2.5));
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(33.0, 68.0, -23.0, 3.5)); } catch (e2) {}
}

console.log('Arrived near vein. Pos:', lib.fmt(bot.entity.position));

// Mine gold ore blocks
let mined = 0;
for (const gp of vein) {
  const b = bot.blockAt(gp);
  if (b && b.name === 'nether_gold_ore') {
    console.log(`Mining nether_gold_ore at ${lib.fmt(gp)}...`);
    try {
      await bot.dig(b);
      mined++;
      await sleep(250);
      await lib.pickup(3.5);
    } catch (err) {
      console.log(`Error mining at ${lib.fmt(gp)}:`, err.message);
    }
  }
}

// Vacuum dropped nuggets
await lib.pickup(4.0);

const nuggets = lib.count('gold_nugget');
const ingots = lib.count('gold_ingot');
console.log(`Mined ${mined} gold ore blocks. Gold nuggets in inv: ${nuggets}, Ingots: ${ingots}`);
bot.chat(`Beta: Mined ${mined} Nether Gold Ore blocks! Holding ${nuggets} gold nuggets (${Math.floor(nuggets/9)} ingots)`);

return {
  mined,
  gold_nuggets: nuggets,
  gold_ingots: ingots,
  pos: bot.entity.position,
  hp: bot.health
};
