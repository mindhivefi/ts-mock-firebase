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
import { NotImplementedYet } from '../firestore/utils';

export default class MockFirebaseAuth implements FirebaseAuth {
  public constructor(public app: MockFirebaseApp) {}

  static Persistence: {
    LOCAL: Persistence
    NONE: Persistence
    SESSION: Persistence,
  };

  public applyActionCode = (code: string): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }

  public checkActionCode = (code: string): Promise<ActionCodeInfo> => {
    throw new NotImplementedYet('applyActionCode');
  }
  confirmPasswordReset = (code: string, newPassword: string): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  createUserWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  createUserAndRetrieveDataWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public get currentUser(): User | null {
    throw new NotImplementedYet('applyActionCode');
  }

  fetchProvidersForEmail = (email: string): Promise<Array<string>> => {
    throw new NotImplementedYet('applyActionCode');
  }
  fetchSignInMethodsForEmail = (email: string): Promise<Array<string>> => {
    throw new NotImplementedYet('applyActionCode');
  }
  isSignInWithEmailLink = (emailLink: string): boolean => {
    throw new NotImplementedYet('applyActionCode');
  }
  getRedirectResult = (): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  public get languageCode(): string | null {
    throw new NotImplementedYet('applyActionCode');
  }
  public get settings(): AuthSettings {
    throw new NotImplementedYet('applyActionCode');
  }
  onAuthStateChanged = (
    nextOrObserver: Observer<any> | ((a: User | null) => any),
    error?: (a: Error) => any,
    completed?: Unsubscribe
  ): Unsubscribe => {
    throw new NotImplementedYet('applyActionCode');
  }
  onIdTokenChanged = (
    nextOrObserver: Observer<any> | ((a: User | null) => any),
    error?: (a: Error) => any,
    completed?: Unsubscribe
  ): Unsubscribe => {
    throw new NotImplementedYet('applyActionCode');
  }
  sendSignInLinkToEmail = (
    email: string,
    actionCodeSettings: ActionCodeSettings
  ): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  sendPasswordResetEmail = (
    email: string,
    actionCodeSettings?: ActionCodeSettings | null
  ): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  setPersistence = (persistence: Persistence): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInAndRetrieveDataWithCredential = (
    credential: AuthCredential
  ): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInAnonymously = (): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInAnonymouslyAndRetrieveData = (): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInWithCredential = (credential: AuthCredential): Promise<User> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInWithCustomToken = (token: string): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInAndRetrieveDataWithCustomToken = (
    token: string
  ): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInAndRetrieveDataWithEmailAndPassword = (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInWithEmailLink = (
    email: string,
    emailLink?: string
  ): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInWithPhoneNumber = (
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ): Promise<ConfirmationResult> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInWithPopup = (provider: AuthProvider): Promise<UserCredential> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signInWithRedirect = (provider: AuthProvider): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  signOut = (): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  updateCurrentUser = (user: User | null): Promise<void> => {
    throw new NotImplementedYet('applyActionCode');
  }
  useDeviceLanguage = (): void => {
    throw new NotImplementedYet('applyActionCode');
  }
  verifyPasswordResetCode = (code: string): Promise<string> => {
    throw new NotImplementedYet('applyActionCode');
  }
}
