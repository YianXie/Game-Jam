// Canvas set ups
let app;
app = new PIXI.Application();
globalThis.__PIXI_APP__ = app;

const gameWidth = Math.round(window.innerWidth * 0.8);
const gameHeight = Math.round(window.innerHeight * 0.75);
const diagonalLength = Math.round(Math.sqrt(gameWidth * gameWidth + gameHeight * gameHeight));
console.log("Width:", gameWidth, "\r\nHeight:", gameHeight, "\r\nDiagonal:", diagonalLength);
await app.init(
    {
        width: gameWidth,
        height: gameHeight,
    }
);
document.body.querySelector("#gameDiv").appendChild(app.canvas);
app.stage.interactive = true;

// Game variables
const gravity = 1.5;
const chiAttackCoolDown = 2;
let currentBackgroundPosition = {
    minX: 0,
    maxX: 0,
};
let gamePaused = false;
let playerDeathNum = 0;
let playerRegenerationInterval = undefined;
let playerIsRegenrating = false;
let isStartingGame = false;
let allowPlayerMoveOutOfScreen = false;
let minFloorHeight = gameHeight * 6 / 7;
let playerIsSwordAttacking = false;
let playerIsChiAttacking = false;
let playerRollInfo = { isRolling: false, direction: "" };
let playerRollCoolDown = 30; // 1 second, 60fps per second
let cntAfterAttack = 0;
let inCoolDown = 0;
let playerHoldSword = 0;
let unlockedAbilities = [];
let key = {};
let mouse = {};

// Resize event listener
window.addEventListener("resize", () => {
    console.log("resized");
    // if (confirm("Window resized detected. Do you want to refresh to resize the game window?")) {
    //     location.reload();
    // }

    // Currently not working
    // app.height = window.innerHeight * 0.75;
    // app.width = window.innerWidth * 0.8;
})

// Load the textures
// Load the background images
const cg = await PIXI.Assets.load('./src/image/background/cg.png');
const bugBossBackground = await PIXI.Assets.load('./src/image/background/bug_boss_background.png');
const forestBackground = await PIXI.Assets.load('./src/image/background/forest.png');

// Load the player image
const playerFaceRight = await PIXI.Assets.load('./src/image/player/player_face_right.png');
const playerFaceLeft = await PIXI.Assets.load('./src/image/player/player_face_left.png');
const playerWalkLeft1 = await PIXI.Assets.load('./src/image/player/player_move_left_1.png');
const playerWalkLeft2 = await PIXI.Assets.load('./src/image/player/player_move_left_2.png');
const playerWalkRight1 = await PIXI.Assets.load('./src/image/player/player_move_right_1.png');
const playerWalkRight2 = await PIXI.Assets.load('./src/image/player/player_move_right_2.png');
const playerDamagedFaceRight = await PIXI.Assets.load('./src/image/player/player_damaged_face_right.png');
const playerDamagedFaceLeft = await PIXI.Assets.load('./src/image/player/player_damaged_face_left.png');

// Load the monster image
const strikeWaveFaceRight = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_face_right.png');
const strikeWaveFaceLeft = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_face_left.png');
const strikingPigFaceRight = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_pig_face_right.png');
const strikePigFaceLeft = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_pig_face_left.png');
const strikePigWalkLeft1 = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_pig_move_left_1.png');
const strikePigWalkLeft2 = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_pig_move_left_2.png');
const strikePigWalkRight1 = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_pig_move_right_1.png');
const strikePigWalkRight2 = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_pig_move_right_2.png');
const strikePigDied = await PIXI.Assets.load('./src/image/monsters/strike_pig/strike_pig_die.png')

const bugBossFaceRight = await PIXI.Assets.load('./src/image/monsters/bug_boss/bug_boss_face_right.png');
const bugBossFaceLeft = await PIXI.Assets.load('./src/image/monsters/bug_boss/bug_boss_face_left.png');
const bugBossDamagedFaceRight = await PIXI.Assets.load('./src/image/monsters/bug_boss/bug_boss_damaged_face_right.png');
const bugBossDamagedFaceLeft = await PIXI.Assets.load('./src/image/monsters/bug_boss/bug_boss_damaged_face_left.png');
const bugBossStrikeFaceRight = await PIXI.Assets.load('./src/image/monsters/bug_boss/bug_boss_strike_face_right.png');
const bugBossStrikeFaceLeft = await PIXI.Assets.load('./src/image/monsters/bug_boss/bug_boss_strike_face_left.png');
const bugBossDied = await PIXI.Assets.load('./src/image/monsters/bug_boss/bug_boss_die.png');
const littleBugFaceRight = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_walk_right_1.png'); // since there is no face right image for the little bug, use the walk right image instead
const littleBugFaceLeft = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_walk_left_1.png'); // since there is no face left image for the little bug, use the walk left image instead
const littleBugWalkRight1 = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_walk_right_1.png');
const littleBugWalkRight2 = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_walk_right_2.png');
const littleBugWalkLeft1 = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_walk_left_1.png');
const littleBugWalkLeft2 = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_walk_left_2.png');
const littleBugDied = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_die.png');
const littleBugStingTexture = await PIXI.Assets.load('./src/image/monsters/bug_boss/little_bug_sting.png'); // there is no left or right image for the little bug sting

// Load the symbols image
const monsterAnger = await PIXI.Assets.load('./src/image/monsters/angry.png');
const smokeFaceRight = await PIXI.Assets.load('./src/image/monsters/smoke_face_right.png');
const smokeFaceLeft = await PIXI.Assets.load('./src/image/monsters/smoke_face_left.png');
const exclamationMarkYellow = await PIXI.Assets.load('./src/image/monsters/exclamation_mark_yellow.png');
const exclamationMarkRed = await PIXI.Assets.load('./src/image/monsters/exclamation_mark_red.png');
const entityRemainHealth0 = await PIXI.Assets.load('./src/image/monsters/entity_remain_health_0.png');
const entityRemainHealth1 = await PIXI.Assets.load('./src/image/monsters/entity_remain_health_1.png');
const entityRemainHealth2 = await PIXI.Assets.load('./src/image/monsters/entity_remain_health_2.png');
const entityRemainHealth3 = await PIXI.Assets.load('./src/image/monsters/entity_remain_health_3.png');
const entityRemainHealth4 = await PIXI.Assets.load('./src/image/monsters/entity_remain_health_4.png');
const entityRemainHealth5 = await PIXI.Assets.load('./src/image/monsters/entity_remain_health_5.png');
const entityRemainHealth6 = await PIXI.Assets.load('./src/image/monsters/entity_remain_health_6.png');

// Load the player's items image
const swordTexture = await PIXI.Assets.load('./src/image/player/sword.png');
const chiTexture = await PIXI.Assets.load('./src/image/player/chi.png');

// Load the supporting objects image
const bugBossSeatTexture = await PIXI.Assets.load('./src/image/others/bug_boss_seat.png');
const buddaStatusTexture = await PIXI.Assets.load('./src/image/others/budda_status.png');
const stoneTexture = await PIXI.Assets.load('./src/image/others/stone.png');
const houseTexture = await PIXI.Assets.load('./src/image/others/house.png');

// The start page
const startPageContainer = new PIXI.Container();
let startPageBackground = PIXI.Sprite.from('./src/image/background/cg.png');
startPageBackground.anchor.set(0.5);
startPageBackground.x = app.screen.width / 2;
startPageBackground.y = app.screen.height / 2;
startPageBackground.width = app.screen.width;
startPageBackground.height = app.screen.height;
startPageContainer.addChild(startPageBackground);

const nonHoverColor = 'rgba(255, 255, 255, 0.3)';
const hoverColor = 'rgba(255, 255, 255, 0.8)';
const startButton = new PIXI.Graphics();
startPageContainer.addChild(startButton);

let startPagePlayer = PIXI.Sprite.from('./src/image/player/player_face_right.png');
startPagePlayer.anchor.set(0.5);
startPagePlayer.x = app.screen.width / 4 - diagonalLength * 0.05;
startPagePlayer.y = app.screen.height / 2;
startPagePlayer.width = diagonalLength * 0.2;
startPagePlayer.height = diagonalLength * 0.2;
startPageContainer.addChild(startPagePlayer);

let startPageStrikePig = PIXI.Sprite.from('./src/image/monsters/strike_pig/strike_pig_face_left.png');
startPageStrikePig.anchor.set(0.5);
startPageStrikePig.x = app.screen.width * 3 / 4 + diagonalLength * 0.0625;
startPageStrikePig.y = app.screen.height / 2;
startPageStrikePig.width = diagonalLength * 0.25;
startPageStrikePig.height = diagonalLength * 0.25;
startPageContainer.addChild(startPageStrikePig);

const startButtonText = new PIXI.Text(
    'Start',
    {
        fontFamily: 'Arcade',
        fontSize: 24,
        fill: 'black',
    }
);
startPageContainer.addChild(startButtonText);

startButtonText.anchor.set(0.5);
startButtonText.x = app.screen.width / 2;
startButtonText.y = app.screen.height / 2;
startButtonText.interactive = true;

startButton.lineStyle(2, 0x000000, 1);
startButton.beginFill(nonHoverColor);
startButton.roundRect(0, 0, 100, 50, 50);
startButton.endFill();

startButton.x = app.screen.width / 2 - 50;
startButton.y = app.screen.height / 2 - 25;
startButton.interactive = true;
startButton.buttonMode = true;

startButtonText.on('pointerover', () => {
    startButton.clear();
    startButton.beginFill(hoverColor);
    startButton.roundRect(0, 0, 100, 50, 50);
    startButton.endFill();
});
startButtonText.on('pointerout', () => {
    startButton.clear();
    startButton.beginFill(nonHoverColor);
    startButton.roundRect(0, 0, 100, 50, 50);
    startButton.endFill();
});
startButton.on('pointerover', () => {
    startButton.clear();
    startButton.beginFill(hoverColor);
    startButton.roundRect(0, 0, 100, 50, 50);
    startButton.endFill();
});
startButton.on('pointerout', () => {
    startButton.clear();
    startButton.beginFill(nonHoverColor);
    startButton.roundRect(0, 0, 100, 50, 50);
    startButton.endFill();
});
startButton.on('pointerdown', function () {
    askForInit();
});
startButtonText.on('pointerdown', function () {
    askForInit();
});
app.stage.addChild(startPageContainer);

// The information of the entities
const charactersInfo = {
    player: {
        name: "player",
        alive: true,
        size: {
            width: diagonalLength * 0.0625,
            height: diagonalLength * 0.0625,
            average: (diagonalLength * 0.625 + diagonalLength * 0.625) / 2,
        },
        speed: gameWidth * 0.0075,
        speedY: 0,
        isJumping: false,
        floorY: gameHeight * 6 / 7,
        texture: {},
        animationSpeed: 0.15,
        location: {
            x: app.screen.width / 2,
            y: app.screen.height / 2,
        },
        status: {
            health: 1000,
            maxHealth: 1000,
            energy: 3,
            maxEnergy: 3,
            shield: false,
        },
        attack: {
            sword: {
                name: "sword",
                damage: 25,
                rotation: 0,
                direction: "right",
                size: {
                    width: diagonalLength * 0.04,
                    height: diagonalLength * 0.04,
                    average: (diagonalLength * 0.04 + diagonalLength * 0.04) / 2,
                },
                location: {
                    x: 0,
                    y: 0,
                },
                texture: {},
                from: "player",
            },
            chi: {
                name: "chi",
                damage: 25,
                range: gameWidth * 0.25,
                speed: gameWidth * 0.01,
                direction: "right",
                size: {
                    width: diagonalLength * 0.04,
                    height: diagonalLength * 0.04,
                    average: diagonalLength * 0.04,
                },
                location: {
                    x: 0,
                    y: 0,
                },
                originalLocation: {
                    x: 0,
                    y: 0,
                },
                texture: {},
                from: "player",
            }
        },
        isBlocked: {
            left: false,
            right: false,
        },
        damageCoolDown: 0.5,
        inDamageCooldown: false,
        damagedSound: [new Audio('./src/audio/player/player_damaged.mp3')],
        dieSound: new Audio('./src/audio/player/player_die.mp3'),
    },
    reset: function () {
        const player = this.player;
        player.status.health = player.status.maxHealth;
        player.status.energy = player.status.maxEnergy;
        player.status.shield = false;
        player.alive = true;
        player.location.x = app.screen.width / 2;
        player.location.y = app.screen.height / 2;
        player.speedY = 0;
        player.isJumping = false;
        player.isBlocked.left = false;
        player.isBlocked.right = false;
        player.texture = {};
        setTimeout(() => {
            // The player has a 1.5 seconds of invincibility after dying
            player.inDamageCooldown = false;
        }, 1500);
    },
}
const monstersInfo = {
    strikePig: { // temporarely skipped strike pig because it is not appearing
        name: "strikePig",
        alive: true,
        location: {
            x: app.screen.width * 1.5,
            y: app.screen.height / 2 - 25,
        },
        size: {
            width: diagonalLength * 0.2,
            height: diagonalLength * 0.2,
            average: (diagonalLength * 0.2 + diagonalLength * 0.2) / 2,
        },
        status: {
            maxHealth: 100,
            health: 100,
            shield: false,
        },
        exclamationMarkPosition: {
            y: -gameHeight * 0.1,
            faceRightX: gameWidth * 0.025,
            faceLeftX: -gameWidth * 0.025,
        },
        entityRemainHealthPosition: {
            y: 0,
            faceRightX: gameWidth * 0.025,
            faceLeftX: -gameWidth * 0.025,
        },
        isBlocked: {
            left: false,
            right: false,
        },
        visibility: true,
        anchor: 0.5,
        attack: strikePigAttack,
        range: 500,
        speed: 2,
        speedY: 0,
        floorY: gameHeight * 6 / 7,
        isJumping: false,
        texture: {},
        animationSpeed: 0.15,
        damageCoolDown: 0.5,
        inDamageCooldown: false,
        isChasing: false,
        isAttacking: false,
        damagedSound: [
            new Audio('./src/audio/strike_pig/strike_pig_damaged_1.mp3'),
            new Audio('./src/audio/strike_pig/strike_pig_damaged_2.mp3'),
            new Audio('./src/audio/strike_pig/strike_pig_damaged_3.mp3'),
            new Audio('./src/audio/strike_pig/strike_pig_damaged_4.mp3')
        ],
        dieSound: new Audio('./src/audio/strike_pig/strike_pig_die.mp3'),
    },
    bugBoss: {
        name: "bugBoss",
        alive: true,
        location: {
            x: app.screen.width * 4 / 5,
            y: app.screen.height / 2,
        },
        size: {
            width: diagonalLength * 0.15,
            height: diagonalLength * 0.15,
            average: (diagonalLength * 0.15 + diagonalLength * 0.15) / 2,
        },
        status: {
            maxHealth: 50,
            health: 50,
            shield: false,
        },
        exclamationMarkPosition: {
            y: -(gameHeight * 0.175),
            faceRightX: (gameWidth * 0.025),
            faceLeftX: -(gameWidth * 0.025),
        },
        entityRemainHealthPosition: {
            y: -(gameHeight * 0.1),
            faceRightX: (gameWidth * 0.025),
            faceLeftX: -(gameWidth * 0.025),
        },
        isBlocked: {
            left: false,
            right: false,
        },
        visibility: true,
        anchor: 0.5,
        attack: bugBossAttack,
        range: gameWidth * 0.5,
        speed: 0,
        speedY: 0,
        floorY: gameHeight * 6 / 7,
        isJumping: false,
        texture: {},
        animationSpeed: 0.15,
        damageCoolDown: 0.5,
        inDamageCooldown: false,
        isChasing: false,
        isAttacking: false,
        isSummoning: false,
        damagedSound: [
            new Audio('./src/audio/bug_boss/bug_boss_damaged_1.mp3'),
            new Audio('./src/audio/bug_boss/bug_boss_damaged_2.mp3'),
            new Audio('./src/audio/bug_boss/bug_boss_damaged_3.mp3'),
            new Audio('./src/audio/bug_boss/bug_boss_damaged_4.mp3')
        ],
        dieSound: new Audio('./src/audio/bug_boss/bug_boss_die.mp3'),
    },
    littleBug: {
        name: "littleBug",
        alive: true,
        location: {
            // The location can be anything as this would be randomized in the future
            x: 0,
            y: 0,
        },
        size: {
            width: diagonalLength * 0.05,
            height: diagonalLength * 0.05,
            average: (diagonalLength * 0.05 + diagonalLength * 0.05) / 2,
        },
        status: {
            maxHealth: 50,
            health: 50,
            shield: false,
        },
        exclamationMarkPosition: {
            y: -(gameHeight * 0.05),
            faceRightX: (gameWidth * 0.01),
            faceLeftX: -(gameWidth * 0.01),
        },
        entityRemainHealthPosition: {
            y: (gameHeight * 0.01),
            faceRightX: (gameWidth * 0.01),
            faceLeftX: -(gameWidth * 0.01),
        },
        isBlocked: {
            left: false,
            right: false,
        },
        visibility: true,
        anchor: 0.5,
        attack: littleBugAttack,
        range: 500,
        speed: 2,
        speedY: 0,
        floorY: gameHeight * 6 / 7,
        isJumping: false,
        texture: {},
        animationSpeed: 0.15,
        damageCoolDown: 0.5,
        inDamageCooldown: false,
        inAttackingCooldown: false,
        isChasing: false,
        isAttacking: false,
        damagedSound: [
            new Audio('./src/audio/little_bug/little_bug_damaged_1.mp3'),
            new Audio('./src/audio/little_bug/little_bug_damaged_2.mp3'),
            new Audio('./src/audio/little_bug/little_bug_damaged_3.mp3'),
        ],
        dieSound: new Audio('./src/audio/little_bug/little_bug_die.mp3'),
    },
    reset: function () {
        this.strikePig.status.health = this.strikePig.status.maxHealth;
        this.strikePig.alive = true;
        this.strikePig.location.x = app.screen.width / 2 - 1000;
        this.strikePig.location.y = app.screen.height / 2 - 25;
        this.strikePig.speedY = 0;
        this.strikePig.isJumping = false;
        this.strikePig.isBlocked.left = false;
        this.strikePig.isBlocked.right = false;
        this.strikePig.texture = {};
        this.strikePig.isChasing = false;
        this.strikePig.isAttacking = false;
        this.strikePig.inDamageCooldown = false;

        this.bugBoss.status.health = this.bugBoss.status.maxHealth;
        this.bugBoss.alive = true;
        this.bugBoss.location.x = app.screen.width * 4 / 5;
        this.bugBoss.location.y = app.screen.height / 2;
        this.bugBoss.speedY = 0;
        this.bugBoss.isJumping = false;
        this.bugBoss.isBlocked.left = false;
        this.bugBoss.isBlocked.right = false;
        this.bugBoss.texture = {};
        this.bugBoss.isChasing = false;
        this.bugBoss.isAttacking = false;
        this.bugBoss.inDamageCooldown = false;
        this.bugBoss.isSummoning = false;

        this.littleBug.status.health = this.littleBug.status.maxHealth;
        this.littleBug.alive = true;
        this.littleBug.location.x = 0;
        this.littleBug.location.y = 0;
        this.littleBug.speedY = 0;
        this.littleBug.isJumping = false;
        this.littleBug.isBlocked.left = false;
        this.littleBug.isBlocked.right = false;
        this.littleBug.texture = {};
        this.littleBug.isChasing = false;
        this.littleBug.isAttacking = false;
        this.littleBug.inDamageCooldown = false;
        this.littleBug.inAttackingCooldown = false;
    },
}
const supportingObjectsInfo = {
    house: {
        name: "house",
        location: {
            x: app.screen.width / 2,
            y: app.screen.height / 2,
        },
        size: {
            width: gameWidth * 2 / 3,
            height: gameHeight * 0.2,
            average: 200,
        },
        textures: {},
    },
    bugBossSeat: {
        name: "bugBossSeat",
        location: {
            x: app.screen.width * 4 / 5,
            y: minFloorHeight,
        },
        size: {
            width: gameWidth * 0.2,
            height: gameHeight * 0.125,
            average: (gameWidth * 0.2 + gameHeight * 0.125) / 2,
        },
        textures: {},
    },
    buddaStatus: {
        name: "buddaStatus",
        location: {
            x: gameWidth / 8,
            y: minFloorHeight - gameHeight * 0.15,
        },
        size: {
            width: diagonalLength * 0.175,
            height: diagonalLength * 0.2,
            average: (gameWidth * 0.15 + gameHeight * 0.4) / 2,
        },
        textures: {},
    },
    stone: {
        name: "stone",
        location: {
            x: gameWidth / 8,
            y: minFloorHeight,
        },
        size: {
            width: diagonalLength * 0.15,
            height: diagonalLength * 0.15,
            average: (diagonalLength * 0.15 + diagonalLength * 0.15) / 2,
        },
        textures: {},
    }
}
const attacksInfo = {
    // The direction is set to default as right
    strike: {
        name: "strike",
        damage: 30,
        range: gameWidth * 0.25,
        speed: gameWidth * 0.015,
        direction: "right",
        location: {
            x: -1000,
            y: 0,
        },
        size: {
            width: gameWidth * 0.25,
            height: gameHeight * 0.3,
            average: (gameWidth * 0.25 + gameHeight * 0.3) / 2,
        },
        textures: {},
        from: "strikePig",
    },
    littleBugSting: {
        name: "littleBugSting",
        damage: 15,
        range: gameWidth * 0.15,
        speed: gameWidth * 0.01,
        direction: "right",
        location: {
            x: 0,
            y: 0,
        },
        size: {
            width: diagonalLength * 0.05,
            height: diagonalLength * 0.05,
            average: (diagonalLength * 0.05 + diagonalLength * 0.05) / 2,
        },
        textures: {},
        from: "littleBug",
    },
    bugBossStrike: {
        name: "bugBossStrike",
        damage: 50,
        range: gameWidth * 0.25,
        speed: gameWidth * 0.015,
        direction: "right",
        location: {
            x: 0,
            y: 0,
        },
        size: {
            width: gameWidth * 0.25,
            height: gameHeight * 0.25,
            average: (gameWidth * 0.25 + gameHeight * 0.25) / 2,
        },
        textures: {},
        from: "bugBoss",
    }
}
const symbolsInfo = {
    smoke: {
        name: "smoke",
        location: {
            x: app.screen.width / 2,
            y: app.screen.height / 2,
        },
        size: {
            width: diagonalLength * 0.1,
            height: diagonalLength * 0.1,
            average: (diagonalLength * 0.1 * 2) / 2,
        },
        textures: {},
    },
    exclamationMark: {
        name: "exclamationMark",
        location: {
            x: app.screen.width / 2,
            y: app.screen.height / 2,
        },
        size: {
            width: diagonalLength * 0.125,
            height: diagonalLength * 0.125,
            average: (diagonalLength * 0.125 * 2) / 2,
        },
        textures: {},
    },
    entityRemainHealth: {
        name: "entityRemainHealth",
        location: {
            x: app.screen.width / 2,
            y: app.screen.height / 2,
        },
        size: {
            width: diagonalLength * 0.075,
            height: diagonalLength * 0.075,
            average: (diagonalLength * 0.075 * 2) / 2,
        },
        texture: {},
    },
}

// array for storing the elements
let supportingObjects = [];
let characters = [];
let monstersAttack = [];
let playerAttacks = [];
let monsters = [];
let backgrounds = [];
let intervalsAndTimeouts = [];

// Define the entities
let player, sword, chi, playerRollSmoke;
let strikePig, strikePigStrike, strikePigSmoke;
let bugBoss, bugBossExclamationMark, littleBug, bugBossStrike;
let house, bugBossSeat, buddaStatus, stone;
let healthText, energyText;

// Audio
const ambientMusic = new Audio('./src/audio/BGM/ambient.mp3');
ambientMusic.loop = true;
const battleMusic = new Audio('./src/audio/BGM/battle.mp3');
battleMusic.loop = true;
const freeSwordSound = new Audio('./src/audio/player/free_sword.mp3');
const unlockAbilitySound = new Audio('./src/audio/player/unlock_ability.mp3');
const playerChiAttackSound = new Audio('./src/audio/player/player_chi_attack.mp3');
const playerRollSound = new Audio('./src/audio/player/player_roll.mp3');
const playerRollReadySound = new Audio('./src/audio/player/roll_ready.mp3');

function askForInit() {
    if (confirm("Do you want to view an instruction first before you start?")) {
        isStartingGame = true;
        showInstructions();
    } else {
        init();
    }
}

// Initialize the game
function init() {
    console.log("%c Game started!", "color: lightblue; font-size: 24px;");
    try {
        app.stage.children.forEach((child) => {
            child.destroy();
            app.stage.removeChild(child);
        });
        app.ticker.remove(gameLoop);
    }
    catch (err) {
        console.log(err);
    }
    app.renderer.background.color = 'black'; // change the background color to black

    // Reset the entities and arrays
    charactersInfo.reset();
    monstersInfo.reset();
    characters.length = 0;
    monsters.length = 0;
    playerAttacks.length = 0;
    monstersAttack.length = 0;
    supportingObjects.length = 0;
    playerIsRegenrating = false;
    for (let i = 0; i < intervalsAndTimeouts.length; i++) {
        clearInterval(intervalsAndTimeouts[i]);
        intervalsAndTimeouts[i] = undefined;
    }

    // Add the event listeners and the game loop
    isStartingGame = false;
    document.addEventListener('keydown', keysDown);
    document.addEventListener('keyup', keysUp);
    document.querySelector("#gameDiv").addEventListener('mousedown', mouseDown);
    document.querySelector("#gameDiv").addEventListener('mouseup', mouseUp);
    app.ticker.add(gameLoop);

    // Play the background music (BGM)
    battleMusic.play();
    battleMusic.volume = 1;
    ambientMusic.volume = 1;

    // Must add the background image first otherwise the other images will be covered by the background image
    let bugBossBackground = PIXI.Sprite.from('./src/image/background/bug_boss_background.png');
    bugBossBackground.anchor = 0.5;
    bugBossBackground.x = app.screen.width / 2;
    bugBossBackground.y = app.screen.height / 2;
    bugBossBackground.width = app.screen.width;
    bugBossBackground.height = app.screen.height;
    bugBossBackground.label = "bugBoss";
    app.stage.addChild(bugBossBackground);
    backgrounds.push(bugBossBackground);

    // Generate the forest backgrounds with lops
    for (let i = 1; i < 4; i++) {
        let forestBackground = PIXI.Sprite.from('./src/image/background/forest.png');
        forestBackground.anchor = 0.5;
        forestBackground.x = gameWidth * (i + 0.5);
        forestBackground.y = gameHeight / 2;
        forestBackground.width = gameWidth;
        forestBackground.height = gameHeight;
        forestBackground.label = ("forest" + String(i));
        app.stage.addChild(forestBackground);
        backgrounds.push(forestBackground);
    }
    console.log(backgrounds);

    // Set up the entities
    // The order matters, the last element will be on top of the previous elements (图层顺序)
    house = createElement(false, house, supportingObjectsInfo.house.size, { x: app.screen.width / 2, y: app.screen.height / 2 }, 0.5, false, "./src/image/others/house.png", "house");
    supportingObjects.push(house);

    createPlayerTexture();
    player = createElement({ texture: charactersInfo.player.texture.faceRight, loop: false, autoPlay: true, animationSpeed: charactersInfo.player.animationSpeed }, player, charactersInfo.player.size, charactersInfo.player.location, 0.5, true, './src/image/player/player_face_right.png', charactersInfo.player);
    characters.push(player);

    sword = createElement(false, sword, charactersInfo.player.attack.sword.size, charactersInfo.player.attack.sword.location, 0.5, false, './src/image/player/sword.png', charactersInfo.player.attack.sword);
    playerAttacks.push(sword);

    chi = createElement(false, chi, charactersInfo.player.attack.chi.size, charactersInfo.player.attack.chi.location, 0.5, false, './src/image/player/chi.png', charactersInfo.player.attack.chi);
    playerAttacks.push(chi);

    playerRollSmoke = createElement(false, playerRollSmoke, symbolsInfo.smoke.size, { x: player.x, y: player.y + 35 }, 0.5, false, "./src/image/monsters/smoke_face_left.png");

    createStrikePigTexure();
    strikePig = createMonster(monstersInfo.strikePig, './src/image/monsters/strike_pig/strike_pig_face_left.png', true, true, {
        texture: monstersInfo.strikePig.texture.faceLeft,
        animationSpeed: monstersInfo.strikePig.animationSpeed,
        loop: false,
        autoPlay: true,
    }).monster;
    monsters.push(strikePig);
    console.log(strikePig);

    strikePigStrike = createElement(false, strikePigStrike, attacksInfo.strike.size, attacksInfo.strike.location, 0.5, false, './src/image/monsters/strike_pig/strike_face_right.png', attacksInfo.strike);
    monstersAttack.push(strikePigStrike);

    strikePigSmoke = createElement(false, strikePigSmoke, symbolsInfo.smoke.size, symbolsInfo.smoke.location, 0.5, false, './src/image/monsters/smoke_face_right.png', symbolsInfo.smoke);

    createBugBossTexture();
    createLittleBugTexture();
    bugBoss = createMonster(monstersInfo.bugBoss, './src/image/monsters/bug_boss/bug_boss_face_left.png', true, true, {
        texture: monstersInfo.bugBoss.texture.faceLeft,
        animationSpeed: monstersInfo.bugBoss.animationSpeed,
        loop: false,
        autoPlay: true,
    }).monster;
    monsters.push(bugBoss);

    bugBossStrike = createElement(false, bugBossStrike, attacksInfo.bugBossStrike.size, attacksInfo.bugBossStrike.location, 0.5, false, './src/image/monsters/bug_boss/bug_boss_strike_face_left.png', attacksInfo.bugBossStrike);
    monstersAttack.push(bugBossStrike);

    bugBossSeat = createElement(false, bugBossSeat, supportingObjectsInfo.bugBossSeat.size, supportingObjectsInfo.bugBossSeat.location, 0.5, true, './src/image/others/bug_boss_seat.png', supportingObjectsInfo.bugBossSeat);
    supportingObjects.push(bugBossSeat);

    stone = createElement(false, stone, supportingObjectsInfo.stone.size, supportingObjectsInfo.stone.location, 0.5, true, './src/image/others/stone.png', supportingObjectsInfo.stone);
    supportingObjects.push(stone);

    buddaStatus = createElement(false, buddaStatus, supportingObjectsInfo.buddaStatus.size, supportingObjectsInfo.buddaStatus.location, 0.5, true, './src/image/others/budda_status.png', supportingObjectsInfo.buddaStatus);
    supportingObjects.push(buddaStatus);

    // Create the text for the health and energy
    // Did not use the createElement function because the text is not an image
    healthText = new PIXI.Text(
        'Health: ' + charactersInfo.player.status.health,
        {
            fontFamily: 'Arcade',
            fontSize: 24,
            fill: 'red',
        }
    );
    healthText.anchor = 0;
    healthText.x = 10;
    healthText.y = 10;
    healthText.label = "healthBar";
    app.stage.addChild(healthText);

    energyText = new PIXI.Text(
        'Energy: ' + charactersInfo.player.status.energy,
        {
            fontFamily: 'Arcade',
            fontSize: 24,
            fill: 'blue',
        }
    );
    energyText.anchor = 0;
    energyText.x = 10;
    energyText.y = 40;
    energyText.label = "energyBar";
    app.stage.addChild(energyText);
}

document.getElementById("openInstruction").addEventListener('click', (event) => {
    event.preventDefault();
    showInstructions();
});

document.getElementById("closeInstruction").addEventListener('click', hideInstructions);
document.getElementById("hideUnlockAbility").addEventListener('click', unlockAbilityHide);
document.getElementById("closeAlertInstruction").addEventListener('click', closeInstructionAlert);

function showBackground(blurLevel) {
    document.getElementById("instructionBackground").classList.add("instruction-background-show");
    document.getElementById("instructionBackground").style.filter = `blur(${blurLevel}px)`; // The blur level can be adjusted
}

function hideBackground() {
    document.getElementById("instructionBackground").classList.remove("instruction-background-show");
    document.getElementById("instructionBackground").style.filter = "blur(0px)";
}

function showInstructions() {
    console.log("showing instructions");
    document.getElementById("instruction").classList.add("instruction-show")
    showBackground(5);
    pauseGame();
    document.addEventListener("keydown", function hideInstructionKeydown(e) {
        if (e.key === "Escape") {
            hideInstructions();
            document.removeEventListener('keydown', hideInstructionKeydown);
        }
    })

    try {
        document.getElementById("checkInstructionAlert").classList.remove("check-instruction-alert-show");
    }
    catch (err) {
        console.log(err);
    }
}

function hideInstructions() {
    document.getElementById("instruction").classList.remove("instruction-show");
    window.location.href = "#title";
    hideBackground();
    resumeGame();

    if (isStartingGame) {
        init();
    }
}

function closeInstructionAlert() {
    document.getElementById("checkInstructionAlert").classList.remove("check-instruction-alert-show");
    window.location.href = "#title";
}

function unlockAbilityShow(ability, descriptions, imgSrc) {
    if (unlockedAbilities.includes(ability)) {
        return;
    }

    try {
        document.getElementById("abilityTips").remove();
    }
    catch (err) {

    }

    pauseGame();
    showBackground(3);
    unlockedAbilities.push(ability);
    document.getElementById("abilityName").innerHTML = ability;
    document.getElementById("abilityDescription").innerHTML = descriptions.description;
    document.getElementById("abilityImg").src = imgSrc;
    document.getElementById("unlockAbility").classList.add('unlock-ability-show');
    document.getElementById("instructionContent").innerHTML += "<br><p>" + descriptions.instruction + "</p>";

    unlockAbilitySound.play();
    document.addEventListener("keydown", function hideUnlockAbilityKeydown(e) {
        if (e.key === "Escape") {
            unlockAbilityHide();
            document.removeEventListener('keydown', hideUnlockAbilityKeydown);
        }
    })
}

function unlockAbilityHide() {
    resumeGame();
    hideBackground();
    document.getElementById("unlockAbility").classList.remove('unlock-ability-show');
    window.location.href = "#checkInstructionAlert";
    const alertInstruction = document.getElementById("checkInstructionAlert");
    alertInstruction.classList.add("check-instruction-alert-show")
    ambientMusic.volume = 1;
    battleMusic.volume = 1;
}

function keysDown(e) {
    key[e.key] = true;
}

function keysUp(e) {
    key[e.key] = false;
}

function mouseDown(e) {
    mouse[e.button] = true;
    if (mouse[0] || mouse[2]) {
        playerSwordAttack(e);
    }
}

function mouseUp(e) {
    mouse[e.button] = false;
}

function getObjectLength(obj) {
    const arr = Object.keys(obj); // convert the object to an array

    return arr.length;
}

// A function that takes the animation options, the element, the size of the element, the location of the element, the anchor of the element, the visibility of the element, and the texture of the element
function createElement(animationOptions, element, size, location, anchor, visibility, texture, label) {
    if (getObjectLength(animationOptions) > 0) {
        element = new PIXI.AnimatedSprite(animationOptions.texture);
        element.loop = animationOptions.loop;
        element.animationSpeed = animationOptions.animationSpeed;
        if (animationOptions.autoPlay) {
            element.play();
        }
    } else {
        element = PIXI.Sprite.from(texture);
    }
    element.visible = visibility;
    element.anchor = anchor;
    element.width = size.width;
    element.height = size.height;
    element.label = label;
    element.x = location.x;
    element.y = location.y;
    app.stage.addChild(element);

    return element;
}

function createMonster(monsterInfo, texture, createRemainHealth, createExclamationMark, animations) {
    let monster;
    const info = { ...monsterInfo };
    if (animations) {
        monster = new PIXI.AnimatedSprite(animations.texture);
        monster.animationSpeed = animations.animationSpeed;
        monster.loop = animations.loop;
        if (animations.autoPlay) {
            monster.play();
        }
    } else {
        monster = PIXI.Sprite.from(texture);
    }

    if (info.container === undefined) {
        info.container = new PIXI.Container();
    }

    // console.log(monster);
    monster.visible = info.visibility;
    monster.anchor = info.anchor;
    monster.width = info.size.width;
    monster.height = info.size.height;
    monster.label = info;
    monster.x = info.location.x;
    monster.y = info.location.y;
    info.container.addChild(monster);

    if (createRemainHealth) {
        let remainHealth;
        remainHealth = PIXI.Sprite.from('./src/image/monsters/entity_remain_health_6.png');
        remainHealth.anchor.set(0.5);
        if (texture.includes("left")) {
            remainHealth.x = info.location.x + info.entityRemainHealthPosition.faceLeftX;
        } else if (texture.includes("right")) {
            remainHealth.x = info.location.x + info.entityRemainHealthPosition.faceRightX;
        } else {
            remainHealth.x = info.location.x;
        }
        remainHealth.y = info.location.y + info.entityRemainHealthPosition.y;
        remainHealth.width = symbolsInfo.entityRemainHealth.size.width * info.size.width / 250;
        remainHealth.height = symbolsInfo.entityRemainHealth.size.height * info.size.height / 250;
        remainHealth.label = symbolsInfo.entityRemainHealth;
        info.container.addChild(remainHealth);
    }

    if (createExclamationMark) {
        let exclamationMark;
        exclamationMark = PIXI.Sprite.from('./src/image/monsters/exclamation_mark_red.png');
        exclamationMark.anchor.set(0.5);
        exclamationMark.visible = false;
        exclamationMark.width = symbolsInfo.exclamationMark.size.width * info.size.width / 250;
        exclamationMark.height = symbolsInfo.exclamationMark.size.height * info.size.height / 250;
        exclamationMark.label = symbolsInfo.exclamationMark;
        info.container.addChild(exclamationMark);
    }

    app.stage.addChild(info.container);

    return {
        monster: monster,
        container: info.container,
    };
}

// Creathe the textures for different actions of the player
function createPlayerTexture() {
    console.log("Creating player texture");
    charactersInfo.player.texture['faceLeft'] = [
        new PIXI.Texture(playerFaceLeft, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
    ]
    charactersInfo.player.texture['faceRight'] = [
        new PIXI.Texture(playerFaceRight, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
    ]
    charactersInfo.player.texture['walkLeft'] = [
        new PIXI.Texture(playerFaceLeft, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
        new PIXI.Texture(playerWalkLeft1, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
        new PIXI.Texture(playerWalkLeft2, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
    ]
    charactersInfo.player.texture['walkRight'] = [
        new PIXI.Texture(playerFaceRight, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
        new PIXI.Texture(playerWalkRight1, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
        new PIXI.Texture(playerWalkRight2, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
    ]
    charactersInfo.player.texture['damagedFaceRight'] = [
        new PIXI.Texture(playerDamagedFaceRight, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
    ]
    charactersInfo.player.texture['damagedFaceLeft'] = [
        new PIXI.Texture(playerDamagedFaceLeft, new PIXI.Rectangle(0, 0, charactersInfo.player.size.width, charactersInfo.player.size.height)),
    ]
}

function playerRegeneration() {
    // Regenerate the player's health and energy
    if (!charactersInfo.player.alive || gamePaused) {
        return;
    }

    if (charactersInfo.player.status.health < charactersInfo.player.status.maxHealth) {
        charactersInfo.player.status.health += 5;
        healthText.text = 'Health: ' + charactersInfo.player.status.health;
    }

    if (charactersInfo.player.status.energy < charactersInfo.player.status.maxEnergy) {
        charactersInfo.player.status.energy += 0.25;
        energyText.text = 'Energy: ' + charactersInfo.player.status.energy;
    }
}

function playerSwordAttack(e) {
    if (playerIsSwordAttacking) {
        return;
    }

    // get the x and y position of the mouse click on the canvas
    freeSwordSound.currentTime = 0;
    freeSwordSound.play();
    const x = e.clientX - app.canvas.getBoundingClientRect().left;
    const y = e.clientY - app.canvas.getBoundingClientRect().top;
    const attackAngle = Math.round(Math.atan2(y - player.y, x - player.x) * 180 / Math.PI); // calculate the angle of the attack

    if (attackAngle >= -90 && attackAngle <= 90) {
        charactersInfo.player.attack.sword.direction = "right";
    } else if (attackAngle < -90 || attackAngle > 90) {
        charactersInfo.player.attack.sword.direction = "left";
    }
    charactersInfo.player.attack.sword.rotation = 0.5;
    sword.rotation = 0.5;
    playerIsSwordAttacking = true;
}

function playerChiAttack() {
    if (charactersInfo.player.status.energy < 1 || playerIsChiAttacking || !charactersInfo.player.alive) {
        return;
    }

    console.log("Chi attack!");
    playerIsChiAttacking = true;
    charactersInfo.player.status.energy -= 1;
    energyText.text = 'Energy: ' + charactersInfo.player.status.energy;
    playerChiAttackSound.currentTime = 0;
    playerChiAttackSound.play();

    if (player.textures === charactersInfo.player.texture.faceRight || player.textures === charactersInfo.player.texture.walkRight) {
        charactersInfo.player.attack.chi.direction = "right";
    } else {
        charactersInfo.player.attack.chi.direction = "left";
    }
    charactersInfo.player.attack.chi.originalLocation = { x: player.x, y: player.y };
    chi.y = player.y;
    chi.x = player.x;
}

function playerRoll() {
    if (playerRollInfo.isRolling || !charactersInfo.player.alive || playerRollCoolDown > 0) {
        return;
    }

    console.log("Player is rolling");
    playerRollInfo.isRolling = true;
    playerRollSound.currentTime = 0;
    playerRollSound.play();
    if (player.textures === charactersInfo.player.texture.faceRight || player.textures === charactersInfo.player.texture.walkRight || player.textures === charactersInfo.player.texture.damagedFaceRight) {
        playerRollInfo.direction = "right";
    } else {
        playerRollInfo.direction = "left";
    }
}

function dialogue(speaker, message) {
    let dialogueBg = new PIXI.Graphics();
    dialogueBg.anchor.set(0.5);

    let msg = new PIXI.Text(
        message.text,
        {
            fontFamily: "Arial",
            fontSize: 24,
            fill: "black",
        }
    )
    msg.anchor.set(0.5);
    msg.x = message.x;
    msg.y = message.y;
    msg.width = message.width;
    msg.height = message.height;

    dialogueBg.roundRect(msg.x, msg.y, msg.width, msg.height, 20);
}

// Create the textures for different actions of the strike pig
function createStrikePigTexure() {
    console.log("Creating strike pig texture");
    monstersInfo.strikePig.texture['faceLeft'] = [
        new PIXI.Texture(strikePigFaceLeft, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
    ]
    monstersInfo.strikePig.texture['faceRight'] = [
        new PIXI.Texture(strikingPigFaceRight, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
    ]
    monstersInfo.strikePig.texture['walkLeft'] = [
        new PIXI.Texture(strikePigFaceLeft, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
        new PIXI.Texture(strikePigWalkLeft1, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
        new PIXI.Texture(strikePigWalkLeft2, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
    ]
    monstersInfo.strikePig.texture['walkRight'] = [
        new PIXI.Texture(strikingPigFaceRight, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
        new PIXI.Texture(strikePigWalkRight1, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
        new PIXI.Texture(strikePigWalkRight2, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
    ]
    monstersInfo.strikePig.texture['died'] = [
        new PIXI.Texture(strikePigDied, new PIXI.Rectangle(0, 0, monstersInfo.strikePig.size.width, monstersInfo.strikePig.size.height)),
    ]
}

function createBugBossTexture() {
    console.log("Creating bug boss texture");
    monstersInfo.bugBoss.texture['faceLeft'] = [
        new PIXI.Texture(bugBossFaceLeft, new PIXI.Rectangle(0, 0, monstersInfo.bugBoss.size.width, monstersInfo.bugBoss.size.height)),
    ]
    monstersInfo.bugBoss.texture['faceRight'] = [
        new PIXI.Texture(bugBossFaceRight, new PIXI.Rectangle(0, 0, monstersInfo.bugBoss.size.width, monstersInfo.bugBoss.size.height)),
    ]
    monstersInfo.bugBoss.texture['damagedFaceLeft'] = [
        new PIXI.Texture(bugBossDamagedFaceLeft, new PIXI.Rectangle(0, 0, monstersInfo.bugBoss.size.width, monstersInfo.bugBoss.size.height)),
    ]
    monstersInfo.bugBoss.texture['damagedFaceRight'] = [
        new PIXI.Texture(bugBossDamagedFaceRight, new PIXI.Rectangle(0, 0, monstersInfo.bugBoss.size.width, monstersInfo.bugBoss.size.height)),
    ]
    monstersInfo.bugBoss.texture['died'] = [
        new PIXI.Texture(bugBossDied, new PIXI.Rectangle(0, 0, monstersInfo.bugBoss.size.width, monstersInfo.bugBoss.size.height)),
    ]
}

function createLittleBugTexture() {
    console.log("Creating little bug texture");
    monstersInfo.littleBug.texture['faceLeft'] = [
        new PIXI.Texture(littleBugFaceLeft, new PIXI.Rectangle(0, 0, monstersInfo.littleBug.size.width, monstersInfo.littleBug.size.height)),
    ]
    monstersInfo.littleBug.texture['faceRight'] = [
        new PIXI.Texture(littleBugFaceRight, new PIXI.Rectangle(0, 0, monstersInfo.littleBug.size.width, monstersInfo.littleBug.size.height)),
    ]
    monstersInfo.littleBug.texture['walkLeft'] = [
        new PIXI.Texture(littleBugWalkLeft1, new PIXI.Rectangle(0, 0, monstersInfo.littleBug.size.width, monstersInfo.littleBug.size.height)),
        new PIXI.Texture(littleBugWalkLeft2, new PIXI.Rectangle(0, 0, monstersInfo.littleBug.size.width, monstersInfo.littleBug.size.height)),
    ]
    monstersInfo.littleBug.texture['walkRight'] = [
        new PIXI.Texture(littleBugWalkRight1, new PIXI.Rectangle(0, 0, monstersInfo.littleBug.size.width, monstersInfo.littleBug.size.height)),
        new PIXI.Texture(littleBugWalkRight2, new PIXI.Rectangle(0, 0, monstersInfo.littleBug.size.width, monstersInfo.littleBug.size.height)),
    ]
    monstersInfo.littleBug.texture['died'] = [
        new PIXI.Texture(littleBugDied, new PIXI.Rectangle(0, 0, monstersInfo.littleBug.size.width, monstersInfo.littleBug.size.height)),
    ]
}

function playerJump() {
    // Allow the player to jump by adjusting the y speed (just like real life)
    charactersInfo.player.speedY = -20;
}

function updateCanvas(direction, amount = charactersInfo.player.speed) {
    // The direction here refers to the direction of the canvas' movement
    if (!allowPlayerMoveOutOfScreen) return;

    let playerIsNearLeftBorder = false;
    let playerIsNearRightBorder = false;
    if ((currentBackgroundPosition.minX + gameWidth / 2) > player.x) {
        playerIsNearLeftBorder = true;
    }
    if ((currentBackgroundPosition.maxX - gameWidth / 2) < player.x) {
        playerIsNearRightBorder = true;
    }

    app.stage.children.forEach((child) => {
        if (!playerIsNearLeftBorder && !playerIsNearRightBorder) {
            if (direction === "left") {
                // Player is moving right, background is moving left
                if (child.label != "healthBar" && child.label != "energyBar") {
                    child.x -= amount;
                }
            } else if (direction === "right") {
                // Player is moving left, background is moving right

                if (child.label != "healthBar" && child.label != "energyBar") {
                    child.x += amount;
                }
            }
        }
    });
}

function generateRandomCoords(min, max) {
    const y = Math.floor(Math.random() * (max.y - min.y + 1) + min.y);
    const x = Math.floor(Math.random() * (max.x - min.x + 1) + min.x);

    return { x, y };
}

function checkCollision(element1, element2) {
    let element1Bounds = element1.getBounds();
    let element2Bounds = element2.getBounds();

    // Check if the two elements are colliding and their positions
    if (element1Bounds.x + element1Bounds.width > element2Bounds.x && element1Bounds.x < element2Bounds.x) {
        return 'right';
    } else if (element1Bounds.x < element2Bounds.x + element2Bounds.width && element1Bounds.x + element1Bounds.width > element2Bounds.x + element2Bounds.width) {
        return 'left';
    }

    return 'none';
}

function checkStandingOn(element1, element2) {
    let element1Bounds = element1.getBounds();
    let element2Bounds = element2.getBounds();

    if (element1Bounds.x + element1Bounds.width / 2 > element2Bounds.x && element1Bounds.x + element1Bounds.width / 2 < element2Bounds.x + element2Bounds.width) {
        if (element1Bounds.y + element1Bounds.height > element2Bounds.y && element1Bounds.y < element2Bounds.y + element2Bounds.height) {
            return true;
        }
    }

    return false;
}

function distanceBetween(element1, element2) {
    const xDistance = Math.abs(element1.x - element2.x);
    const yDistance = Math.abs(element1.y - element2.y);

    return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
}

function monsterFollowPlayer(monster) {
    if (!monster.label.alive || monster.label.isAttacking || !charactersInfo.player.alive) {
        return;
    }

    if (distanceBetween(player, monster) > monster.label.range) { // if the player is out of the range of the monster
        if (monster.textures === monster.label.texture.walkRight || monster.textures === monster.label.texture.faceRight) {
            monster.textures = monster.label.texture.faceRight;
        } else if (monster.textures === monster.label.texture.walkLeft || monster.textures === monster.label.texture.faceLeft) {
            monster.textures = monster.label.texture.faceLeft;
        }

        // Hide the exclamation mark
        monster.label.container.children.forEach((child) => {
            if (child.label.name === "exclamationMark") {
                child.visible = false;
            }
        });

        return;
    }

    if (monster.x > player.x + monster.label.range * 0.25) {
        if (!monster.playing || monster.textures !== monster.label.texture.walkLeft) {
            // Change the texture of the monster to walk left
            if (!monster.label.isDamaged) {
                try {
                    if (monster.label.texture.walkLeft.length > 0) {
                        monster.textures = monster.label.texture.walkLeft;
                        monster.play();
                    }
                }
                catch (err) {
                    monster.textures = monster.label.texture.faceLeft;
                    monster.loop = false;
                }
                monster.label.container.children.forEach((child) => {
                    if (child.label.name === "entityRemainHealth") {
                        child.x = monster.x + monster.label.entityRemainHealthPosition.faceLeftX;
                    }
                });
            }
        }

        monster.label.container.children.forEach((child) => {
            if (child.label.name === "exclamationMark") {
                child.visible = true;
                child.x = monster.x + monster.label.exclamationMarkPosition.faceLeftX;
                child.y = monster.y + monster.label.exclamationMarkPosition.y;
            }
            child.x -= monster.label.speed;
        });
    } else if (monster.x < player.x - monster.label.range * 0.25) {
        if (!monster.playing || monster.textures !== monster.label.texture.walkRight) {
            // Change the texture of the monster to walk right
            if (!monster.label.isDamaged) {
                try {
                    if (monster.label.texture.walkRight.length > 0) {
                        monster.textures = monster.label.texture.walkRight;
                        monster.play();
                    }
                }
                catch (err) {
                    monster.textures = monster.label.texture.faceRight;
                    monster.loop = false;
                }
                monster.label.container.children.forEach((child) => {
                    if (child.label.name === "entityRemainHealth") {
                        child.x = monster.x + monster.label.entityRemainHealthPosition.faceRightX;
                    }
                });
            }
        }
        monster.label.container.children.forEach((child) => {
            if (child.label.name === "exclamationMark") {
                child.visible = true;
                child.x = monster.x + monster.label.exclamationMarkPosition.faceRightX;
                child.y = monster.y + monster.label.exclamationMarkPosition.y;
            }
            child.x += monster.label.speed;
        });
    } else {
        // If the monster is close to the player, stop moving and attack
        if (!monster.label.isAttacking) {
            monster.label.attack(monster);
            monster.label.container.children.forEach((child) => {
                if (child.label.name === "exclamationMark") {
                    child.texture = monsterAnger;
                }
            });
        }
    }
}

function moveExlcamationMark(monster) {
    if (!monster.label.alive) {
        return;
    }

    let exclamationMark;
    monster.label.container.children.forEach((child) => {
        if (child.label.name === "exclamationMark") {
            exclamationMark = child;
        }
    });

    exclamationMark.visible = true;
    exclamationMark.texture = exclamationMarkRed;
    exclamationMark.y = monster.y + monster.label.exclamationMarkPosition.y;

    if (monster.textures === monster.label.texture.walkRight || monster.textures === monster.label.texture.faceRight) {
        exclamationMark.x = monster.x + monster.label.exclamationMarkPosition.faceRightX;
    } else if (monster.textures === monster.label.texture.walkLeft || monster.textures === monster.label.texture.faceLeft) {
        exclamationMark.x = monster.x + monster.label.exclamationMarkPosition.faceLeftX;
    }
}

let strikePigStrikeInProgress = false;
let strikeDirection = "";
function strikePigAttack() {
    if (!strikePig.label.alive) {
        return;
    }

    console.log("Strike pig is attacking");
    strikePig.label.isAttacking = true;
    strikePigSmoke.visible = true;
    strikePigSmoke.y = strikePig.y + 35;
    strikePig.loop = true;
    strikePigStrike.y = strikePig.y;
    if (strikePig.textures === monstersInfo.strikePig.texture.walkRight) {
        strikePigStrike.texture = strikeWaveFaceRight;
        strikePigSmoke.texture = smokeFaceRight;
        strikePigSmoke.x = strikePig.x - 75;
        strikePigExclamationMark.x = strikePig.x + 50;
        strikePigStrike.x = strikePig.x + 75;
        strikeDirection = "right";
    }
    else if (strikePig.textures === monstersInfo.strikePig.texture.walkLeft) {
        strikePigStrike.texture = strikeWaveFaceLeft;
        strikePigSmoke.texture = smokeFaceLeft;
        strikePigSmoke.x = strikePig.x + 75;
        strikePigExclamationMark.x = strikePig.x - 50;
        strikePigStrike.x = strikePig.x - 75;
        strikeDirection = "left";
    }

    strikePig.animationSpeed = monstersInfo.strikePig.animationSpeed * 2;
    strikePig.play();
    const strikePigStrikeInterval = setTimeout(function () {
        strikePigStrike.visible = true;
        strikePigStrikeInProgress = true;
    }, 1500);

    const strikePigNotStrikeInterval = setTimeout(function () {
        strikePigStrike.visible = false;
        strikePigSmoke.visible = false;
        strikePigStrikeInProgress = false;
        strikePig.label.isAttacking = false;
        strikePig.animationSpeed = monstersInfo.strikePig.animationSpeed;
    }, 2000); // change the delay time to adjust the strike distance
    intervalsAndTimeouts.push(strikePigStrikeInterval);
    intervalsAndTimeouts.push(strikePigNotStrikeInterval);
}

function createLittleBug() {
    if (!bugBoss.label.alive || !charactersInfo.player.alive || gamePaused) {
        return;
    }

    let littleBug = undefined;
    const littleBugCoor = generateRandomCoords({ x: 50, y: monstersInfo.littleBug.floorY }, { x: app.screen.width + 50, y: 50 });
    monstersInfo.littleBug.location.x = littleBugCoor.x;
    monstersInfo.littleBug.location.y = littleBugCoor.y;
    littleBug = createMonster(monstersInfo.littleBug, './src/image/monsters/bug_boss/little_bug_walk_right_1.png', true, true, {
        texture: monstersInfo.littleBug.texture.faceRight,
        animationSpeed: monstersInfo.littleBug.animationSpeed,
        loop: true,
        autoPlay: false,
    }).monster;
    monsters.push(littleBug);
}

function bugBossAttack(element = bugBoss) {
    if (!bugBoss.label.alive || bugBoss.label.isAttacking || !charactersInfo.player.alive) {
        return;
    }

    // When the bug boss is attacking, it will summon little bugs
    // WIP
    bugBoss.label.isAttacking = true;
    if (!bugBoss.label.isSummoning) {
        console.log("Set create bug interval");
        bugBoss.label.isSummoning = true;
        const createLittleBugInterval = setInterval(createLittleBug, 2500);
        intervalsAndTimeouts.push(createLittleBugInterval);
    }

    if (player.x > bugBoss.x) {
        attacksInfo.bugBossStrike.direction = "right";
    } else if (player.x < bugBoss.x) {
        attacksInfo.bugBossStrike.direction = "left";
    }
    bugBossStrike.y = bugBoss.y;
    bugBossStrike.x = bugBoss.x;
    attacksInfo.bugBossStrike["originalLocation"] = { x: bugBoss.x, y: bugBoss.y };
}

function littleBugAttack(element) {
    if (!bugBoss.label.alive) {
        return;
    }

    element.label.isAttacking = true;
    let littleBugSting = undefined;
    littleBugSting = createElement(false, littleBugSting, attacksInfo.littleBugSting.size, attacksInfo.littleBugSting.location, 0.5, false, './src/image/monsters/bug_boss/little_bug_sting.png', attacksInfo.littleBugSting);
    monstersAttack.push(littleBugSting);
    littleBugSting.label = attacksInfo.littleBugSting;
    littleBugSting.y = element.y;
    littleBugSting.x = element.x;
    element.label["attackInfo"] = { ...attacksInfo.littleBugSting };
    element.label.attackInfo["sting"] = littleBugSting;
    element.label.attackInfo["originalLocation"] = { x: element.x, y: element.y };

    if (element.textures === monstersInfo.littleBug.texture.walkRight || element.textures === monstersInfo.littleBug.texture.faceRight) {
        element.label.attackInfo.direction = "right";
    } else if (element.textures === monstersInfo.littleBug.texture.walkLeft || element.textures === monstersInfo.littleBug.texture.faceLeft) {
        element.label.attackInfo.direction = "left";
    }
}

function checkEntitiesFalling() {
    function handleFallingAndCollision(entity, entityInfo, defaultFloorY) {
        let isStandingOnObject = false;

        for (const supportingObject of supportingObjects) {
            const isStandOnObject = checkStandingOn(entity, supportingObject);
            const isCollidingObject = checkCollision(entity, supportingObject);

            if (!isStandOnObject && isCollidingObject) {
                if (isCollidingObject === "left") {
                    entityInfo.isBlocked.left = true;
                } else if (isCollidingObject === "right") {
                    entityInfo.isBlocked.right = true;
                } else {
                    entityInfo.isBlocked.left = false;
                    entityInfo.isBlocked.right = false;
                }
            }

            if (isStandOnObject) {
                entity.label.floorY = supportingObject.y - entity.height / 2;
                isStandingOnObject = true;
                break;
            }
        }

        if (!isStandingOnObject) {
            entity.label.floorY = defaultFloorY;
        }

        if (entity.y < entity.label.floorY - entity.label.speedY) {
            // If the entity is in the air
            entity.label.speedY += gravity;
            try {
                entity.label.container.children.forEach((child) => {
                    child.y += entity.label.speedY;
                });
            }
            catch (err) {
                console.log(entity.label.name + " does not have a container");
                entity.y += entity.label.speedY;
            }
        } else {
            // If the entity is on the floor
            entity.label.speedY = 0;
            entity.label.isJumping = false;
            entity.y = entity.label.floorY;
        }
    }

    // Loop through each of the lists
    // Check falling for each monster
    for (const monster of monsters) {
        handleFallingAndCollision(monster, monster.label, minFloorHeight);
    }

    // Check falling for each character
    // The characters object include the player
    for (const character of characters) {
        handleFallingAndCollision(character, character.label, minFloorHeight);
    }
}


function damage(element, dmg) {
    if (element.label.inDamageCooldown) {
        return;
    }

    element.label.inDamageCooldown = true;
    if (element.label.name === "player") {
        if (element.label.status.shield) {
            dmg /= 2;
        }

        if (playerRollInfo.isRolling) {
            dmg *= 0.25;
        }
    }

    if (element.label.status.health - dmg <= 0) {
        if (element.label.name === "player") {
            healthText.text = 'Health: 0';
        }
        elementDied(element);

        return false;
    }

    element.label.status.health -= Math.round(dmg);
    if (element.label.name === "player") {
        // Update the health text
        healthText.text = 'Health: ' + Math.round(charactersInfo.player.status.health);
    }

    // The same logic applies to the monsters and the player
    try {
        if (element.textures === element.label.texture.faceRight || element.textures === element.label.texture.walkRight) {
            element.textures = element.label.texture.damagedFaceRight;
        } else if (element.textures === element.label.texture.faceLeft || element.textures === element.label.texture.walkLeft) {
            element.textures = element.label.texture.damagedFaceLeft;
        }
        element.label.container.children.forEach((child) => {
            if (child.label.name === "entityRemainHealth") {
                const currentHelthPercentage = element.label.status.health / element.label.status.maxHealth * 100;
                if (currentHelthPercentage >= 80) {
                    child.texture = entityRemainHealth5;
                } else if (currentHelthPercentage >= 60) {
                    child.texture = entityRemainHealth4;
                } else if (currentHelthPercentage >= 40) {
                    child.texture = entityRemainHealth3;
                } else if (currentHelthPercentage >= 20) {
                    child.texture = entityRemainHealth2;
                } else if (currentHelthPercentage >= 10) {
                    child.texture = entityRemainHealth1;
                } else if (currentHelthPercentage >= 0) {
                    child.texture = entityRemainHealth0;
                }
            }
        });
    }
    catch (err) {
        console.log(element.label.name + " does not have remain health object");
    }

    const randomDieSoundIndex = Math.floor(Math.random() * element.label.damagedSound.length);
    element.label.damagedSound[randomDieSoundIndex].currentTime = 0;
    element.label.damagedSound[randomDieSoundIndex].play();

    const playerDamagedInterval = setTimeout(function () {
        element.label.inDamageCooldown = false;
        if (element.textures === element.label.texture.damagedFaceRight) {
            element.textures = element.label.texture.faceRight;
        } else if (element.textures === element.label.texture.damagedFaceLeft) {
            element.textures = element.label.texture.faceLeft;
        }
    }, element.label.damageCoolDown * 1000);
    intervalsAndTimeouts.push(playerDamagedInterval);
}

function elementDied(element) {
    console.log(element.label.name + " is dead");
    element.label.alive = false;
    element.label.status.health = 0;
    if (element.label.name === "player") {
        player.visible = false;
        setTimeout(gameOver, 1500);
    } else {
        // Add the element to the stage so that it can be seen
        element.label.container.visible = false;
        app.stage.addChild(element);
        element.visible = true;
        element.textures = element.label.texture.died;

        setTimeout(function () {
            try {
                element.label.container.destroy();
                element.label.container = null;
                element.visible = false;
            }
            catch (err) {
                element.destroy();
                element = null;
                element.visible = false;
            }
        }, 1500);
        for (const monsterAttack of monstersAttack) {
            if (monsterAttack.label.from === element.label.name) {
                monsterAttack.destroy();
                monsterAttack.visible = false;
            }
        }
    }
    element.label.dieSound.play();

    // Check if the player has killed special monsters that unlock abilities
    if (element.label.name === "bugBoss") {
        setTimeout(() => {
            unlockAbilityShow("Roll", {
                description: "Press <b>q</b> to roll, has a 0.5 second cooldown. <br>When rolling, the player takes 75% less damage.",
                instruction: "Press <b>q</b> to roll",
            }, "./src/image/player/player_roll.gif");
            allowPlayerMoveOutOfScreen = true;
            player.x = app.screen.width * 1.5;
            updateCanvas("left", app.screen.width * 1);
        }, 1500);
    }
}

function pauseGame() {
    app.ticker.stop();
    gamePaused = true;
    document.removeEventListener('keydown', keysDown);
    document.removeEventListener('keyup', keysUp);
    document.querySelector("#gameDiv").removeEventListener('mousedown', mouseDown);
    document.querySelector("#gameDiv").removeEventListener('mouseup', mouseUp);
    ambientMusic.volume = 0.5;
    battleMusic.volume = 0.5;
}

function resumeGame() {
    app.ticker.start();
    gamePaused = false;
    document.addEventListener('keydown', keysDown);
    document.addEventListener('keyup', keysUp);
    document.querySelector("#gameDiv").addEventListener('mousedown', mouseDown);
    document.querySelector("#gameDiv").addEventListener('mouseup', mouseUp);
    ambientMusic.volume = 1;
    battleMusic.volume = 1;
}

function gameOver() {
    console.log("Game over!");
    document.removeEventListener('keydown', keysDown);
    document.removeEventListener('keyup', keysUp);
    document.querySelector("#gameDiv").removeEventListener('mousedown', mouseDown);
    document.querySelector("#gameDiv").removeEventListener('mouseup', mouseUp);
    clearInterval(playerRegenerationInterval);
    ambientMusic.volume = 0.5;
    battleMusic.volume = 0.5;

    let respawnButton, quitButton, gameOverText, gameOverBackground;
    respawnButton = new PIXI.Text(
        "Respawn",
        {
            fontFamily: 'Arcade',
            fontSize: 24,
            fill: 'rgba(255, 255, 255, 0.8)',
        }
    );
    respawnButton.anchor.set(0.5);
    respawnButton.x = app.screen.width / 2;
    respawnButton.y = app.screen.height / 2 - 25;
    respawnButton.interactive = true;
    respawnButton.buttonMode = true;
    respawnButton.on('mouseover', () => {
        respawnButton.style.fill = 'rgba(255, 255, 255, 1)';
    });
    respawnButton.on('mouseout', () => {
        respawnButton.style.fill = 'rgba(255, 255, 255, 0.8)';
    });
    respawnButton.on('click', () => {
        console.log("Respawn");
        playerDeathNum++;
        player.label.alive = true;
        init();
    });

    quitButton = new PIXI.Text(
        "Quit",
        {
            fontFamily: 'Arcade',
            fontSize: 24,
            fill: 'rgba(255, 0, 0, 0.8)',
        }
    );
    quitButton.anchor.set(0.5);
    quitButton.x = app.screen.width / 2;
    quitButton.y = app.screen.height / 2 + 25;
    quitButton.interactive = true;
    quitButton.buttonMode = true;
    quitButton.on('mouseover', () => {
        quitButton.style.fill = 'rgba(255, 0, 0, 1)';
    });
    quitButton.on('mouseout', () => {
        quitButton.style.fill = 'rgba(255, 0, 0, 0.8)';
    });
    quitButton.on('click', () => {
        console.log("Quit");
        if (confirm("Are you sure you want to quit?")) {
            window.close();
        }
    });

    gameOverText = new PIXI.Text(
        "Game Over",
        {
            fontFamily: 'Arcade',
            fontSize: 48,
            fill: 'rgba(255, 0, 0, 0.8)',
        }
    )
    gameOverText.anchor.set(0.5);
    gameOverText.x = app.screen.width / 2;
    gameOverText.y = app.screen.height / 5;

    gameOverBackground = new PIXI.Graphics();
    gameOverBackground.beginFill(0x000000, 0.5);
    gameOverBackground.drawRect(0, 0, app.screen.width, app.screen.height);
    gameOverBackground.endFill();

    // The order of adding the elements to the stage matters
    app.stage.addChild(gameOverBackground);
    app.stage.addChild(gameOverText);
    app.stage.addChild(respawnButton);
    app.stage.addChild(quitButton);
}

function gameLoop(delta = 1) {
    // The gameloop function is called 60 times per second (60fps)
    // If the player is dead, stop the game loop
    if (!charactersInfo.player.alive) {
        return;
    }

    try {
        if (!playerIsRegenrating) {
            playerRegenerationInterval = setInterval(playerRegeneration, 1000);
            playerIsRegenrating = true;
            intervalsAndTimeouts.push(playerRegenerationInterval);
        }
    }
    catch (err) {
        console.log("Error:", err);
    }
    // Check if the player is attacking the monsters
    for (const attack of monstersAttack) {
        if (checkCollision(player, attack) === "right" || checkCollision(player, attack) === "left") {
            const attacker = monsters.find(monster => monster.label.name === attack.label.from);
            if (attacker.label.alive) {
                damage(player, attack.label.damage);
            }
        }
    }

    // Check if the monsters are attacking the player
    for (const playerAttack of playerAttacks) {
        for (const monster of monsters) {
            if ((checkCollision(playerAttack, monster) === 'left' || checkCollision(playerAttack, monster) === 'right') && monster.label.alive) {
                damage(monster, playerAttack.label.damage);
                // if (!monster.label.)
            }
        }
    }

    // Check if the monster should be following the player
    for (const monster of monsters) {
        monsterFollowPlayer(monster);
        if (monster.label.name === "littleBug") {
            if (monster.label.alive && bugBoss.label.alive && monster.label.isAttacking && !monster.label.inAttackingCooldown) {
                try {
                    if (Math.abs(monster.label.attackInfo.sting.x - monster.label.attackInfo.originalLocation.x) < monster.label.attackInfo.range) {
                        monster.label.attackInfo.sting.visible = true;
                        if (monster.label.attackInfo.direction === "right") {
                            monster.textures = monstersInfo.littleBug.texture.faceRight;
                            monster.label.attackInfo.sting.x += monster.label.attackInfo.speed;
                        } else if (monster.label.attackInfo.direction === "left") {
                            monster.textures = monstersInfo.littleBug.texture.faceLeft;
                            monster.label.attackInfo.sting.x -= monster.label.attackInfo.speed;
                        }
                    } else {
                        monster.label.attackInfo.sting.visible = false;
                        monster.label.attackInfo.sting.destroy();
                        monster.label.isAttacking = false;
                    }
                }
                catch (err) {
                    console.log("The little bug is dead");
                }
            }
        }
    }

    if (playerIsSwordAttacking) {
        sword.visible = true;
        sword.y = player.y + 8;
        if (charactersInfo.player.attack.sword.direction === "right") {
            sword.x = player.x + 20;
            player.textures = charactersInfo.player.texture.faceRight;
            if (sword.rotation < 1.5) {
                sword.rotation += 0.15;
            } else if (cntAfterAttack < 10 + playerHoldSword) {
                cntAfterAttack++;
            } else {
                sword.visible = false;
                playerIsSwordAttacking = false;
                cntAfterAttack = 0;
            }
        } else if (charactersInfo.player.attack.sword.direction === "left") {
            sword.x = player.x - 20;
            player.textures = charactersInfo.player.texture.faceLeft;
            if (sword.rotation > -1.5) {
                sword.rotation -= 0.15;
            } else if (cntAfterAttack < 10 + playerHoldSword) {
                cntAfterAttack++;
            } else {
                sword.visible = false;
                playerIsSwordAttacking = false;
                cntAfterAttack = 0;
            }
        }
    }

    if (playerIsChiAttacking) {
        chi.visible = true;
        if (Math.abs(chi.x - charactersInfo.player.attack.chi.originalLocation.x) < charactersInfo.player.attack.chi.range) {
            // console.log(charactersInfo.player.attack.chi.originalLocation.x, chi.x);
            if (charactersInfo.player.attack.chi.direction === "right") {
                console.log("Chi is moving right");
                chi.x += charactersInfo.player.attack.chi.speed;
            } else if (charactersInfo.player.attack.chi.direction === "left") {
                chi.x -= charactersInfo.player.attack.chi.speed;
            }
            chi.rotation += 0.2;
        } else {
            playerIsChiAttacking = false;
            chi.visible = false;
        }
    }

    if (playerRollInfo.isRolling && playerRollCoolDown <= 0) {
        if ((playerRollInfo.direction === "right" && player.rotation < 3) || (playerRollInfo.direction === "left" && player.rotation > -3) && charactersInfo.player.alive && player.x > 0 && player.x < app.screen.width) {
            if (playerRollInfo.direction === "right") {
                player.rotation += 0.3;
                if (!charactersInfo.player.isBlocked.right) {
                    player.x += gameWidth * 0.025;
                    playerRollSmoke.texture = smokeFaceRight;
                    if (allowPlayerMoveOutOfScreen) {
                        updateCanvas("left", gameWidth * 0.025);
                    }
                }
            } else if (playerRollInfo.direction === "left") {
                player.rotation -= 0.3;
                if (!charactersInfo.player.isBlocked.left) {
                    player.x -= gameWidth * 0.025;
                    playerRollSmoke.texture = smokeFaceLeft;
                    if (allowPlayerMoveOutOfScreen) {
                        updateCanvas("right", gameWidth * 0.025);
                    }
                }
            }
            playerRollSmoke.visible = true;
            playerRollSmoke.width = player.width * 0.75;
            playerRollSmoke.height = player.height * 0.75;
            playerRollSmoke.x = player.x;
            playerRollSmoke.y = player.y + 30;
        } else {
            playerRollInfo.isRolling = false;
            player.rotation = 0;
            playerRollSmoke.visible = false;
            playerRollCoolDown = 30; // Reset the cooldown
        }
    } else {
        if (playerRollCoolDown > 0) {
            playerRollCoolDown--;
        } else {
            // playerRollReadySound.play();
        }
    }

    // Check if the strike pig is attacking
    if (strikePigStrikeInProgress && strikePig.label.alive) {
        if (strikeDirection === "right") {
            strikePig.label.container.children.forEach((child) => {
                if (child.label.name === "exclamationMark") {
                    child.visible = false;
                } else {
                    child.x += monstersInfo.strikePig.speed * 5;
                }
            });
        } else if (strikeDirection === "left") {
            strikePig.label.container.children.forEach((child) => {
                if (child.label.name === "exclamationMark") {
                    child.visible = false;
                } else {
                    child.x -= monstersInfo.strikePig.speed * 5;
                }
            });
        }
    }

    if (bugBoss.label.alive && bugBoss.label.isAttacking && charactersInfo.player.alive) {
        bugBossStrike.visible = true;
        if (Math.abs(bugBossStrike.x - attacksInfo.bugBossStrike.originalLocation.x) < attacksInfo.bugBossStrike.range) {
            if (attacksInfo.bugBossStrike.direction === "right") {
                bugBossStrike.texture = bugBossStrikeFaceRight;
                bugBossStrike.x += attacksInfo.bugBossStrike.speed;
            } else if (attacksInfo.bugBossStrike.direction === "left") {
                bugBossStrike.texture = bugBossStrikeFaceLeft;
                bugBossStrike.x -= attacksInfo.bugBossStrike.speed;
            }
        } else {
            bugBossStrike.x = bugBoss.x;
            bugBossStrike.visible = false;
            bugBoss.label.isAttacking = false;
        }
    }

    if (!bugBoss.label.alive) {
        // Update the background border coords
        for (const background of backgrounds) {
            if (background.label === "forest1") {
                currentBackgroundPosition.minX = background.getBounds().minX;
            }
            else if (background.label === "forest3") {
                currentBackgroundPosition.maxX = background.getBounds().maxX;
            }
        }
    }

    // check key press
    // During boss fight, player cannot move out of the screen
    let isMoving = false;
    if (key['a'] || key["ArrowLeft"]) {
        if (!allowPlayerMoveOutOfScreen) {
            if ((player.x - player.width / 2) <= 0) {
                charactersInfo.player.isBlocked.left = true;
            }
        } else {
            if ((currentBackgroundPosition.minX) >= player.x) {
                charactersInfo.player.isBlocked.left = true;
            }
            if ((currentBackgroundPosition.maxX) <= player.x) {
                charactersInfo.player.isBlocked.right = true;
            }
        }

        if (!player.playing) {
            player.textures = charactersInfo.player.texture.walkLeft;
            player.play();
        }
        if (!charactersInfo.player.isBlocked.left) {
            player.x -= charactersInfo.player.speed;
            isMoving = true;
            updateCanvas("right");
        }
    }
    if (key['d'] || key["ArrowRight"]) {
        if (!allowPlayerMoveOutOfScreen) {
            if ((player.x + player.width / 2) >= app.screen.width) {
                charactersInfo.player.isBlocked.right = true;
            }
        } else {
            if ((currentBackgroundPosition.minX) >= player.x) {
                charactersInfo.player.isBlocked.left = true;
            }
            if ((currentBackgroundPosition.maxX) <= player.x) {
                charactersInfo.player.isBlocked.right = true;
            }
        }

        if (!player.playing) {
            player.textures = charactersInfo.player.texture.walkRight;
            player.play();
        }
        if (!charactersInfo.player.isBlocked.right) {
            player.x += charactersInfo.player.speed;
            isMoving = true;
            updateCanvas("left");
        }
    }
    if ((key[' '] || key['w'] || key['ArrowUp']) && !charactersInfo.player.isJumping) {
        charactersInfo.player.isJumping = true;
        playerJump();
    }

    // Test
    if (key['p']) {
        // Just for testing, unlock all abilities
        // use gif to better show the abilities
        unlockAbilityShow("Chi attack", {
            description: "Press <b>f</b> to use Chi attack, deals 25 damage. <br>Each attack consumes 1 energy.",
            instruction: "Press <b>f</b> to use Chi attack",
        }, "./src/image/player/player_chi_attack.gif");
        unlockAbilityShow("Roll", {
            description: "Press <b>q</b> to roll, has a 0.5 second cooldown. <br>When rolling, the player takes 75% less damage.",
            instruction: "Press <b>q</b> to roll",
        }, "./src/image/player/player_roll.gif");
    }
    if (key['o']) {
        // Just for testing
        damage(player, charactersInfo.player.status.maxHealth);
    }

    // Abilities key press
    if (key['c']) {
        if (inCoolDown === 0) {
            charactersInfo.player.speed *= 2;
            playerHoldSword = 600;
            inCoolDown = 600;
        }
    }
    if (inCoolDown <= 300 && inCoolDown > 0) {
        charactersInfo.player.speed = 8;
        playerHoldSword = 0;
    }
    if (inCoolDown) {
        inCoolDown--;
    }

    if (key['f'] && unlockedAbilities.includes("Chi attack")) {
        playerChiAttack();
    }

    if (key['q'] && unlockedAbilities.includes("Roll")) {
        playerRoll();
    }

    // Change the player texture to face left or right when the player is not moving
    if (!isMoving) {
        if (player.textures === charactersInfo.player.texture.walkLeft) {
            player.textures = charactersInfo.player.texture.faceLeft;
        }
        else if (player.textures === charactersInfo.player.texture.walkRight) {
            player.textures = charactersInfo.player.texture.faceRight;
        }
    }
    checkEntitiesFalling();
}
