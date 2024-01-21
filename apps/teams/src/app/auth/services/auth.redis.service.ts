import {Inject, Injectable} from "@nestjs/common";
import {iif, mergeMap, Observable, of} from "rxjs";
import {fromPromise} from "@teams/utils";
import {Cache} from 'cache-manager';
import {CACHE_MANAGER} from '@nestjs/cache-manager';

@Injectable()
export class AuthRedisService {
  @Inject(CACHE_MANAGER) private readonly cacheManager: Cache

  saveToken(userId: string, token: string): Observable<void> {
    return fromPromise(this.getById(userId)).pipe(
      mergeMap(r => iif(() => !!r, of(true), fromPromise(this.delete(userId)))),
      mergeMap(() => fromPromise(this.set(userId, token)))
    );
  }

  private async getById(userId: string): Promise<string> {
    return this.cacheManager.get(userId);
  }

  private async delete(userId: string): Promise<void> {
    return this.cacheManager.del(userId);
  }

  private async set(userId: string, token: string): Promise<void> {
    return this.cacheManager.set(userId, token);
  }

  async isSuccessfullyLogin(userId: string, token: string): Promise<boolean> {
    if (!userId) {
      return false;
    }
    const cacheToken: string = await this.cacheManager.get(userId);

    if (!cacheToken) {
      return false;
    }

    return cacheToken === token;
  }

}
