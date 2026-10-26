// programs/117-reinforce-front-and-receive-team.js
console.log('--- REINFORCE FRONT & RECEIVE TEAM ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Craft planks from birch_logs for bridging blocks
if (lib.count('birch_log') >= 1) {
  console.log('Crafting planks for bridging blocks...');
  await lib.craft('birch_planks', 12);
  console.log('Planks now:', lib.count('birch_planks'));
}

// 2. Chat to arriving teammates
bot.chat('Alpha & Beta: Gamma & Delta holding front at (44, 65, -133)! Alpha, please toss 2 food to Gamma. Ready to bridge to Blaze Spawner (32, 68, -190)!');

// 3. Monitor arrival and pickup any food tossed
const startWait = Date.now();
while (Date.now() - startWait < 20000 && !isCancelled()) {
  await lib.pickup(4);
  // If we picked up food, eat it
  for (const f of ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple']) {
    if (lib.count(f) > 0 && bot.food < 18) {
      console.log(`Eating ${f}...`);
      await lib.eat();
      console.log('Health now:', bot.health, 'Food now:', bot.food);
    }
  }
  await sleep(1500);
}

// 4. Report all teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

// 5. Spawner and mob check
const spawner = new Vec3(32, 68, -190);
console.log(`Distance to Blaze Spawner (32, 68, -190): ${spawner.distanceTo(bot.entity.position).toFixed(1)}m`);
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && e.position);
console.log(`Blazes visible: ${blazes.length}`);

bot.chat(`gamma at (44, 65, -133): Health=${bot.health}, Food=${bot.food}. Spawner distance: 59m. Ready for team bridge!`);
