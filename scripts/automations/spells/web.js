export async function web({tokenUuid, regionUuid, regionScenario, originX, originY, regionStatus, speaker, actor, token, character, item, args, scope, workflow, options}) {
    if(args?.[0]?.macroPass === "templatePlaced") {
        let cprConfig = game.gps.getCprConfig({itemUuid: item.uuid});
        const { animEnabled } = cprConfig;
        if(animEnabled) {
            const template = await fromUuid(workflow.templateUuid);
            let alignmentDecision;
            (MidiQOL.safeGetGameSetting('dnd5e', 'gridAlignedSquareTemplates') === true) ? alignmentDecision = "center" : alignmentDecision = "right";
    
            new Sequence()
                .effect()
                    .atLocation(token)
                    .file(`jb2a.magic_signs.circle.02.conjuration.loop.yellow`)
                    .scaleToObject(1.25)
                    .rotateIn(180, 600, {ease: "easeOutCubic"})
                    .scaleIn(0, 600, {ease: "easeOutCubic"})
                    .loopProperty("sprite", "rotation", { from: 0, to: -360, duration: 10000})
                    .belowTokens()
                    .fadeOut(2000)
                    .zIndex(0)
        
                .effect()
                    .atLocation(token)
                    .file(`jb2a.magic_signs.circle.02.conjuration.complete.dark_yellow`)
                    .scaleToObject(1.25)
                    .rotateIn(180, 600, {ease: "easeOutCubic"})
                    .scaleIn(0, 600, {ease: "easeOutCubic"})
                    .loopProperty("sprite", "rotation", { from: 0, to: -360, duration: 10000})
                    .belowTokens(true)
                    .filter("ColorMatrix", {saturate:-1, brightness:2})
                    .filter("Blur", { blurX: 5, blurY: 10 })
                    .zIndex(1)
                    .duration(1200)
                    .fadeIn(200, {ease: "easeOutCirc", delay: 500})
                    .fadeOut(300, {ease: "linear"})
        
                .effect()
                    .attachTo(template, { align: alignmentDecision, edge: "inner" })
                    .scaleToObject(0.5, {uniform:true})
                    .file(`jb2a.magic_signs.circle.02.conjuration.complete.dark_yellow`)
                    .fadeIn(600)
                    .opacity(1)
                    .rotateIn(180, 600, {ease: "easeOutCubic"})
                    .scaleIn(0, 600, {ease: "easeOutCubic"})
                    .belowTokens()
        
                .effect()
                    .file("jb2a.particles.outward.white.01.02")
                    .scaleIn(0, 500, {ease: "easeOutQuint"})
                    .delay(500)
                    .fadeOut(1000)
                    .atLocation(token)
                    .duration(1000)
                    .size(1.75, {gridUnits: true})
                    .animateProperty("spriteContainer", "position.y", {  from:0 , to: -0.5, gridUnits:true, duration: 1000})
                    .zIndex(1)
                    .waitUntilFinished(-500)
        
                .effect()
                    .file("jb2a.markers.light_orb.loop.white")
                    .attachTo(template, { align: alignmentDecision, edge: "inner" })
                    .fadeIn(500)
                    .duration(2500)
                    .belowTokens()
                    .zIndex(2)
        
                .effect()
                    .file("jb2a.shield_themed.above.eldritch_web.01.dark_green")
                    .attachTo(template, { align: alignmentDecision, edge: "inner" })
                    .fadeIn(500)
                    .duration(2500)
                    .belowTokens()
                    .zIndex(2.1)
                    .opacity(0.5)
                    .filter("ColorMatrix", { brightness:0 })
        
                .effect()
                    .file("jb2a.shield_themed.below.eldritch_web.01.dark_green")
                    .attachTo(template, { align: alignmentDecision, edge: "inner" })
                    .fadeIn(500)
                    .duration(2500)
                    .belowTokens()
                    .zIndex(1.9)
                    .filter("ColorMatrix", { brightness:0 })
                    .opacity(0.5)
                    .waitUntilFinished(-200)
        
                .effect()
                    .file("jb2a.impact.004.yellow")
                    .attachTo(template, { align: alignmentDecision, edge: "inner" })
                    .scaleToObject(0.5, {uniform:true})
                    .size(6, {gridUnits: true})
                    .filter("ColorMatrix", { saturate: -1 })
        
                .effect()
                    .file('jb2a.web.01')
                    .attachTo(template)
                    .stretchTo(template)
                    .tieToDocuments(template)
                    .belowTokens()
                    .fadeIn(1500)
                    .zIndex(1)
                    .fadeOut(1500)
                    .scaleIn(0, 500, {ease: "easeOutCubic"})
                    .persist()
        
                .effect()
                    .file('jb2a.web.01')
                    .attachTo(template)
                    .stretchTo(template)
                    .tieToDocuments(template)
                    .opacity(0.3)
                    .fadeIn(1500)
                    .zIndex(1)
                    .fadeOut(1500)
                    .scaleIn(0, 500, {ease: "easeOutCubic"})
                    .persist()
    
            .play();
        }

        return;
    }

    let gmUser = game.gps.getPrimaryGM();

    if(!tokenUuid || !regionUuid || !regionScenario) return;

    let region = await fromUuid(regionUuid);
    let tokenDocument = await fromUuid(tokenUuid);
    token = tokenDocument?.object;
    
    if(!MidiQOL.isTargetable(token)) return;
    if((token.actor.type !== 'npc' && token.actor.type !== 'character')) return;
    if(token.actor.items.some(i => i.identifier === "web-walker")) return;

    if(regionScenario === "tokenExit") {
        const isRestrained = await token.actor.appliedEffects.find(e => e.name === "Restrained");
        if (isRestrained) await isRestrained.delete();
    }

    let validatedRegionMovement = game.gps.validateRegionMovement({ regionScenario: regionScenario, regionStatus: regionStatus, regionUuid: regionUuid, tokenUuid: tokenUuid, validExit: false });
    const { validRegionMovement, validReroute } = validatedRegionMovement;
    if(!validRegionMovement) return;

    let chosenItem = await fromUuid(region.flags["region-attacher"].itemUuid);
    let itemProperName = chosenItem?.name;
    
    let dialogId = "web";
    let dialogTitlePrimary = `${token.actor.name} | ${itemProperName}`;
    let browserUser = game.gps.getBrowserUser({ actorUuid: token.actor.uuid });

    const hasEffectApplied = token.document.hasStatusEffect("restrained");
    const damagedThisTurn = await region.getFlag("gambits-premades", "checkWebRound");
    if(damagedThisTurn && damagedThisTurn === `${token.id}_${game.combat.round}`) return;

    if (hasEffectApplied && regionScenario === "tokenTurnStart") {
        let dialogContent = `
            <div class="gps-dialog-container">
                <div class="gps-dialog-section">
                    <div class="gps-dialog-content">
                        <div>
                            <div class="gps-dialog-flex">
                                <p class="gps-dialog-paragraph">Would you like to use your action to make an athletics skill check to escape the ${chosenItem.name}?</p>
                                <div id="image-container" class="gps-dialog-image-container">
                                    <img id="img_${dialogId}" src="${chosenItem.img}" class="gps-dialog-image">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="gps-dialog-button-container">
                    <button id="pauseButton_${dialogId}" type="button" class="gps-dialog-button">
                        <i class="fas fa-pause" id="pauseIcon_${dialogId}" style="margin-right: 5px;"></i>Pause
                    </button>
                </div>
            </div>
        `;
        
        let result = await game.gps.socket.executeAsUser("process3rdPartyReactionDialog", browserUser, {dialogTitle:dialogTitlePrimary,dialogContent,dialogId,initialTimeLeft: 30,validTokenPrimaryUuid: token.document.uuid,source: gmUser === browserUser ? "gm" : "user",type:"singleDialog"});
                
        const { userDecision, enemyTokenUuid, allyTokenUuid, damageChosen, abilityCheck, source, type } = result;

        if (!userDecision) {
            await region.setFlag("gambits-premades", "checkWebRound", `${token.id}_${game.combat.round}`);
            return;
        }
        else if (userDecision) {
            let skillCheck;
            if(source && source === "user") skillCheck = await game.gps.socket.executeAsUser("gpsActivityUse", browserUser, {itemUuid: chosenItem.uuid, identifier: "syntheticCheck", targetUuid: token.document.uuid});
            else if(source && source === "gm") skillCheck = await game.gps.socket.executeAsUser("gpsActivityUse", gmUser, {itemUuid: chosenItem.uuid, identifier: "syntheticCheck", targetUuid: token.document.uuid});
            if(!skillCheck) return;

            if (skillCheck.failedSaves.size === 0) {
                await game.gps.socket.executeAsUser("gmToggleStatus", gmUser, {tokenUuid: `${token.document.uuid}`, status: "restrained", active: false });
                let chatData = {
                    user: browserUser.id,
                    speaker: ChatMessage.getSpeaker({ token: token }),
                    content: `<span style='text-wrap: wrap;'>You successfully escape from the ${chosenItem.name}!</span>`
                };
                ChatMessage.create(chatData);
            }
            else {
                let chatData = {
                    user: browserUser.id,
                    speaker: ChatMessage.getSpeaker({ token: token }),
                    content: `<span style='text-wrap: wrap;'>You are unable to escape the ${chosenItem.name} this turn.</span>`
                };
                ChatMessage.create(chatData);
            }
        }
    
        await region.setFlag("gambits-premades", "checkWebRound", `${token.id}_${game.combat.round}`);
    }

    else if (!hasEffectApplied) {
        const saveResult = await game.gps.gpsActivityUse({itemUuid: chosenItem.uuid, identifier: "syntheticSave", targetUuid: token.document.uuid});
        
        if (saveResult.failedSaves.size !== 0) {
            const hasEffectApplied = token.document.hasStatusEffect("restrained");

            if (!hasEffectApplied) {
                await game.gps.socket.executeAsUser("gmToggleStatus", gmUser, {tokenUuid: `${token.document.uuid}`, status: "restrained", active: true });
            }
            
            let dialogContent = `
                <div class="gps-dialog-container">
                    <div class="gps-dialog-section">
                        <div class="gps-dialog-content">
                            <div>
                                <div class="gps-dialog-flex">
                                    <p class="gps-dialog-paragraph">Would you like to use your action to make an strength ability check to escape the ${chosenItem.name}?</p>
                                    <div id="image-container" class="gps-dialog-image-container">
                                        <img id="img_${dialogId}" src="${chosenItem.img}" class="gps-dialog-image">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="gps-dialog-button-container">
                        <button id="pauseButton_${dialogId}" type="button" class="gps-dialog-button">
                            <i class="fas fa-pause" id="pauseIcon_${dialogId}" style="margin-right: 5px;"></i>Pause
                        </button>
                    </div>
                </div>
            `;
            
            let result = await game.gps.socket.executeAsUser("process3rdPartyReactionDialog", browserUser, {dialogTitle:dialogTitlePrimary,dialogContent,dialogId,initialTimeLeft: 30,validTokenPrimaryUuid: token.document.uuid,source: gmUser === browserUser ? "gm" : "user",type:"singleDialog"});
                    
            const { userDecision, enemyTokenUuid, allyTokenUuid, damageChosen, abilityCheck, source, type } = result;
    
            if (!userDecision) {
                if(validReroute) {
                    game.gps.validateRegionMovement({ regionScenario: "tokenForcedMovement", regionStatus: regionStatus, regionUuid: regionUuid, tokenUuid: tokenUuid });
    
                    if(originX && originY) await token.document.update({ x: originX, y: originY }, { teleport: true });
                }

                return;
            }
            else if (userDecision) {
                const skillCheck = await game.gps.gpsActivityUse({itemUuid: chosenItem.uuid, identifier: "syntheticCheck", targetUuid: token.document.uuid});
                if (skillCheck.failedSaves.size === 0) {
                    await game.gps.socket.executeAsUser("gmToggleStatus", gmUser, {tokenUuid: `${token.document.uuid}`, status: "restrained", active: false });
                        let chatData = {
                        user: browserUser.id,
                        speaker: ChatMessage.getSpeaker({ token: token }),
                        content: `<span style='text-wrap: wrap;'>You successfully escape from the ${chosenItem.name}!</span>`
                    };
                    ChatMessage.create(chatData);
                }
                else {
                    if(validReroute) {
                        game.gps.validateRegionMovement({ regionScenario: "tokenForcedMovement", regionStatus: regionStatus, regionUuid: regionUuid, tokenUuid: tokenUuid });
        
                        if(originX && originY) await token.document.update({ x: originX, y: originY }, { teleport: true });
                    }
                    let chatData = {
                        user: browserUser.id,
                        speaker: ChatMessage.getSpeaker({ token: token }),
                        content: `<span style='text-wrap: wrap;'>You are unable to escape the ${chosenItem.name} this turn.</span>`
                    };
                    ChatMessage.create(chatData);
                }
            }
        }
        
        if(saveResult) {
            await region.setFlag("gambits-premades", "checkWebRound", `${token.id}_${game.combat.round}`);
        }
    }
}