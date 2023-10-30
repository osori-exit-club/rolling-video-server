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
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { ClipDto } from "./dto/clip.dto";
import { RoomService } from "src/room/room.service";
import { RoomDto } from "src/room/dto/room.dto";
import { ClipResponseDto } from "./dto/clip-response.dto";
import { ResponseMessage } from "src/utils/message.ko";
import { CreateClipResponseDto } from "./dto/create-clip-response.dto";
import { DeleteClipDto } from "./dto/delete-clip.dto";

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
        },
        file: {
          type: "string",
          format: "binary",
          nullable: false,
        },
      },
      required: ["roomId", "nickname", "file"],
    },
  })
  @ApiOkResponse({
    description: "생성된 클립 정보",
    type: CreateClipResponseDto,
  })
  @ApiNotFoundResponse({
    description: "잘못된 id를 전송한 경우",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: HttpStatus.NOT_FOUND,
        },
        message: {
          type: "string",
          example: ResponseMessage.ROOM_READ_FAIL_NOT_FOUND,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "업로드 기한이 지난 경우",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: HttpStatus.BAD_REQUEST,
        },
        message: {
          type: "string",
          example: ResponseMessage.CLIP_CREATE_FAIL_EXPIRED(
            new Date().toDateString(),
            new Date(new Date().getDate() - 1).toDateString()
          ),
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "파일의 크기가 큰 경우",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: HttpStatus.BAD_REQUEST,
        },
        message: {
          type: "string",
          example: ResponseMessage.CLIP_CREATE_FAIL_SIZE_LIMIT("15MB"),
        },
      },
    },
  })
  async create(
    @Body() createClipDto: CreateClipDto,
    @UploadedFile() file
  ): Promise<CreateClipResponseDto> {
    const sizeMB = file.size / 1_000_000;
    console.log(sizeMB);

    if (sizeMB > 15) {
      throw new HttpException(
        ResponseMessage.CLIP_CREATE_FAIL_SIZE_LIMIT("15MB"),
        HttpStatus.BAD_REQUEST
      );
    }

    const room: RoomDto | null = await this.roomService.findOne(
      createClipDto.roomId
    );
    if (room == null) {
      throw new HttpException(
        ResponseMessage.ROOM_READ_FAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    const currentDate: Date = new Date();
    if (+room.dueDate < currentDate.getTime()) {
      throw new HttpException(
        ResponseMessage.CLIP_CREATE_FAIL_EXPIRED(
          room.dueDate.toDateString(),
          currentDate.toDateString()
        ),
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
    type: ClipResponseDto,
  })
  @ApiNotFoundResponse({
    description: "잘못된 id를 전송한 경우",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: 404,
        },
        message: {
          type: "string",
          example: ResponseMessage.CLIP_READ_FAIL_NOT_FOUND,
        },
      },
    },
  })
  async findOne(@Param("id") id: string): Promise<ClipResponseDto> {
    const result = await this.clipService.findOne(id);
    if (result == null) {
      throw new HttpException(
        ResponseMessage.CLIP_READ_FAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }

  @Delete(":id")
  @ApiOperation({
    summary: "클립 삭제 API",
    description: "클립 삭제 API",
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "clip id",
    example: "651c1bc85130dd8a0abf7727",
  })
  @ApiBody({
    type: DeleteClipDto,
  })
  @ApiOkResponse({
    description: "삭제 겅공 여부",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: ResponseMessage.CLIP_REMOVE_SUCCESS,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "잘못된 id를 전송한 경우",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: HttpStatus.NOT_FOUND,
        },
        message: {
          type: "string",
          example: ResponseMessage.CLIP_READ_FAIL_NOT_FOUND,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "잘못된 secretKey를 전송한 경우",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: HttpStatus.BAD_GATEWAY,
        },
        message: {
          type: "string",
          example: ResponseMessage.CLIP_REMOVE_FAIL_WONG_PASSWORD,
        },
      },
    },
  })
  async remove(@Param("id") id: string, deleteClipDto: DeleteClipDto) {
    return this.clipService.remove(id, deleteClipDto);
  }
}
