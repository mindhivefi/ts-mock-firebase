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
import { MockFirebaseAppImpl } from '../app';

import { NotImplementedYet } from '../firestore/utils/NotImplementedYet';
import MockUser from './MockUser';

export default class MockFirebaseAuth implements FirebaseAuth {
  public get currentUser(): MockUser | null {
    return this._user as MockUser;
  }

  public set currentUser(user: MockUser | null) {
    this._user = user;
  }
  public get languageCode(): string | null {
    throw new NotImplementedYet('languageCode');
  }
  public get settings(): AuthSettings {
    throw new NotImplementedYet('settings');
  }
  public tenantId: string | null = null;

  public static Persistence: {
    LOCAL: Persistence;
    NONE: Persistence;
    SESSION: Persistence;
  };
  private _user: MockUser | null = null;

  public constructor(public app: MockFirebaseAppImpl) { }

  public applyActionCode = (code: string): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }

  public checkActionCode = (code: string): Promise<ActionCodeInfo> => {
    throw new NotImplementedYet('checkActionCode');
  }
  public confirmPasswordReset = (code: string, newPassword: string): Promise<void> => {
    throw new NotImplementedYet('confirmPasswordReset');
  }
  public createUserWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('createUserWithEmailAndPassword');
  }
  public createUserAndRetrieveDataWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('createUserAndRetrieveDataWithEmailAndPassword');
  }

  public fetchProvidersForEmail = (email: string): Promise<string[]> => {
    throw new NotImplementedYet('fetchProvidersForEmail');
  }
  public fetchSignInMethodsForEmail = (email: string): Promise<string[]> => {
    throw new NotImplementedYet('fetchSignInMethodsForEmail');
  }
  public isSignInWithEmailLink = (emailLink: string): boolean => {
    throw new NotImplementedYet('isSignInWithEmailLink');
  }
  public getRedirectResult = (): Promise<UserCredential> => {
    throw new NotImplementedYet('getRedirectResult');
  }
  public onAuthStateChanged = (
    nextOrObserver: Observer<any> | ((a: User | null) => any),
    error?: (a: Error) => any,
    completed?: Unsubscribe
  ): Unsubscribe => {
    throw new NotImplementedYet('onAuthStateChanged');
  }
  public onIdTokenChanged = (
    nextOrObserver: Observer<any> | ((a: User | null) => any),
    error?: (a: Error) => any,
    completed?: Unsubscribe
  ): Unsubscribe => {
    throw new NotImplementedYet('onIdTokenChanged');
  }
  public sendSignInLinkToEmail = (email: string, actionCodeSettings: ActionCodeSettings): Promise<void> => {
    throw new NotImplementedYet('sendSignInLinkToEmail');
  }
  public sendPasswordResetEmail = (email: string, actionCodeSettings?: ActionCodeSettings | null): Promise<void> => {
    throw new NotImplementedYet('sendPasswordResetEmail');
  }
  public setPersistence = (persistence: Persistence): Promise<void> => {
    throw new NotImplementedYet('setPersistence');
  }
  public signInAndRetrieveDataWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
    throw new NotImplementedYet('signInAndRetrieveDataWithCredential');
  }
  public signInAnonymously = (): Promise<UserCredential> => {
    throw new NotImplementedYet('signInAnonymously');
  }
  public signInAnonymouslyAndRetrieveData = (): Promise<UserCredential> => {
    throw new NotImplementedYet('signInAnonymouslyAndRetrieveData');
  }
  public signInWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
    throw new NotImplementedYet('signInWithCredential');
  }
  public signInWithCustomToken = (token: string): Promise<UserCredential> => {
    throw new NotImplementedYet('signInWithCustomToken');
  }
  public signInAndRetrieveDataWithCustomToken = (token: string): Promise<UserCredential> => {
    throw new NotImplementedYet('signInAndRetrieveDataWithCustomToken');
  }
  public signInWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('signInWithEmailAndPassword');
  }
  public signInAndRetrieveDataWithEmailAndPassword = (email: string, password: string): Promise<UserCredential> => {
    throw new NotImplementedYet('signInAndRetrieveDataWithEmailAndPassword');
  }
  public signInWithEmailLink = (email: string, emailLink?: string): Promise<UserCredential> => {
    throw new NotImplementedYet('signInWithEmailLink');
  }
  public signInWithPhoneNumber = (
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ): Promise<ConfirmationResult> => {
    throw new NotImplementedYet('signInWithPhoneNumber');
  }
  public signInWithPopup = (provider: AuthProvider): Promise<UserCredential> => {
    throw new NotImplementedYet('signInWithPopup');
  }
  public signInWithRedirect = (provider: AuthProvider): Promise<void> => {
    throw new NotImplementedYet('signInWithRedirect');
  }
  public signOut = (): Promise<void> => {
    throw new NotImplementedYet('signOut');
  }
  public updateCurrentUser = (user: User | null): Promise<void> => {
    throw new NotImplementedYet('updateCurrentUser');
  }
  public useDeviceLanguage = (): void => {
    throw new NotImplementedYet('useDeviceLanguage');
  }
  public verifyPasswordResetCode = (code: string): Promise<string> => {
    throw new NotImplementedYet('verifyPasswordResetCode');
  }
}
