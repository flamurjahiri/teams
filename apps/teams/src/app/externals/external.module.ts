import {Global, Module} from '@nestjs/common'
import {GoogleMapsApiService} from "./api/google/maps/google.maps.api.service";
import {HttpModule} from "@nestjs/axios";

@Global()
@Module({
  exports: [GoogleMapsApiService],
  imports: [HttpModule],
  controllers: [],
  providers: [GoogleMapsApiService],
})

export class ExternalServiceModule {
}
