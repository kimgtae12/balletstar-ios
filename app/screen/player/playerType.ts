export interface MusicItemListType {
  title: string;
  file: string;
  howl: string;
  idx: string;
  duration: string;
}

export interface PlayerItemType {
  id: string; //player id
  title: string; //player 제목
  url: string; //player 노래 경로
  album: string; //player 앨범 정보
  artist: string; // 작곡가 정보 (ios 필수)
  artwork: string; // 앨범 표지
  duration: number; //노래 길이
  dbIdx: string; //db상 idx
}
