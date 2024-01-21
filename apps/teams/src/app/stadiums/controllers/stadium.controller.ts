import {Body, Controller, Delete, Get, Inject, Param, Post, Query, Req, UseGuards} from "@nestjs/common";
import {StadiumService} from "../services/stadium.service";
import {SimpleAuthGuard} from "../../auth/guards/simple-auth.guard";
import {JoiValidationPipe} from "@teams/validators";
import {Stadium} from "../entities/stadium.schema";
import {Observable} from "rxjs";
import {HttpRequest} from "../../auth/entities/custom-request.interface";
import {DeleteResult, PaginatedEntityResponse, PaginatedFilters} from "@teams/database";
import {StadiumPaginatedRequest} from "../dto/stadium.paginated.request";

@Controller('/stadiums')
export class StadiumController {
  @Inject(StadiumService) stadiumService: StadiumService;


  @Post('/')
  @UseGuards(SimpleAuthGuard)
  insert(@Req() req: HttpRequest, @Body(new JoiValidationPipe(Stadium)) stadium: Stadium): Observable<Stadium> {
    return this.stadiumService.addStadium(req, stadium);
  }

  @Get('/:id')
  @UseGuards(SimpleAuthGuard)
  getById(@Req() httpReq: HttpRequest, @Param() {id}: { id: string }): Observable<Stadium> {
    return this.stadiumService.getById(id);
  }

  @Get('/')
  @UseGuards(SimpleAuthGuard)
  getCloseStadiums(@Query() {lat, lng}: { lat: number, lng: number },
                   @Query(new JoiValidationPipe(PaginatedFilters)) filters: PaginatedFilters,
                   @Req() req: HttpRequest): Observable<PaginatedEntityResponse<Stadium>> {
    return this.stadiumService.getCloseStadiums(req, filters, lat, lng);
  }

  @Post('/data')
  @UseGuards(SimpleAuthGuard)
  getStadiums(@Query(new JoiValidationPipe(PaginatedFilters)) filters: PaginatedFilters,
              @Body(new JoiValidationPipe(StadiumPaginatedRequest)) request: StadiumPaginatedRequest,
              @Req() req: HttpRequest): Observable<PaginatedEntityResponse<Stadium>> {
    return this.stadiumService.getStadiums(req, filters, request, false);
  }

  @Post('/me/data')
  @UseGuards(SimpleAuthGuard)
  getMyStadiums(@Query(new JoiValidationPipe(PaginatedFilters)) filters: PaginatedFilters,
                @Body(new JoiValidationPipe(StadiumPaginatedRequest)) request: StadiumPaginatedRequest,
                @Req() req: HttpRequest): Observable<PaginatedEntityResponse<Stadium>> {
    return this.stadiumService.getStadiums(req, filters, request, true);
  }


  @Delete('/:id')
  @UseGuards(SimpleAuthGuard)
  delete(@Req() httpReq: HttpRequest, @Param() {id}: { id: string }): Observable<DeleteResult> {
    return this.stadiumService.delete(httpReq.id, id);
  }

}
