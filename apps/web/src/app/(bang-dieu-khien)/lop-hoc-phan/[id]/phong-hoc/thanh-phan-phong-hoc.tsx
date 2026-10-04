'use client';

import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';

interface ThuocTinhThanhPhanPhongHoc {
  urlMayChuLiveKit: string;
  token: string;
  onDisconnected: () => void;
}

export default function ThanhPhanPhongHocLiveKit({
  urlMayChuLiveKit,
  token,
  onDisconnected,
}: ThuocTinhThanhPhanPhongHoc) {
  return (
    <LiveKitRoom
      serverUrl={urlMayChuLiveKit}
      token={token}
      connect={true}
      video={true}
      audio={true}
      data-lk-theme="default"
      onDisconnected={onDisconnected}
      className="h-full w-full flex flex-col"
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
