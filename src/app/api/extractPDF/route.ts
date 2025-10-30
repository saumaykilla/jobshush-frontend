import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ProfileType } from "@/lib/schemas/ProfileSchema";
import { cookieBasedClient } from "../../../lib/amplifyServerUtils";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id)
    return NextResponse.json(
      {
        message: "incorrect id",
      },
      {
        status: 500,
      }
    );

  try {
    // Poll every 10 seconds with a maximum timeout
    const maxAttempts = 24; // 2 minutes max (24 * 5 seconds)
    let attempts = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pollForCompletion = async (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
          attempts++;

          try {
            const { data, errors } = await cookieBasedClient.models.FeedbackPolling.get(
              {
                id: id,
              },
              {
                authMode: "apiKey",
                authToken: 'da2-rtzretrwqrhcfd3fbhnm22mibe'
              }
            );

            if (errors) {
              clearInterval(intervalId);
              reject(new Error("Error fetching polling data"));
              return;
            }

            // Check if status has changed from pending
            if (data?.status === "success") {
              clearInterval(intervalId);
              resolve(data.data);
              return;
            }

            if (data?.status === "failed" || data?.status === "error") {
              clearInterval(intervalId);
              reject(new Error("PDF processing failed"));
              return;
            }

            // Check max attempts
            if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              reject(new Error("Processing timeout - max attempts reached"));
              return;
            }

            console.log(`Polling attempt ${attempts}/${maxAttempts}, status: ${data?.status}`);
            
          } catch (error) {
            clearInterval(intervalId);
            reject(error);
          }
        }, 5000); // Poll every 10 seconds
      });
    };

    // Wait for polling to complete
    const pollingResult = await pollForCompletion();

    // Extract resume data from the polling result

    console.log(JSON.parse(pollingResult));
    const resume: ProfileType = JSON.parse(pollingResult);

    if (!resume) {
      return NextResponse.json(
        {
          error: "No resume data found in successful response",
        },
        { status: 500 }
      );
    }

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