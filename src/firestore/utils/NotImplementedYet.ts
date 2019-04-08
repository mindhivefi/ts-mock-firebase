export class NotImplementedYet extends Error {
  constructor(label?: string) {
    super();
    this.message = `Not implemented yet ${label ? label : ''}`;
  }
}
