/**
 * Callback handler used for basic operation in onSnapshot -handlers.
 *
 * @export
 * @class MockListener
 * @template S Type of snapshot object
 */
export default class MockCallbackHandler<S> {
  private _callbacks: ((snapshot: S) => void)[] = [];

  /**
   * Add a new snapshot callback
   * @param {<S>(snapshot: S) => void} callback callback function
   */
  public add = (callback: (snapshot: S) => void) => {
    if (this._callbacks.indexOf(callback) < 0) {
      this._callbacks.push(callback);
    }
  }

  public remove = (callback: (snapshot: S) => void) => {
    const index = this._callbacks.indexOf(callback);
    if (index >= 0) {
      this._callbacks.splice(index, 1);
    }
  }

  public fire = (
    snapshot: S,
    callbacks: ((snapshot: S) => void)[] = this._callbacks
  ): void => {
    for (const callback of callbacks) {
      callback(snapshot);
    }
  }

  public get list(): ((snapshot: S) => void)[] {
    return this._callbacks.slice();
  }

  public load = (callbacks: ((snapshot: S) => void)[]) => {
    this._callbacks = callbacks.slice();
  }

  public reset = () => {
    this._callbacks = [];
  }
}
