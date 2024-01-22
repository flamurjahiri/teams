import {WorkingDays} from "../stadiums/entities/working.days.enum";
import {BadRequestException} from "@nestjs/common";

export const GET_DAY = (day: number): WorkingDays => {
  if (day < 0 || day >= 7) {
    throw new BadRequestException("Days should be in range SUN(0) to SAT(6)");
  }
  if (day === 0) {
    return WorkingDays.SUNDAY;
  }
  if (day === 1) {
    return WorkingDays.MONDAY;
  }
  if (day === 2) {
    return WorkingDays.TUESDAY;
  }
  if (day === 3) {
    return WorkingDays.WEDNESDAY;
  }
  if (day === 4) {
    return WorkingDays.THURSDAY;
  }
  if (day === 5) {
    return WorkingDays.FRIDAY;
  }
  if (day === 6) {
    return WorkingDays.SATURDAY;
  }

  throw new BadRequestException("Days should be in range SUN(0) to SAT(6)");

}
