// programs/514-wait-alpha-bunker.js
console.log('=== GAMMA: BUNKER RENDEZVOUS & GEAR POOLING ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Stay securely inside the bunker
bot.chat('alpha: I am inside Fortress Workshop Bunker at (44, 65, -127). Please toss 2 cooked food & gold ingots when you arrive!');

const startWait = Date.now();
let teammateMet = null;

// Wait up to 25s for Alpha to arrive along the high ridge
while (Date.now() - startWait < 25000 && !isCancelled()) {
  const nearbyPlayers = Object.values(bot.entities).filter(e =>
    e.type === 'player' && e.username !== bot.username && bot.entity.position.distanceTo(e.position) <= 12
  );

  if (nearbyPlayers.length > 0) {
    teammateMet = nearbyPlayers[0];
    console.log(`Teammate arrived: ${teammateMet.username} at ${lib.fmt(teammateMet.position)} (dist: ${bot.entity.position.distanceTo(teammateMet.position).toFixed(1)}m)`);
    bot.chat(`gamma: Welcome ${teammateMet.username}! Standing by for food / gold drop!`);
    await sleep(2000);
    break;
  }

  // Vacuum any drops that might have been tossed
  const picked = await lib.pickup(4.0);
  if (picked > 0) {
    console.log(`Picked up ${picked} items!`);
  }

  // Eat if we got food
  const foodItem = bot.inventory.items().find(i =>
    i.name.includes('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name === 'baked_potato'
  );
  if (foodItem) {
    try {
      await lib.eat();
      console.log(`Ate food! New Food: ${bot.food}, HP: ${bot.health}`);
    } catch (e) {}
  }

  await sleep(1500);
}

// Final vacuum
await lib.pickup(5.0);

// Check inventory after rendezvous
const finalFood = bot.inventory.items().filter(i =>
  i.name.includes('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name === 'baked_potato'
);
if (finalFood.length > 0) {
  try {
    await lib.eat();
    console.log(`Ate food! New Food: ${bot.food}, HP: ${bot.health}`);
  } catch (e) {}
}

const finalIngots = lib.count('gold_ingot');
const finalPearls = lib.count('ender_pearl');

bot.chat(`gamma: Bunker Status - HP: ${bot.health.toFixed(1)}, Food: ${bot.food}/20, Gold Ingots: ${finalIngots}, Pearls: ${finalPearls}/12`);

return {
  teammateMet: teammateMet ? teammateMet.username : null,
  hp: bot.health,
  food: bot.food,
  ingots: finalIngots,
  pearls: finalPearls,
  inv: lib.inv()
};
