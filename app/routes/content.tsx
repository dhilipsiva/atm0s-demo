"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  useConsumer,
  usePublisher,
  useRemoteVideoTracks,
  useSession,
  RemoteTrack,
  useConsumerStatus,
  Atm0sMediaProvider,
} from "@atm0s-media-sdk/react-hooks";

import { Kind } from "@atm0s-media-sdk/core";
import { GATEWAY } from "~/consts";

function EchoViewer({ track }: { track: RemoteTrack }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const consumer = useConsumer(track);
  const consumerStatus = useConsumerStatus(consumer);
  useEffect(() => {
    videoRef.current!.srcObject = consumer.stream;
  }, [videoRef.current, consumer]);
  useEffect(() => {
    consumer.attach({
      priority: 1,
      maxSpatial: 2,
      maxTemporal: 2,
    });
    return () => {
      consumer.detach();
    };
  }, [track]);

  return (
    <div>
      {track.peer}/{track.track} - {consumerStatus}
      <video
        muted
        autoPlay
        width={500}
        height={500}
        ref={videoRef}
        style={{ backgroundColor: "gray" }}
        id="video-echo"
      />
    </div>
  );
}

function EchoContent(): JSX.Element {
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const session = useSession();
  const audio_sender = usePublisher("audio_main", Kind.AUDIO);
  const video_sender = usePublisher("video_main", Kind.VIDEO);
  const [view, setView] = useState(true);

  const video_tracks = useRemoteVideoTracks();

  const connect = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    previewVideoRef.current!.srcObject = stream;
    await audio_sender.attach(stream.getAudioTracks()[0]!);
    await video_sender.attach(stream.getVideoTracks()[0]!);
    await session.connect();
  }, [session, previewVideoRef.current]);

  return (
    <div>
      <input
        type="button"
        value="Connect"
        id="connect"
        onClick={connect}
      ></input>
      <br />
      <input
        type="button"
        value="View"
        id="view"
        onClick={() => setView(true)}
      ></input>
      <br />{" "}
      <video
        muted
        autoPlay
        ref={previewVideoRef}
        width={500}
        height={500}
        style={{ backgroundColor: "gray" }}
        id="video-preview"
      />
      <br />
      <audio autoPlay id="audio-echo" />
      <br />
      {view && video_tracks.map((t) => <EchoViewer key={t.peer} track={t} />)}
    </div>
  );
}

interface Props {
  room: string;
  peer: string;
  token: string;
}

export default function PageContent({ room, peer, token }: Props) {
  return (
    <Atm0sMediaProvider
      gateway={GATEWAY}
      cfg={{
        token,
        join: {
          room,
          peer,
          publish: { peer: true, tracks: true },
          subscribe: { peers: true, tracks: true },
        },
      }}
      prepareAudioReceivers={1}
      prepareVideoReceivers={1}
    >
      <EchoContent />
    </Atm0sMediaProvider>
  );
}
