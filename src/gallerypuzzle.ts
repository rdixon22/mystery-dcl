import { NumberWheel } from "./numberwheel";

export class GalleryPuzzle
{
    public totalValue:number = 0;

    public wheel1:NumberWheel;
    public wheel2:NumberWheel;
    public wheel3:NumberWheel;
    public wheel4:NumberWheel;

    private answer:number = 4263;

    public doorOpened:boolean = false;
    public onSolved:Function;
    public isSolved:boolean = false;

    constructor()
    {

    }

    calcTotal()
    {
        this.totalValue = this.wheel1.value*1000 + this.wheel2.value*100 + this.wheel3.value*10 + this.wheel4.value;
    }

    public onWheelValueChanged = () => 
    {
        this.calcTotal();
        log("total=" + this.totalValue);
        if (this.totalValue == this.answer)
        {
            log("CORRECT!");
            this.isSolved = true;
            if (this.onSolved != undefined)
            {
                this.onSolved();
            }
        }
    }
}