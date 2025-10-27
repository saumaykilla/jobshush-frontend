"use client";

import {
  ControlBar,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  RoomContext,
  useParticipantContext,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Loading from "./Loading";

export default function Page({
  roomName,
  token,
}: {
  roomName: string;
  token: string;
}) {
  // TODO: get user input for room and name
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const hasDeletedRef = useState({ current: false })[0];

  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        if (!token) throw new Error("Token is required");

        await roomInstance.connect(
          process.env.NEXT_PUBLIC_LIVEKIT_URL || "",
          token
        );

        roomInstance.on("disconnected", async () => {
          if (hasDeletedRef.current) return;
          hasDeletedRef.current = true;

          try {
            await axios.delete(`/api/mock-interview?roomName=${roomName}`);
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              console.warn("Room already deleted or not found");
            } else {
              console.error("Failed to delete room:", error);
            }
          } finally {
            router.push("/mock-interview");
          }
        });

        setIsLoading(false);
      } catch (e) {
        console.error("Failed to connect to room:", e);
        toast.error("Failed to connect to room");
        router.push("/mock-interview");
      }
    };

    connectToRoom();

    return () => {
      if (roomInstance && roomInstance.state !== "disconnected") {
        roomInstance.disconnect();
      }
    };
  }, [roomInstance, roomName, token, router, hasDeletedRef]);

  console.log(roomInstance?.remoteParticipants);
  console.log(roomInstance?.localParticipant);
  return isLoading || !roomInstance?.remoteParticipants ? (
    <div className="absolute  top-0 left-0 z-100 h-full w-full flex items-center justify-center">
      <Loading message="Connecting to your interview session, please wait..." />
    </div>
  ) : (
    <RoomContext.Provider value={roomInstance}>
      <div data-lk-theme="default" style={{ height: "100dvh" }}>
        {/* Your custom component with basic video conferencing functionality. */}
        <MyVideoConference />
        {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
        <RoomAudioRenderer />
        {/* Controls for the user to start/stop audio, video, and screen share tracks */}
        <ControlBar
          controls={{ microphone: true, camera: false, screenShare: false }}
        />
      </div>
    </RoomContext.Provider>
  );
}

function ParticipantInfo() {
  const participant = useParticipantContext();

  // Create a custom display name
  const displayName = participant.name || "Mia - AI Interviewer";

  return (
    <div className="lk-participant-metadata">
      <div className="lk-participant-metadata-item">
        <span className="lk-participant-name">{displayName}</span>
      </div>
    </div>
  );
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile>
        <ParticipantInfo />
      </ParticipantTile>
    </GridLayout>
  );
}
