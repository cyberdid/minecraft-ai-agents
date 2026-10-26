// programs/245-reach-y19-and-pickup-drops.js
console.log('=== Program 245: Reach y=19 & Pickup Drops at (327, 19, -32) ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('beta: Yes! Drops are at (327, 19, -32)! Heading down to y=19 now!');

// Stages from y=47 down to (327, 19, -32)
const stages = [
  { x: 335, y: 32, z: -65 },
  { x: 328, y: 20, z: -70 },
  { x: 327, y: 19, z: -45 },
  { x: 327, y: 19, z: -32 }
];

for (let i = 0; i < stages.length; i++) {
  if (isCancelled()) break;
  const st = stages[i];
  console.log(`Heading to stage ${i+1}/${stages.length}: (${st.x}, ${st.y}, ${st.z})...`);
  try {
    await lib.goTo(st.x, st.y, st.z, 2, { dig: true, timeoutMs: 20000 });
    console.log(`Reached stage ${i+1}! Pos:`, lib.fmt(bot.entity.position));
  } catch (err) {
    console.log(`Stage ${i+1} note:`, err.message);
  }
}

console.log('Arrived at death spot area! Pos:', lib.fmt(bot.entity.position));

// Fight any mob in 8m
const hostiles = lib.hostiles(8);
if (hostiles.length > 0) {
  console.log(`Hostile nearby: ${hostiles[0].name}. Fighting...`);
  try {
    await lib.fight(8, 6);
  } catch (e) {}
}

// Pickup items
const gained = await lib.pickup(12);
console.log(`Picked up ${gained} items!`);
await sleep(800);
await lib.pickup(12);

console.log('Alpha inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Recovery result: diamond_pickaxe=${lib.count('diamond_pickaxe')}, water_bucket=${lib.count('water_bucket')}. Pos: ${lib.fmt(bot.entity.position)}.`);
