import { NextRequest, NextResponse } from "next/server";
// import { ProfileType } from "@/utils/schemas/profileSchema";
import { cookieBasedClient } from "@/lib/amplifyServerUtils";
import { ProfileType } from "@/lib/schemas/ProfileSchema";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  if (!payload) {
    return NextResponse.json(
      {
        message: " payload not received",
      },
      {
        status: 400,
      }
    );
  }

  const { data: profileData, errors: profileError } =
    await cookieBasedClient.models.Profile.create({
      resume: payload,
      optimizationLimit: 100,
      resetTime: new Date().toISOString(),
    });
  if (profileError) {
    console.log(profileError);
    return NextResponse.json(
      {
        error: profileError,
      },
      {
        status: 500,
      }
    );
  } else {
    return NextResponse.json(
      {
        message: "Success",
        data: profileData,
      },
      {
        status: 201,
      }
    );
  }
}

export async function GET() {
  const { data: profileData, errors: profileError } =
    await cookieBasedClient.models.Profile.list();
  if (profileError) {
    console.log(profileError);
    return NextResponse.json(
      {
        error: profileError,
      },
      {
        status: 500,
      }
    );
  } else {
    const resume = profileData?.[0]?.resume;
    const profile: ProfileType = {
      personalDetails: {
        fullName: resume?.personalDetails?.fullName,
        email: resume?.personalDetails?.email,
        country: resume?.personalDetails?.country || undefined,
        contactNumber: resume?.personalDetails?.contactNumber || undefined,
        city: resume?.personalDetails?.city || undefined,
      },
      template: resume?.template || "Classic",
      skills: {
        fieldName: resume?.skills?.fieldName || "Skills",
        data: resume?.skills?.data || undefined,
      },
      roleDetails: {
        summary: resume?.roleDetails?.summary || undefined,
        linkedInURL: resume?.roleDetails?.linkedInURL || undefined,
        additionalLinks:
          resume?.roleDetails?.additionalLinks?.map((item) => ({
            label: item?.label || undefined,
            url: item?.url || undefined,
          })) || undefined,
      },
      education: {
        fieldName: resume?.education?.fieldName || "Education",
        lineItem: (resume?.education?.lineItem ?? []).map((item) => ({
          institute: item?.institute ?? "",
          degree: item?.degree ?? "",
          location: item?.location ?? "",
          startDate: item?.startDate ? new Date(item.startDate) : undefined,
          endDate: item?.endDate ? new Date(item.endDate) : undefined,
          description: item?.description ?? "",
        })),
      },
      workExperience: {
        fieldName: resume?.workExperience?.fieldName || "Work Experience",
        lineItem: (resume?.workExperience?.lineItem ?? []).map((item) => ({
          company: item?.company ?? "",
          role: item?.role ?? "",
          location: item?.location ?? "",
          startDate: item?.startDate ? new Date(item.startDate) : undefined,
          endDate: item?.endDate ? new Date(item.endDate) : undefined,
          description: item?.description ?? "",
        })),
      },
      customSections: resume?.customSections || [],
      sectionOrder:
        resume?.sectionOrder?.filter(
          (item): item is { id: string; type: string; value: string } =>
            item !== null
        ) ?? [],
    };
    return NextResponse.json(
      {
        message: "Success",
        data: {
          profileID: profileData?.[0]?.id,
          resume: profile,
          optimizationLimit: profileData?.[0]?.optimizationLimit,
        },
      },
      {
        status: 201,
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  const payload = await req.json();
  console.log("PUT /api/profile payload:", payload);

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

  console.log("Processing update for profile ID:", payload.id);
  console.log("Optimization limit to update:", payload.optimizationLimit);

  try {
    // Prepare update parameters based on what's being sent
    const updateParams: { id: string; resume?: ProfileType; optimizationLimit?: number } = {
      id: payload.id,
    };

    // Only include resume if it's provided and not null/undefined
    if (payload.resume !== undefined && payload.resume !== null) {
      updateParams.resume = payload.resume;
    }

    // Always include optimizationLimit if it's provided, even if it's 0
    if (payload.optimizationLimit !== undefined && payload.optimizationLimit !== null && typeof payload.optimizationLimit === 'number') {
      updateParams.optimizationLimit = payload.optimizationLimit;
      console.log("Including optimizationLimit in update:", payload.optimizationLimit);
    } else {
      console.log("No optimizationLimit provided in payload");
    }

    console.log("Update parameters being sent:", updateParams);

    const { data: profileData, errors: profileError } =
      // @ts-expect-error - Type mismatch between schema types, but update works correctly
      await cookieBasedClient.models.Profile.update(updateParams);
    
    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json(
        {
          error: profileError,
          message: "Failed to update profile in database",
        },
        {
          status: 500,
        }
      );
    }
    
    console.log("Profile updated successfully:", profileData);
    const resume = profileData?.resume;
    const profile: ProfileType = {
      personalDetails: {
        fullName: resume?.personalDetails?.fullName || "",
        email: resume?.personalDetails?.email || "",
        country: resume?.personalDetails?.country || undefined,
        contactNumber: resume?.personalDetails?.contactNumber || undefined,
        city: resume?.personalDetails?.city || undefined,
      },
      template: resume?.template || "Classic",
      skills: {
        fieldName: resume?.skills?.fieldName || "Skills",
        data: resume?.skills?.data || undefined,
      },
      roleDetails: {
        summary: resume?.roleDetails?.summary || undefined,
        linkedInURL: resume?.roleDetails?.linkedInURL || undefined,
        additionalLinks:
          resume?.roleDetails?.additionalLinks?.map((item) => ({
            label: item?.label || undefined,
            url: item?.url || undefined,
          })) || undefined,
      },
      education: {
        fieldName: resume?.education?.fieldName || "Education",
        lineItem: (resume?.education?.lineItem ?? []).map((item) => ({
          institute: item?.institute ?? "",
          degree: item?.degree ?? "",
          location: item?.location ?? "",
          startDate: item?.startDate ? new Date(item.startDate) : undefined,
          endDate: item?.endDate ? new Date(item.endDate) : undefined,
          description: item?.description ?? "",
        })),
      },
      workExperience: {
        fieldName: resume?.workExperience?.fieldName || "Work Experience",
        lineItem: (resume?.workExperience?.lineItem ?? []).map((item) => ({
          company: item?.company ?? "",
          role: item?.role ?? "",
          location: item?.location ?? "",
          startDate: item?.startDate ? new Date(item.startDate) : undefined,
          endDate: item?.endDate ? new Date(item.endDate) : undefined,
          description: item?.description ?? "",
        })),
      },
      customSections: resume?.customSections || [],
      sectionOrder:
        resume?.sectionOrder?.filter(
          (item): item is { id: string; type: string; value: string } =>
            item !== null
        ) ?? [],
    };
    return NextResponse.json(
      {
        data: {
          profileID: profileData?.id,
          resume: profile,
          optimizationLimit: profileData?.optimizationLimit,
        },
      },
      {
        status: 201,
      }
    );
    
  } catch (error) {
    console.error("Unexpected error in profile update:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while updating profile",
      },
      {
        status: 500,
      }
    );
  }
}
