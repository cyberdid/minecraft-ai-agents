// programs/510-seal-hole-and-request-food.js
console.log('=== GAMMA: SEAL HOLE, CLEAR TUNNEL, AND COOPERATE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Dig blocking netherrack at (44, 65, -146) if present
const block146 = bot.blockAt(new Vec3(44, 65, -146));
if (block146 && block146.name !== 'air') {
  console.log(`Clearing obstruction at (44, 65, -146): ${block146.name}`);
  try {
    await lib.dig(44, 65, -146);
    console.log('Obstruction cleared!');
  } catch (e) {
    console.log('Dig error:', e.message);
  }
}

// 2. Seal floor gap at (44, 64, -148)
const gapBlock = bot.blockAt(new Vec3(44, 64, -148));
if (gapBlock && (gapBlock.name === 'air' || gapBlock.name === 'cave_air')) {
  console.log('Sealing floor gap at (44, 64, -148)...');
  // Need a support block to place against. (44, 64, -147) is cobblestone!
  const refBlock = bot.blockAt(new Vec3(44, 64, -147));
  if (refBlock && refBlock.boundingBox === 'block') {
    try {
      // Stand safely at (44, 65, -145) or (45, 65, -145)
      await bot.pathfinder.goto(new goals.GoalNear(44.5, 65.0, -145.5, 0.5));
      const placeItem = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack' || i.name === 'dirt');
      if (placeItem) {
        await bot.equip(placeItem.type, 'hand');
        // Place against the south face (+z) of (44, 64, -147) -> target is (44, 64, -148)
        await bot.placeBlock(refBlock, new Vec3(0, 0, -1));
        console.log(`*** PLACED ${placeItem.name} AT (44, 64, -148)! GAP SEALED! ***`);
        bot.chat('gamma: Permanently sealed floor hole at (44, 64, -148) with solid block!');
      }
    } catch (e) {
      console.log('Place error at gap:', e.message);
      try {
        await lib.place('cobblestone', 44, 64, -148);
        console.log('lib.place succeeded for gap!');
      } catch (e2) {
        console.log('lib.place fallback error:', e2.message);
      }
    }
  }
} else {
  console.log(`Floor at (44, 64, -148) is already solid: ${gapBlock ? gapBlock.name : 'null'}`);
}

// 3. Request food from teammates and pickup
bot.chat('gamma: Beta / Delta, please toss 2-3 cooked food for HP regen! (HP: 12.5, Food: 10)');
console.log('Waiting 6s for teammate food toss...');
await sleep(6000);

// Vacuum any dropped items nearby
const picked = await lib.pickup(5.0);
console.log(`Picked up items: ${picked}`);

// Check inventory for food and eat if available
const foodItems = bot.inventory.items().filter(i =>
  i.name.includes('cooked_') || i.name === 'bread' || i.name === 'apple' || i.name === 'baked_potato'
);
if (foodItems.length > 0) {
  console.log(`Found food in inventory: ${foodItems.map(f => `${f.name} x${f.count}`).join(', ')}`);
  try {
    await lib.eat();
    console.log(`Ate food! New Food: ${bot.food}, HP: ${bot.health}`);
  } catch (e) {
    console.log('Eat error:', e.message);
  }
}

// 4. Check for Piglins nearby to barter with Gamma's gold_ingot
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 12
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

if (piglins.length > 0 && lib.count('gold_ingot') > 0) {
  const p = piglins[0];
  console.log(`Bartering with Piglin at ${lib.fmt(p.position)}...`);
  const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
  if (gold) {
    await bot.lookAt(p.position.offset(0, 1.2, 0), true);
    await bot.toss(gold.type, null, 1);
    bot.chat('gamma: Tossed gold_ingot to Piglin! Waiting 8s for bartered drops...');
    await sleep(8000);
    await lib.pickup(5.0);
  }
}

const finalPearls = lib.count('ender_pearl');
const finalFood = bot.food;
const finalHp = bot.health;

return {
  hp: finalHp,
  food: finalFood,
  pearls: finalPearls,
  pos: bot.entity.position,
  inv: lib.inv()
};
