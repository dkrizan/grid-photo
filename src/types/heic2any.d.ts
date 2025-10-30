declare module 'heic2any' {
  type ConvertInput = {
    blob: Blob;
    toType?: string;
    quality?: number;
  };

  type ConvertResult = Blob | Blob[];

  export default function heic2any(options: ConvertInput): Promise<ConvertResult>;
}
