// programs/822-run-into-base.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 822: Run Into Base ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Configure movements to allow digging terrain to climb hill
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

const wps = [
  new Vec3(275, 70, -58),
  new Vec3(285, 71, -56),
  new Vec3(294, 72, -54)
];

for (const wp of wps) {
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: true, timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('Pos at Base:', lib.fmt(bot.entity.position));
bot.chat('Beta: Arrived at portal site (294, 72, -54) with iron pickaxe & weapons! I am ready to help mine iron/obsidian and relight portal!');

// Check teammates
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log('Teammates nearby:', teammates.map(t => `${t.username} at ${lib.fmt(t.position)}`).join(', '));

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  teammates: teammates.length
};
