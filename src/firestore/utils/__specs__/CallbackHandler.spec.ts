import MockCallbackHandler from '../CallbackHandler';

describe('CallbackHandler', () => {
  it('will register callback', () => {
    const handler = new MockCallbackHandler();
    const callback = (snapshot: any) => {
      console.log(snapshot);
    };

    handler.add(callback);
    expect(handler.list.length).toBe(1);
    expect(handler.list).toContain(callback);
  });

  it('will not register same callback twice', () => {
    const handler = new MockCallbackHandler();
    const callback = (snapshot: any) => {
      console.log(snapshot);
    };

    handler.add(callback);
    handler.add(callback);
    expect(handler.list.length).toBe(1);
    expect(handler.list).toContain(callback);
  });

  it('will remove registerered from handler', () => {
    const handler = new MockCallbackHandler();
    const callback = (snapshot: any) => {
      console.log(snapshot);
    };

    handler.add(callback);
    handler.remove(callback);
    expect(handler.list.length).toBe(0);
  });

  it('reset will remove all callbacks', () => {
    const handler = new MockCallbackHandler();
    const callback = (snapshot: any) => {
      console.log(snapshot);
    };

    handler.add(callback);
    handler.reset();
    expect(handler.list.length).toBe(0);
  });

  it('will fire each callback once', () => {
    const handler = new MockCallbackHandler();

    const callbackA = jest.fn((s: any) => {
      //console.log(s);
    });
    const callbackB = jest.fn((s: any) => {
      //console.log(s);
    });

    handler.add(callbackA);
    handler.add(callbackB);

    const snapshot = {};
    handler.fire(snapshot);
    expect(callbackA.mock.calls.length).toBe(1);
    expect(callbackB.mock.calls.length).toBe(1);
    expect(callbackA.mock.calls[0][0]).toBe(snapshot);
    expect(callbackB.mock.calls[0][0]).toBe(snapshot);
  });
});
