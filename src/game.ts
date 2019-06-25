import { AABB } from "./aabb";
import { Animal } from "./animal";
import { RigidBody } from "./rigidbody";
import { Portable } from "./portable";
import { SceneObject } from "./sceneobject";
import { ModelLoader } from "./modelloader";

import { Rotatable3 } from "./rotatable3";
import { Slidable } from "./slidable";
import { CubeCollider } from "./cubecollider";
import { NumberWheel } from "./numberwheel";
import { GalleryPuzzle } from "./gallerypuzzle";

// load the scene object model (SOM)
import * as som from './som.json';
log("scene.title: " + som.scene.title); 

/// -------- SCENE CREATION FUNCTIONS --------

function spawnSceneObject(data:object) 
{
  const so = populate(new SceneObject(), data); // TODO: error checking

  const mod = new Entity();
  mod.addComponent(new GLTFShape("models/" + so.filename));
  const trans = new Transform({ position: new Vector3(...so.pos), scale: new Vector3(...so.scale) });
  mod.addComponent(trans);
  trans.rotation.eulerAngles = new Vector3(...so.angles);

  if (so.rigidbody || so.throwable)
  {
    mod.addComponent(new RigidBody(mod, new Vector3(...so.physics.velocity), so.physics.mass, so.physics.bounciness));
  }
  if (so.portable || so.throwable)
  {
    mod.addComponent(new Portable(mod, so.throwable, 50));
  }

  engine.addEntity(mod);
  return mod;
}

function spawnModel(filename: string, x: number, y: number, z: number, scaleX: number = 1, scaleY: number = 1, scaleZ: number = 1) {

  const mod = new Entity();
  mod.addComponent(new GLTFShape("models/" + filename));
  mod.addComponent(new Transform({ position: new Vector3(x, y, z), scale: new Vector3(scaleX, scaleY, scaleZ) }));

  engine.addEntity(mod);
  return mod;
}

function spawnBall(x: number, y: number, z: number, mass:float = 1, bounce:float = 0.7) 
{
  const ball = new Entity();
  ball.addComponent(new Transform({ position: new Vector3(x, y, z), scale: new Vector3(0.2, 0.2, 0.2) }));
  ball.addComponent(new SphereShape());

  let startVel:Vector3 = new Vector3(12, 0, 10);
  ball.addComponent(new RigidBody(ball, startVel, mass, bounce));

  engine.addEntity(ball);
  return ball;
}

function spawnRock(x: number, y: number, z: number, scaleX: number = 1, scaleY: number = 1, scaleZ: number = 1, startVel:number = 30)
{
  const rock = spawnModel("rock1.gltf", x, y, z, scaleX, scaleY, scaleZ);
  rock.addComponent(new RigidBody(rock, new Vector3(0, 0, 0), scaleY + 0.75, 0.4, true)); // using scaleY for mass
  rock.addComponent(new Portable(rock, true, startVel));
}

function addCollider(collider:CubeCollider)
{
  log(collider);
  if (RigidBody.colliders == undefined)
  {
    RigidBody.colliders = [ collider ];
  }
  else
  {
    RigidBody.colliders.push(collider);
  }
  
}

// -- UI ---
// Create screenspace component
const canvas = new UICanvas()
const displayTxt = new UIText(canvas)
displayTxt.value = 'Tired and thirsty from a long desert hike,\nyou see a strange mountain on the horizon.\nAs you get closer, you see two hills,\nand a narrow track up one slope.'

//text.value = 'One steps forward\nTwo step back\nTrue steps reveal\nAn inside track'

// TEST CUBE COLLIDERS
let aabb = new AABB(new Vector3(1,1,1), new Vector3(2,2,2));
aabb.logData();

let p1 = new Vector3(3, 1, 1);
testBox(aabb, p1, 1);
let p2 = new Vector3(1, 1, 1.1);
testBox(aabb, p2, 2);
let p3 = new Vector3(0.1, 0.2, 0.3);
testBox(aabb, p3, 3);
let p4 = new Vector3(1.7, 1.8, 1.9);
testBox(aabb, p4, 4);

// load hillside colliders
const hillCollider1 = new Entity();
let hc1Trans = new Transform({ position: new Vector3(52, 7.5, 6), scale: new Vector3(20, 15, 73) });
hillCollider1.addComponent(hc1Trans);
// don't add the shape if you want it invisible
//hillCollider1.addComponent(new BoxShape());
engine.addEntity(hillCollider1);
let hcc:CubeCollider = new CubeCollider(hillCollider1, hc1Trans.position, hc1Trans.scale);
hcc.onCollision = logCollision;
hillCollider1.addComponent(hcc);
addCollider(hcc);

// const hillCollider2 = new Entity();
// let hc2Trans = new Transform({ position: new Vector3(17, 10, 7), scale: new Vector3(32, 20, 20) });
// hillCollider2.addComponent(hc2Trans);
// // don't add the shape if you want it invisible
// hillCollider2.addComponent(new BoxShape());
// engine.addEntity(hillCollider2);
// let hcc2:CubeCollider = new CubeCollider(hillCollider2, hc2Trans.position, hc2Trans.scale);
// hcc2.onCollision = logCollision;
// hillCollider2.addComponent(hcc2);
// addCollider(hcc2);

// const cube = new Entity();
// let cubeTrans = new Transform({ position: new Vector3(49, 7.5, 2.5), scale: new Vector3(14, 15, 84) });
// cube.addComponent(cubeTrans);
// cube.addComponent(new BoxShape());
// engine.addEntity(cube);
// let cc:CubeCollider = new CubeCollider(cube, cubeTrans.position, cubeTrans.scale);
// //testBox(cc.aabb, cubeTrans.position.add(Vector3.One()), 99);
// cc.onCollision = logCollision;
// cube.addComponent(cc);
// //log("colliders=" + RigidBody.colliders);
// addCollider(cc);


let r1:Entity = spawnRock(20, 0.1, -18.6, 0.25, 0.25, 0.25, 50);
let r2:Entity = spawnRock(26, 0.1, -19, 0.25, 0.25, 0.25, 50);
let r3:Entity = spawnRock(23.3, 0.1, -23, 0.30, 0.30, 0.30, 50);
let r4:Entity = spawnRock(26, 0.1, 56, 0.25, 0.25, 0.25, 50);

// Spawn a button 
// const cube = new Entity();
// cube.addComponent(new Transform({ position: new Vector3(25, 5, -15), scale: new Vector3(0.5, 0.3, 0.5) }));
// cube.addComponent(new BoxShape());
// engine.addEntity(cube);

// cube.addComponent(
//   new OnClick(() => {
//     spawnBall(Math.random() * 24 + 4, 6 + Math.random() * 4, Math.random() * -19 - 4, 1, (2 + (Math.random() * 16)) / 20);
//   })
// )

// Throw out the first ball
//const b = spawnBall(4, 8, 4);

/*
// Floor for measuring angles
const floor = new Entity();
floor.addComponent(new Transform({ position: new Vector3(25, 0, -16), scale: new Vector3(16, 0.05, 16) }));
floor.addComponent(new BoxShape());
engine.addEntity(floor);
floor.addComponent(
  new OnClick(() => {
    getLookVector();
  })
)
*/
/*
const cloud = new Entity();
cloud.addComponent(new Transform({ position: new Vector3(54, 64, 24), scale: new Vector3(108, 0.1, 108) }));
cloud.addComponent(new BoxShape());
engine.addEntity(cloud);
cloud.addComponent(
  new OnClick(() => {
    log("cloudy");
  })
)

*/
let structuresLoaded:boolean = false;
const loader:ModelLoader = new ModelLoader();

loadLandscape();
//loadStructures();
//loadAnimals();

// --- SYSTEMS ---

// PortableSystem manages objects that the avatar can carry around with them
class PortableSystem implements ISystem  
{
  public group:ComponentGroup = engine.getComponentGroup(Portable);
  update(dt: number) 
  {
    for (let entity of this.group.entities) 
    {
      const obj:Portable = entity.getComponent(Portable);
      obj.nextFrame(dt);
    }
  }
}
engine.addSystem(new PortableSystem());

// PhysicsSystem handles very basic physics for all entities with a RigidBody component
class PhysicsSystem 
{
  public group:ComponentGroup = engine.getComponentGroup(RigidBody);
  update(dt: number) 
  {
    for (let entity of this.group.entities) 
    {
      const body = entity.getComponent(RigidBody);
      body.update(dt);
    }
  }
}
engine.addSystem(new PhysicsSystem())

class RotatableSystem implements ISystem  
{
  public group:ComponentGroup = engine.getComponentGroup(Rotatable3);
  update(dt: number) 
  {
    for (let entity of this.group.entities) 
    {
      const obj:Rotatable3 = entity.getComponent(Rotatable3);
      obj.nextFrame(dt);
    }
  }
}
engine.addSystem(new RotatableSystem());

class SlidableSystem implements ISystem  
{
  public group:ComponentGroup = engine.getComponentGroup(Slidable);
  update(dt: number) 
  {
    for (let entity of this.group.entities) 
    {
      const obj:Slidable = entity.getComponent(Slidable);
      obj.nextFrame(dt);
    }
  }
}
engine.addSystem(new SlidableSystem());

// AnimalSystem handles animal movement and AI
class AnimalSystem implements ISystem {
  public group:ComponentGroup = engine.getComponentGroup(Animal);
  
  update(dt: number) 
  {
    for (let entity of this.group.entities) {
      const obj:Animal = entity.getComponent(Animal);
      obj.nextFrame(dt);
    }
  }
}
engine.addSystem(new AnimalSystem());


class NumberWheelSystem implements ISystem {
  public group:ComponentGroup = engine.getComponentGroup(NumberWheel);
  
  update(dt: number) 
  {
    for (let entity of this.group.entities) {
      const obj:NumberWheel = entity.getComponent(NumberWheel);
      obj.nextFrame(dt);
    }
  }
}
engine.addSystem(new NumberWheelSystem());

// --- LOADING FUNCTIONS ---
let isAltarComplete:boolean = false;
let victoryText:string = "New words appear on the altar:\nWithin in your wallet you will see\nA gold and shiny NFT!\n(Well, we ran out of time, but one day...)";

function loadLandscape()
{
  // load models that we will re-use early in the process
  const ground01 = loader.spawnSceneObject(som.scene.ground01);
  const rock1 = loader.spawnSceneObject(som.scene.rock1);

  const hill01 = loader.spawnSceneObject(som.scene.hill01);
  const hill02 = loader.spawnSceneObject(som.scene.hill02);
  const hill03 = loader.spawnSceneObject(som.scene.hill03);
  const hill04 = loader.spawnSceneObject(som.scene.hill04);
  //const hillcover = loader.spawnSceneObject(som.scene.hillCover);
  //addDebugClick(hillcover);
  addDebugClick(hill02);
  addDebugClick(hill03); 
  addDebugClick(hill04);

  const platform = loader.spawnSceneObject(som.scene.platform);
  platform.addComponent(
    new OnClick(() => {
      getLookVector();
    })
  )
  const altar = loader.spawnSceneObject(som.scene.altar);
  altar.addComponentOrReplace(
    new OnClick(() => {
      if (!structuresLoaded)
      {
        displayTxt.value = som.scene.altar.text;
      }
      else if (isAltarComplete)
      {
        displayTxt.value = victoryText;
      }
      else
      {
        displayTxt.value = "The altar subtly vibrates, like it's waiting for something else...";
      }
    })
  )

  const altarButton = loader.spawnSceneObject(som.scene.altarButton);
  let altarButtonSlider = new Slidable(altarButton, new Vector3(0, -2, 0), 4, 1);
  altarButton.addComponent(altarButtonSlider);
  altarButton.addComponentOrReplace(
    new OnClick(() => {
      log("clicked altarButton; pos=" + altarButton.getComponent(Transform).position);
      if (!structuresLoaded)
      {
        structuresLoaded = true;

        loadStructures();

        altarButtonSlider.togglePos();
        displayTxt.value = "";
      }
    })
  )

  const rock2 = loader.spawnSceneObject(som.scene.rock2);
  const rock3 = loader.spawnSceneObject(som.scene.rock3);
  const rock4 = loader.spawnSceneObject(som.scene.rock4);
  const rock5 = loader.spawnSceneObject(som.scene.rock5);
  const rock6 = loader.spawnSceneObject(som.scene.rock6);

  const ground02 = loader.spawnSceneObject(som.scene.ground02);
  const ground03 = loader.spawnSceneObject(som.scene.ground03);
  const ground04 = loader.spawnSceneObject(som.scene.ground04);
  
  const ground11 = loader.spawnSceneObject(som.scene.ground11);
  const ground12 = loader.spawnSceneObject(som.scene.ground12);
  const ground13 = loader.spawnSceneObject(som.scene.ground13);
  const ground14 = loader.spawnSceneObject(som.scene.ground14);
  
  const ground21 = loader.spawnSceneObject(som.scene.ground21);
  const ground22 = loader.spawnSceneObject(som.scene.ground22);
  const ground23 = loader.spawnSceneObject(som.scene.ground23);
  const ground24 = loader.spawnSceneObject(som.scene.ground24);
  
  const ground31 = loader.spawnSceneObject(som.scene.ground31);
  const ground32 = loader.spawnSceneObject(som.scene.ground32);
  const ground33 = loader.spawnSceneObject(som.scene.ground33);
  const ground34 = loader.spawnSceneObject(som.scene.ground34);
}

function loadStructures()
{
  const wallBack = loader.spawnSceneObject(som.scene.wallBack);
  const wallRight = loader.spawnSceneObject(som.scene.wallRight);
  const wallLeft = loader.spawnSceneObject(som.scene.wallLeft);

  const bigTower = loader.spawnSceneObject(som.scene.bigTower);

  let isTurretSpun:boolean = false;
  const turret = loader.spawnSceneObject(som.scene.turret);

  let turretRotator = new Rotatable3(turret, new Vector3(0, -120, 0), 4, 1);
  turret.addComponent(turretRotator);
  let turretSlider = new Slidable(turret, new Vector3(0, 5.1, 0), 4, 1);
  turret.addComponent(turretSlider);
  turret.addComponentOrReplace(
    new OnClick(() => {
      if (!isTurretSpun)
      {
        displayTxt.value = som.scene.lever2.text;
      }
    })
  )

  const lever2 = loader.spawnSceneObject(som.scene.lever2);
  let leverRotator2 = new Rotatable3(lever2, new Vector3(-30, 0, 0), 2, 2);
  lever2.addComponent(leverRotator2);
  lever2.addComponentOrReplace(
    new OnClick(() => {
        leverRotator2.toggleRotation();
        turretRotator.toggleRotation();
        turretSlider.togglePos();
        displayTxt.value = "";
        isTurretSpun =true;
    })
  )

  const tower01 = loader.spawnSceneObject(som.scene.tower01);
  const tower02 = loader.spawnSceneObject(som.scene.tower02);
  const tower03 = loader.spawnSceneObject(som.scene.tower03);

  const stand = loader.spawnSceneObject(som.scene.stand);

  const castleTerrace = loader.spawnSceneObject(som.scene.castleTerrace);
  const castleHouse = loader.spawnSceneObject(som.scene.castleHouse);

  // --- MAZE ---

  let isMazeSolved:boolean = false;
  const maze = loader.spawnSceneObject(som.scene.maze);
  const mazeButton = loader.spawnSceneObject(som.scene.mazeButton);
  mazeButton.addComponentOrReplace(
    new OnClick(() => {
      displayTxt.value = som.scene.mazeButton.text;
    })
  )
  // hardcoding the location because the GLTF model is offset quite a bit
  let mazeButtonPos:Vector3 = new Vector3(72.4, 14.5, 17.6);

  const mazeDoor1 = loader.spawnSceneObject(som.scene.mazeDoor1);
  let mdSlider1 = new Slidable(mazeDoor1, new Vector3(0, 0, 1), 2, 1);
  mazeDoor1.addComponent(mdSlider1);

  const mazeDoor2 = loader.spawnSceneObject(som.scene.mazeDoor2);
  let mdSlider2 = new Slidable(mazeDoor2, new Vector3(0, 0, -1), 2, 1);
  mazeDoor2.addComponent(mdSlider2);

  let openPodBayDoors = () => {
    mdSlider1.togglePos();
    mdSlider2.togglePos();
    displayTxt.value = "";
  }

  mazeDoor1.addComponentOrReplace(
    new OnClick(() => {
      if (isMazeSolved)
      {
        openPodBayDoors();
      }
    })
  )
  mazeDoor2.addComponentOrReplace(
    new OnClick(() => {
      if (isMazeSolved)
      {
        openPodBayDoors();
      }
    })
  )

  const carrot1 = loader.spawnSceneObject(som.scene.carrot1);
  let carrotHolder:Portable = carrot1.getComponent(Portable);
  carrotHolder.onDropped = () => {
    let distance = Vector3.Distance(carrot1.getComponent(Transform).position, mazeButtonPos);
    log("Dropped carrot: Distance=" + distance);
    if (distance < 1.2)
    {
      // maze doors open
      isMazeSolved = true;
      openPodBayDoors();
    }
  };

  const wallFront = loader.spawnSceneObject(som.scene.wallFront);
  const castleEntrance = loader.spawnSceneObject(som.scene.castleEntrance);
  const leverBase = loader.spawnSceneObject(som.scene.leverBase);

  // --- DRAWBRIDGE ---

  const drawbridge = loader.spawnSceneObject(som.scene.drawbridge);
  let bridgeRotator = new Rotatable3(drawbridge, new Vector3(90, 0, 0), 4, 1);
  drawbridge.addComponent(bridgeRotator);
  drawbridge.addComponentOrReplace(
    new OnClick(() => {
      //bridgeRotator.toggleRotation();
      // can't trigger this directly -- hit the lever
    })
  )

  let leverHit:boolean = false;
  const lever = loader.spawnSceneObject(som.scene.lever);
  let leverRotator = new Rotatable3(lever, new Vector3(-30, 0, 0), 2, 2);
  lever.addComponent(leverRotator);
  let leverCollider:CubeCollider = new CubeCollider(lever, new Vector3(48.5, 15.5, 2.5), new Vector3(6, 4, 2));
  let logLeverHit = () => {
    log("LEVER WAS HIT!");
    leverRotator.toggleRotation();
    bridgeRotator.toggleRotation();
    leverHit = true;
    displayTxt.value = "";
  }
  leverCollider.onCollision = logLeverHit;
  lever.addComponent(leverCollider);
  addCollider(leverCollider);
  lever.addComponentOrReplace(
    new OnClick(() => {
      if (leverHit)
      {
        leverRotator.toggleRotation();
        bridgeRotator.toggleRotation();
        // call our rabbit friend
        //loadAnimals();
      }
      else
      {
        displayTxt.value = som.scene.lever.text;
      }
    })
  )

  loadCastleColliders();

  // --- GALLERY PUZZLE ---
  const painting01 = loader.spawnSceneObject(som.scene.painting01);
  const painting02 = loader.spawnSceneObject(som.scene.painting02);
  const painting03 = loader.spawnSceneObject(som.scene.painting03);
  const painting04 = loader.spawnSceneObject(som.scene.painting04);

  const puzzleDoor = loader.spawnSceneObject(som.scene.puzzleDoor);
  let doorRotator = new Rotatable3(puzzleDoor, new Vector3(0, -90, 0), 3, 2);
  puzzleDoor.addComponent(doorRotator);

  let gallery = new GalleryPuzzle();
  puzzleDoor.addComponentOrReplace(
    new OnClick(() => {
      // after it's solved you can open and close the door
      if (gallery.isSolved)
      {
        doorRotator.toggleRotation();
      }
    }
  ));
  
  gallery.onSolved = () => {
    doorRotator.toggleRotation();
  }
  const puzzleWheel1 = loader.spawnSceneObject(som.scene.puzzleWheel1);
  let numWheel1 = new NumberWheel(puzzleWheel1, 1, 2);
  numWheel1.onValueChanged = gallery.onWheelValueChanged;
  puzzleWheel1.addComponent(numWheel1);
  gallery.wheel1 = numWheel1;

  const puzzleWheel2 = loader.spawnSceneObject(som.scene.puzzleWheel2);
  let numWheel2 = new NumberWheel(puzzleWheel2, 1, 2);
  numWheel2.onValueChanged = gallery.onWheelValueChanged;
  puzzleWheel2.addComponent(numWheel2);
  gallery.wheel2 = numWheel2;

  const puzzleWheel3 = loader.spawnSceneObject(som.scene.puzzleWheel3);
  let numWheel3 = new NumberWheel(puzzleWheel3, 1, 2);
  numWheel3.onValueChanged = gallery.onWheelValueChanged;
  puzzleWheel3.addComponent(numWheel3);
  gallery.wheel3 = numWheel3;

  const puzzleWheel4 = loader.spawnSceneObject(som.scene.puzzleWheel4);
  let numWheel4 = new NumberWheel(puzzleWheel4, 1, 2);
  numWheel4.onValueChanged = gallery.onWheelValueChanged;
  puzzleWheel4.addComponent(numWheel4);
  gallery.wheel4 = numWheel4;

  // --- ALTAR AND ALTAR BUTTON

  let altarButtonPos:Vector3 = new Vector3(15.12, 18, 7.32);

  const coin = loader.spawnSceneObject(som.scene.coin);
  let placeCoinInSlot = () => {
    coin.getComponent(Transform).position = altarButtonPos;
    isAltarComplete = true;
    displayTxt.value = victoryText;
  }

  let coinHolder:Portable = coin.getComponent(Portable);
  coinHolder.onDropped = () => {
    let distance = Vector3.Distance(coin.getComponent(Transform).position, altarButtonPos);
    log("Dropped coin: Distance=" + distance);
    if (distance < 5)
    {
      // maze doors open
      placeCoinInSlot();
    }
  };

  //const coin2 = loader.spawnSceneObject(som.scene.coin2);

  // --- FLAGS ---
  const flag1 = loader.spawnSceneObject(som.scene.flag1);
  const flag2 = loader.spawnSceneObject(som.scene.flag2);

  loadAnimals();
}

function loadCastleColliders()
{
  const cube2 = new Entity();
  let cubeTrans2 = new Transform({ position: new Vector3(50, 20, 23.5), scale: new Vector3(6, 10, 40) });
  cube2.addComponent(cubeTrans2);
  //cube2.addComponent(new BoxShape());
  engine.addEntity(cube2);
  let cc2:CubeCollider = new CubeCollider(cube2, cubeTrans2.position, cubeTrans2.scale);
  //testBox(cc2.aabb, cubeTrans2.position.add(Vector3.One()), 99);
  cc2.onCollision = logCollision;
  cube2.addComponent(cc2);
  //log("colliders=" + RigidBody.colliders);
  addCollider(cc2);

  const cube3 = new Entity();
  let cubeTrans3 = new Transform({ position: new Vector3(50, 20, -18.5), scale: new Vector3(6, 10, 40) });
  cube3.addComponent(cubeTrans3);
  //cube3.addComponent(new BoxShape());
  engine.addEntity(cube3);
  let cc3:CubeCollider = new CubeCollider(cube3, cubeTrans3.position, cubeTrans3.scale);
  //testBox(cc3.aabb, cubeTrans3.position.add(Vector3.One()), 99);
  cc3.onCollision = logCollision;
  cube3.addComponent(cc3);
  //log("colliders=" + RigidBody.colliders);
  addCollider(cc3);
}

function loadAnimals()
{
  // -------- ANIMALS --------

  // BUNNIES
  // var idleClipNames:string[] = ["idle_1", "idle_2", "eat"];
  // var bunny1:Animal = new Animal("bunny1", "Low_Rabbit_v01.gltf", "Arm_rabbit|", idleClipNames, new Vector3(58, 14.2, 3), new Vector3(1.8, 1.8, 1.8));
  // bunny1.ent.addComponent(bunny1);

  // var bunnyWays:Vector3[] = new Array();
  // bunnyWays.push(new Vector3(58, 14.1, 8));
  // bunnyWays.push(new Vector3(58, 14.1, 1));
  // bunnyWays.push(new Vector3(55, 14.1, 0));
  // bunnyWays.push(new Vector3(55, 14.1, 9));
  // bunnyWays.push(new Vector3(53, 14.1, 8));
  // bunnyWays.push(new Vector3(53, 14.1, 1));

  // bunny1.waypoints = bunnyWays;
  // bunny1.movesRandomly = true;
  // bunny1.walkSpeed -= 0.1; // bunnies walk slow
  // bunny1.idle();

  // simple bunny test
  let idle1:boolean = true;
  const testbunny = loader.spawnSceneObject(som.scene.testbunny);
  const anim = new Animator();
  let idleAnim:AnimationState = new AnimationState("Arm_rabbit|idle_1", {looping: true});
  anim.addClip(idleAnim);
  let idleAnim2:AnimationState = new AnimationState("Arm_rabbit|idle_2", {looping: true});
  idleAnim2.weight = 0;
  anim.addClip(idleAnim2);
  // let runAnim:AnimationState = new AnimationState("Arm_rabbit|run", {looping: true});
  // runAnim.weight = 0;
  // anim.addClip(runAnim);
  testbunny.addComponent(anim);
  idleAnim.play();
  testbunny.addComponentOrReplace(
    new OnClick(() => {
      if (idle1)
      {
        idleAnim.stop();
        idleAnim.weight = 0;
        idleAnim2.stop();
        idleAnim2.weight = 1;
        idleAnim2.play();
        idle1 = false;
      }
      else
      {
        idleAnim2.stop();
        idleAnim2.weight = 0;
        idleAnim.stop();
        idleAnim.weight = 1;
        idleAnim.play();
        idle1 = true;
      }
    })
  )
}

// --- UTILITY FUNCTIONS ---

function populate(target, ...args) 
{
  if (!target) {
    throw TypeError('Cannot convert undefined or null to object');
  }
  for (const source of args) 
  {
    if (source) 
    {
      Object.keys(source).forEach(key => target[key] = source[key]);
    }
  }
  return target;
}

function getLookVector()
{
  let forwardPoint:Vector3 = Camera.instance.position.clone().add(Vector3.Forward().rotate(Camera.instance.rotation));

  log("cam pos=" + Camera.instance.position);
  log("cam rot=" + Camera.instance.rotation + "; euler=" + Camera.instance.rotation.eulerAngles);
  log("  forward=" + forwardPoint);
}

function addDebugClick(e:Entity)
{
  e.addComponentOrReplace(
    new OnClick(() => {
      getLookVector();
    })
  )
}

function testBox(box:AABB, point:Vector3, testNum:number = 0)
{
  log("test " + testNum)
  box.logData();
  log(point);
  log("inside=" + aabb.isPointInside(point));
  log("surface=")
  log(aabb.getSurfacePoint(point));
  log("normal=")
  log(aabb.getClosestNormal(point));
}

function logCollision()
{
  log("collided!");
}

function logHit()
{
  log("HIT LEVER!");
}