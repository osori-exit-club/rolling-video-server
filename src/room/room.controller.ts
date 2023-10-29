import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { RoomService } from "./room.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { RoomDto } from "./dto/room.dto";
import { DeleteRoomDto } from "./dto/delete-room.dto";
import { GatherRoomResponseDto } from "./dto/gather-room-response.dto";
import { CreateRoomResponseDto } from "./dto/create-room-response.dto";
import { SimpleResponseDto } from "src/common/dto/simple-response.dto";
import { HttpResponse } from "aws-sdk";
import { ResponseMessage } from "src/utils/message.ko";
import { ReadRoomResponseDto } from "./dto/read-room-response.dto";

@Controller("room")
@ApiTags("Room API")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({
    summary: "방 생성 API",
    description: "방 생성 API",
  })
  @ApiBody({
    description: "방 정보",
    type: CreateRoomDto,
  })
  @ApiOkResponse({
    description: "생성된 Room 객체",
    type: CreateRoomResponseDto,
  })
  async create(
    @Body() createRoomDto: CreateRoomDto
  ): Promise<CreateRoomResponseDto> {
    const roomDto: RoomDto = await this.roomService.create(createRoomDto);
    return new CreateRoomResponseDto(
      roomDto.roomId,
      roomDto.name,
      roomDto.recipient,
      roomDto.dueDate + ""
    );
  }

  @Get()
  @ApiOperation({
    summary: "전체 방 조회 API",
    description: "전체 방 조회 API",
  })
  @ApiOkResponse({
    description: "방 전체 정보 리스트",
    type: [RoomDto],
  })
  async findAll(): Promise<ReadRoomResponseDto[]> {
    const roomDtoList: RoomDto[] = await this.roomService.findAll();
    return roomDtoList.map((roomDto) => {
      return new ReadRoomResponseDto(
        roomDto.roomId,
        roomDto.name,
        roomDto.recipient,
        new Date(+roomDto.dueDate),
        roomDto.clipList.map((it) => it.clipId)
      );
    });
  }

  @Get(":id")
  @ApiOperation({
    summary: "방 조회 API",
    description: "방 조회 API",
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "room id",
    example: "65099d54d2ba36bb284678e2",
  })
  @ApiOkResponse({
    description: "방 정보",
    type: ReadRoomResponseDto,
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
          example: ResponseMessage.ROOM_READ_FAIL_NOT_FOUND,
        },
      },
    },
  })
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ReadRoomResponseDto> {
    const roomDto = await this.roomService.findOne(id);
    if (roomDto == null) {
      throw new HttpException(
        ResponseMessage.ROOM_READ_FAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return new ReadRoomResponseDto(
      roomDto.roomId,
      roomDto.name,
      roomDto.recipient,
      new Date(+roomDto.dueDate),
      roomDto.clipList.map((it) => it.clipId)
    );
  }

  @Delete(":id")
  @ApiOperation({
    summary: "방 삭제 API",
    description: "방 삭제 API",
  })
  @ApiParam({
    name: "id",
    type: "string",
    description: "room id",
    example: "651c1bc85130dd8a0abf7727",
  })
  @ApiBody({
    type: DeleteRoomDto,
  })
  @ApiOkResponse({
    description: "방 정보",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: ResponseMessage.ROOM_REMOVE_SUCCESS,
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
          example: 404,
        },
        message: {
          type: "string",
          example: ResponseMessage.ROOM_REMOVE_FAIL_NOT_FOUND,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "잘못된 password를 전송한 경우",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: 400,
        },
        message: {
          type: "string",
          example: ResponseMessage.ROOM_REMOVE_FAIL_WONG_PASSWORD,
        },
      },
    },
  })
  remove(
    @Param("id") id: string,
    @Body() deleteRoomDto: DeleteRoomDto
  ): Promise<SimpleResponseDto> {
    return this.roomService.remove(id, deleteRoomDto);
  }

  @Post(":id/gather")
  @ApiOperation({ summary: "클립 취합 API", description: "클립을 생성한다." })
  @ApiOkResponse({
    description: "취합 성공",
    type: GatherRoomResponseDto,
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
          example: ResponseMessage.ROOM_GATHER_FAIL_NOT_FOUND,
        },
      },
    },
  })
  gather(@Param("id") roomId: string): Promise<GatherRoomResponseDto> {
    return this.roomService.gather(roomId);
  }
}
