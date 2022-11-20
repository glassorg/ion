import { strict as assert } from "assert";
import { MemoryFileSystem } from "./MemoryFileSystem";

let fs = new MemoryFileSystem({
    "foo.txt": "foo",
    "bar.txt": "bar",
    "foo/bar/fuz.txt": "fuz",
    "foo.ion": "foo ion",
    "bar.ion": "bar ion",
})

assert(fs.exists("foo.txt"));
assert(!fs.exists("bar"));

assert.deepEqual(fs.find(/\.txt$/), ["foo.txt", "bar.txt", "foo/bar/fuz.txt"]);

fs.write("new/file/alpha.txt", "alpha here");
assert.deepEqual(fs.read("new/file/alpha.txt"), "alpha here");

assert.deepEqual(fs.find(/\.txt$/), ["foo.txt", "bar.txt", "foo/bar/fuz.txt", "new/file/alpha.txt"]);

assert.deepEqual(fs.find(/\.ion$/), ["foo.ion", "bar.ion"]);

