import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { RoomService } from "./room.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { ApiBody, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { RoomDto } from "./dto/room.dto";

@Controller("room")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({
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
  findAll() {
    return this.roomService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roomService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.roomService.remove(id);
  }
}
