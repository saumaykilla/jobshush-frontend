import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import axios from "axios";
import outputs from "../../../../amplify_outputs.json";
import { ProfileType } from "@/lib/schemas/ProfileSchema";
import { authenticatedUser } from "../../../lib/amplifyServerUtils";

export async function POST(request: NextRequest) {
 
  const formData = await request.formData();

  const file = formData.get("file") as File;

  if (!file)
    return NextResponse.json(
      {
        message: "incorrect File Uploaded",
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

  const backendForm = new FormData();
  backendForm.append("file", file);
  try {
    const request = await axios.post(
      `https://awggvl4c36.execute-api.us-east-2.amazonaws.com/extractFromFile`,
      backendForm,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          userpool_id: userPoolId,
          aws_region: aws_region,
          client_id: appId,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const resume: ProfileType = await request.data.resume;
    console.log(resume);
    const profile: Partial<ProfileType> = {
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
          resume?.roleDetails?.additionalLinks?.map(
            (item: { label: string; url: string }) => ({
              label: item?.label || undefined,
              url: item?.url || undefined,
            })
          ) || undefined,
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
    };
    const sectionOrder: ProfileType["sectionOrder"] = [
      { id: nanoid(), type: "PersonalDetails", value: "Personal Details" },
      { id: nanoid(), type: "RoleDetails", value: "Role Details" },
      { id: nanoid(), type: "EducationDetails", value: "Education Details" },
      { id: nanoid(), type: "WorkExperience", value: "Work Experience" },
      { id: nanoid(), type: "Skills", value: "Skills" },
    ];

    // Handle custom sections if present
    if (resume?.customSections && Array.isArray(resume?.customSections)) {
      // Map over custom sections to generate new IDs
      profile.customSections = resume?.customSections.map(
        (section: ProfileType["customSections"]) => {
          const newId = nanoid();

          // Add to sectionOrder
          sectionOrder.push({
            id: newId,
            type: "CustomSection",
            value: section.sectionName,
          });

          // Replace sectionID in original data
          return { ...section, sectionID: newId };
        }
      );
    }

    // Attach sectionOrder to data
    profile.sectionOrder = sectionOrder;
    profile.template = "Classic";
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.log("=== PDF EXTRACTION FAILED ===");
    console.log("Error details:", error);
    console.log(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Failed to extract PDF content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
