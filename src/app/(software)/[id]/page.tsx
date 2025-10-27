import { cookieBasedClient } from "@/lib/amplifyServerUtils";
import { ProfileType } from "@/lib/schemas/ProfileSchema";
import TailoredResume from "@/components/TailoredResume";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ApplicationPageProps {
  params: Promise<{ id: string }>
}

type ApplicationResult = 
  | { success: true; data: { resume: ProfileType; coverLetter: string, fileName: string } }
  | { success: false; error: string };



async function getApplicationById(id: string): Promise<ApplicationResult> {


  try {
    const { data: applicationData, errors } = await cookieBasedClient.models.Application.get({
      id: id,
    });

    if (errors) {
      console.error("Application fetch errors:", errors);
      return { success: false, error: "Failed to fetch application data. Please try again." };
    }

    if (!applicationData) {
      return { success: false, error: "Application not found. It may have been deleted or you don't have access to it." };
    }

    // Transform the resume data to match ProfileType
    const resume: ProfileType = {
      personalDetails: {
        fullName: applicationData.resume?.personalDetails?.fullName || "",
        email: applicationData.resume?.personalDetails?.email || "",
        country: applicationData.resume?.personalDetails?.country || undefined,
        contactNumber: applicationData.resume?.personalDetails?.contactNumber || undefined,
        city: applicationData.resume?.personalDetails?.city || undefined,
      },
      template: (applicationData.resume?.template as "Classic" | "Modern") || "Classic",
      skills: {
        fieldName: applicationData.resume?.skills?.fieldName || "Skills",
        data: applicationData.resume?.skills?.data || undefined,
      },
      roleDetails: {
        summary: applicationData.resume?.roleDetails?.summary || undefined,
        linkedInURL: applicationData.resume?.roleDetails?.linkedInURL || undefined,
        additionalLinks:
          applicationData.resume?.roleDetails?.additionalLinks?.map((item) => ({
            label: item?.label || undefined,
            url: item?.url || undefined,
          })) || undefined,
      },
      education: {
        fieldName: applicationData.resume?.education?.fieldName || "Education",
        lineItem: (applicationData.resume?.education?.lineItem ?? []).map((item) => ({
          institute: item?.institute ?? "",
          degree: item?.degree ?? "",
          location: item?.location ?? "",
          startDate: item?.startDate ? new Date(item.startDate) : undefined,
          endDate: item?.endDate ? new Date(item.endDate) : undefined,
          description: item?.description ?? "",
        })),
      },
      workExperience: {
        fieldName: applicationData.resume?.workExperience?.fieldName || "Work Experience",
        lineItem: (applicationData.resume?.workExperience?.lineItem ?? []).map((item) => ({
          company: item?.company ?? "",
          role: item?.role ?? "",
          location: item?.location ?? "",
          startDate: item?.startDate ? new Date(item.startDate) : undefined,
          endDate: item?.endDate ? new Date(item.endDate) : undefined,
          description: item?.description ?? "",
        })),
      },
      customSections: applicationData.resume?.customSections || [],
      sectionOrder:
        applicationData.resume?.sectionOrder?.filter(
          (item): item is { id: string; type: string; value: string } =>
            item !== null
        ) ?? [],
    };

    return {
      success: true,
      data: {
        resume,
        coverLetter: applicationData.coverLetter || "",
        fileName: applicationData.resumeName || "",
      }
    };
  } catch (error) {
    console.error("Error fetching application:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred while loading the application." 
    };
  }
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const {id} = await params;
  const result = await getApplicationById(id);

  // If successful, render the TailoredResume component
  if (result.success && result.data) {
    const { resume, coverLetter,fileName } = result.data;
    return (
      <>
        <TailoredResume id={id} resume={resume} coverLetter={coverLetter} fileName={fileName} />
      </>
    );
  }

  // If error occurred, show error UI
  const errorMessage = result.success === false ? result.error : "Something went wrong while loading your application.";
  
  return (
    <div className="container mx-auto py-6 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Application Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {errorMessage}
          </p>
          <Link href="/dashboard">
            <Button className="w-full" variant="default">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
