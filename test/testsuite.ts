export class TestSuite
{
    public name:string;
    public testFunctions:Function[];

    constructor(_name:string = "All Tests", _tests:Function[] = [])
    {
        this.name = _name;
        this.testFunctions = _tests;
    }

    addTest(test:Function)
    {
        this.testFunctions.push(test);
    }

    clear()
    {
        this.testFunctions = new Function[0];
    }

    run()
    {
        log("Running " + this.name);
        let i:number;
        for (i = 0; i < this.testFunctions.length; i++)
        {
            let test:Function = this.testFunctions[i];
            try
            {
                test();
            }
            catch (e)
            {
                log("ERROR DURING TEST: " + e.toString());
            }
            log('\n');
        }
    }
}