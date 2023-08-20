import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RoomService } from "./room.service";
import { CreateRoomDto } from "./dto/create-room.dto";

@Controller("room")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roomService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.roomService.remove(+id);
  }
}
