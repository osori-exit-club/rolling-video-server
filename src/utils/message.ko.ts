export const ResponseMessage = {
  CLIP_READ_FAIL_NOT_FOUND: "조회에 실패 했습니다. 원인: 존재하지 않는 id",
  CLIP_CREATE_FAIL_EXPIRED(dueDate: string, currentDate: string) {
    return `This room is exipred because due date is ${dueDate} but today is ${currentDate}`;
  },
  CLIP_CREATE_FAIL_SIZE_LIMIT(limit: string) {
    return `Validation failed (expected size is less than ${limit})`;
  },
  CLIP_REMOVE_SUCCESS: "삭제에 성공 했습니다.",
  CLIP_REMOVE_FAIL: "삭제에 실패 했습니다.",
  CLIP_REMOVE_FAIL_WONG_PASSWORD: "삭제에 실패 했습니다. 원인: 잘못된 비밀번호",

  ROOM_READ_FAIL_NOT_FOUND: "조회에 실패 했습니다. 원인: 존재하지 않는 id",
  ROOM_REMOVE_SUCCESS: "삭제에 성공 했습니다.",
  ROOM_REMOVE_FAIL: "삭제에 실패 했습니다.",
  ROOM_REMOVE_FAIL_WONG_PASSWORD: "삭제에 실패 했습니다. 원인: 잘못된 비밀번호",
  ROOM_REMOVE_FAIL_WRONG_ID: "삭제에 실패 했습니다. 원인: 존재하지 않는 id",
  ROOM_GATHER_FAIL_NOT_FOUND: "취합에 실패 했습니다. 원인: 존재하지 않는 id",
};
