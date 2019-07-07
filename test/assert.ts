export class AssertError extends Error 
{
    constructor(message?: string) 
    {
        super(message);
        // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = "AssertError"; // stack traces display correctly now 
    }
}

export class Assert
{
    static equal(a:any, b:any):boolean
    {
      if (typeof a != typeof b) 
      {
        throw new AssertError("Types do not match: " + (typeof a).toString() + ", " + (typeof b).toString());
      }

      let result:number;

      if (typeof a === "number") 
      {
        //log("compareNumbers(" + a + "," + b + ") = " + Assert.compareNumbers(a, b));
        result = Assert.compareNumbers(a, b);
        if (result == 0)
        {
          return true;
        }
        throw new AssertError("Values are not equal. " + a.toString() + " != " + b.toString());
      }

      if (typeof a === "string") 
      {
        result = Assert.compareStrings(a, b);
        if (result != 0)
        {
          throw new AssertError("Values are not equal. Type: string");
        }
        return true;
      }

      if (a instanceof Vector3) 
      {
        if (!(b instanceof Vector3))
        {
          throw new AssertError("Types do not match: Vector3, " + (typeof b).toString());
        }

        result = Assert.compareVector3(a, b);
        if (result != 0)
        {
          throw new AssertError("Vector3s are not equal. " + a + " vs " + b);
        }
        return true;
      }

      // check simple equality for other types
      if (a != b)
      {
        throw new AssertError("Values are not equal. Type: " + (typeof a).toString());
      }
      return true;
    }

    static lessThan(a:any, b:any):boolean
    {
      let result:number = Assert.compareNumbers(a, b);
      if (result >= 0)
      {
        throw new AssertError("Value is not less. " + a.toString() + " >= " + b.toString());
      }
      return true;
    }

    static greaterThan(a:any, b:any):boolean
    {
      let result:number = Assert.compareNumbers(a, b);
      if (result <= 0)
      {
        throw new AssertError("Value is not greater. " + a.toString() + " <= " + b.toString());
      }
      return true;
    }

    static deepStrictEqual(a:any, b:any):boolean
    { 
      //future
      //return (Assert.compare(a, b) == 0);
      return false;
    }

    static ok(a:boolean):boolean
    {
      if (a == false)
      {
        throw new AssertError("Value is false");
      }
      return true;
    }

    static notNull(a:any):boolean
    {
      if (a == null || a == undefined)
      {
        throw new AssertError("Value is null: " + a);
      }
      return true;
    }

    static closeTo(a:any, b:any, tolerance:number = 0.0001):boolean
    {
      if (a instanceof Vector3) 
      {
        if (!(b instanceof Vector3))
        {
          throw new AssertError("Types do not match: Vector3, " + (typeof b).toString());
        }

        let result = Vector3.DistanceSquared(a, b);
        if (result > tolerance)
        {
          throw new AssertError("Vector3s are not close. Distance=" + result + " from " + a + " to " + b);
        }
        return true;
      }
    }

    // --- INTERNAL FUNCTIONS ---

    /**
     * General number comparison
     * @param a First value
     * @param b Second value
     * @returns 0 for strict equality; 1 if a > b; -1 if a < b
     */
    static compareNumbers(a:number, b:number):number
    {
        if (a == b) 
        {
          return 0;
        }
        if (a < b) 
        {
          return -1;
        }
        if (a > b) 
        {
          return 1;
        }
        return 0;
      }

    /**
     * General string comparison
     * @param a First value
     * @param b Second value
     * @returns 0 for strict equality; 1 if a > b; -1 if a < b
     */
    static compareStrings(a:string, b:string):number
    {
        if (a == b) 
        {
          return 0;
        }
        return -1;
    }

    /**
     * General Vector3 comparison
     * @param a First value
     * @param b Second value
     * @returns 0 for equality; 1 if a > b; -1 if a < b
     */
    static compareVector3(a:Vector3, b:Vector3, tolerance:number = 0.0001):number
    {
        if (Vector3.DistanceSquared(a, b) < tolerance) 
        {
          return 0;
        }
        return -1;
    }
}