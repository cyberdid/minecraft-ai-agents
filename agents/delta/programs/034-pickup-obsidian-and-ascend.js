// programs/034-pickup-obsidian-and-ascend.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Equip stone sword for defense
await lib.equipWeapon();

// 2. Head to Beta's death spot at (298, 18, -32)
const betaDropSpot = new Vec3(298, 18, -32);
console.log('Approaching Beta drop spot at', lib.fmt(betaDropSpot));

try {
  await lib.goTo(betaDropSpot.x, betaDropSpot.y, betaDropSpot.z, 2, { timeoutMs: 15000 });
} catch (e) {
  console.log('goTo drop spot note:', e.message);
}

// 3. Pick up all drops in 12 block radius
const picked = await lib.pickup(12);
console.log(`Picked up ${picked} items!`);

console.log('Obsidian in inventory:', lib.count('obsidian'));
console.log('Full inventory:', JSON.stringify(lib.inv()));

// 4. Report to team
if (lib.count('obsidian') >= 10) {
  bot.chat(`delta: 10 OBSIDIAN SECURED! Ascending shaft to portal frame at (298, 72, -54)!`);
} else {
  bot.chat(`delta: Holding ${lib.count('obsidian')} obsidian, diamond pickaxe, flint & steel! Searching area.`);
}

// 5. Ascend staircase to surface
console.log('Ascending staircase to surface...');
const stages = [
  { x: 304, y: 54, z: -34 },
  { x: 302, y: 71, z: -44 },
  { x: 298, y: 72, z: -52 }
];

for (const s of stages) {
  if (isCancelled()) break;
  console.log(`Ascending to stage (${s.x}, ${s.y}, ${s.z})...`);
  try {
    await lib.goTo(s.x, s.y, s.z, 2, { timeoutMs: 25000 });
    console.log(`Reached stage at ${lib.fmt(bot.entity.position)}`);
  } catch (err) {
    console.log(`Stage note:`, err.message);
  }
}

console.log('Delta pos now:', lib.fmt(bot.entity.position));
console.log('Obsidian count:', lib.count('obsidian'));
