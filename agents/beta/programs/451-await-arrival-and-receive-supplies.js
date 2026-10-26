// programs/451-await-arrival-and-receive-supplies.js
console.log('=== Step: Await Alpha & Delta at Fortress Bunker (44, 65, -129) and receive supplies ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

bot.chat('beta: Alpha/Delta, I see you on the ridge! Bunker entrance is at (44, 66, -128). Unlocking when you arrive!');

// Monitor for teammate arrival for up to 25s
let teammateArrived = false;
for (let t = 0; t < 25; t++) {
  if (isCancelled()) break;
  for (const [name, player] of Object.entries(bot.players)) {
    if (player.entity && name !== 'beta') {
      const dist = bot.entity.position.distanceTo(player.entity.position);
      if (dist < 8) {
        console.log(`Teammate ${name} arrived at bunker! Distance: ${dist.toFixed(1)}m`);
        teammateArrived = true;
        break;
      }
    }
  }
  if (teammateArrived) break;
  await sleep(1000);
}

// If teammate arrived, dig doorway block at (44, 66, -128) to let them in
if (teammateArrived) {
  const doorBlock = bot.blockAt(new Vec3(44, 66, -128));
  if (doorBlock && doorBlock.name !== 'air') {
    try {
      await lib.dig(44, 66, -128);
      console.log('Opened bunker doorway for teammate!');
    } catch (e) {}
  }
}

// Pick up any tossed drops
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 6
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.6);
    console.log(`Collected drop at ${lib.fmt(d.position)}!`);
  } catch (e) {}
}

// Eat if food obtained
const foods = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple'];
for (const f of foods) {
  while (lib.count(f) > 0 && bot.food < 20 && !isCancelled()) {
    try {
      await bot.equip(mcData.itemsByName[f].id, 'hand');
      await bot.consume();
      console.log(`Ate ${f}! HP now: ${bot.health}/20, Food: ${bot.food}/20`);
      await sleep(350);
    } catch (e) { break; }
  }
}

console.log(`Final status: HP=${bot.health.toFixed(1)}/20, Food=${bot.food}/20, Inv=`, JSON.stringify(lib.inv()));
bot.chat(`beta: Fortress Outpost united! HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20. Ready to push into Fortress corridors!`);
