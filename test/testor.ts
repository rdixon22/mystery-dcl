import { Assert, AssertError } from './assert';
import * as assert from 'assert';

    export function describe(testcase, callback) {
        log(testcase);
        callback();
    }

    export function it(description, callback) {
        try 
        {
            callback();
            log(`\t ✓ ${description}`);
            //console.log('\x1b[32m\t %s\x1b[0m',`✓ ${description}`); //green
        } 
        catch (e) 
        {
            log(`\t x ${description}`);
            //console.log('\x1b[31m\t %s\x1b[0m',`x ${description}`); //red

            if(e instanceof AssertError) 
            {
                log('\t    AssertError: ' + (e as AssertError).message);
                //log(e);
            }
            else if(e instanceof Error) 
            {
                // handle generic Errors
                log('\t    Error: ' + (e as Error).message);
            }
            else 
            {
                // what got thrown?
                log('\t    ?: ' + e.ToString());
            }
        }
    }

    export function expect(actual) {
        return {
            toEqual(expected) {
                Assert.equal(actual, expected);
            },
            toBe(expected) {
                Assert.deepStrictEqual(actual, expected);
            },
            toBeTruthy() {
                Assert.ok(actual);
            },
            toHaveLength(expected) {
                Assert.ok(actual.length === expected);
            },
            isCloseTo(expected, tolerance = 0.0001) {
                Assert.closeTo(actual, expected);
            }
        };
    }