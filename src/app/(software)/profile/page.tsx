"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useProfileStore } from "@/store/profileStore";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building,
  Edit3,
  FileText,
  GraduationCap,
  Plus,
  Save,
  Star,
  Trash2,
  User,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSchema, ProfileType } from "@/lib/schemas/ProfileSchema";
import { FormProvider, get, Resolver, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import PersonalDetails from "@/components/resumeComponents/personalDetails";
import RoleDetails from "@/components/resumeComponents/professionalDetails";
import WorkExperience from "@/components/resumeComponents/workDetails";
import Skills from "@/components/resumeComponents/skills";
import EducationDetails from "@/components/resumeComponents/educationDetails";
import CustomSection from "@/components/resumeComponents/customSection";
import { Input } from "@/components/ui/input";
import PDFViewer from "@/components/PDFViewer";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import SectionReordering from "@/components/resumeComponents/sectionReordering";



const Profile = () => {
  const { profile, profileID } = useProfileStore();
  const resolver = useMemo(
    () => yupResolver(ProfileSchema) as unknown as Resolver<ProfileType>,
    []
  );
  const methods = useForm<ProfileType>({
    mode: "all",
    resolver: resolver,
  });
  const { fields, append, remove } = useFieldArray({
    control: methods?.control,
    name: "customSections",
  });

  const [debouncedResume, setDebouncedResume] = useState<
    ProfileType | undefined
  >(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  const watchedData = methods.watch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResume(watchedData);
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedData]);

  const blobUrl = usePDFGenerator({
    resume: debouncedResume,
  });
  const getNextSectionNumber = useCallback(() => {
    const customSections = watchedData?.customSections || [];
    const existingNumbers = customSections
      .map((section: ProfileType["customSections"][number]) => {
        const match = section.sectionName.match(/Custom Section (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num: number) => num > 0);

    if (existingNumbers.length === 0) return 1;

    const maxNumber = Math.max(...existingNumbers);
    return maxNumber + 1;
  }, [watchedData]);

  const updateSectionOrder = useCallback(() => {
    const customSections = watchedData?.customSections || [];
    const existingSectionOrder =
      watchedData?.sectionOrder?.filter(
        (section) => section.type !== "CustomSection"
      ) || [];

    const customSectionOrder: ProfileType["sectionOrder"] = customSections.map(
      (section: ProfileType["customSections"][number]) => ({
        id: section?.sectionID,
        type: "CustomSection" as const,
        value: section?.sectionName,
      })
    );

    methods?.setValue("sectionOrder", [
      ...existingSectionOrder,
      ...customSectionOrder,
    ]);
  }, [methods, watchedData]);

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


  const handleSaveProfile = useCallback(async () => {
    setIsProcessing(true);

    const isValid = await methods?.trigger();
    if (isValid) {
      // Get all form data once to avoid multiple watch() calls
      const formData = methods?.watch();

      if (!formData) return;

      const payload = {
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
      try {
        const response = await axios.put("/api/profile", {
          id: profileID,
          resume: payload,
          optimizationLimit: useProfileStore.getState().optimizationLimit,
        });
        const optimizationLimit = useProfileStore.getState().optimizationLimit;
        useProfileStore.setState({
          profileID: response.data.data?.profileID,
          profile: response.data.data?.resume,
          optimizationLimit: optimizationLimit,
        });
        if (response.status !== 201) {
          throw new Error(response.data.message);
        }
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error(error);
        toast.error("Error creating profile");
      } finally {
        setIsProcessing(false);
      }
    }
  }, [methods, profileID]);
  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axios.get("/api/profile");
      useProfileStore.setState({
        profile: response.data.data?.resume,
        optimizationLimit: response.data.data?.optimizationLimit,
      });
    };
    if (!profile) {
      console.log("fetching profile");
      fetchProfile();
    }
    methods.reset(profile);
  }, [profile, methods]);

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
    <div className="h-full  flex flex-col lg:flex-row gap-6 no-scrollbar">
      {/* Left Side - Editable Form */}
      <div className="flex-1 pb-6 space-y-6 lg:overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <div>
            <h2>Edit Profile</h2>
            <p className="text-muted-foreground">
              Update your information and see live preview
            </p>
          </div>
          <div className="flex  gap-2 flex-col-reverse">
            <Button
              onClick={handleAddCustomSection}
              type="button"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Section
            </Button>
            <Button disabled={isProcessing} onClick={handleSaveProfile}>
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Profile
            </Button>
          </div>
        </div>
        <FormProvider {...methods}>
          <div className="space-y-4 pr-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume Template & Section Order
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag and drop to reorder sections in your resume 
                </p>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Work Experience
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <WorkExperience />
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                </div>
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

            {fields?.map((lineItem, idx) => {
              const sectionNames =
                watchedData?.customSections?.map(
                  (s: ProfileType["customSections"][number]) => s.sectionName
                ) || [];
              const currentSectionName =
                watchedData?.customSections?.[idx]?.sectionName ||
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
                          {...methods?.register(
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
                        methods?.formState?.errors,
                        `customSections.${idx}.sectionName.message`
                      ) && (
                        <span className="text-red-500 text-xs text-nowrap">
                          {get(
                            methods?.formState?.errors,
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
      </div>
      {/* Right Side - Resume Preview */}
      <div className="hidden lg:flex lg:flex-1 lg:sticky lg:top-6 min-h-[calc(100vh-100px)]  ">
        <PDFViewer
          file={blobUrl}
          fileName={watchedData?.template || "Resume"}
        />
      </div>
    </div>
  );
};

export default React.memo(Profile);
