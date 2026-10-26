// programs/146-bridge-gap-to-mountain.js
console.log('--- BRIDGE GAP TO GLOWSTONE MOUNTAIN (Z=-148) ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Move to (44, 65, -141)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -141));
} catch (e) {}

console.log('At (44, 65, -141). Inspecting blocks ahead:');
for (let z = -142; z >= -148; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z));
  const feet = bot.blockAt(new Vec3(44, 65, z));
  const head = bot.blockAt(new Vec3(44, 66, z));
  console.log(`z=${z}: floor=${f ? f.name : 'air'}, feet=${feet ? feet.name : 'air'}, head=${head ? head.name : 'air'}`);
}

// 2. Helper to get any building block
function getBuildBlock() {
  const candidates = ['cobblestone', 'netherrack', 'birch_planks', 'dirt', 'granite'];
  for (const c of candidates) {
    if (lib.count(c) > 0) return c;
  }
  return null;
}

// 3. Clear feet/head barricades at z=-143 if they block forward bridge placement
const feet143 = bot.blockAt(new Vec3(44, 65, -143));
const head143 = bot.blockAt(new Vec3(44, 66, -143));

// Check if floor at (44, 64, -143) is missing
const f143 = bot.blockAt(new Vec3(44, 64, -143));
if (!f143 || f143.name === 'air') {
  console.log('Placing floor at (44, 64, -143)...');
  const bname = getBuildBlock();
  if (bname) {
    try {
      await lib.place(bname, 44, 64, -143);
      console.log(`Placed floor at (44, 64, -143) using ${bname}`);
    } catch (e) {
      console.log('Floor 143 place err:', e.message);
    }
  }
}

// Check floor at (44, 64, -144)
const f144 = bot.blockAt(new Vec3(44, 64, -144));
if (!f144 || f144.name === 'air') {
  console.log('Placing floor at (44, 64, -144)...');
  const bname = getBuildBlock();
  if (bname) {
    try {
      await lib.place(bname, 44, 64, -144);
      console.log(`Placed floor at (44, 64, -144) using ${bname}`);
    } catch (e) {
      console.log('Floor 144 place err:', e.message);
    }
  }
}

// Check floor at (44, 64, -145)
const f145 = bot.blockAt(new Vec3(44, 64, -145));
if (!f145 || f145.name === 'air') {
  console.log('Placing floor at (44, 64, -145)...');
  const bname = getBuildBlock();
  if (bname) {
    try {
      await lib.place(bname, 44, 64, -145);
      console.log(`Placed floor at (44, 64, -145) using ${bname}`);
    } catch (e) {
      console.log('Floor 145 place err:', e.message);
    }
  }
}

bot.chat(`gamma advancing bridge floor to z=-145 towards glowstone mountain at z=-148!`);
console.log('Final inv:', JSON.stringify(lib.inv()));
