// programs/230-scan-mine-iron.js
console.log('=== SCAN MINE SHAFT FOR IRON ORE ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Check for nearby birch logs to top up planks
const nearbyLogs = lib.find('*_log', { maxDistance: 16, count: 5 });
console.log(`Nearby logs (${nearbyLogs.length}):`, nearbyLogs.map(l => `${l.name} at ${lib.fmt(l.position)}`));
for (const l of nearbyLogs) {
  if (l.position.y <= 74 && lib.count('*_log') < 3) {
    console.log(`Mining accessible log at ${lib.fmt(l.position)}...`);
    try {
      await lib.dig(l.position.x, l.position.y, l.position.z);
    } catch (e) {
      console.log('Dig log note:', e.message);
    }
  }
}
await lib.pickup(6);
console.log('Logs in inv:', lib.count('*_log'));

// 2. Walk to mine shaft entrance at (302, 71, -44)
console.log('Walking to mine shaft at (302, 71, -44)...');
await lib.goTo(302, 71, -44, 2, { timeoutMs: 15000 });
console.log('At mine shaft! Pos:', lib.fmt(bot.entity.position));

// 3. Search for iron ore in a 32m sphere
const iron = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore' || b.name === 'raw_iron_block'),
  maxDistance: 32,
  count: 10
});
console.log(`Iron ore found near shaft (${iron.length}):`, iron.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// 4. Search for coal ore
const coal = bot.findBlocks({
  matching: b => b && (b.name === 'coal_ore' || b.name === 'deepslate_coal_ore'),
  maxDistance: 32,
  count: 5
});
console.log(`Coal ore found near shaft (${coal.length}):`, coal.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// 5. Also check for animals on the surface
const animals = Object.values(bot.entities).filter(e => 
  ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) && 
  e.position.distanceTo(bot.entity.position) < 40
);
console.log(`Animals within 40m (${animals.length}):`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`));

console.log('Time until night:', lib.time().secondsUntilNight);
