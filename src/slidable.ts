@Component("Slidable")
export class Slidable {

  public entity:Entity;
  public isAnimating:boolean = false;
  public isAtTarget:boolean = false;

  public trans:Transform; // de-reference the transform for speed

  public originalPos:Vector3;
  public moveVector:Vector3;
  public targetPos:Vector3;
  public startPos:Vector3;
  public endPos:Vector3;
  public duration:float = 2;
  public fraction:float;
  public elapsed:float = 0;

  public speed:number = 1;

  constructor(_entity:Entity, 
    _moveVector:Vector3, 
    _dur:number = 2, 
    _speed:number = 1)
  {
      this.entity = _entity;
      this.trans = _entity.getComponent(Transform);
      this.originalPos = this.trans.position;
      this.moveVector = _moveVector;
      this.targetPos = this.originalPos.add(_moveVector);

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
          log("clicked on Slidable object, isAtTarget=" + this.isAtTarget + "; pos=" + this.trans.position);
          this.togglePos();
        })
    )
  }

  togglePos()
  {
      log("togglePos(), isAtTarget=" + this.isAtTarget + ", isAnimating=" + this.isAnimating);
      if (this.isAnimating) return;

      let nextPos:Vector3;
      if (this.isAtTarget)
      {
        nextPos = this.originalPos;
      }
      else
      {
        nextPos = this.targetPos;
      }
      this.moveTo(nextPos);
  }

  moveTo(nextPos:Vector3)
  {
      this.startPos = this.trans.position;
      this.endPos = nextPos;
      log("start=" + this.startPos + ", end=" + this.endPos);
      this.elapsed = 0;
      this.fraction = 0;
      this.isAnimating = true;
  }

  nextFrame(dt: number)
  {
    if (this.isAnimating)
    {
        // rotate toward the target
        this.move(dt);
    }
  }

  move(dt: number)
  {
    // changing to use a constant movement speed
    this.elapsed += (dt * this.speed);

    var newPos:Vector3;
    if (this.elapsed > this.duration) 
    {
        newPos = this.endPos;
        this.isAtTarget = this.isAtTarget ? false : true;
        this.isAnimating = false;
    }
    else
    {
        this.fraction = this.elapsed / this.duration;

        newPos = Vector3.Lerp(
            this.startPos,
            this.endPos,
            this.fraction
        )
    }
    this.trans.position = newPos;
  }
}