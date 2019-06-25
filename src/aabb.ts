/**
 * A simple Axis Aligned Bounding Box (AABB) class
 */
export class AABB 
{
    public halfSize:Vector3;
    public center:Vector3;
    public min:Vector3;
    public max:Vector3;

    constructor(_center:Vector3, _fullSize:Vector3)
    {
        this.center = _center;
        this.halfSize = _fullSize.multiplyByFloats(0.5, 0.5, 0.5);

        let p1:Vector3 = this.center.add(this.halfSize);
        let p2:Vector3 = this.center.subtract(this.halfSize);

        this.min = new Vector3(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.min(p1.z, p2.z));
        this.max = new Vector3(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y), Math.max(p1.z, p2.z));
    }

    getClosestNormal(point:Vector3):Vector3 
    {
        // TODO: Handle cases where the point has passed all the way through and out the other side
        return this.getFaceNormal(this.getSurfacePoint(point));
    }

    isPointInside(point:Vector3):boolean
    {
        if (point.x < this.min.x || point.x < this.min.y || point.z < this.min.z) {
            return false;
        }
        if (point.x > this.max.x || point.y > this.max.y || point.z > this.max.z) {
            return false;
        }
        return true;
    }
    
    /**
     * Returns the closest point on the box from a point outside it 
     */
    clampPoint(point:Vector3):Vector3
    {
        let result:Vector3 = point.clone();
        result.x = (result.x < this.min.x) ? this.min.x : result.x;
        result.x = (result.x > this.max.x) ? this.max.x : result.x;

        result.y = (result.y < this.min.y) ? this.min.y : result.y;
        result.y = (result.y > this.max.y) ? this.max.y : result.y;

        result.z = (result.z < this.min.z) ? this.min.z : result.z;
        result.z = (result.z > this.max.z) ? this.max.z : result.z;
        return result;
    }

    getSurfacePoint(point:Vector3):Vector3
    {
        
        let surfacePoint:Vector3;
        if (!this.isPointInside(point))
        {
            // if the point is outside, clamp to the closest 
            surfacePoint = this.clampPoint(point);
        }
        else
        {
            // if it's inside, project to the closest boundary plane
            let distances:number[] = [];
            distances.push(Math.abs(point.x - this.min.x));
            distances.push(Math.abs(point.y - this.min.y));
            distances.push(Math.abs(point.z - this.min.z));
            distances.push(Math.abs(point.x - this.max.x));
            distances.push(Math.abs(point.y - this.max.y));
            distances.push(Math.abs(point.z - this.max.z));
    
            let i:number;
            let minDist:number = Number.MAX_VALUE;
            let minIndex:number = 0;
            for (i = 0; i < distances.length; i++)
            {
                if (distances[i] < minDist)
                {
                    minDist = distances[i];
                    minIndex = i;
                }
            }
            surfacePoint = point.clone();
            switch (minIndex)
            {
                case 0: surfacePoint.x = this.min.x;
                break;
                case 1: surfacePoint.y = this.min.y;
                break;
                case 2: surfacePoint.z = this.min.z;
                break;
                case 3: surfacePoint.x = this.max.x;
                break;
                case 4: surfacePoint.y = this.max.y;
                break;
                case 5: surfacePoint.z = this.max.z;
                break;
            }
        }
        return surfacePoint;
    }

    getFaceNormal(point:Vector3):Vector3
    {
        if (point.y >= this.max.y)
        {
            return Vector3.Up();
        }
        else if(point.z >= this.max.z)
        {
            return Vector3.Forward();  //forward
        }
        else if(point.x >= this.max.x)
        {
            return Vector3.Right();  // right
        }
        else if(point.z <= this.min.z)
        {
            return Vector3.Backward();  // backward
        }
        else if(point.x <= this.min.x)
        {
            return Vector3.Left();  // left
        }
        else if(point.y <= this.min.y)
        {
            return Vector3.Down();
        }
    }

    logData()
    {
        log("center=");
        log(this.center);
        log("halfSize=");
        log(this.halfSize);
        log("min=");
        log(this.min);
        log("max=");
        log(this.max);
    }

}