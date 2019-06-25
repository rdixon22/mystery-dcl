import {RigidBody} from "./rigidbody";
import {Portable} from "./portable";
import {SceneObject} from "./sceneobject";

/**
 * Loads a GLTF model, given a SceneObject data structure.
 * Optionally adds components to make the entity Portable/throwable or a RigidBody.
 * If a GLTFShape has already been loaded, it will be reused.
 */
export class ModelLoader
{
    public cache : object = {}; // simple object-based dictionary
    public filePrefix : string = "models/";

    spawnSceneObject(data: object): Entity
    {
        const so = this.populate(new SceneObject(), data); // TODO: error checking

        const mod = new Entity();

        // check cache to see if shape is already there
        let shape:GLTFShape = this.cache[so.filename];
        log("loading " + so.filename);
        //log(shape);
        if (shape == undefined)
        {
            shape = new GLTFShape(this.filePrefix + so.filename);
            this.cache[so.filename] = shape;
        }
        //log(shape);
        mod.addComponent(shape);

        const trans = new Transform({
            position: new Vector3(...so.pos),
            scale: new Vector3(...so.scale)
        });
        trans.rotation.eulerAngles = new Vector3(...so.angles);
        mod.addComponent(trans);

        if (so.rigidbody || so.throwable) {
            mod.addComponent(new RigidBody(mod, new Vector3(...so.physics.velocity), so.physics.mass, so.physics.bounciness, true));
        }
        if (so.portable || so.throwable) {
            mod.addComponent(new Portable(mod, so.throwable, 50));
        }

        engine.addEntity(mod);
        return mod;
    }

    populate(target, ...args)
    {
        if (!target) 
        {
            throw TypeError('Cannot convert undefined or null to object');
        }
        for (const source of args) {
            if (source) {
                Object.keys(source).forEach(key => target[key] = source[key]);
            }
        }
        return target;
    }
}