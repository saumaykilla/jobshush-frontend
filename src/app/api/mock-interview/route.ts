import { NextRequest, NextResponse } from "next/server";
import { RoomServiceClient, AccessToken, AgentDispatchClient } from "livekit-server-sdk";
import { ProfileType } from "@/lib/schemas/ProfileSchema";

type CreateMockInterviewRequest = {
  candidate: string;
  job: string;
  resume: ProfileType;
};

const roomService = new RoomServiceClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

const agentDispatchClient = new AgentDispatchClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  try {
    const { candidate, job, resume }: CreateMockInterviewRequest =
      await req.json();
    if (!candidate || !job || !resume)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    if (
      !process.env.NEXT_PUBLIC_LIVEKIT_URL ||
      !process.env.LIVEKIT_API_KEY ||
      !process.env.LIVEKIT_API_SECRET
    )
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 }
      );

    const roomName = `interview-${candidate.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`;
    const metadata = JSON.stringify({
      candidate,
      resume,
      job,
      created_at: new Date().toISOString(),
    });
    const size = new TextEncoder().encode(JSON.stringify(metadata)).length;
    const kiloBytes = size / 1024;
    console.log(`Metadata size: ${kiloBytes} KB`);
    await roomService.createRoom({
      name: roomName,
      maxParticipants: 2,
      metadata: metadata,
      emptyTimeout: 300,
    });
    await agentDispatchClient.createDispatch(roomName,"Mia");
    const rooms = await roomService.listRooms([roomName]);
    console.log(
      "📝 Room metadata verification:",
      rooms[0]?.metadata?.substring(0, 100)
    );
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: candidate.replace(/\s+/g, "_"),
        name: candidate,
      }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      success: true,
      room_name: roomName,
      token: jwt,
      url: process.env.LIVEKIT_URL,
      candidate,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create mock interview" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const roomName = req.nextUrl.searchParams.get("roomName");
  if (!roomName) {
    return NextResponse.json(
      { error: "Room name is required" },
      { status: 400 }
    );
  }

  await roomService.deleteRoom(roomName);
  return NextResponse.json(
    { message: "Room deleted successfully" },
    { status: 200 }
  );
}

export async function GET() {
  const rooms = await roomService.listRooms();
   const activeRooms =  rooms?.map((room)=>{
      return {
        name: room.name,
      }
    })
  return NextResponse.json(activeRooms || [], { status: 200 });
}
