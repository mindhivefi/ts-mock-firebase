import {
  ActionCodeSettings,
  ApplicationVerifier,
  AuthCredential,
  AuthProvider,
  ConfirmationResult,
  IdTokenResult,
  MultiFactorUser,
  User,
  UserCredential,
  UserInfo,
  UserMetadata,
} from '@firebase/auth-types';
import { NotImplementedYet } from '../firestore/utils/NotImplementedYet';
import { MockMultiFactorUser } from './MockMultiFactorUser';

export default class MockUser implements User {

  readonly tenantId: string | null = "";

  public get multiFactor(): MultiFactorUser {
    return this._multiFactor;
  }

  public set multiFactor(value: MultiFactorUser) {
    this._multiFactor = value;
  }

  public get displayName(): string | null {
    return this._displayName;
  }

  public set displayName(value: string | null) {
    this._displayName = value;
  }

  public get email(): string | null {
    return this._email;
  }

  public set email(value: string | null) {
    this._email = value;
  }

  public get isAnonymous() {
    return this._isAnonymous;
  }

  public set isAnonymous(value: boolean) {
    this._isAnonymous = value;
  }
  public get phoneNumber(): string | null {
    return this._phoneNumber;
  }

  public set phoneNumber(value: string | null) {
    this._phoneNumber = value;
  }
  public get photoURL(): string | null {
    return this._photoURL;
  }
  public set photoURL(value: string | null) {
    this._photoURL = value;
  }

  public get metadata() {
    return this._metadata;
  }

  public set metadata(value: UserMetadata) {
    this._metadata = value;
  }

  public get refreshToken(): string {
    return this._refreshToken;
  }

  public set refreshToken(value: string) {
    this._refreshToken = value;
  }

  public get providerId(): string {
    return this._providerId;
  }

  public set providerId(value: string) {
    this._providerId = value;
  }

  public get providerData(): Array<UserInfo | null> {
    return this._providerData;
  }

  public set providerData(value: Array<UserInfo | null>) {
    this._providerData = value;
  }

  public get uid(): string {
    return this._uid;
  }
  public set uid(value: string) {
    this._uid = value;
  }
  public get emailVerified(): boolean {
    return this._emailVerified;
  }

  public set emailVerified(value: boolean) {
    this._emailVerified = value;
  }

  private _isAnonymous: boolean = false;
  private _metadata: UserMetadata;
  private _providerData: Array<UserInfo | null> = [];
  private _refreshToken: string = '';
  private _displayName: string | null = null;
  private _email: string | null = null;
  private _phoneNumber: string | null = null;
  private _photoURL: string | null = null;
  private _providerId: string = '';
  private _uid: string = '';
  private _emailVerified: boolean = false;
  private _multiFactor: MultiFactorUser = new MockMultiFactorUser();

  constructor() {
    this._metadata = {};
  }

  public delete = (): Promise<void> => {
    throw new NotImplementedYet('User.delete()');
  }

  public getIdTokenResult = (forceRefresh: boolean = false): Promise<IdTokenResult> => {
    throw new NotImplementedYet('User.getIdTokenResult()');
  }

  public getIdToken = (forceRefresh: boolean = false): Promise<string> => {
    throw new NotImplementedYet('User.getIdToken()');
  }

  /**
   * Links the user account with the given credentials and returns any available additional user information, such as user name.
   *
   * @memberof MockUser
   */
  public linkAndRetrieveDataWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
    throw new NotImplementedYet('User.linkAndRetrieveDataWithCredential()');
  }
  public linkWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
    throw new NotImplementedYet('User.linkWithCredential()');
  }
  public linkWithPhoneNumber = (
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ): Promise<ConfirmationResult> => {
    throw new NotImplementedYet('User.linkWithPhoneNumber()');
  }
  public linkWithPopup = (provider: AuthProvider): Promise<UserCredential> => {
    throw new NotImplementedYet('User.linkWithPopup()');
  }
  public linkWithRedirect = (provider: AuthProvider): Promise<void> => {
    throw new NotImplementedYet('User.linkWithRedirect()');
  }
  public reauthenticateAndRetrieveDataWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
    throw new NotImplementedYet('User.reauthenticateAndRetrieveDataWithCredential()');
  }
  public reauthenticateWithCredential = (credential: AuthCredential): Promise<UserCredential> => {
    throw new NotImplementedYet('User.reauthenticateWithCredential()');
  }
  public reauthenticateWithPhoneNumber = (
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ): Promise<ConfirmationResult> => {
    throw new NotImplementedYet('User.reauthenticateWithPhoneNumber()');
  }
  public reauthenticateWithPopup = (provider: AuthProvider): Promise<UserCredential> => {
    throw new NotImplementedYet('User.reauthenticateWithPopup()');
  }
  public reauthenticateWithRedirect = (provider: AuthProvider): Promise<void> => {
    throw new NotImplementedYet('User.reauthenticateWithRedirect()');
  }
  public reload = (): Promise<void> => {
    throw new NotImplementedYet('User.reload()');
  }
  public sendEmailVerification = (actionCodeSettings?: ActionCodeSettings | null): Promise<void> => {
    throw new NotImplementedYet('User.sendEmailVerification()');
  }
  public toJSON = (): string => {
    throw new NotImplementedYet('User.toJSON()');
  }
  public unlink = (providerId: string): Promise<User> => {
    throw new NotImplementedYet('User.unlink()');
  }
  public updateEmail = (newEmail: string): Promise<void> => {
    throw new NotImplementedYet('User.updateEmail()');
  }
  public updatePassword = (newPassword: string): Promise<void> => {
    throw new NotImplementedYet('User.updatePassword()');
  }
  public updatePhoneNumber = (phoneCredential: AuthCredential): Promise<void> => {
    throw new NotImplementedYet('User.updatePhoneNumber()');
  }
  public updateProfile = (profile: { displayName?: string | null; photoURL?: string | null }): Promise<void> => {
    throw new NotImplementedYet('User.updateProfile()');
  }
  public verifyBeforeUpdateEmail = (
    newEmail: string,
    actionCodeSettings?: ActionCodeSettings | null
  ): Promise<void> => {
    throw new NotImplementedYet('User.verifyBeforeUpdateEmail()');
  }
}
