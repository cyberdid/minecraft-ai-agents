// programs/135-inspect-and-fortify-tunnel.js
console.log('--- INSPECT & FORTIFY FORWARD TUNNEL TO MOUNTAIN ---');
console.log('Gamma pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Cobblestone:', lib.count('cobblestone'));

// 1. Check nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

// 2. Walk forward carefully along x=44 to z=-135
console.log('Moving along hallway to (44, 65, -135)...');
try {
  await lib.goTo(44, 65, -135, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo -135 note:', e.message);
}

console.log('Now at:', lib.fmt(bot.entity.position));

// 3. Inspect blocks from z=-133 to z=-141
console.log('Scanning tunnel structure z=-133 to z=-141...');
for (let z = -133; z >= -141; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  const roof = bot.blockAt(new Vec3(44, 67, z));
  const left = bot.blockAt(new Vec3(43, 65, z));
  const right = bot.blockAt(new Vec3(45, 65, z));
  console.log(`z=${z}: floor=${floor ? floor.name : 'null'}, feet=${feet ? feet.name : 'null'}, roof=${roof ? roof.name : 'null'}, left=${left ? left.name : 'null'}, right=${right ? right.name : 'null'}`);
}

// 4. Check hostile mobs nearby
const hostiles = lib.hostiles(24);
console.log('Hostiles within 24m:', JSON.stringify(hostiles));

bot.chat(`gamma at Fortress advance tunnel (44, 65, -135). Scanning bridge to mountain at z=-140.`);
