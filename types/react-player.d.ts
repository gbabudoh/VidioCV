declare module "react-player/lazy" {
  import { Component } from "react";

  export interface ReactPlayerProps {
    url?:
      | string
      | string[]
      | MediaStream
      | Array<{ src: string; type: string }>;
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    progressInterval?: number;
    playsinline?: boolean;
    pip?: boolean;
    stopOnUnmount?: boolean;
    light?: boolean | string;
    playIcon?: React.ReactElement;
    fallback?: React.ReactElement;
    wrapper?: React.ElementType | string;
    config?: Record<string, unknown>;
    onReady?: (player: ReactPlayer) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onEnded?: () => void;
    onClickPreview?: (event: React.MouseEvent) => void;
    onEnablePIP?: () => void;
    onDisablePIP?: () => void;
    onError?: (
      error: unknown,
      data?: unknown,
      hlsInstance?: unknown,
      hlsGlobal?: unknown,
    ) => void;
    onDuration?: (duration: number) => void;
    onSeek?: (seconds: number) => void;
    onProgress?: (state: {
      played: number;
      playedSeconds: number;
      loaded: number;
      loadedSeconds: number;
    }) => void;
    [key: string]: unknown;
  }

  export default class ReactPlayer extends Component<
    ReactPlayerProps,
    Record<string, unknown>
  > {}
}
