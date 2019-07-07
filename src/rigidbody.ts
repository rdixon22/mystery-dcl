/* A simple physics-managed entity.
   A RigidBody component can represent any one of the subclasses:
   - RigidBody (collisions based on center point only)
   - RigidSphere (includes radius)
   - RigidCube
   - RigidSphereModel (GLTF model with spherical collider)
   - RigidCubeModel (GLTF model with cube-shaped collider)
   BUT for now, this class only manages RigidPoint objects.
   AND it handles its own collisions (which it probably shouldn't).
   It's a hack, but then, it's for a hackathon...
*/
import { CubeCollider } from './cubecollider';
import { AABB } from './aabb';
import { Ray } from './ray';

@Component("RigidBody")
export class RigidBody {

  public static colliders:CubeCollider[] = [];

  public gravity:Vector3 = new Vector3(0, -50, 0);
  public friction:float = 0.98;
  public bounceCount:number = 0;
  public bounceLimit:number = 12;
  
  public ent:Entity;
  public trans:Transform; // de-reference the transform for speed
  public isStatic:boolean = false;

  public forces:Vector3 = new Vector3(0,0,0);
  public velocity:Vector3 = new Vector3(12,0,12);
  public mass = 1.0;
  public bounciness = 0.7;

  public newPosition:Vector3 = new Vector3(0,0,0);
  public groundY = 0.15;

  // TODO: remove or inactivate colliders too
  static addCollider(cc:CubeCollider)
  {
    RigidBody.colliders.push(cc);
  }

  constructor(_entity:Entity, _startVelocity:Vector3, _mass:float = 1.0, _bounce:float = 0.7, _startStatic = false) 
  {
    this.ent = _entity;
    this.trans = _entity.getComponent(Transform);
    this.velocity = _startVelocity;
    this.mass = _mass;
    this.bounciness = _bounce;
    this.isStatic = _startStatic;

    this.ent.addComponentOrReplace(
        new OnClick(() => {
          log("clicked on RigidBody object, isStatic=" + this.isStatic + "; mass=" + this.mass + "; bounce=" + this.bounciness);
          this.kick();
        })
    )
  }

  update(dt:number)
  {
    // don't move if it's unmovable (or being moved around some other way)
    if (this.isStatic) return;

    this.sumForces(dt);

    this.move(dt);

    this.solveConstraints(dt);

    //log("velocity=" + this.velocity);
    //log("newPosition=" + this.newPosition);
    if (this.bounceCount >= this.bounceLimit || (Math.abs(this.velocity.x) < 0.01 && Math.abs(this.velocity.y) < 0.01 && Math.abs(this.velocity.z) <= 0.01))
    {
      this.trans.position.y = this.groundY;
      this.velocity = Vector3.Zero();
      this.isStatic = true;
      // reset stuff
      this.bounceCount = 0;
    }
  }

  // Combine all the forces acting on this object
  sumForces(dt)
  {
    this.forces = this.gravity;
  }

  // Apply the forces to change object position
  move(dt)
  {
    let m = (1.0 / this.mass) * dt;
    
    let acceleration = this.forces.multiplyByFloats(m, m, m);
    
    this.velocity = this.velocity.multiplyByFloats(this.friction, this.friction, this.friction);
    this.velocity.addInPlace(acceleration); // .multiplyByFloats(dt, dt, dt)

    //let verlet = (this.velocity.add(oldVelocity).multiplyByFloats(dt/2, dt/2, dt/2));
    let verlet = this.velocity.multiplyByFloats(dt, dt, dt);
    this.newPosition = this.trans.position.add(verlet);
    //log("move(), newPos=" + this.newPosition);
  }

  // Checks for collisions and other constraints
  solveConstraints(dt)
  {
    let collided:boolean = false;
    if (RigidBody.colliders.length > 0)
    {
      // else check against any colliders in the list
      let i:number;
      let bounceNormal:Vector3;
      let cc:CubeCollider;
      let r1:Ray = new Ray(this.trans.position, this.newPosition);
      let t:number;
      for (i = 0; i < RigidBody.colliders.length; i++)
      {
        cc = RigidBody.colliders[i];
        t = cc.checkRayCollision(r1);
        if (t >= 0)
        {
          this.bounceOffCube(dt, t, r1, cc.aabb);
          // only handle one bounce per frame
          collided = true;
          cc.onCollision(); // in case the collider has something special to do
          break;
        }
      }
    }
    if (!collided && this.newPosition.y <= this.groundY)
    {
      // bounce against the ground plane first, and set bounce velocity for next frame
      this.bounceOffGround(dt);
    }

    this.trans.position = this.newPosition;
  }

  // Calculate the bounce velocity vector
  bounceOffGround(dt)
  {
    let fullDist:float = Math.abs(this.trans.position.y - this.newPosition.y);
    let groundDist:float = Math.abs(this.trans.position.y - this.groundY);
    let groundPct:float = groundDist / fullDist;
    let bouncePct:float = 1 - groundPct;

    // put it on the ground
    this.newPosition.y = this.groundY;

    let groundNormal:Vector3 = Vector3.Up();
    let projection:float = -2 * Vector3.Dot(this.velocity, groundNormal);
        // the bounce slows it down
    let newVel:Vector3 = groundNormal.multiplyByFloats(projection, projection, projection);
    newVel = newVel.add(this.velocity);
    //let drag:float = this.bounciness * (1 - (this.bounceCount / this.bounceLimit));
    //newVel = newVel.multiplyByFloats(drag, drag, drag);
    newVel = newVel.multiplyByFloats(this.bounciness, this.bounciness, this.bounciness);

    if (fullDist > 0.0001)
    {
      // start the bounce
      let bounceTime = bouncePct * dt * this.friction;
      let bounceVel = newVel.multiplyByFloats(bounceTime, bounceTime, bounceTime);
      //log("oldVel=" + this.velocity + "; bounceVel=" + newVel + "; proj=" + projection + "; bt=" + bouncePct);
  
      this.newPosition = this.newPosition.add(bounceVel);
      this.bounceCount++;
    }

    // velocity for next frame
    this.velocity = newVel;
  }

  // Calculate the bounce velocity vector
  // NOTE: This needs a lot more testing. It's acting weird in quite a few cases.
  bounceOffCube(dt, t:number, ray:Ray, aabb:AABB)
  {
      // Create a ray from the last point before we entered the box, to the next point inside or beyond the box
      //let ray:Ray = new Ray(this.trans.position, this.newPosition);
      //let t:number = ray.intersectsBox(aabb);
      log("pos=" + this.trans.position + "\nnew=" + this.newPosition + "\ndist=" + ray.distance + "\nt=" + t);
      if (t == -1) return; // ray does not intersect -- something is wrong

      // Get the point where it first hits the box
      let hitPoint:Vector3 = ray.getPoint(t);
      // Figure out the face normal at that point
      let faceNormal:Vector3 = aabb.getFaceNormal(hitPoint);
      log("hit=" + hitPoint + "\nnorm=" + faceNormal);

      // let fullDist:float = ray.getDistance();
      // let travelDist:float = Vector3.Distance(this.trans.position, hitPoint);
      // let travelPct:float = travelDist / fullDist;
      // let bouncePct:float = 1 - travelPct;
  
      let projection:float = -2 * Vector3.Dot(this.velocity, faceNormal);
      
      let newVel:Vector3 = faceNormal.multiplyByFloats(projection, projection, projection);
      newVel = newVel.add(this.velocity);
      // the bounce slows it down
      newVel = newVel.multiplyByFloats(this.bounciness, this.bounciness, this.bounciness);
      
      
      // put it at a spot near where it first hit the cube
      // TODO: make this more efficient. Can't have it exactly on a face or else it detects a collision in the next frame too
      this.newPosition = hitPoint.add(newVel.multiplyByFloats(0.04, 0.04, 0.04));
      //log("new=" + this.newPosition);
      
      this.bounceCount++;
      log("vel=" + this.velocity + "\nnewVel=" + newVel + "\nbounces=" + this.bounceCount);
      // velocity for next frame
      this.velocity = newVel;
  }

  kick()
  {
    //this.trans.position.y = this.groundY + 0.1;
    this.velocity.y = -50;
    this.velocity.x = -2;
    this.velocity.z = 2;
    this.isStatic = false;
    this.bounceCount = 0;
  }

}