import { AABB } from "./aabb";

export class Ray
{
    public origin:Vector3;
    public direction:Vector3;
    public normDirection:Vector3;

    constructor(_origin:Vector3, _direction:Vector3)
    {
        this.origin = _origin;
        this.direction = _direction;
        this.normalize();
    }

    normalize()
    {
        if (this.direction != undefined)
        {
            this.normDirection = Vector3.Normalize(this.direction);
        }
        else
        {
            this.normDirection = Vector3.Up();
        }
    }

    getDistance()
    {
        return Vector3.Distance(this.origin, this.direction);
    }

    getPoint(dist:number)
    {
        // this works best with a normalized direction
        if (this.normDirection == undefined)
        {
            this.normalize();
        }
        return this.normDirection.multiplyByFloats(dist, dist, dist).add(this.origin);
    }

    intersectsPlane(plane:Plane) 
    {
		// check if the ray lies on the plane first
		var distToPoint = plane.signedDistanceTo( this.origin );
        if (distToPoint === 0) 
        {
			return true;
		}

		var denominator = Vector3.Dot(plane.normal, this.direction );
        if (denominator * distToPoint < 0) 
        {
			return true;
		}
		// ray origin is behind the plane (and is pointing behind it)
		return false;
    }
    
    // Check if the ray intersects an AABB box, and if so return ti distance along the ray where it first hits
    intersectsBox(box:AABB) 
    {  
        let t1:number = (box.min.x - this.origin.x) / Math.max(this.normDirection.x, 0.0001);
        let t2:number = (box.max.x - this.origin.x) / Math.max(this.normDirection.x, 0.0001);
        let t3:number = (box.min.y - this.origin.y) / Math.max(this.normDirection.y, 0.0001);
        let t4:number = (box.max.y - this.origin.y) / Math.max(this.normDirection.y, 0.0001);
        let t5:number = (box.min.z - this.origin.z) / Math.max(this.normDirection.z, 0.0001);
        let t6:number = (box.max.z - this.origin.z) / Math.max(this.normDirection.z, 0.0001);

        let tmin:number = Math.max(
            Math.min(t1, t2), 
            Math.min(t3, t4),
            Math.min(t5, t6)
        );

        let tmax:number = Math.min(
            Math.max(t1, t2), 
            Math.max(t3, t4),
            Math.max(t5, t6)
        );

        if (tmax < 0) 
        {
            // ray would intersect, but it is pointing away from the box
            return -1;
        }
        if (tmin > tmax) {
            // no intersection at all
            return -1;
        }

        // if tmin < 0, the origin is inside the box, so tmax is the right intersection point (indside collision pointing out)
        // otherwise, it's tmin
		return ( tmin >= 0 ? tmin : tmax );
	}
}