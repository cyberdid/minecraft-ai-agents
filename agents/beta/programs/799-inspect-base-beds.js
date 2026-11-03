// programs/799-inspect-base-beds.js
console.log('=== Program 799: Inspect Base Beds & Players ===');
const beds = bot.findBlocks({ matching: b => b && b.name.endsWith('_bed'), maxDistance: 10 });
console.log(`Found ${beds.length} beds:`, beds.map(b => `${bot.blockAt(b).name} at ${lib.fmt(b)}`));

const players = Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username);
console.log(`Players nearby (${players.length}):`, players.map(p => `${p.username} at ${lib.fmt(p.position)}`));
console.log('Current time:', bot.time.timeOfDay, 'canSleep:', lib.time().canSleep);
