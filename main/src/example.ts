import {Readable} from "stream";

export const streamOf = <T>(...args : T[]) => {
  const r = new Readable({
    objectMode: true
  });
  args.forEach(e => r.push(e));
  r.push(null);
  return r;
};

export const arrayOf = <T>(...args : T[]) => {
  return args;
};
