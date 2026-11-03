// programs/505-warp-nether-barter.js
console.log('=== GAMMA: WARP TO NETHER & ADVANCE TO BARTERING TUNNEL ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. If night in Overworld, sleep to set spawn and skip night
if (bot.game.dimension === 'overworld' && (bot.time.timeOfDay >= 12542 || bot.time.timeOfDay <= 500)) {
  try {
    console.log('Night/dusk detected, attempting to sleep in bed...');
    await lib.sleepInBed();
    console.log('Slept in bed!');
  } catch (e) {
    console.log('Sleep in bed notice:', e.message);
  }
}

// 2. Warp into Nether using autoloaded helper enterNetherPortal()
console.log('Entering Nether Portal...');
bot.chat('gamma: Entering Nether portal with golden_boots equipped...');
const portalRes = await enterNetherPortal(30000);
console.log('Portal transit result:', JSON.stringify(portalRes));

if (bot.game.dimension !== 'the_nether') {
  throw new Error(`Failed to enter the_nether, still in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

bot.chat('gamma: In Nether with golden_boots! 100% Piglin neutrality active. Marching to Covered Tunnel (44, 65, -145)...');

// 3. Configure fire avoidance & equip gear
configureFireAvoidance();
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 4. Quick check for nether_gold_ore near bunker (safe area, no Piglins)
try {
  const goldOreBlocks = bot.findBlocks({
    matching: mcData.blocksByName.nether_gold_ore.id,
    maxDistance: 8,
    count: 3
  });
  if (goldOreBlocks.length > 0) {
    console.log(`Found ${goldOreBlocks.length} nether_gold_ore near bunker, mining...`);
    for (const bPos of goldOreBlocks) {
      if (lib.tools().stone_pickaxe || lib.tools().iron_pickaxe || lib.tools().diamond_pickaxe) {
        await lib.dig(bPos.x, bPos.y, bPos.z);
        await sleep(200);
      }
    }
    await lib.pickup(4.0);
    // Craft any nuggets into ingots
    if (lib.count('gold_nugget') >= 9) {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
      console.log(`Crafted ingots! Current ingots: ${lib.count('gold_ingot')}`);
    }
  }
} catch (e) {
  console.log('Bunker gold ore check:', e.message);
}

// 5. March along safe waypoints to Covered Tunnel at WP 16: (44, 65, -145)
// Nether Pillbox Waypoints index 0 to 15
console.log(`Starting march to Covered Tunnel (44, 65, -145)... Current ingots: ${lib.count('gold_ingot')}`);
const targetTunnelPos = new Vec3(44, 65, -145);

for (let i = 0; i < NETHER_PILLBOX_WAYPOINTS.length; i++) {
  if (isCancelled()) break;
  if (bot.game.dimension !== 'the_nether') break;

  const wp = NETHER_PILLBOX_WAYPOINTS[i];
  const wpPos = new Vec3(wp.x, wp.y, wp.z);

  // If we already passed this waypoint, skip
  if (bot.entity.position.distanceTo(wpPos) < 2.5) continue;
  if (bot.entity.position.z < wp.z - 2.0 && bot.entity.position.distanceTo(wpPos) > 10.0) {
    // Already further north
    continue;
  }

  console.log(`Moving to WP ${i + 1}/${NETHER_PILLBOX_WAYPOINTS.length}: (${wp.x}, ${wp.y}, ${wp.z})`);
  await clearFireAhead();

  // Face ahead with low gaze (avoid Enderman aggro)
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try {
      await clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
    } catch (e2) {}
  }

  await clearFireAhead();
  try { await lib.pickup(3.0); } catch (e) {}

  // If reached covered tunnel at z <= -140, stop march
  if (bot.entity.position.z <= -140) {
    console.log(`Arrived at covered tunnel area! Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }

  if (bot.health <= 8) {
    console.log(`Health warning: HP ${bot.health}, pausing march in cover.`);
    break;
  }
}

console.log('March completed or reached tunnel. Current pos:', lib.fmt(bot.entity.position));

// 6. Look for Piglins in range (within 16 blocks) to barter!
let barteredCount = 0;
let initialPearls = lib.count('ender_pearl');

const findPiglins = () => {
  return Object.values(bot.entities).filter(e =>
    e.name === 'piglin' &&
    e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 16
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
};

let nearbyPiglins = findPiglins();
console.log(`Nearby Piglins detected: ${nearbyPiglins.length}`);

if (nearbyPiglins.length > 0 && lib.count('gold_ingot') > 0) {
  const piglin = nearbyPiglins[0];
  console.log(`Targeting Piglin at ${lib.fmt(piglin.position)}, distance: ${bot.entity.position.distanceTo(piglin.position).toFixed(1)}m`);
  
  // Approach Piglin safely to ~3m
  try {
    await bot.pathfinder.goto(new goals.GoalNear(piglin.position.x, piglin.position.y, piglin.position.z, 3.0));
  } catch (e) {}

  while (lib.count('gold_ingot') > 0 && !isCancelled()) {
    const p = findPiglins()[0];
    if (!p) {
      console.log('Piglin moved out of range');
      break;
    }

    const goldItem = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!goldItem) break;

    console.log(`Tossing 1 gold_ingot to Piglin at ${lib.fmt(p.position)}...`);
    await bot.lookAt(p.position.offset(0, 1.2, 0), true);
    await bot.toss(goldItem.type, null, 1);
    bot.chat(`gamma: Tossed gold ingot to Piglin! Bartering... (ingots left: ${lib.count('gold_ingot') - 1})`);
    barteredCount++;

    // Piglin inspects ingot for ~6-8 seconds
    console.log('Waiting 7.5s for Piglin inspection and trade drop...');
    await sleep(7500);

    // Vacuum bartered drops
    const picked = await lib.pickup(6.0);
    console.log(`Vacuumed items: ${picked}`);
    
    const curPearls = lib.count('ender_pearl');
    if (curPearls > initialPearls) {
      bot.chat(`gamma: GOT ENDER PEARLS! Count: ${curPearls}/12!`);
      console.log(`*** GOT ENDER PEARL! TOTAL: ${curPearls}/12 ***`);
      initialPearls = curPearls;
    }
  }
} else {
  console.log(`No piglins nearby or no gold ingots (ingots: ${lib.count('gold_ingot')}). Holding position in covered tunnel.`);
  bot.chat(`gamma: At tunnel ${lib.fmt(bot.entity.position)}. Ingots: ${lib.count('gold_ingot')}, Pearls: ${lib.count('ender_pearl')}/12, HP: ${bot.health.toFixed(1)}`);
}

const finalPearls = lib.count('ender_pearl');
const finalIngots = lib.count('gold_ingot');

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ingots: finalIngots,
  pearls: finalPearls,
  bartered: barteredCount,
  inv: lib.inv()
};
