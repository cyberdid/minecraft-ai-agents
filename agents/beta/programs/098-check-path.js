const path = bot.pathfinder.getPathTo(new Movements(bot, mcData), new goals.GoalNear(340, -55, -54, 2))
console.log('Path status:', path.status)
console.log('Path length:', path.path ? path.path.length : 0)
