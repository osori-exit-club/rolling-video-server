import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ClipService } from "./clip.service";
import { CreateClipDto } from "./dto/create-clip.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { ClipDto } from "./dto/clip.dto";
import { ClipRepository } from "./clip.repository";
import { RoomService } from "src/room/room.service";
import { RoomDto } from "src/room/dto/room.dto";
import { ClipResponseDto } from "./dto/clip-response.dto";

@Controller("clip")
@ApiTags("Clip API")
export class ClipController {
  constructor(
    private readonly clipService: ClipService,
    private readonly roomService: RoomService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "클립 생성 API", description: "클립을 생성한다." })
  @ApiConsumes("multipart/form-data")
  @ApiOkResponse({
    description: "생성된 클립 정보",
    type: ClipDto,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        roomId: {
          type: "string",
          description: "방 번호",
          nullable: false,
        },
        nickname: {
          type: "string",
          description: "clip 생성자 이름",
        },
        isPublic: {
          type: "boolean",
          description: "클립 공개 여부",
          default: false,
          nullable: false,
        },
        file: {
          type: "string",
          format: "binary",
          nullable: false,
        },
      },
      required: ["roomId", "nickname", "isPublic", "file"],
    },
  })
  async create(
    @Body() createClipDto: CreateClipDto,
    @UploadedFile() file
  ): Promise<ClipResponseDto> {
    const sizeMB = file.size / 1_000_000;
    console.log(sizeMB);

    if (sizeMB > 15) {
      throw new HttpException("size is over than 15MB", HttpStatus.BAD_REQUEST);
    }

    const room: RoomDto = await this.roomService.findOne(createClipDto.roomId);
    const currentDate: Date = new Date();
    if (+room.dueDate < currentDate.getTime()) {
      throw new HttpException(
        `This room is exipred because due date is ${room.dueDate} but today date is ${currentDate}`,
        HttpStatus.BAD_REQUEST
      );
    }

    return this.clipService.create(createClipDto, file);
  }

  @Get(":id")
  @ApiOperation({
    summary: "클립 조회 API",
    description: "하나의 클립에 대한 정보를 조회 한다",
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "clip id",
    example: "6537cf6aba132621e8c041e2",
  })
  @ApiOkResponse({
    description: "Clip 정보",
    type: ClipRepository,
  })
  findOne(@Param("id") id: string) {
    return this.clipService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.clipService.remove(id);
  }
}
