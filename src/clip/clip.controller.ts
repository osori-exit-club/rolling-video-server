import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ClipService } from "./clip.service";
import { CreateClipDto } from "./dto/create-clip.dto";
import { UpdateClipDto } from "./dto/update-clip.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("clip")
export class ClipController {
  constructor(private readonly clipService: ClipService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  create(@Body() createClipDto: CreateClipDto, @UploadedFile() file) {
    const sizeMB = file.size / 1_000_000;
    console.log(sizeMB);

    if (sizeMB > 15) {
      throw new HttpException("size is over than 15MB", HttpStatus.BAD_REQUEST);
    }
    return this.clipService.create(createClipDto, file);
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
