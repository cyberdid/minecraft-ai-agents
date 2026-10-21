// programs/021-greet-beta.js
bot.chat("beta: Welcome back! I'm at (10, 65, -26) with sandstone. Night in 130s, let's build shelter!")

// Craft last sandstone from 4 sand
if (lib.count('sand') >= 4) {
  try {
    await lib.craft('sandstone', 1)
  } catch (e) {
    console.log('craft err:', e.message)
  }
}
console.log('alpha inventory:', JSON.stringify(lib.inv()))

// Move close to beta if beta is nearby
const beta = bot.players.beta?.entity
if (beta) {
  console.log('Beta pos:', lib.fmt(beta.position))
  try {
    await bot.pathfinder.goto(new goals.GoalNear(beta.position.x, beta.position.y, beta.position.z, 2))
  } catch (e) {
    console.log('approach err:', e.message)
  }
}

// Check nearby crafting tables or chests
const table = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 16 })
console.log('crafting table nearby:', !!table)

return lib.status()
