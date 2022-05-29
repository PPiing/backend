// 201 Created
export interface IAddRoomResult {
  chatSeq: number;
  chatName: string;
}
// 40X error
export interface IAddRoomError {
  errcode: string;
  errmsg: string;
}
