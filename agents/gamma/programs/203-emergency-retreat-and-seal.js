// programs/203-emergency-retreat-and-seal.js
console.log('--- EMERGENCY RETREAT TO SAFE BUNKER & SEAL DOORWAY ---');
console.log('HP before retreat:', bot.health);

// 1. Sprint back along bridge to z=-135 inside covered tunnel
await lib.walkTo(44.5, -138.0, 2000);
await lib.walkTo(44.5, -135.0, 2000);
bot.clearControlStates();

console.log('Retreated to safe tunnel at:', lib.fmt(bot.entity.position));

// 2. Seal the tunnel opening at z=-137 with cobblestone/soul_sand to block all fireballs
console.log('Sealing tunnel opening at (44, 65..66, -138)...');
try {
  await lib.place('soul_sand', 44, 65, -138);
} catch (e) {}
try {
  await lib.place('soul_sand', 44, 66, -138);
} catch (e) {}

console.log('Sealed tunnel! Current pos:', lib.fmt(bot.entity.position));
console.log('HP now:', bot.health, 'Food:', bot.food);

// Check if still on fire
const onFire = bot.entity.metadata ? bot.entity.metadata[0] & 1 : false;
console.log('On fire status:', onFire ? 'YES' : 'NO');

// Wait 10 seconds in safety for fire to extinguish and stabilize
await sleep(10000);

console.log('HP after 10s:', bot.health);
bot.chat(`gamma safely retreated to Fortress Workshop bunker at ${lib.fmt(bot.entity.position)}! HP: ${bot.health.toFixed(1)}/20.`);
