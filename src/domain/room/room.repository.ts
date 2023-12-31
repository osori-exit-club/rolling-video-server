import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room, RoomDocument } from "src/shared/mongodb/schema/rooms.schema";
import { HashHelper } from "src/shared/hash/hash.helper";
import { ResponseMessage } from "src/resources/message.ko";
import { CreateRoomRequest } from "./dto/request/create-room.request.dto";
import { UpdateRoomRequest } from "./dto/request/update-room.request.dto";
import { RoomDto } from "./dto/room.dto";
import { ClassInfo } from "src/shared/logger/interface/ClassInfo";
import { MethodLoggerService } from "src/shared/logger/MethodLoggerService";

@Injectable()
export class RoomRepository implements ClassInfo {
  readonly logTag: string = this.constructor.name;
  private readonly logger: MethodLoggerService = new MethodLoggerService(
    Logger,
    this
  );

  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private hashHelper: HashHelper
  ) {}

  async create(createRoomDto: CreateRoomRequest): Promise<RoomDto> {
    let obj: any = createRoomDto;
    if (createRoomDto.password) {
      const passwordHashed = await this.hashHelper.createHash(
        createRoomDto.password
      );
      obj["passwordHashed"] = passwordHashed;
      delete obj.password;
    }
    const room: any = await this.roomModel.create(obj);
    return new RoomDto(
      room._id.toString(),
      room.name,
      room.passwordHashed,
      room.recipient,
      new Date(+room.dueDate),
      room.clipIds
    );
  }

  async addClip(roomId: string, clipId: string): Promise<RoomDto> {
    const result = await this.roomModel.findById(roomId);
    if (result == null) {
      throw new HttpException(
        ResponseMessage.ROOM_READ_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }
    result.clipIds.push(clipId);
    const room = await result.save();

    return new RoomDto(
      room._id.toString(),
      room.name,
      room.passwordHashed,
      room.recipient,
      new Date(+room.dueDate),
      room.clipIds
    );
  }

  async findAll(): Promise<RoomDto[]> {
    const result = await this.roomModel.find().exec();
    return result.map((room) => {
      return new RoomDto(
        room._id.toString(),
        room.name,
        room.passwordHashed,
        room.recipient,
        new Date(+room.dueDate),
        room.clipIds
      );
    });
  }

  async findOne(id: string): Promise<RoomDto> {
    let room = null;
    try {
      room = await this.roomModel.findById(id).exec();
    } catch (err) {
      if (err.__proto__.toString() != "CastError") {
        this.logger.error(
          "findOne",
          err,
          `failed to findById with id(${id}) because id format is wrong`
        );
      }
    }
    if (room == null) {
      throw new HttpException(
        ResponseMessage.ROOM_READ_FAIL_WRONG_ID,
        HttpStatus.NOT_FOUND
      );
    }

    return new RoomDto(
      room._id.toString(),
      room.name,
      room.passwordHashed,
      room.recipient,
      new Date(+room.dueDate),
      room.clipIds
    );
  }

  async update(
    id: string,
    updateRoomRequest: UpdateRoomRequest
  ): Promise<RoomDto> {
    let room = await this.roomModel.findById(id);
    if (room == null) {
      throw new HttpException(
        `Room(${id}) is not existed`,
        HttpStatus.NOT_FOUND
      );
    }
    if (updateRoomRequest.name) {
      room.name = updateRoomRequest.name;
    }
    if (updateRoomRequest.recipient) {
      room.recipient = updateRoomRequest.recipient;
    }
    room = await room.save();

    const roomDto = new RoomDto(
      room._id.toString(),
      room.name,
      room.passwordHashed,
      room.recipient,
      new Date(+room.dueDate),
      room.clipIds
    );
    return roomDto;
  }

  /**
   *
   * @return objectId if room exists else null
   */
  async remove(id: string): Promise<boolean> {
    try {
      const result = await this.roomModel.findByIdAndDelete(id).exec();
      if (result == null) {
        return false;
      }
      return true;
    } catch (err) {
      if (err.__proto__.toString() != "CastError") {
        this.logger.error("remove", err);
      }
      return false;
    }
  }
}
