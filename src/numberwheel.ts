@Component("NumberWheel")
export class NumberWheel
{
  public entity:Entity;
  public value:number = 5;
  public numStops:number = 9;
  public anglesPerStop:Vector3 = new Vector3(-40, 0, 0);

  public isAnimating:boolean = false;
  public isAtTarget:boolean = false;

  public trans:Transform; // de-reference the transform for speed

  public originalRotation:Quaternion;
  public startRotation:Quaternion;
  public endRotation:Quaternion;
  public duration:float = 2;
  public fraction:float;
  public elapsed:float = 0;

  public speed:number = 1;
  public onValueChanged:Function;

  constructor(_entity:Entity, 
    _dur:number = 1, 
    _speed:number = 1) //     _eulerChange:Vector3, 
  {
      this.entity = _entity;
      this.trans = _entity.getComponent(Transform);
      this.originalRotation = this.trans.rotation;
 
      if (_dur > 0) 
      {
          this.duration = _dur;
      }
      else
      {
          this.duration = 1; 
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
          log("clicked on NumberWheel, value=" + this.value);
          this.rollForward();
        })
    )
  }

  rollForward()
  {
      //log("rollForward(), isAnimating=" + this.isAnimating);
      if (this.isAnimating) return;

      this.value++;
      if (this.value > this.numStops)
      {
          this.value = 1;
      }

      let nextRot:Quaternion = this.trans.rotation.multiply(Quaternion.Euler(this.anglesPerStop.x, this.anglesPerStop.y, this.anglesPerStop.z));
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
        //this.isAtTarget = this.isAtTarget ? false : true;
        this.isAnimating = false;
        if (this.onValueChanged != undefined)
        {
            this.onValueChanged();
        }
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