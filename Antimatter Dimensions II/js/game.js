function updateDimensionSet(name="dimension", abbr="", curr="") {
	var Name = name[0].toUpperCase() + name.slice(1)
	
	var c12 = inChallenge(12) && name == "dimension";
	
	for(var i = 10; i >= 0; i--) {
		if(i < 10-c12) {
			var tickspeed = inChallenge(7) ? 1 : getTickspeed(name);
			var base = window["get" + Name + "Production"](i + 1)
			var dimProduction = base.gt(0) ? base.multiply(tickspeed).multiply(getChallengeMultiplier(name)) : new Decimal(0)
			if(c12) var dimProductionUp = window["get" + Name + "Production"](i + 2).multiply(tickspeed).multiply(getChallengeMultiplier(name))
			var realProduction = i ? (c12 ? dimProductionUp : dimProduction) : (c12 ? dimProduction.divide(100).add(dimProductionUp) : dimProduction);
			game[name + "s"][i].amount = game[name + "s"][i].amount.add(realProduction.multiply(diff/1000));
			if (i < 9-c12) ge(abbr + "dimgrowth" + i).textContent = game[name + "s"][i].amount.eq(0)?"":"(+" + shorten(realProduction.divide(game[name + "s"][i].amount).multiply(100)) + "%/s)"
		}
		
		if (i) {
			var display =
			game[name + "s"][i - 1].amount.gt(0) && (
				name == "dimension" ?
				game.shifts + 4 >= i : 
			name == "infinityDimension" ? 
				game.infinityShifts.gte(i) : 
				true
			)

			if (display) {
				ge(abbr + "dimamount" + i).textContent = shortenMoney(game[name + "s"][i].amount)
				ge(abbr + "dimmult" + i).textContent = shorten(game[name + "s"][i].multiplier)
				ge(abbr + "dimbuy" + i).textContent = "Cost: " + shortenCosts(game[name + "s"][i].cost) + curr
				ge(abbr + "dimbuy" + i).className = window["canBuy" + Name](i) ? "buy" : "lock"
			}
			ge(abbr + "dimDisplay" + i).style.display = display?"":"none"
		}
	}
}

function update() {
	diff = Date.now() - game.lastUpdate || 0;
	game.lastUpdate = Date.now()
	
	diff *= parseInt(localStorage.hacker) || 1;
	
	setTimeout(update, 1)
	
	game.dimMult = new Decimal(2);
	if(game.infinityUpgrades.includes(5)) game.dimMult = game.dimMult.multiply(1.1)
	if(inChallenge(2)) game.dimMult = game.dimMult.multiply(0.8)
	if(challengeCompleted(4, 1)) game.dimMult = game.dimMult.multiply(1.5)
	
	updateDimensionSet("dimension")
	updateDimensionSet("infinityDimension", "inf", " IP")
	// updateDimensionSet("timeDimension", "time", " EP")
	game.totalAntimatter = game.totalAntimatter.add(getDimensionProduction(1).multiply(getTickspeed("dimension")).multiply(diff/1000));
	
	if(inChallenge(2, 1)) sacrifice()
	
	ge("antimatter").textContent = getFullExpansion(game.dimensions[0].amount)
	ge("antimatterGrowth").textContent = getFullExpansion(getDimensionProduction(1).multiply(inChallenge(7) ? 1 : getTickspeed("dimension")))
	
	ge("infinityPower").textContent = getFullExpansion(game.infinityDimensions[0].amount)
	ge("infinityPowerEffect").textContent = shorten(getInfinityPowerEffect())
	ge("infinityPowerGrowth").textContent = getFullExpansion(getInfinityDimensionProduction(1).multiply(getTickspeed("infinityDimension")))
	
	ge("tickspeed").textContent = inChallenge(7) ? "" : shorten(getTickspeed("dimension"));
	ge("buyTickspeed").textContent = "Cost: " + shortenCosts(game.tickspeed.cost);
	ge("buyTickspeed").className = ge("maxTickspeed").className = canBuyTickspeed() ? "buy" : "lock"
	
	ge("dimMult").textContent = shorten(game.dimMult, 2, 1)
	
	displayIf("sacrificeContainer", game.shifts == 5)
	ge("sacrifice").className = "buy"
	ge("sacrifice").textContent = "Dimensional Sacrifice (" + shorten(getSacrificeGain()) + "x)"
	ge("sacrificePower").textContent = shorten(game.sacrificeMult)
	
	ge("shifts").textContent = game.shifts;
	ge("shiftReq").textContent = tierNames[game.shifts+4]
	ge("shift").className = canShift() ? "buy" : "lock"
	
	ge("boosts").textContent = getFullExpansion(getEffectiveDimensionBoosts());
	dr = getDimensionBoostReq()
	ge("boostReq").textContent = (inChallenge(10) ? getFullExpansion(dr, 2) + " fourth " : getFullExpansion(dr.ceil()) + " ninth ");
	ge("boost").className = canBoost() ? "buy" : "lock" 
	
	ge("galaxies").textContent = getFullExpansion(getEffectiveNormalGalaxies());
	ge("galaxyReq").textContent = getFullExpansion(getGalaxyReq()) + (inChallenge(10) ? " fourth " : " ninth ");
	ge("galaxy").className = canGalaxy() ? "buy" : "lock" 
	
	displayIf("shiftDisplay", game.shifts < 5 && !inChallenge(10));
	displayIf("boostDisplay", game.shifts == 5 || inChallenge(10));
	displayIf("galaxyDisplay", game.shifts == 5 || inChallenge(10));
	displayIf("sacrificeDisplay", game.shifts == 5)
	
	ge("boostName").textContent = getEffectiveDimensionBoosts().gte(getDimensionHypersonicStart()) ? "Dimension Hypersonic" : game.boosts.gte(getDimensionSupersonicStart()) ? "Dimension Supersonic" : "Dimension Boost"
	ge("galaxyName").textContent = getEffectiveNormalGalaxies().gte(getDarkGalaxyStart()) ? "Dark Antimatter Galaxies" : getEffectiveNormalGalaxies().gte(getRemoteGalaxyStart()) ? "Remote Antimatter Galaxies" : game.galaxies.gte(getDistantGalaxyStart()) ? "Distant Antimatter Galaxies" : "Antimatter Galaxies"
	ge("boostPower").textContent = shorten(getDimensionBoostPower(), 2, 1)
	ge("boostEffect").textContent = "(" + shorten(getDimensionBoostEffect()) + "x on all dimensions)"
	ge("galaxyPower").textContent = shortenMoney(getGalaxyPower(), 2, 1)
	ge("galaxyEffect").innerHTML = inChallenge(7) ? "x" + shorten(getTickPower().pow(7)) + " on 9th dimensions" : getTickPower().gte(2) ? "x" + shorten(getTickPower()) : "+" + shorten(getTickPower().subtract(1).multiply(100)) + "%"

	game.tickCostMultIncrease = 10 - game.repeatInf[0].bought;
	game.dimCostMultIncrease = 10 - game.repeatInf[2].bought;

	displayIf("infinityTabButton", game.infinities.gt(0))
	displayIf("challengesTabButton", game.infinityUpgrades.length > 15)
	displayIf("automationTabButton", getChallengeCompletions()) // Note to self: Finish this you lazy motherfucker

	gc("infinityPoints", function(e) {
		e.textContent = shortenMoney(game.infinityPoints.floor())
	})

	if (game.currentTab == "infinity") {
		var infinityUpgradeDescriptions = [
			"Multiplier on all dimensions based on total existence time<br>Currently: " + shorten(getInfinityUpgradeEffect(0)) + "x",
			"Multiplier on all dimensions based on time in this infinity<br>Currently: " + shorten(getInfinityUpgradeEffect(1)) + "x",
			"Multiplier for unspent infinity points on first dimensions<br>Currently: " + shorten(getInfinityUpgradeEffect(2)) + "x",
			"You start with the fifth and sixth dimensions unlocked",
			"Dimensions 1-3 gain a multiplier based on infinities<br>Currently: " + shorten(getInfinityUpgradeEffect(4)) + "x",
			"Dimension upgrade multiplier is 10% stronger",
			"Multiplier for unspent infinity points on all dimensions<br>Currently: " + shorten(getInfinityUpgradeEffect(6)) + "x",
			"You start with the seventh and eighth dimensions unlocked",
			"Dimensions 4-6 gain a multiplier based on infinities<br>Currently: " + shorten(getInfinityUpgradeEffect(4)) + "x",
			"Dimension boost multiplier is 25% stronger",
			"Infinity point generation based on fastest infinity",
			"You start with the ninth dimensions unlocked and one galaxy",
			"Dimensions 7-9 gain a multiplier based on infinities<br>Currently: " + shorten(getInfinityUpgradeEffect(4)) + "x",
			"Dimension boost cost increases by 25% less",
			"Infinity stat generation based on fastest infinity",
			"Antimatter galaxies are twice as effective",
			"Break Infinity",
			"Power up all dimensions based on current antimatter<br>Currently: " + shorten(getInfinityUpgradeEffect(17)) + "x",
			"Power up all dimensions based on total antimatter produced<br>Currently: " + shorten(getInfinityUpgradeEffect(18)) + "x",
			"Power up all dimensions based on ninth dimensions<br>Currently: " + shorten(getInfinityUpgradeEffect(19)) + "x",
			"Power up all dimensions based on infinities<br>Currently: " + shorten(getInfinityUpgradeEffect(20)) + "x",
			"Power up all dimensions based on challenge times<br>Currently: " + shorten(getInfinityUpgradeEffect(21)) + "x",
			"Power up all dimensions based on achievements<br>Currently: " + shorten(getInfinityUpgradeEffect(22)) + "x",
			"Infinity Dimensions get a multiplier based on their tier, giving the best boost to the lowest",
			"Dimension boost multiplier is 60% stronger",
			"Antimatter galaxies are 10% stronger",
			"Do nothing",
			"Waste 10 million IP",
			"Make this button green",
			"",
			"",
			"",
		]
		for(var i = 0; i < 32; i++) {
			ge("infinityUpgrade" + i).className = game.infinityUpgrades.includes(i) ? "infinityUpgradeBought" : canBuyInfinityUpgrade(i) ? "infinityUpgrade" : "infinityUpgradeLocked";
			ge("infinityUpgradeDesc" + i).innerHTML = infinityUpgradeDescriptions[i];
			ge("infinityUpgradeCost" + i).innerHTML = shortenCosts(infinityUpgradeCosts[i]) + " IP";
		}
	}
	
	var text = ""
	if(game.infinityUpgrades.includes(10)) {
		game.infinityPoints = game.infinityPoints.add(getInfinityPointMult().multiply(getInfinityUpgradeEffect(10)).multiply(diff));
		text += "You generate " + shortenMoney(getInfinityPointMult()) + " IP ";
	}
	if(game.infinityUpgrades.includes(14)) {
		game.infinities = game.infinities.add(getInfinityUpgradeEffect(10) * diff);
		text += "and 1 infinity ";
	}
	if(text.length) text += "every " + timeDisplay(1 / getInfinityUpgradeEffect(10)) + "."
		ge("infinityPointGeneration").textContent = text;
		ge("breakButton").textContent = game.break?"FIX INFINITY" : "BREAK INFINITY"
		ge("breakButton").setAttribute("tooltip", 
			getChallengeCompletions() >= 10 ? 
				`Allows numbers to exceed ${shorten(Number.MAX_VALUE)}, increasing infinity point gain.` : 
				`10 challenge completions are required to break infinity.
				Progress: ${getChallengeCompletions()} / 10`
		)

	c = game.dimensions[0].amount.gte(Number.MAX_VALUE) && !(game.bestInfinityTime < 60000 || game.break);
	displayIf("tabButtons", !c)
	
	if(c) {
		if(!lastTab) {
			lastTab = game.currentTab;
		}
		showTab("bigCrunch")
	}
	
	displayIf("infinityTabs", game.infinityUpgrades.length > 15)
	
	var rate = gainedInfinityPoints().divide(getTimeSince("infinity")/60000)
	if(!game.bestIPRate || game.bestIPRate.lt(rate)) {
		game.bestIPRate = rate;
		game.bestIPRateAt = gainedInfinityPoints()
	}

	displayIf("infinityPrestige", game.infinities.gt(0))
	displayIf("gainedIP", (game.bestInfinityTime < 60000 && atInfinity()) || game.break);
	ge("gainedIP").style.fontSize = game.break || inChallenge() ? "11px" : "30px"
	ge("gainedIP").innerHTML = getChallengeSet() == 1 || getChallengeSet() == 2 ? 
		(canCompleteChallenge() ? "Big Crunch to complete challenge." : "Reach " + shortenMoney(getChallengeGoal()) + " antimatter to complete challenge.") : 
		game.break ? 
			"<b>Big Crunch for " + shortenMoney(gainedInfinityPoints()) + "<br>Infinity Points.</b><br>" + 
			shorten(rate) + " IP/min<br>Peak: " + 
			(game.options.showBestRateAt ? shorten(game.bestIPRateAt) + " IP" : shorten(game.bestIPRate) + " IP/min") : "<b>Big Crunch</b>"
	
	// ge("antimetal").textContent = getFullExpansion(game.automator.antimetal)
	displayIf("dimensionTabs", game.break)
	
	displayIf("postInfinityUpgrades", game.break)

	ge("repeatInf0").innerHTML = "Tickspeed cost multiplier increase<br>" + game.tickCostMultIncrease + "x" + (game.repeatInf[0].bought.lt(7) ? " > " + (game.tickCostMultIncrease-1) + "x<br>Cost: " + shortenMoney(getRepeatInfCost(0)) + " IP" : "")
	ge("repeatInf1").innerHTML = "Multiply IP gain by 2<br>Currently: " + shortenMoney(Decimal.pow(2, game.repeatInf[1].bought)) + "x<br>Cost: " + shortenMoney(getRepeatInfCost(1)) + " IP"
	ge("repeatInf2").innerHTML = "Dimension cost multiplier increase<br>" + game.dimCostMultIncrease + "x" + (game.repeatInf[2].bought.lt(5) ? " > " + (game.dimCostMultIncrease-1) + "x<br>Cost: " + shortenMoney(getRepeatInfCost(2)) + " IP" : "")
	
	ge("repeatInf0").className = game.repeatInf[0].bought.gt(6) ? "infinityUpgradeBought" : canBuyRepeatInf(0) ? "infinityUpgrade" : "infinityUpgradeLocked"
	ge("repeatInf1").className = canBuyRepeatInf(1) ? "infinityUpgrade" : "infinityUpgradeLocked"
	ge("repeatInf2").className = game.repeatInf[2].bought.gt(4) ? "infinityUpgradeBought" : canBuyRepeatInf(2) ? "infinityUpgrade" : "infinityUpgradeLocked"

	ge("infinityshiftcost").textContent = (getChallengeCompletions(1) > 11 || game.infinityShifts.lt(4)) ? "Reach " + shortenCosts(getInfinityShiftCost()) + " antimatter to unlock a new dimension." : "Complete all 12 infinity challenges to unlock."
	displayIf("infinityPowerArea", game.infinityShifts.gt(0))
	ge("infinityshift").className = canInfinityShift() ? "buy" : "lock"

	ge("challengeInfo").style.left = innerWidth / 2 - 175;
	ge("challengeInfo").style.top = 290;
	
	displayIf("challengeMultiplier", inChallenge(4) || inChallenge(5) || inChallenge(6))
		
	ge("challengeMultiplier").innerHTML = "<br>Challenge production factor: " + getChallengeMultiplier().multiply(100).toFixed(2) + "%"
	
	if(game.currentTab == "challenges") {
		updateChallengeDescriptions();
		ge("challengeDescription").innerHTML = challengeDescriptions[selectedChallenge+game.selectedChallengeType*12]
		ge("cLeft").style.opacity = (game.selectedChallengeType > 0) + 0
		ge("cRight").style.opacity = (game.selectedChallengeType < getChallengeTypeCap()) + 0
		ge("challengeBenefits").innerHTML = getChallengeBenefits()
	}
	
	if(game.currentTab == "statistics") {
		ge(game.currentStatisticsTab + "StatisticsTab").innerHTML = getStatisticsDisplay(game.currentStatisticsTab)
	}

	// Achievement checks
	
	ge("achievementCompletions").innerText = getFullExpansion(game.achievements.length) + " / " + getFullExpansion(achievements);
	ge("achievementMultiplier").innerText = getFullExpansion(getAchievementMultiplier());
	ge("achievementRowCompletions").innerText = getFullExpansion(game.achievementRowsCompleted);

	if(game.shifts == 5) giveAchievement(10);
	if(game.boosts.gte(5)) giveAchievement(11);
	if(game.dimensions[0].amount.gt(1e303)) giveAchievement(12)
	if(game.galaxies.gt(0)) giveAchievement(13)
	if(game.galaxies.gt(1)) giveAchievement(14)
	if(game.galaxies.gt(2)) giveAchievement(15)
	if(game.dimensions[0].amount.gte(6.66e201) && game.dimensions[9].amount.eq(9)) giveAchievement(17)
	
	if(game.sacrificeMult.gte(66666) && !inChallenge(8)) giveAchievement(18)
	if(game.dimensions[8].amount.gt(1e27)) giveAchievement(19)
	if(getTickspeed("dimension").gt(1e16)) giveAchievement(20)
	if(game.infinities.gt(10)) giveAchievement(21)
	if(game.dimensions[0].amount.gte(Number.MAX_VALUE) && game.sacrificeMult.eq(1)) giveAchievement(26)
	if(game.totalGalaxies.gte(100)) giveAchievement(27)
	if(game.infinityPoints.gte(1000)) giveAchievement(28);
	if(game.infinities.gte(1000)) giveAchievement(30);
	if(getChallengeCompletions() > 0) giveAchievement(32);
	if(game.challenges[0][9].completed) giveAchievement(33);
	if(getChallengeCompletions() > 11) giveAchievement(35);
	if(game.break) giveAchievement(36);
	if(game.totalAntimatter.gt(Decimal.pow(Number.MAX_VALUE, 2))) giveAchievement(37);
		
	ge("autosaveOption").innerText = "Autosave: " + ["Off", "On"][!!game.options.autosave+0]
	ge("saveTabsOption").innerText = "Save Tabs: " + ["Off", "On"][!!game.options.saveTabs+0]
	ge("automateOption").innerText = "Auto Max All: " + ["Off", "On"][!!game.options.automate+0]

	ge("auClass").innerText = au.class
	ge("upgradeCore").innerText = `Unlock Class ${au.class+1} - ${layerNames[au.class+1]}`;
	ge("upgradeCore").className = canUpgradeAutomator() ? "buy" : "lock"

	for(var i = 0; i < 2; i++) displayIf("class" + i + "Automation", au.class >= i)
	
	au.extensions.forEach(function(e) {
		e.charge += e.speed * diff / 1000;
		if(e.charge > 2**au.class) e.charge = 2**au.class;
		
		var div = ge(e.id < 9 ? "dimensionAutobuyer" + e.id : ["tickspeedAutobuyer", "boostAutobuyer", "galaxyAutobuyer", "sacrificeAutobuyer", "infinityAutobuyer"][e.id-9])
		
		ge("buyauto" + (e.id)).innerHTML = "50% smaller interval<br>Cost: " + shortenCosts(e.cost) + " " + smallCurrency[e.currency]
		
		div.children[1].innerHTML = "Level " + getFullExpansion(e.level) + "<br>Interval: " + timeDisplayShort(1 / e.speed) + "<br>" + (e.speed <= 1 ? timeDisplayShort(Math.max(1 / e.speed * (1 - e.charge), 0)) + " remaining until charged" : getFullExpansion(e.speed) + " activations per second")
		div.children[2].style.width = Math.min(e.charge, 1) * 230
		div.children[2].innerText = (e.charge*100).toFixed(0) + "%"
	})
	
	au.raw = ge("auScript").value;
	au.script = au.raw.split(`
`);
	if(!au.tickDelay) au.tickDelay = 0;
	if(au.tickDelay > 0) au.tickDelay--;
	else {
		au.delay -= diff;
		if(au.delay < 0) {
			au.delay = 0;
			au.line++;
			if(au.line >= au.script.length || !au.line) au.line = 0;
			runAu(au.script[au.line])
		}
	}

	if(game.options.automate) {
		galaxy();
		boost();
		shift();
		maxAll();
		if(getSacrificeGain().gt(10) && challengeCompleted(2, 1)) sacrifice();
	}
	// if(gainedInfinityPoints().gt(5e15)) bigCrunch();
}

function getStatisticsDisplay(type) {
	let lines = []
	switch(type) {
		case "normal":
			lines.push(`You have made a total of ${getFullExpansion(game.totalAntimatter)} antimatter.`)
			if(game.boosts.gt(0)) lines.push(`You have ${getFullExpansion(game.boosts)} dimensional boosts.`)
			if(game.galaxies.gt(0)) lines.push(`You have ${getFullExpansion(game.galaxies)} antimatter galaxies.`)
			if(game.totalBoosts.gt(0)) lines.push(`You have done a total of ${getFullExpansion(game.totalBoosts)} dimensional boosts.`)
			if(game.totalGalaxies.gt(0)) lines.push(`You have created a total of ${getFullExpansion(game.totalGalaxies)} antimatter galaxies.`)
		
			lines.push("")
			if (game.infinities.gt(0)) {
				lines.push(`You have gone infinite ${getFullExpansion(game.infinities)} times.`)
				lines.push(`Your fastest infinity is in ${timeDisplay(game.bestInfinityTime)}.`)
				lines.push(`You have spent ${timeDisplay(getTimeSince("infinity"))} in this infinity.`)
				lines.push("")
			}
			lines.push(`You have existed for ${timeDisplay(getTimeSince("start"))}.`)
			break;
		case "challenge":
			lines.push("")
			if(getChallengeCompletions(game.selectedChallengeType)) lines.push("")
			for(var i = 0; i < 12; i++) if(game.challenges[game.selectedChallengeType][i].completed) lines.push(`Challenge ${i+1} Record: ${game.challenges[game.selectedChallengeType][i].completed ? timeDisplay(game.challenges[game.selectedChallengeType][i].bestTime) : "N/A"}`)
			lines.push(`<br>Sum of all ${layerNames[game.selectedChallengeType].toLowerCase()}challenge times is ${timeDisplay(getChallengeTimes(game.selectedChallengeType))}`)
			break;
	}
	return lines.join("<br>")
}

showTab(game.options.saveTabs ? game.currentTab : "dimensions")
showDimensionTab(game.options.saveTabs ? game.currentDimensionTab : "normal")
showStatisticsTab(game.options.saveTabs ? game.currentStatisticsTab : "normal")
showInfinityTab(game.options.saveTabs ? game.currentInfinityTab : "infinityUpgrades")
showAutomationTab(game.options.saveTabs ? game.currentAutomationTab : "core")
scrollChallengesTo(game.options.saveTabs ? game.selectedChallengeType : 0)

update();
updateAchievements()

setInterval(function() {if(game.options.autosave) save()}, 10000)
