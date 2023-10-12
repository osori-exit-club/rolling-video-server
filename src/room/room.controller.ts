import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { RoomService } from "./room.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { RoomDto } from "./dto/room.dto";
import { DeleteRoomDto } from "./dto/delete-room.dto";

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
    type: RoomDto,
  })
  create(@Body() createRoomDto: CreateRoomDto): Promise<RoomDto> {
    return this.roomService.create(createRoomDto);
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
  findAll() {
    return this.roomService.findAll();
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
    type: RoomDto,
  })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roomService.findOne(id);
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
    type: RoomDto,
  })
  remove(@Param("id") id: string, @Body() deleteRoomDto: DeleteRoomDto) {
    return this.roomService.remove(id, deleteRoomDto);
  }
}
