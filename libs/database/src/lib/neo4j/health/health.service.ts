import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Driver } from 'neo4j-driver';
import { NEO_4J_DRIVER } from '../assets/constants';

@Injectable()
export class Neo4JHealthService extends HealthIndicator implements OnModuleDestroy {
  @Inject(NEO_4J_DRIVER) private readonly driver: Driver;

  async onModuleDestroy(): Promise<void> {
    return this.driver?.close();
  }

  async check(): Promise<HealthIndicatorResult> {
    const startTime = new Date();

    const getStatus = (error?: any): HealthIndicatorResult => {
      return this.getStatus('Neo4j Health Check', !error, {
        error, duration: new Date().getTime() - startTime.getTime()
      });
    };

    return this.driver.getServerInfo().then(() => getStatus())
      .catch(err => {
        throw new HealthCheckError('Neo4j Health Check', getStatus(err));
      });
  }

}
