import {create} from 'zustand';

interface BearState {
  bears: number;
  increasePopulation: (by: number) => void;
  removeAllBears: () => void;
}

interface musicItemType {
  id: string; //player id
  title: string; //player 제목
  url: string; //player 노래 경로
  album: string; //player 앨범 정보
  artist: string; // 작곡가 정보 (ios 필수)
  artwork: string; // 앨범 표지
  duration: number; //노래 길이
  dbIdx: string;
}

interface musicStore {
  mt_idx: string;
  mst_idx: string;
  plt_idx: string;
  item: musicItemType[];
  updateMusicItem: (item: musicItemType[]) => void;
  updateMtIdx: (mt_idx: string) => void;
  updateMstIdx: (mst_idx: string) => void;
  updatePltIdx: (plt_idx: string) => void;
}

const useBearStore = create<BearState>(set => ({
  bears: 0,
  increasePopulation: () => set(state => ({bears: state.bears + 1})),
  removeAllBears: () => set({bears: 0}),
}));

const useMusicStore = create<musicStore>(set => ({
  mt_idx: '',
  mst_idx: '',
  plt_idx: '',
  item: [
    {
      id: '',
      title: '',
      url: '',
      album: '',
      artist: '',
      artwork: '',
      duration: 0,
      dbIdx: '',
    },
  ],
  updateMusicItem: musicItem => set(state => ({item: [...musicItem]})),
  updateMtIdx: mt_idx => set(state => ({mt_idx: mt_idx})),
  updateMstIdx: mst_idx => set(state => ({mst_idx: mst_idx})),
  updatePltIdx: plt_idx => set(state => ({plt_idx: plt_idx})),
  clearInfo: () =>
    set(state => ({
      mt_idx: '',
      mst_idx: '',
      plt_idx: '',
      item: [
        {
          id: '',
          title: '',
          url: '',
          album: '',
          artist: '',
          artwork: '',
          duration: 0,
          dbIdx: '',
        },
      ],
    })),
}));

export {useBearStore, useMusicStore};
