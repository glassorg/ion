import { strict as assert } from "assert";
import { MemoryFileSystem } from "./MemoryFileSystem";

let fs = new MemoryFileSystem({
    "foo.txt": "foo",
    "bar.txt": "bar",
    "foo/bar/fuz.txt": "fuz",
    "foo.ion": "foo ion",
    "bar.ion": "bar ion",
})

export async function test() {
    assert(await fs.exists("foo.txt"));
    assert(!await fs.exists("bar"));
    assert.deepEqual(await fs.find(/\.txt$/), ["foo.txt", "bar.txt", "foo/bar/fuz.txt"]);
    await fs.write("new/file/alpha.txt", "alpha here");

    assert.deepEqual(await fs.read("new/file/alpha.txt"), "alpha here");

    assert.deepEqual(await fs.find(/\.txt$/), ["foo.txt", "bar.txt", "foo/bar/fuz.txt", "new/file/alpha.txt"]);

    assert.deepEqual(await fs.find(/\.ion$/), ["foo.ion", "bar.ion"]);
}


