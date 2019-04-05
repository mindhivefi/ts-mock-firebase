import {
  ActionCodeInfo,
  ActionCodeSettings,
  ApplicationVerifier,
  AuthCredential,
  AuthProvider,
  AuthSettings,
  ConfirmationResult,
  Error,
  FirebaseAuth,
  Persistence,
  User,
  UserCredential,
} from '@firebase/auth-types';
import { Observer, Unsubscribe } from '@firebase/util';
import { MockFirebaseApp } from '../firebaseApp';
import { NotImplementedYet } from '../firestore/utils/NotImplementedYet';
import MockUser from './MockUser';

export default class MockFirebaseAuth implements FirebaseAuth {
  public get currentUser(): MockUser | null {
    return this._user;
  }

  public set currentUser(user: MockUser | null) {
    this._user = user;
  }
  public get languageCode(): string | null {
    throw new NotImplementedYet('applyActionCode');
  }
  public get settings(): AuthSettings {
    throw new NotImplementedYet('applyActionCode');
  }

  public static Persistence: {
    LOCAL: Persistence;
    NONE: Persistence;
    SESSION: Persistence;
  };
  private _user: MockUser | null = null;

  public constructor(public app: MockFirebaseApp) {}

  public applyActionCode = (code: string): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }

  public checkActionCode = (code: string): Promise<ActionCodeInfo> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public confirmPasswordReset = (code: string, newPassword: string): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public createUserWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public createUserAndRetrieveDataWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }

  public fetchProvidersForEmail = (email: string): Promise<string[]> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public fetchSignInMethodsForEmail = (email: string): Promise<string[]> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public isSignInWithEmailLink = (emailLink: string): boolean => {
    throw new NotImplementedYet('applyActionCode');
  }
  public getRedirectResult = (): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public onAuthStateChanged = (
    nextOrObserver: Observer<any> | ((a: User | null) => any),
    error?: (a: Error) => any,
    completed?: Unsubscribe
  ): Unsubscribe => {
    throw new NotImplementedYet('applyActionCode');
  }
  public onIdTokenChanged = (
    nextOrObserver: Observer<any> | ((a: User | null) => any),
    error?: (a: Error) => any,
    completed?: Unsubscribe
  ): Unsubscribe => {
    throw new NotImplementedYet('applyActionCode');
  }
  public sendSignInLinkToEmail = (email: string, actionCodeSettings: ActionCodeSettings): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public sendPasswordResetEmail = (email: string, actionCodeSettings?: ActionCodeSettings | null): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public setPersistence = (persistence: Persistence): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInAndRetrieveDataWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInAnonymously = (): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInAnonymouslyAndRetrieveData = (): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInWithCredential = (credential: AuthCredential): Promise<User> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInWithCustomToken = (token: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInAndRetrieveDataWithCustomToken = (token: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInAndRetrieveDataWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInWithEmailLink = (email: string, emailLink?: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInWithPhoneNumber = (
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ): Promise<ConfirmationResult> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInWithPopup = (provider: AuthProvider): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signInWithRedirect = (provider: AuthProvider): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public signOut = (): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public updateCurrentUser = (user: User | null): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public useDeviceLanguage = (): void => {
    throw new NotImplementedYet('applyActionCode');
  }
  public verifyPasswordResetCode = (code: string): Promise<string> => {
    throw new NotImplementedYet('applyActionCode');
  }
}
