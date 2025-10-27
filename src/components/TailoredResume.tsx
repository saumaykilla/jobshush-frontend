"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { ProfileType } from "@/lib/schemas/ProfileSchema";
import { FormProvider, get, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProfileSchema } from "@/lib/schemas/ProfileSchema";
import { Resolver } from "react-hook-form";
import PersonalDetails from "@/components/resumeComponents/personalDetails";
import RoleDetails from "@/components/resumeComponents/professionalDetails";
import WorkExperience from "@/components/resumeComponents/workDetails";
import Skills from "@/components/resumeComponents/skills";
import EducationDetails from "@/components/resumeComponents/educationDetails";
import CustomSection from "@/components/resumeComponents/customSection";
import PDFViewer from "@/components/PDFViewer";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Building,
  Edit3,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Editor from "./ui/rich-text/editor";
import axios from "axios";
import { toast } from "sonner";
import SectionReordering from "./resumeComponents/sectionReordering";

interface TailoredResumeProps {
  resume: ProfileType;
  coverLetter: string;
  id: string;
  fileName: string;
}

const TailoredResume: React.FC<TailoredResumeProps> = ({
  resume,
  coverLetter,
  fileName,
  id,
}) => {
  const resolver = useMemo(
    () => yupResolver(ProfileSchema) as unknown as Resolver<ProfileType>,
    []
  );
  const resumeMethods = useForm<ProfileType>({
    mode: "all",
    resolver: resolver,
    defaultValues: resume,
  });
  const coverLetterMethods = useForm<{ coverLetter: string; fileName: string }>(
    {
      mode: "all",
      defaultValues: { coverLetter: coverLetter, fileName: fileName },
    }
  );

  const { fields, append, remove } = useFieldArray({
    control: resumeMethods?.control,
    name: "customSections",
  });

  const getNextSectionNumber = useCallback(() => {
    const customSections = resumeMethods?.watch("customSections") || [];
    const existingNumbers = customSections
      .map((section: ProfileType["customSections"][number]) => {
        const match = section.sectionName.match(/Custom Section (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num: number) => num > 0);

    if (existingNumbers.length === 0) return 1;

    const maxNumber = Math.max(...existingNumbers);
    return maxNumber + 1;
  }, [resumeMethods]);

  const updateSectionOrder = useCallback(() => {
    const customSections = resumeMethods?.watch("customSections") || [];
    const existingSectionOrder =
      resumeMethods
        ?.watch()
        ?.sectionOrder?.filter((section) => section.type !== "CustomSection") ||
      [];

    const customSectionOrder: ProfileType["sectionOrder"] = customSections.map(
      (section: ProfileType["customSections"][number]) => ({
        id: section?.sectionID,
        type: "CustomSection" as const,
        value: section?.sectionName,
      })
    );

    resumeMethods?.setValue("sectionOrder", [
      ...existingSectionOrder,
      ...customSectionOrder,
    ]);
  }, [resumeMethods]);

  const handleEditSection = useCallback((index: number) => {
    setTimeout(() => {
      const element = document.getElementById(`section-name-${index}`);
      element?.focus();
    }, 0);
  }, []);

  const handleSectionBlur = useCallback(() => {
    // Update sectionOrder when section name changes (after blur)
    updateSectionOrder();
  }, [updateSectionOrder]);

  const [selectedTab, setSelectedTab] = useState<"resume" | "cover-letter">(
    "resume"
  );
  const [debouncedResume, setDebouncedResume] = useState<
    ProfileType | undefined
  >(undefined);
  const [debouncedCoverLetter, setDebouncedCoverLetter] = useState<
    string | undefined
  >(undefined);
  const resumeWatchedData = resumeMethods.watch();
  const coverLetterWatchedData = coverLetterMethods.watch();

  // Use already watched data to avoid multiple watch calls
  const watchedPersonalDetails = resumeWatchedData.personalDetails;
  const watchedRoleDetails = resumeWatchedData.roleDetails;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResume(resumeWatchedData);
    }, 500);

    return () => clearTimeout(timer);
  }, [resumeWatchedData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCoverLetter(coverLetterWatchedData.coverLetter);
    }, 500);

    return () => clearTimeout(timer);
  }, [coverLetterWatchedData.coverLetter]);

  const coverLetterBlobUrl = usePDFGenerator({
    coverLetter: {
      coverLetter: debouncedCoverLetter || "",
      personalDetails: watchedPersonalDetails,
      roleDetails: watchedRoleDetails,
    },
  });

  const resumeBlobUrl = usePDFGenerator({
    resume: debouncedResume,
  });

  useEffect(() => {
    resumeMethods.reset(resume);
  }, [resume, resumeMethods]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveProfile = useCallback(async () => {
    setIsProcessing(true);

    const isValidResume = await resumeMethods?.trigger();
    const isValidCoverLetter = await coverLetterMethods?.trigger();

    if (isValidResume && isValidCoverLetter) {
      // Get all form data once to avoid multiple watch() calls
      const formData = resumeMethods?.watch();
      const coverLetterData = coverLetterMethods?.watch();

      if (!formData) return;

      const resumePayload = {
        personalDetails: formData.personalDetails,
        roleDetails: {
          ...formData.roleDetails,
          linkedInURL: formData.roleDetails?.linkedInURL || undefined,
        },
        education: {
          fieldName: formData.education?.fieldName,
          lineItem:
            formData.education?.lineItem?.map((items) => ({
              ...items,
              startDate: items?.startDate
                ? new Date(items.startDate).toISOString()
                : "",
              endDate: items?.endDate
                ? new Date(items.endDate).toISOString()
                : undefined,
            })) ?? [],
        },

        skills: {
          ...formData.skills,
          fieldName: "Skills",
        },
        workExperience: {
          fieldName: "Work Experience",
          lineItem:
            formData.workExperience?.lineItem?.map((items) => ({
              ...items,
              startDate: items?.startDate
                ? new Date(items.startDate).toISOString()
                : "",
              endDate: items?.endDate
                ? new Date(items.endDate).toISOString()
                : undefined,
            })) ?? [],
        },
        sectionOrder: formData.sectionOrder,
        customSections: formData.customSections,
        template: formData.template as "Classic" | "Modern",
      };
      const coverLetterPayload = coverLetterData?.coverLetter;
      const resumeName = coverLetterData?.fileName;
      try {
        const response = await axios.put("/api/application", {
          id: id,
          resume: resumePayload,
          coverLetter: coverLetterPayload,
          resumeName:resumeName
        });

        if (response.status !== 201) {
          throw new Error(response.data.message);
        }
        toast.success("Changes updated successfully");
      } catch (error) {
        console.error(error);
        toast.error("Error saving changes ");
      } finally {
        setIsProcessing(false);
      }
    }
  }, [resumeMethods, coverLetterMethods, id]);

  const handleAddCustomSection = useCallback(() => {
    const nextNumber = getNextSectionNumber();
    append({
      sectionID: nanoid(),
      sectionName: `Custom Section ${nextNumber}`,
      lineItems: [
        {
          header: "",
          subHeader: "",
          description: "",
        },
      ],
    });
    // Update sectionOrder after adding new section
    setTimeout(() => {
      updateSectionOrder();
    }, 0);
  }, [getNextSectionNumber, append, updateSectionOrder]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 no-scrollbar">
      {/* Left Side - Content */}
      <div className="flex-1 pb-6 space-y-6 lg:overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <div>
            <h2>Tailored Resume & Cover Letter</h2>
            <p className="text-muted-foreground">
              View and customize your application materials
            </p>
          </div>
          <div className="flex  gap-2 flex-col-reverse">
            {selectedTab === "resume" && (
              <Button
                onClick={handleAddCustomSection}
                type="button"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Section
              </Button>
            )}
            <Button onClick={handleSaveProfile} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="resume"
              onClick={() => setSelectedTab("resume")}
            >
              Resume
            </TabsTrigger>
            <TabsTrigger
              value="cover-letter"
              onClick={() => setSelectedTab("cover-letter")}
            >
              Cover Letter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-4">
            <FormProvider {...resumeMethods}>
              <div className="space-y-4 pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="File Name"
                        {...coverLetterMethods?.register("fileName", { required: true })}
                      />
                      {coverLetterMethods?.formState?.errors?.fileName && (
                        <span className="text-red-500 text-xs text-nowrap">
                          File Name is required
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Resume Template & Section Order
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop to reorder sections in your resume (first 2
                      sections are locked)
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <SectionReordering />
                  </CardContent>
                </Card>

                {/* Personal Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PersonalDetails />
                  </CardContent>
                </Card>

                {/* Professional Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Professional Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RoleDetails />
                  </CardContent>
                </Card>

                {/* Work Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Work Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <WorkExperience />
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <EducationDetails />
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skills />
                  </CardContent>
                </Card>

                {/* Custom Sections */}
                {fields?.map((lineItem, idx) => {
                  const sectionNames =
                    resumeMethods
                      ?.watch("customSections")
                      ?.map(
                        (s: ProfileType["customSections"][number]) =>
                          s.sectionName
                      ) || [];
                  const currentSectionName =
                    resumeMethods?.watch(`customSections.${idx}.sectionName`) ||
                    sectionNames[idx];
                  const isDuplicate =
                    sectionNames.filter(
                      (name: string) => name === currentSectionName
                    ).length > 1;
                  return (
                    <Card key={lineItem.id} className="w-full">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center w-full space-x-3">
                          <div className="flex-1 flex items-center space-x-2">
                            <Input
                              type="text"
                              placeholder="Section Name"
                              className="flex-1"
                              {...resumeMethods?.register(
                                `customSections.${idx}.sectionName`
                              )}
                              id={`section-name-${idx}`}
                              onBlur={handleSectionBlur}
                            />
                            <button
                              type="button"
                              onClick={() => handleEditSection(idx)}
                              className="text-blue-600 hover:text-blue-700 p-2"
                              title="Focus to Edit Section Name"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                          {isDuplicate && (
                            <span className="text-red-500 text-xs text-nowrap mr-4">
                              Duplicate section name
                            </span>
                          )}
                          {get(
                            resumeMethods?.formState?.errors,
                            `customSections.${idx}.sectionName.message`
                          ) && (
                            <span className="text-red-500 text-xs text-nowrap">
                              {get(
                                resumeMethods?.formState?.errors,
                                `customSections.${idx}.sectionName.message`
                              )}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              remove(idx);
                              // Update sectionOrder after removing section
                              setTimeout(() => {
                                updateSectionOrder();
                              }, 0);
                            }}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Remove Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <CustomSection index={idx} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </FormProvider>
          </TabsContent>

          <TabsContent value="cover-letter" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormProvider {...coverLetterMethods}>
                  <div>
                    <Editor
                      placeholder="Write your summary here..."
                      content={coverLetterMethods?.watch()?.coverLetter}
                      onChange={(value: string) => {
                        coverLetterMethods?.setValue("coverLetter", value);
                      }}
                    />
                  </div>
                </FormProvider>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Side - Resume Preview */}
      <div className="hidden lg:flex lg:flex-1 lg:sticky lg:top-6 min-h-[calc(100vh-100px)]">
        <PDFViewer
          file={selectedTab === "resume" ? resumeBlobUrl : coverLetterBlobUrl}
          fileName={coverLetterMethods?.getValues("fileName") || "Documet"}
        />
      </div>
    </div>
  );
};

export default React.memo(TailoredResume);
