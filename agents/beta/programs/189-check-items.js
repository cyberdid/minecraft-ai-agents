console.log('Chest:', JSON.stringify(await lib.chestContents()))
console.log('Nearby items on ground:', Object.values(bot.entities).filter(e => e.name === 'item').map(e => `${e.name} at ${lib.fmt(e.position)}`))
