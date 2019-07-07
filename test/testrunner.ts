/**
 * Add this file to the "includes" list in tsconfig.json when you want the tests to run. 
 */
import { TestSuite } from './testsuite';
import { describe, it, expect } from './testor';
import { Ray } from '../src/ray';
import { AABB } from '../src/aabb';

let a:number = 3;
let b:number = 3;

function numTest() 
{ 
  describe('A and B', () => {
    it('should be equal', () => {
      expect(a).toEqual(b);
    });

    it('should total 4 (fail!)', () => {
        expect(a + b).toEqual(4);
    });
  });
}

let v1:Vector3 = new Vector3(0.1, 0.1, 0);
let v2:Vector3 = new Vector3(0.1, 0.1, 0.01);
let v3:Vector3 = new Vector3(0, 0, 2);
let v4:Vector3 = new Vector3(0, -1.5, 0);

function vector3Test()
{
  describe('Vector3 Tests', () => {
    it('v1 and v2 should be very close', () => {
      expect(v1).isCloseTo(v2);
    });

    it('v1 and v3 too far (fail!)', () => {
      expect(v1).isCloseTo(v3);
    });

    it('v1 and v3 within 1.0 apart', () => {
      expect(v1).isCloseTo(v2, 1.0);
    });

    it('v1 normalizes to (0.707, 0.707, 0)', () => {
      expect(Vector3.Normalize(v1)).toEqual(new Vector3(0.7071, 0.7071, 0));
    });

    it('v3 normalizes to (0,0,1)', () => {
      expect(Vector3.Normalize(v3)).toEqual(new Vector3(0, 0, 1));
    });

    it('v4 normalizes to (0,-1,0)', () => {
      expect(Vector3.Normalize(v4)).toEqual(new Vector3(0, -1, 0));
    });

    it('distance from (1, 3, 1) to (1, 1.5, 1) = 1.5', () => {
      expect(Vector3.Distance(new Vector3(1,3,1), new Vector3(1,1.5,1))).toEqual(1.5);
    });
  });
}

// construct rays using origin and endPoint
let r1:Ray = new Ray(new Vector3(0,0,0), Vector3.Up());
let r2:Ray = new Ray(new Vector3(-3,-3,0), new Vector3(-2, -2, 0));

let box:AABB = new AABB(new Vector3(1, 1, 1), new Vector3(2, 2, 2));

let rAbove:Ray = new Ray(new Vector3(1, 3, 1), new Vector3(1, 1.5, 1));
let tAbove:number = rAbove.intersectsBox(box);
//log("tAbove=" + tAbove + ", hitPt=" + rAbove.getPoint(tAbove) + ", onePt=" + rAbove.getPoint(1));

let rBelow:Ray = new Ray(new Vector3(1, -1, 1), new Vector3(1, 0.5, 1));
let tBelow:number = rAbove.intersectsBox(box);
//log("tBelow=" + tBelow + ", hitPt=" + rBelow.getPoint(tBelow) + ", onePt=" + rBelow.getPoint(1));

let rFront:Ray = new Ray(new Vector3(1, 1, -1), new Vector3(1, 1, 0.5));
let tFront:number = rFront.intersectsBox(box);
//log("tFront=" + tFront + ", hitPt=" + rFront.getPoint(tFront) + ", onePt=" + rFront.getPoint(1));

let rFrontLow:Ray = new Ray(new Vector3(1, 0.001, -1), new Vector3(1, 0.001, 0.5));
let tFrontLow:number = rFrontLow.intersectsBox(box);
let nFrontLow:Vector3 = box.getFaceNormal(rFrontLow.getPoint(tFrontLow));
//log("tFrontLow=" + tFrontLow + ", hitPt=" + rFrontLow.getPoint(tFrontLow) + ", normal=" + nFrontLow);

let rThru:Ray = new Ray(new Vector3(1, 1, -1), new Vector3(1, 1, 3));
let tThru:number = rThru.intersectsBox(box);
let nThru:Vector3 = box.getFaceNormal(rThru.getPoint(tThru));
//log("tThru=" + tThru + ", hitPt=" + rThru.getPoint(tThru) + ", normal=" + nThru);

let rTooFar:Ray = new Ray(new Vector3(1, 1, -10), new Vector3(1, 1, -1));
let tTooFar:number = rTooFar.intersectsBox(box);
//log("tTooFar=" + tTooFar + ", hitPt=" + rTooFar.getPoint(tTooFar) + ", onePt=" + rTooFar.getPoint(1));

function rayTest()
{
  describe('Ray Tests', () => {
    it('should have length of one', () => {
      expect(r1.distance).toEqual(1);
    });

    it('r1 ends at 0,1,0', () => {
      expect(r1.getPoint(1)).toEqual(Vector3.Up());
    });

    it('r2 normalizes to 0.707, 0.707, 0', () => {
      expect(r2.normDirection).toEqual(new Vector3(0.7071, 0.7071, 0));
    });

    it('rAbove normalizes to 0, -1, 0', () => {
      expect(rAbove.normDirection).toEqual(new Vector3(0, -1, 0));
    });

    it('rAbove starts at (1, 3, 1)', () => {
      expect(rAbove.origin).toEqual(new Vector3(1, 3, 1));
    });

    it('rAbove ends at (1, 1.5, 1)', () => {
      expect(rAbove.endPoint).toEqual(new Vector3(1, 1.5, 1));
    });

    it('rAbove has length of 1.5', () => {
      expect(rAbove.distance).toEqual(1.5);
    });

    it('rBelow normalizes to 0, 1, 0', () => {
      expect(rBelow.normDirection).toEqual(new Vector3(0, 1, 0));
    });

    it('rBelow ends at (1, 0.5, 1)', () => {
      expect(rBelow.getEndpoint()).toEqual(new Vector3(1, 0.5, 1));
    });

  });
}

function aabbTest()
{
  describe('AABB Tests', () => {
      it('box has correct min point', () => {
        expect(box.min).toEqual(new Vector3(0, 0, 0));
      });

      it('box has correct max point', () => {
        expect(box.max).toEqual(new Vector3(2, 2, 2));
      });

      it('point (1, 1, 1) is inside', () => {
        expect(box.isPointInside(new Vector3(1,1,1))).toBeTruthy();
      });

      it('point (2, 2, 2) is inside', () => {
        expect(box.isPointInside(new Vector3(2,2,2))).toBeTruthy();
      });

      it('point (0, 0, 0.1) is inside', () => {
        expect(box.isPointInside(new Vector3(0,0,0.1))).toBeTruthy();
      });

      it('point (1, 0, 0) is inside', () => {
        expect(box.isPointInside(new Vector3(1,0,0))).toBeTruthy();
      });

      it('point (2, 2, 2.01) is NOT inside', () => {
        expect(!box.isPointInside(new Vector3(2,2,2.01))).toBeTruthy();
      });

      it('second ray does NOT intersect', () => {
        expect(r2.intersectsBox(box) < 0).toBeTruthy();
      });

      it('above ray intersects', () => {
        expect(tAbove >= 0).toBeTruthy();
      });

      it('above ray hitPoint is (1, 2, 1)', () => {
        expect(rAbove.getPoint(tAbove)).isCloseTo(new Vector3(1,2,1));
      });

      it('below ray intersects', () => {
        expect(tBelow >= 0).toBeTruthy();
      });

      it('below ray hitPoint is (1, 0, 1)', () => {
        expect(rBelow.getPoint(tBelow)).isCloseTo(new Vector3(1,0,1));
      });

      it('front ray intersects', () => {
        expect(tFront >= 0).toBeTruthy();
      });

      it('front ray hitPoint is (1, 1, 0)', () => {
        expect(rFront.getPoint(tFront)).isCloseTo(new Vector3(1, 1, 0));
      });

      it('frontLow ray intersects', () => {
        expect(tFrontLow >= 0).toBeTruthy();
      });

      it('frontLow ray hitPoint is (1, 0.001, 0)', () => {
        expect(rFrontLow.getPoint(tFrontLow)).isCloseTo(new Vector3(1, 0.001, 0));
      });

      it('frontLow normal is (0, 0, -1)', () => {
        expect(nFrontLow).toEqual(new Vector3(0, 0, -1));
      });

      it('thru ray intersects', () => {
        expect(tThru >= 0).toBeTruthy();
      });

      it('thru ray hitPoint is (1, 1, 0)', () => {
        expect(rThru.getPoint(tFrontLow)).isCloseTo(new Vector3(1, 1, 0));
      });

      it('thru normal is (0, 0, -1)', () => {
        expect(nThru).toEqual(new Vector3(0, 0, -1));
      });

      it('distant ray does NOT intersect', () => {
        expect(tTooFar < 0).toBeTruthy();
      });
  });
}

log("--- TEST SUITES ---");
let suite:TestSuite = new TestSuite("All Tests", [numTest, vector3Test, rayTest, aabbTest]);
suite.run();