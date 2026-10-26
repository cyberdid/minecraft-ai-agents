// programs/060-survey-and-status.js
console.log('--- GAMMA STATUS CHECK ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));
console.log('Tools:', JSON.stringify(lib.tools()));

// Armor slots: 5: helmet, 6: chestplate, 7: leggings, 8: boots, 45: offhand (shield)
const armor = {
  head: bot.inventory.slots[5]?.name || null,
  torso: bot.inventory.slots[6]?.name || null,
  legs: bot.inventory.slots[7]?.name || null,
  feet: bot.inventory.slots[8]?.name || null,
  offhand: bot.inventory.slots[45]?.name || null
};
console.log('Equipped Armor:', JSON.stringify(armor));

// Teammates positions
const team = ['alpha', 'beta', 'delta'];
for (const name of team) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at:`, lib.fmt(p.entity.position));
  } else {
    console.log(`Teammate ${name} not in range or not logged in`);
  }
}

// Distance to base
const baseDoor = new Vec3(294, 72, -54);
console.log('Distance to base door:', bot.entity.position.distanceTo(baseDoor).toFixed(1));

// Check time
console.log('Time:', JSON.stringify(lib.time()));
