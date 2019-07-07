import {RigidBody} from "./rigidbody";

@Component("Portable")
export class Portable {

  // TODO: Check whether the object is "in reach" before picking it up
  // TODO: If you pick up an object, the one you're holding should be dropped

  public static heldObject:Portable;

  public ent:Entity;
  public trans:Transform; // de-reference the transform for speed
  public isHeld:boolean = false;
  public isThrowable:boolean = false;
  public throwVel:float;
  
  private distance:float = 1;
  
  public logCount:number = 0;
  public onDropped:Function;

  constructor(_entity:Entity, _throwable:boolean = false, _throwVel:float = 2.0) {
    this.ent = _entity;
    this.trans = _entity.getComponent(Transform);

    this.isThrowable = _throwable;
    this.throwVel = _throwVel;

    this.ent.addComponentOrReplace(
        new OnClick(() => {
          let body:RigidBody = this.ent.getComponentOrNull(RigidBody);
          let rigidBodyState:string = "none";
          if (body != null) 
          {
            // no physics while we're carrying it
            rigidBodyState = body.isStatic ? "static" : "physics";
          }
          log("clicked on Portable, held=" + this.isHeld + ", throwable=" + this.isThrowable + "; pos=" + this.trans.position + ", bodyState=" + rigidBodyState);
          this.pickUpOrPutDown();
        })
    )
  }

  pickUpOrPutDown()
  {
    if (this.isHeld)
    {
      if (this.isThrowable)
      {
          this.throw();
      }
      else
      {
          this.drop();
      }
    }
    else
    {
      // drop anything we are currently holding (no inventory system yet)
      if (Portable.heldObject != null)
      {
        Portable.heldObject.drop();
      }
      this.carry();
    }
  }

  carry()
  {
    this.putInFront(0);
    Portable.heldObject = this;
    this.isHeld = true;
    let body:RigidBody = this.ent.getComponentOrNull(RigidBody);
    if (body != null) 
    {
      // no physics while we're carrying it
      body.isStatic = true;
    }
  }

  drop()
  {
    this.isHeld = false;
    // Where to put it? Avatar camera is a certain height from the floor, but y coord is always zero.
    // need to drop right at our "feet" so can't drop off ledges or inside of collider objects
    let dropPos:Vector3 = Camera.instance.position.clone();
    dropPos.y -= 1.35;
    
    Portable.heldObject = null;
    this.trans.position = dropPos;
    log("dropping cam.pos=" + Camera.instance.position + ", this.pos=" + this.trans.position);
    if (this.onDropped != undefined)
    {
      this.onDropped();
    }
  }

  getForwardVector():Vector3
  {
    return Vector3.Forward().rotate(Camera.instance.rotation);
  }

  throw()
  {
      this.isHeld = false;
      //this.isThrowable = false;
      let body:RigidBody = this.ent.getComponentOrNull(RigidBody);
      if (body == null) 
      {
          this.drop();
          return;
      }
      // let physics take over
      body.isStatic = false;
      Portable.heldObject = null;
      // send it off
      //body.velocity = this.getForwardVector();
      let vel:Vector3 = this.getForwardVector().multiplyByFloats(this.throwVel, this.throwVel, this.throwVel);
      vel.y = -vel.y;
      log("static=" + body.isStatic + ", throwVel=" + vel);
      body.velocity = vel;
  }

  nextFrame(dt:number)
  {
    if (!this.isHeld) return;
    this.putInFront(dt);
  }

  putInFront(dt: number)
  {
    let newPos:Vector3 = Camera.instance.position.clone().add(this.getForwardVector());
    // adjust for y inaccuracies in camera pos
    newPos.y = Camera.instance.position.y - 0.1;

    // let's try smoothing this out...
    let lerpSpeed:number = 10;
    this.trans.position = Vector3.Lerp(
      this.trans.position,
      newPos,
      dt * lerpSpeed
    )

    if (this.logCount++ < 50)
    {
      //log("cam.rot=" + Camera.instance.rotation + ", sin(rad)=" + Math.sin(radians) + ", cos(rad)=" + Math.cos(radians))
      //log("cam.pos=" + Camera.instance.position + ", this.pos=" + this.trans.position);
    }
    
  }
}