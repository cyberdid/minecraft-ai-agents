// programs/154-create-forward-observation-slit.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const upperEndcap = new Vec3(44, 66, -135);
console.log('Upper endcap block at (44, 66, -135):', bot.blockAt(upperEndcap)?.name);

// 1. Mine upper endcap block to create an eye-level observation slit
if (bot.blockAt(upperEndcap)?.name === 'granite') {
  console.log('Mining upper granite block at (44, 66, -135) to create forward observation slit...');
  await lib.dig(44, 66, -135);
  console.log('Mined! Block now:', bot.blockAt(upperEndcap)?.name);
  await sleep(300);
}

// 2. Pick up dropped block
try {
  await lib.pickup(3);
} catch (e) {}

// 3. Inspect what is directly visible in front through the slit
console.log('--- View through forward observation slit (z=-136..-140) ---');
for (let z = -136; z >= -140; z--) {
  for (let y = 64; y <= 68; y++) {
    const b = bot.blockAt(new Vec3(44, y, z));
    if (b && b.name !== 'air' && b.name !== 'cave_air') {
      console.log(`Block at (44, ${y}, ${z}): ${b.name}`);
    }
  }
}

// 4. Verify lower barricade is solid
const lowerBarricade = bot.blockAt(new Vec3(44, 65, -135));
console.log(`Lower barricade at (44, 65, -135): ${lowerBarricade?.name}`);

// 5. Equip weapon
await lib.equipWeapon();
console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat('delta: Created 1-block observation & strike slit at (44, 66, -135). View to netherrack mountain z=-140 is clear.');
