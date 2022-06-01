// 201 Created
export interface IJoinRoomResult {
  chatSeq: number;
}
// 40X error
export interface IJoinRoomError {
  errcode: string;
  errmsg: string;
}
