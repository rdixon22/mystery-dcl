import { AABB } from "./aabb";

@Component("CubeCollider")
export class CubeCollider 
{
    public aabb:AABB;
    public enabled:boolean = true;
    public collisionHandler:Function; 

    constructor(_entity:Entity, _center:Vector3, _fullSize:Vector3)
    {
        this.aabb = new AABB(_center, _fullSize);
    }

    checkCollisionNormal(newPos:Vector3, previousPos):Vector3 
    {
        //log("checkCollisionNormal");
        // TODO: Handle cases where the point has passed all the way through and out the other side
        if (this.enabled && this.aabb.isPointInside(newPos))
        {
            if (this.onCollision != undefined) this.onCollision();
            return this.aabb.getClosestNormal(previousPos);
        }
        return undefined;
    }

    getClosestPoint(point:Vector3):Vector3
    {
        return this.aabb.getSurfacePoint(point);
    }
    
    onCollision()
    {
        if (this.collisionHandler != undefined)
        {
            this.collisionHandler(this);
        }
    }
}