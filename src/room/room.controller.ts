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
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
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
import { DeleteRoomRequest } from "./dto/request/delete-room.request.dto";
import { GatherRoomResponse } from "./dto/response/gather-room.response.dto";
import { CreateRoomResponse } from "./dto/response/create-room.response.dto";
import { SimpleResponseDto } from "src/common/dto/simple-response.dto";
import { ResponseMessage } from "src/utils/message.ko";
import { RoomResponse } from "./dto/response/room.response.dto";

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
    type: CreateRoomRequest,
  })
  @ApiOkResponse({
    description: "생성된 Room 객체",
    type: CreateRoomResponse,
  })
  async create(
    @Body() createRoomDto: CreateRoomRequest
  ): Promise<CreateRoomResponse> {
    const roomDto: RoomDto = await this.roomService.create(createRoomDto);
    return new CreateRoomResponse(
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
  async findAll(): Promise<RoomResponse[]> {
    const roomDtoList: RoomDto[] = await this.roomService.findAll();
    return roomDtoList.map((roomDto) => {
      return new RoomResponse(
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
    type: RoomResponse,
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
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<RoomResponse> {
    const roomDto = await this.roomService.findOne(id);
    if (roomDto == null) {
      throw new HttpException(
        ResponseMessage.ROOM_READ_FAIL_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return new RoomResponse(
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
    type: DeleteRoomRequest,
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
          example: HttpStatus.NOT_FOUND,
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
          example: HttpStatus.BAD_REQUEST,
        },
        message: {
          type: "string",
          example: ResponseMessage.ROOM_REMOVE_FAIL_WONG_PASSWORD,
        },
      },
    },
  })
  async remove(
    @Param("id") id: string,
    @Body() deleteRoomDto: DeleteRoomRequest
  ): Promise<SimpleResponseDto> {
    const result = await this.roomService.remove(id, deleteRoomDto);
    if (result && result._id && id == result._id + "") {
      return new SimpleResponseDto(ResponseMessage.ROOM_REMOVE_SUCCESS);
    }
    return new SimpleResponseDto(ResponseMessage.ROOM_REMOVE_FAIL);
  }

  @Post(":id/gather")
  @ApiOperation({ summary: "클립 취합 API", description: "클립을 생성한다." })
  @ApiOkResponse({
    description: "취합 성공",
    type: GatherRoomResponse,
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
          example: ResponseMessage.ROOM_GATHER_FAIL_NOT_FOUND,
        },
      },
    },
  })
  gather(@Param("id") roomId: string): Promise<GatherRoomResponse> {
    return this.roomService.gather(roomId);
  }
}
