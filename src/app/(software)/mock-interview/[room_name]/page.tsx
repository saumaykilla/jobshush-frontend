"use client";
import Agent from "@/components/Agent";
import { useParams, useSearchParams } from "next/navigation";
import React, {  } from "react";

const InterviewPanel = () => {
  const { room_name } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="flex flex-col h-full w-full">
      <Agent roomName={room_name as string} token={token as string} />
    </div>
  );
};

export default InterviewPanel;
