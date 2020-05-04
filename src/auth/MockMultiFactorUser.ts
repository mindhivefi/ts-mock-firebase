import { NotImplementedYet } from './../firestore/utils/NotImplementedYet';

import { MultiFactorUser, MultiFactorInfo, MultiFactorAssertion, MultiFactorSession } from '@firebase/auth-types'

export class MockMultiFactorUser implements MultiFactorUser {

  public get enrolledFactors(): MultiFactorInfo[] {
    return this._enrolledFactors;
  }

  public enroll = (
    assertion: MultiFactorAssertion,
    displayName?: string | null
  ): Promise<void> => {
    throw new NotImplementedYet("MockMultiFactorUser.enroll");
  };

  public getSession = (): Promise<MultiFactorSession> => {
    throw new NotImplementedYet("MockMultiFactorUser.getSession");
  }

  public unenroll = (option: MultiFactorInfo | string): Promise<void> => {
    throw new NotImplementedYet("MockMultiFactorUser.unenroll");
  }

  private _enrolledFactors: MultiFactorInfo[] = [];
}