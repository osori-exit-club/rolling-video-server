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
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { ClipDto } from "./dto/clip.dto";

@Controller("clip")
@ApiTags("Clip API")
export class ClipController {
  constructor(private readonly clipService: ClipService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "클립 생성 API", description: "클립을 생성한다." })
  @ApiConsumes("multipart/form-data")
  @ApiOkResponse({
    description: "생성된 클립 정보",
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
        _id: {
          type: "string",
          description: "clip id",
        },
        __v: {
          type: "number",
          description: "version of mongo db",
        },
      },
      example: {
        roomId: "65099d54d2ba36bb284678e2",
        nickname: "nickname3",
        isPublic: true,
        _id: "6509a7ab8173da335d01c6bc",
        __v: 0,
        videoUrl:
          "https://careerlego-salt-test.s3.amazonaws.com/videos/65099d54d2ba36bb284678e2/6509a7ab8173da335d01c6bc.mp4",
      },
    },
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
  create(@Body() createClipDto: CreateClipDto, @UploadedFile() file) {
    const sizeMB = file.size / 1_000_000;
    console.log(sizeMB);

    if (sizeMB > 15) {
      throw new HttpException("size is over than 15MB", HttpStatus.BAD_REQUEST);
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
    example: "651c105569ada488e158a346",
  })
  @ApiOkResponse({
    description: "Clip 정보",
    type: ClipDto,
  })
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
