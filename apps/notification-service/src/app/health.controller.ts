import {Controller, Get, Inject} from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MicroserviceHealthIndicator,
} from "@nestjs/terminus";
import {KAFKA_OPTIONS} from "../assets/config.options";
import {KafkaOptions} from "@nestjs/microservices/interfaces/microservice-configuration.interface";
import {Transport} from "@nestjs/microservices";

@Controller('/notification/api/health')
export class HealthController {

  @Inject(HealthCheckService) healthCheckService: HealthCheckService
  @Inject(MicroserviceHealthIndicator) private microserviceHealthIndicator: MicroserviceHealthIndicator


  @HealthCheck()
  @Get('/')
  health(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.checkKafkaHealth('KAFKA_HEALTH_CHECK', KAFKA_OPTIONS),
    ]);
  }

  async checkKafkaHealth(key: string, options: KafkaOptions): Promise<HealthIndicatorResult> {
    return this.microserviceHealthIndicator.pingCheck(key, {
      transport: Transport.KAFKA,
      options: {
        ...options['options'],
        producerOnlyMode: true
      }
    });
  }
}
