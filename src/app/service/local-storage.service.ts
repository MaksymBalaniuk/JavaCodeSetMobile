import { Injectable } from '@angular/core';
import {UserDetails} from "../entity/user-details";
import {PremiumLimits} from "../dto/premium-limits";
import {UserPermissions} from "../dto/user-permissions";
import {CodeBlockEntity} from "../entity/code-block-entity";
import {LoadContext} from "../enumeration/load-context";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  isAuthorizedKey = 'isAuthorized';
  userDetailsKey = 'userDetails';
  premiumLimitsKey = 'premiumLimits';
  userPermissionsKey = 'userPermissions';
  currentCodeBlockKey = 'currentCodeBlock';
  loadContextKey = 'loadContext';

  constructor() { }

  containsAuthorizationData(): boolean {
    return localStorage.getItem(this.isAuthorizedKey) != null;
  }

  setAuthorized(): void {
    localStorage.setItem(this.isAuthorizedKey, 'true');
  }

  setUserDetails(userDetails: UserDetails): void {
    localStorage.setItem(this.userDetailsKey, JSON.stringify(userDetails));
  }

  setPremiumLimits(premiumLimits: PremiumLimits): void {
    localStorage.setItem(this.premiumLimitsKey, JSON.stringify(premiumLimits));
  }

  setUserPermissions(userPermissions: UserPermissions): void {
    localStorage.setItem(this.userPermissionsKey, JSON.stringify(userPermissions));
  }

  removeAuthorizationData(): void {
    localStorage.removeItem(this.isAuthorizedKey);
    localStorage.removeItem(this.userDetailsKey);
    localStorage.removeItem(this.premiumLimitsKey);
    localStorage.removeItem(this.userPermissionsKey);
  }

  getUserDetails(): UserDetails | null {
    const item = localStorage.getItem(this.userDetailsKey);
    if (item == null) {
      return null;
    } else {
      return JSON.parse(item);
    }
  }

  getPremiumLimits(): PremiumLimits | null {
    const item = localStorage.getItem(this.premiumLimitsKey);
    if (item == null) {
      return null;
    } else {
      return JSON.parse(item);
    }
  }

  getUserPermissions(): UserPermissions | null {
    const item = localStorage.getItem(this.userPermissionsKey);
    if (item == null) {
      return null;
    } else {
      return JSON.parse(item);
    }
  }

  setCurrentCodeBlock(currentCodeBlock: CodeBlockEntity): void {
    localStorage.setItem(this.currentCodeBlockKey, JSON.stringify(currentCodeBlock));
  }

  getCurrentCodeBlock(): CodeBlockEntity | null {
    const item = localStorage.getItem(this.currentCodeBlockKey);
    if (item == null) {
      return null;
    } else {
      return JSON.parse(item);
    }
  }

  removeCurrentCodeBlock(): void {
    localStorage.removeItem(this.currentCodeBlockKey);
  }

  setLoadContext(loadContext: LoadContext): void {
    localStorage.setItem(this.loadContextKey, loadContext);
  }

  getLoadContext(): LoadContext {
    const item = localStorage.getItem(this.loadContextKey);
    if (item == null) {
      return LoadContext.PUBLIC_CODE_BLOCKS;
    } else {
      const loadContextString = item as keyof typeof LoadContext;
      return LoadContext[loadContextString];
    }
  }
}
