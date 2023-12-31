import {
  All,
  Controller,
  Get,
  Logger,
  Redirect,
  Req,
  Res,
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { AppService } from "./app.service";

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // TODO remove after enabling use global prefix
  @All("api/**")
  redirect(@Req() req, @Res() res) {
    const delegateEndPoint = req.path.replace(/\/api/g, "");
    return res.redirect(delegateEndPoint);
  }
}
