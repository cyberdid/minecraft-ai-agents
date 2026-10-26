const cows = bot.nearestEntity(e => e.name === 'cow')
const pigs = bot.nearestEntity(e => e.name === 'pig')
const sheep = bot.nearestEntity(e => e.name === 'sheep')
const chickens = bot.nearestEntity(e => e.name === 'chicken')

console.log('Nearby animals:', {
  cow: cows ? `${lib.fmt(cows.position)} dist ${bot.entity.position.distanceTo(cows.position).toFixed(1)}` : 'none',
  pig: pigs ? `${lib.fmt(pigs.position)} dist ${bot.entity.position.distanceTo(pigs.position).toFixed(1)}` : 'none',
  sheep: sheep ? `${lib.fmt(sheep.position)} dist ${bot.entity.position.distanceTo(sheep.position).toFixed(1)}` : 'none',
  chicken: chickens ? `${lib.fmt(chickens.position)} dist ${bot.entity.position.distanceTo(chickens.position).toFixed(1)}` : 'none'
})

const ironOre = lib.find(['iron_ore', 'deepslate_iron_ore'], { count: 5, maxDistance: 64 })
console.log('Iron ore found:', ironOre.map(b => `${b.name} at ${lib.fmt(b.position)}`))

const water = lib.find('water', { count: 3, maxDistance: 32 })
console.log('Water nearby:', water.map(b => lib.fmt(b.position)))
