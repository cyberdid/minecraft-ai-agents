// programs/079-emergency-shelter-and-secure.js
console.log('--- EMERGENCY SHELTER AT 2 HP ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const p = bot.entity.position.floored();

// 1. Build an airtight 4-wall + roof shelter around current position
// Floor is y, head is y+1, roof is y+2
console.log('Enclosing player in solid granite shelter...');
const wallOffsets = [
  // North, South, East, West at feet and head
  [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1],
  [1, 1, 0], [-1, 1, 0], [0, 1, 1], [0, 1, -1],
  // Roof above head
  [0, 2, 0]
];

for (const [dx, dy, dz] of wallOffsets) {
  const target = p.offset(dx, dy, dz);
  const b = bot.blockAt(target);
  if (b && (b.name === 'air' || b.name === 'cave_air' || b.name === 'fire')) {
    try {
      await lib.place('granite', target.x, target.y, target.z);
      console.log(`Placed wall at ${lib.fmt(target)}`);
    } catch (e) {
      // If place fails, try diorite
      try {
        await lib.place('diorite', target.x, target.y, target.z);
      } catch (e2) {}
    }
  }
}

// 2. Pickup anything dropped right here
await lib.pickup(4);

// 3. Check players
for (const [name, player] of Object.entries(bot.players)) {
  if (name !== 'gamma' && player.entity) {
    console.log(`Player ${name} at ${lib.fmt(player.entity.position)}, dist: ${player.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

// 4. Emergency Chat Alert to Delta
bot.chat('delta: Alpha (5 HP) and Gamma (2 HP) are sheltered in Fortress bunker (45, 65, -128)! We urgently need cooked food to regenerate HP. Bring beef to (45, 65, -128)!');

console.log('Shelter complete. Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
