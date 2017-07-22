import {arrayOf, streamOf} from "../../main/src/example";
import {Writable} from "stream";

describe("arrayOf(...)", () => {
  it("make an array of objects", () => {
    expect(arrayOf('foo', 'bar', 'baz').join(','))
    .toBe(['foo', 'bar', 'baz'].join(','));
  });
});

describe("streamOf(...)", () => {
  var s = streamOf('foo', 'bar', 'baz');
  var types: string[] = [];
  var values: string[] = [];

  beforeEach(done => {
    var opts = {
      objectMode: true,
      write: (chunk: string, encoding: string, callback: () => void) => {
        types.push(typeof chunk);
        values.push(chunk.toString());
        callback();
      }
    };
    s.on('end', done).pipe(new Writable(opts));
  });

  it("make stream of objects", () => {
    var s2 = ['foo', 'bar', 'baz'];
    expect(types.join(',')).toBe(s2.map(e => typeof e).join(','));
    expect(values.join(',')).toBe(s2.join(','));
  });
});
