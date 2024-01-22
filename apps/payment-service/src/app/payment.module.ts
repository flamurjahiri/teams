import {Module} from '@nestjs/common';

import {PaymentController} from './payment.controller';
import {PaymentService} from './payment.service';
import {EventEmitterModule} from "@nestjs/event-emitter";
import {TerminusModule} from "@nestjs/terminus";
import {HealthController} from "./health.controller";

@Module({
  imports: [
    EventEmitterModule.forRoot({global: true, wildcard: true, delimiter: '.'}),
    TerminusModule],
  controllers: [PaymentController, HealthController],
  providers: [PaymentService],
})
export class PaymentModule {
}
