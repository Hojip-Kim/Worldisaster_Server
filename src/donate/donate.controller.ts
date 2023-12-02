import { Controller, Get, Req } from '@nestjs/common';
import { DonateService } from './donate.service';

@Controller('donate')
export class DonateController {
  constructor(private readonly donateService: DonateService) { }

  @Get()
  getHello(@Req() request: Request): string {
    const cookiesHeader = request.headers['cookie'];
    console.log('Cookies: ', cookiesHeader);
    return this.donateService.getHello();
  }
}
