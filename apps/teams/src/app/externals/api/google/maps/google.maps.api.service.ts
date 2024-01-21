import {Inject, Injectable} from "@nestjs/common";
import {HttpService} from "@nestjs/axios";
import {map, Observable} from "rxjs";
import {GOOGLE_API_KEY} from "../../../../../assets/environments";

@Injectable()
export class GoogleMapsApiService {
  @Inject(HttpService) private readonly httpService: HttpService


  getCity(lat: number, lng: number): Observable<string> {
    return this.httpService.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_API_KEY
      }
    }).pipe(
      map(r => r?.data?.['city'] as string)
    )
  }
}
