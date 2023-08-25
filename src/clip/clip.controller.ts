import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ClipService } from "./clip.service";
import { CreateClipDto } from "./dto/create-clip.dto";
import { UpdateClipDto } from "./dto/update-clip.dto";

@Controller("clip")
export class ClipController {
  constructor(private readonly clipService: ClipService) {}

  @Post()
  create(@Body() createClipDto: CreateClipDto) {
    return this.clipService.create(createClipDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clipService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateClipDto: UpdateClipDto) {
    return this.clipService.update(id, updateClipDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.clipService.remove(id);
  }
}
