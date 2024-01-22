import {Controller} from '@nestjs/common';

import {PaymentService} from './payment.service';
import {EventPattern, Payload} from "@nestjs/microservices";
import {JoiValidationPipe} from "@teams/validators";
import {Payment} from "./payment.entity";
import {lastValueFrom} from "rxjs";

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {
  }

  @EventPattern(`payments-data`)
  sensorData(@Payload(new JoiValidationPipe(Payment)) message: Payment) {
    return lastValueFrom(this.paymentService.makePayment(message));
  }
}
