const Vec3 = require('vec3');

// 1. Eat apple to restore food and regenerate health
console.log(`Current health: ${bot.health.toFixed(1)}/20, food: ${bot.food}/20`);
const apple = bot.inventory.items().find(i => i.name === 'apple');
if (apple && bot.food < 20) {
  console.log('Equipping apple and eating...');
  try {
    await bot.equip(apple, 'hand');
    await bot.consume();
    console.log(`Ate apple! Food is now: ${bot.food}/20`);
  } catch (e) {
    console.log('Failed to eat apple:', e.message);
  }
}

// 2. Chat with alpha
bot.chat("Building now! Perimeter is X: 38..42, Z: -23..-19. I'm placing the wall base!");

// 3. Inspect 5x5 ground heights
console.log('--- 5x5 Ground Survey ---');
const groundGrid = [];
for (let z = -23; z <= -19; z++) {
  let row = `Z=${z}: `;
  for (let x = 38; x <= 42; x++) {
    const b78 = bot.blockAt(new Vec3(x, 78, z))?.name || 'air';
    const b79 = bot.blockAt(new Vec3(x, 79, z))?.name || 'air';
    const b80 = bot.blockAt(new Vec3(x, 80, z))?.name || 'air';
    row += `(${x}: 78=${b78}, 79=${b79}, 80=${b80}) `;
    groundGrid.push({ x, z, b78, b79, b80 });
  }
  console.log(row);
}

// Check alpha's position
const alpha = bot.players['alpha'];
console.log('Alpha at:', alpha?.entity?.position);

return { health: bot.health, food: bot.food, alphaPos: alpha?.entity?.position };
