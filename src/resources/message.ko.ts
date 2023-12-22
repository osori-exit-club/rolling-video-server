export const ResponseMessage = {
  CLIP_READ_FAIL_WRONG_ID: "조회에 실패 했습니다. 원인: 존재하지 않는 id",
  CLIP_CREATE_FAIL_EXPIRED(dueDate: string, currentDate: string) {
    return `This room is exipred because due date is ${dueDate} but today is ${currentDate}`;
  },
  CLIP_CREATE_FAIL_SIZE_LIMIT(limit: string) {
    return `Validation failed (expected size is less than ${limit})`;
  },
  CLIP_CREATE_FAIL_UPLOAD_VIDEO: "비디오 영상 업로드에 실패 했습니다.",
  CLIP_CREATE_FAIL_CREATE_CLIP: "비디오 클립 생성에 실패 했습니다.",
  CLIP_REMOVE_SUCCESS: "삭제에 성공 했습니다.",
  CLIP_REMOVE_FAIL: "삭제에 실패 했습니다.",
  CLIP_REMOVE_FAIL_WONG_PASSWORD: "삭제에 실패 했습니다. 원인: 잘못된 비밀번호",

  ROOM_READ_FAIL_WRONG_ID: "조회에 실패 했습니다. 원인: 존재하지 않는 id",
  ROOM_REMOVE_SUCCESS: "삭제에 성공 했습니다.",
  ROOM_UPDATE_SUCCESS: "수정에 성공 했습니다.",
  ROOM_UPDATE_FAIL: "수정에 실패 했습니다.",
  ROOM_UPDATE_FAIL_WRONG_ID: "수정에 실패 했습니다. 원인: 존재하지 않는 id",
  ROOM_UPDATE_FAIL_WONG_PASSWORD: "수정에 실패 했습니다. 원인: 잘못된 비밀번호",
  ROOM_REMOVE_FAIL: "삭제에 실패 했습니다.",
  ROOM_REMOVE_FAIL_WONG_PASSWORD: "삭제에 실패 했습니다. 원인: 잘못된 비밀번호",
  ROOM_REMOVE_FAIL_WRONG_ID: "삭제에 실패 했습니다. 원인: 존재하지 않는 id",
  ROOM_GATHER_FAIL_WRONG_ID: "취합에 실패 했습니다. 원인: 존재하지 않는 id",
  ROOM_GATHER_FAIL_EMPTY_CLIP: "취합에 실패 했습니다. 원인: 클립 없음",
};
