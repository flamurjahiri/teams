import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {Stadium} from "../entities/stadium.schema";
import {HttpRequest} from "../../auth/entities/custom-request.interface";
import {catchError, iif, mergeMap, Observable, of, throwError} from "rxjs";
import {StadiumRepository} from "../repository/stadium.repository";
import {DeleteResult, PaginatedEntityResponse, PaginatedFilters} from "@teams/database";
import {StadiumPaginatedRequest} from "../dto/stadium.paginated.request";
import {GoogleMapsApiService} from "../../externals/api/google/maps/google.maps.api.service";

@Injectable()
export class StadiumService {

  @Inject(StadiumRepository) private readonly stadiumRepository: StadiumRepository
  @Inject(GoogleMapsApiService) private readonly mapsService: GoogleMapsApiService

  addStadium(req: HttpRequest, stadium: Stadium): Observable<Stadium> {
    stadium.createdBy = req.userSimple;
    return this.stadiumRepository.insert(stadium);
  }


  getById(id: string): Observable<Stadium> {
    return this.stadiumRepository.getById(id);
  }

  getStadiums(req: HttpRequest, paginatedFilters: PaginatedFilters, request: StadiumPaginatedRequest, filterOwnStadium: boolean): Observable<PaginatedEntityResponse<Stadium>> {
    return this.stadiumRepository.getUserStadium(req, paginatedFilters, request, filterOwnStadium);
  }


  getNearLocation(req: HttpRequest, paginatedFilters: PaginatedFilters, lat: number, lng: number): Observable<PaginatedEntityResponse<Stadium>> {
    if (!lat || !lng) {
      return of(new PaginatedEntityResponse([], paginatedFilters.limit));
    }

    return iif(() => !lat || !lng, of(''), this.mapsService.getCity(lat, lng)).pipe(
      catchError(_ => of('')),
      mergeMap(city => this.stadiumRepository.getNearLocation(req, paginatedFilters, city))
    )

  }

  delete(userId: string, stadiumId: string): Observable<DeleteResult> {
    return this.stadiumRepository.getById(stadiumId).pipe(
      mergeMap(stadium =>
        iif(() => userId === stadium.createdBy?._id,
          this.stadiumRepository.deleteById(stadiumId),
          throwError(() => new BadRequestException("You can't delete someone else stadium"))
        )
      )
    );
  }
}
