// programs/182-check-beta-at-lava.js
console.log('Alpha pos:', lib.fmt(bot.entity.position));

for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    if (p.entity) {
      console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
    } else {
      console.log('Beta entity not in render distance');
    }
  }
}

// Check if Beta said anything
bot.chat('beta: I am at the lava pool with you! Do you have 1 iron or bucket? If not, I will run to base furnace for 1 ingot and bring water.');
