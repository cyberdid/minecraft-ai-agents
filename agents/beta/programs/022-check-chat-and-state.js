// 022-check-chat-and-state.js - check chat, position, alpha, and beds
console.log('Position:', lib.fmt(bot.entity.position))
console.log('Alpha:', bot.players.alpha?.entity?.position ? lib.fmt(bot.players.alpha.entity.position) : 'unknown')
console.log('Inventory:', JSON.stringify(lib.inv()))

const beds = lib.find('white_bed', { maxDistance: 32 })
console.log('Placed beds found within 32 blocks:', beds.map(b => lib.fmt(b.position)).join(', '))

return { pos: bot.entity.position, time: lib.time(), beds }
