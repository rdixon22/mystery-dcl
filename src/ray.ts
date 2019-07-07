import { AABB } from "./aabb";

export class Ray
{
    public origin:Vector3;
    public direction:Vector3;
    public endPoint:Vector3;
    public distance:number;
    public normDirection:Vector3;

    constructor(_origin:Vector3, _endPoint:Vector3)
    {
        this.origin = _origin;
        this.endPoint = _endPoint;
        this.direction = _endPoint.subtract(_origin);
        this.distance = Vector3.Distance(this.origin, this.endPoint);
        this.normalize();
    }

    normalize()
    {
        if (this.direction != undefined)
        {
            //let rawDirection = this.direction.subtract(this.origin);
            this.normDirection = Vector3.Normalize(this.direction);
            //log("orig=" + this.origin + ", dir=" + this.direction + ", raw=" + rawDirection + ", norm=" + this.normDirection);
        }
        else
        {
            this.normDirection = Vector3.Up();
        }
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

    getEndpoint()
    {
        return this.origin.add(this.direction);
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

    intersectsBox(box:AABB):number
    {
        let t:number = this.intersectsBoxNormalized(box);
        //log("intersectsBox(), t=" + t + ", dist=" + this.distance);
        if (t <= this.distance)
        {
            return t;
        }
        else
        {
            return -1;
        }
    }
    
    // Check if the ray intersects an AABB box, and if so return the distance along the ray where it first hits
    intersectsBoxNormalized(box:AABB):number
    {  
        let normX = this.normDirection.x == 0 ? 0.0001 : this.normDirection.x;
        let normY = this.normDirection.y == 0 ? 0.0001 : this.normDirection.y;
        let normZ = this.normDirection.z == 0 ? 0.0001 : this.normDirection.z;

        let t1:number = (box.min.x - this.origin.x) / normX; // Math.max(this.normDirection.x, 0.0001)
        let t2:number = (box.max.x - this.origin.x) / normX;
        let t3:number = (box.min.y - this.origin.y) / normY;
        let t4:number = (box.max.y - this.origin.y) / normY;
        let t5:number = (box.min.z - this.origin.z) / normZ;
        let t6:number = (box.max.z - this.origin.z) / normZ;

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

        //log("intersectsBox(), tmin=" + tmin + ", tmax=" + tmax);

        if (tmax < 0) 
        {
            // ray would intersect, but it is pointing away from the box
            return -1;
        }
        if (tmin > tmax) {
            // no intersection at all
            return -1;
        }

        // if tmin < 0, the origin is inside the box, so tmax is the right intersection point (inside collision pointing out)
        // otherwise, it's tmin
		return ( tmin < 0 ? tmax : tmin );
	}
}