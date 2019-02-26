const module = {
  // tslint:disable:no-invalid-this
  daa: function(name: string, value: string): void {
    (this as any)[name] = value;
  },
};

function test1() {
  const f1 = module.daa;

  f1.bind(module);
  f1('kissa', 'miisu');
}

function test2() {
  const f2 = module.daa;
  f2.bind(module);
  f2('koira', 'hound');
}

test1();
test2();
