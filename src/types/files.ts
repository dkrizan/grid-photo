export interface ImgFile {
  id: string;
  file: File;
  previewUrl: string;
  img?: HTMLImageElement;
}

export type NoticeType = 'info' | 'warning' | 'error' | 'success';

export interface Notice {
  type: NoticeType;
  text: string;
}
