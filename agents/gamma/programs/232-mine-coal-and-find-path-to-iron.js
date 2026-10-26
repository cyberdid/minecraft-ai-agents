// programs/232-mine-coal-and-find-path-to-iron.js
console.log('=== MINE COAL & SEARCH PATH TO IRON ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Mine 4 coal
console.log('Mining coal...');
try {
  const gotCoal = await lib.collect('coal', 4);
  console.log('Got coal:', JSON.stringify(gotCoal));
} catch (e) {
  console.log('Coal collect note:', e.message);
}
console.log('Coal count:', lib.count('coal'));

// 2. Find closest log and chop 2 logs with stone axe
console.log('Searching for tree logs...');
const logs = lib.find('*_log', { maxDistance: 32, count: 5 });
for (const l of logs) {
  if (l.position.y <= 75 && lib.count('*_log') < 2) {
    console.log(`Chopping log at ${lib.fmt(l.position)}...`);
    try {
      await lib.dig(l.position.x, l.position.y, l.position.z);
    } catch (e) {
      console.log('Dig log error:', e.message);
    }
  }
}
await lib.pickup(6);
console.log('Logs in inv:', lib.count('*_log'));

// 3. Test pathfinding to iron ore at (302, 47, -51) or (292, 52, -26)
const ironTargets = [
  new Vec3(302, 47, -51),
  new Vec3(292, 52, -26)
];
for (const it of ironTargets) {
  const path = bot.pathfinder.getPathTo(bot.pathfinder.movements, new goals.GoalNear(it.x, it.y, it.z, 2));
  console.log(`Path to ${lib.fmt(it)}: status=${path.status} cost=${path.cost?.toFixed(1)} len=${path.path?.length}`);
}

console.log('Pos now:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
