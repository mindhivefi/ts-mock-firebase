import { primitiveComparator } from '../utils/misc';

export class DatabaseInfo {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId The database to use.
   * @param persistenceKey A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host The Firestore backend host to connect to.
   * @param ssl Whether to use SSL when connecting.
   */
  constructor(
    readonly databaseId: DatabaseId,
    readonly persistenceKey: string,
    readonly host: string,
    readonly ssl: boolean
  ) {}
}

/** The default database name for a project. */
const DEFAULT_DATABASE_NAME = '(default)';

/** Represents the database ID a Firestore client is associated with. */
// tslint:disable-next-line: max-classes-per-file
export class DatabaseId {
  public readonly database: string;
  constructor(readonly projectId: string, database?: string) {
    this.database = database ? database : DEFAULT_DATABASE_NAME;
  }

  get isDefaultDatabase(): boolean {
    return this.database === DEFAULT_DATABASE_NAME;
  }

  public isEqual(other: {}): boolean {
    return other instanceof DatabaseId && other.projectId === this.projectId && other.database === this.database;
  }

  public compareTo(other: DatabaseId): number {
    return primitiveComparator(this.projectId, other.projectId) || primitiveComparator(this.database, other.database);
  }
}
