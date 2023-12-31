const SUCCESS: string = "성공";
const FAIL: string = "실패";

const REASON_WRONG_PASSWORD: string = "비밀번호가 다릅니다.";
const REASON_NOT_EXIST_ID: string = "존재하지 않는 ID 입니다.";
const REASON_WRONG_ID: string = "잘못된 형태의 id 입니다";

function createMessage(
  what: string,
  status: string = FAIL,
  reason: string | null = null
) {
  if (reason) {
    return `${what}에 ${status} 했습니다. 원인: ${reason}`;
  } else {
    return `${what}에 ${status} 했습니다.`;
  }
}

export const ResponseMessage = {
  CLIP_READ_FAIL_WRONG_ID: createMessage("조회", REASON_NOT_EXIST_ID),
  CLIP_CREATE_FAIL_EXPIRED(dueDate: string, currentDate: string) {
    return createMessage(
      "생성",
      `This room is expired because due date is ${dueDate} but today is ${currentDate}`
    );
  },
  CLIP_CREATE_FAIL_SIZE_LIMIT(limit: string) {
    return createMessage(
      "생성",
      `Validation failed (expected size is less than ${limit})`
    );
  },
  CLIP_CREATE_FAIL_UPLOAD_VIDEO: createMessage("비디오 영상 업로드"),
  CLIP_CREATE_FAIL_CREATE_CLIP: createMessage("비디오 클립 생성"),
  CLIP_REMOVE_SUCCESS: createMessage("삭제", SUCCESS),
  CLIP_REMOVE_FAIL: createMessage("클립 삭제"),
  CLIP_REMOVE_FAIL_WONG_PASSWORD: createMessage(
    "클립 삭제",
    REASON_WRONG_PASSWORD
  ),

  ROOM_READ_FAIL_WRONG_ID: createMessage("조회", REASON_NOT_EXIST_ID),
  ROOM_REMOVE_SUCCESS: createMessage("삭제", SUCCESS),
  ROOM_UPDATE_SUCCESS: createMessage("수정", SUCCESS),
  ROOM_UPDATE_FAIL: createMessage("수정"),
  ROOM_UPDATE_FAIL_WRONG_ID: createMessage("수정", REASON_NOT_EXIST_ID),
  ROOM_UPDATE_FAIL_WONG_PASSWORD: createMessage("수정", REASON_WRONG_PASSWORD),
  ROOM_REMOVE_FAIL: createMessage("삭제"),
  ROOM_REMOVE_FAIL_WONG_PASSWORD: createMessage("삭제", REASON_WRONG_PASSWORD),
  ROOM_REMOVE_FAIL_WRONG_ID: createMessage("삭제", REASON_WRONG_ID),
  ROOM_GATHER_FAIL_WRONG_ID: createMessage("취합", REASON_WRONG_ID),
  ROOM_GATHER_FAIL_EMPTY_CLIP: createMessage("취합", "클립 없음"),
};
