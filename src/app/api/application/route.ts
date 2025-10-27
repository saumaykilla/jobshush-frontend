import { authenticatedUser, cookieBasedClient } from "@/lib/amplifyServerUtils";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import outputs from "../../../../amplify_outputs.json";
import { Schema } from "../../../../amplify/data/resource";

export async function POST(request: NextRequest) {
  const { resume, jobDescription } = await request.json();

  if (!resume || !jobDescription)
    return NextResponse.json(
      {
        message: "incorrect payload IN FRONTEND",
      },
      {
        status: 500,
      }
    );
    const response = NextResponse.next();
  const session = await authenticatedUser({ request, response });
  if (!session)
    return NextResponse.json(
      {
        message: "Session is missing ",
      },
      {
        status: 500,
      }
    );
  const accessToken = session?.tokens?.accessToken?.toString();
  const userPoolId = outputs.auth.user_pool_id;
  const appId = outputs.auth.user_pool_client_id;
  const aws_region = outputs.auth.aws_region;

  try {
    const request = await axios.post(
      `https://i789yr59o5.execute-api.us-east-2.amazonaws.com/optimize`,
      {
        resume: resume,
        jobDescription: jobDescription,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          userpool_id: userPoolId,
          aws_region: aws_region,
          client_id: appId,
        },
      }
    );
    const data = await request.data;

    return NextResponse.json(
      {
        data,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: error,
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(
      {
        message: "id is missing",
      },
      {
        status: 500,
      }
    );
  const { errors } = await cookieBasedClient.models.Application.delete({
    id: id,
  });
  if (errors)
    return NextResponse.json(
      {
        errors,
      },
      {
        status: 500,
      }
    );
  return NextResponse.json({
    status: 201,
  });
}

export async function GET() {
  const { data, errors } = await cookieBasedClient.models.Application.list({
    selectionSet: ["id", "resumeName", "createdAt", "status","jobDescription"],
  });
  if (errors) {
    return NextResponse.json(
      {
        message: "Error fetching applications",
      },
      {
        status: 500,
      }
    );
  }
  return NextResponse.json(
    {
      data: data,
    },
    {
      status: 200,
    }
  );
}

export async function PUT(req: NextRequest) {
  const payload = await req.json();
  
  if (!payload.id) {
    return NextResponse.json(
      {
        message: "ID payload not received",
      },
      {
        status: 400,
      }
    );
  }

  // Build update parameters - only include fields that are provided
  const updateParams: {
    id: string;
    resume?: Schema['Resume']['type'];
    coverLetter?: string;
    resumeName?: string;
    status?: "Applied" | "Interview" | "Rejected";
  } = {
    id: payload.id,
  };

  // Include each field only if it's provided
  if (payload.resume !== undefined) {
    updateParams.resume = payload.resume;
  }
  if (payload.coverLetter !== undefined) {
    updateParams.coverLetter = payload.coverLetter;
  }
  if (payload.resumeName !== undefined) {
    updateParams.resumeName = payload.resumeName;
  }
  if (payload.status !== undefined) {
    updateParams.status = payload.status;
  }

  console.log("Updating application with params:", updateParams);

  const { errors: updateError } =
    await cookieBasedClient.models.Application.update(updateParams);
    
  if (updateError) {
    console.error("Application update error:", updateError);
    return NextResponse.json(
      {
        error: updateError,
        message: "Failed to update application",
      },
      {
        status: 500,
      }
    );
  } else {
    return NextResponse.json(
      {
        message: "Changes saved successfully",
      },
      {
        status: 201,
      }
    );
  }
}
