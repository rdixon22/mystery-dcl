@Component("Rotatable3")
export class Rotatable3 {

  public entity:Entity;
  public isAnimating:boolean = false;
  public isAtTarget:boolean = false;
  public restrictX:boolean = false;
  public restrictY:boolean = false;
  public restrictZ:boolean = false;

  public trans:Transform; // de-reference the transform for speed

  public originalRotation:Quaternion;
  public targetRotation:Quaternion;
  public startRotation:Quaternion;
  public endRotation:Quaternion;
  public duration:float = 2;
  public fraction:float;
  public elapsed:float = 0;

  public speed:number = 1;

  constructor(_entity:Entity, 
    _eulerChange:Vector3, 
    _dur:number = 2, 
    _speed:number = 1)
  {
      this.entity = _entity;
      this.trans = _entity.getComponent(Transform);
      this.originalRotation = this.trans.rotation;
      this.targetRotation = this.originalRotation.multiply(Quaternion.Euler(_eulerChange.x, _eulerChange.y, _eulerChange.z));
      // this.restrictX = _restrictX;
      // this.restrictY = _restrictY;
      // this.restrictZ = _restrictZ;

      if (_dur > 0) 
      {
          this.duration = _dur;
      }
      else
      {
          this.duration = 2; 
      }
      if (_speed > 0) 
      {
          this.speed = _speed;
      }
      else
      {
          this.speed = 1; 
      }

      this.entity.addComponentOrReplace(
        new OnClick(() => {
          log("clicked on Rotatable object, isAtTarget=" + this.isAtTarget + "; rot=" + this.trans.rotation + " (" + this.trans.rotation.eulerAngles + ")");
          // TODO: don't rotate by default (because we have to override the OnClick method to defeat this)
          this.toggleRotation();
        })
    )
  }

  toggleRotation()
  {
      log("toggleRotation(), isAtTarget=" + this.isAtTarget + ", isAnimating=" + this.isAnimating);
      if (this.isAnimating) return;

      let nextRot:Quaternion;
      if (this.isAtTarget)
      {
        nextRot = this.originalRotation;
      }
      else
      {
        nextRot = this.targetRotation;
      }
      this.rotateTo(nextRot);
  }

  rotateTo(nextRot:Quaternion)
  {
      this.startRotation = this.trans.rotation;
      this.endRotation = nextRot;
      //log("start=" + this.startRotation + ", end=" + this.endRotation);
      this.elapsed = 0;
      this.fraction = 0;
      this.isAnimating = true;
  }

  nextFrame(dt: number)
  {
    if (this.isAnimating)
    {
        // rotate toward the target
        this.rotate(dt);
    }
  }

  rotate(dt: number)
  {
    // changing to use a constant movement speed
    this.elapsed += (dt * this.speed);

    var newRot:Quaternion;
    if (this.elapsed > this.duration) 
    {
        newRot = this.endRotation;
        this.isAtTarget = this.isAtTarget ? false : true;
        this.isAnimating = false;
    }
    else
    {
        this.fraction = this.elapsed / this.duration;

        newRot = Quaternion.Slerp(
            this.startRotation,
            this.endRotation,
            this.fraction
        )
    }
    this.trans.rotation = newRot;
  }
}