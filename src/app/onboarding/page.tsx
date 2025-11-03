"use client";
import React, {
  useState,
} from "react";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { nanoid } from "nanoid";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  ProfileSchema,
  ProfileType,
} from "../../lib/schemas/ProfileSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  uploadData,
  remove as removeStorage,
} from "aws-amplify/storage";
import {
  User,
  Briefcase,
  GraduationCap,
  Building,
  Star,
  Plus,
  Trash2,
  Upload,
  Edit3,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  FormProvider,
  get,
  Resolver,
  useFieldArray,
  useForm,
} from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { UploadZone } from "@/components/ui/upload-zone";
import PersonalDetails from "@/components/resumeComponents/personalDetails";
import RoleDetails from "@/components/resumeComponents/professionalDetails";
import EducationDetails from "@/components/resumeComponents/educationDetails";
import WorkExperience from "@/components/resumeComponents/workDetails";
import Skills from "@/components/resumeComponents/skills";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableItem from "@/components/resumeComponents/draggableItem";
import CustomSection from "@/components/resumeComponents/customSection";
import { DragReorderHandler } from "@/components/dragToReorder";
import { useRouter } from "next/navigation";
import { updateUserAttributes } from "aws-amplify/auth";
import { useProfileStore } from "@/store/profileStore";
import { generateClient } from "aws-amplify/data";
import { Schema } from "../../../amplify/data/resource";

const client =
  generateClient<Schema>(
    {
      authMode:
        "apiKey",

      apiKey:
        process
          .env
          .NEXT_PUBLIC_GRAPH_QL_API_KEY,
    }
  );

const Onboarding =
  () => {
    const [
      currentStep,
      setCurrentStep,
    ] =
      useState(
        0
      );
    const [
      uploadMethod,
      setUploadMethod,
    ] =
      useState<
        | "upload"
        | "manual"
        | null
      >(
        null
      );
    const [
      isProcessing,
      setIsProcessing,
    ] =
      useState(
        false
      );

    const steps =
      [
        {
          id: "method",
          title:
            "Choose Method",
          icon: Upload,
        },
        {
          id: "personal",
          title:
            "Personal Info",
          icon: User,
        },
        {
          id: "role",
          title:
            "Professional Profile",
          icon: Briefcase,
        },
        {
          id: "education",
          title:
            "Education",
          icon: GraduationCap,
        },
        {
          id: "experience",
          title:
            "Work Experience",
          icon: Building,
        },
        {
          id: "skills",
          title:
            "Skills & Sections",
          icon: Star,
        },
      ];
    const currentStepData =
      steps[
        currentStep
      ];
    const progress =
      (currentStep /
        (steps.length -
          1)) *
      100;
    const resolver =
      yupResolver(
        ProfileSchema
      ) as unknown as Resolver<ProfileType>;

    const methods =
      useForm<ProfileType>(
        {
          mode: "all",
          resolver:
            resolver,
          defaultValues:
            {
              template:
                "Classic",
              sectionOrder:
                [
                  {
                    id: nanoid(),
                    type: "PersonalDetails",
                    value:
                      "Personal Details",
                  },
                  {
                    id: nanoid(),
                    type: "RoleDetails",
                    value:
                      "Role Details",
                  },
                  {
                    id: nanoid(),
                    type: "EducationDetails",
                    value:
                      "Education",
                  },
                  {
                    id: nanoid(),
                    type: "WorkExperience",
                    value:
                      "Work Experience",
                  },
                  {
                    id: nanoid(),
                    type: "Skills",
                    value:
                      "Skills",
                  },
                ],
              education:
                {
                  fieldName:
                    "Education",
                  lineItem:
                    [
                      {
                        institute:
                          "",
                        degree:
                          "",
                        location:
                          "",
                        startDate:
                          undefined,
                        endDate:
                          undefined,
                        description:
                          "",
                      },
                    ],
                },
              skills:
                {
                  fieldName:
                    "Skills",
                },
            },
        }
      );
    const {
      fields,
      append,
      remove,
      move,
    } =
      useFieldArray(
        {
          control:
            methods?.control,
          name: "customSections",
        }
      );

    const getNextSectionNumber =
      () => {
        const customSections =
          methods?.watch(
            "customSections"
          ) ||
          [];
        const existingNumbers =
          customSections
            .map(
              (
                section: ProfileType["customSections"][number]
              ) => {
                const match =
                  section.sectionName.match(
                    /Custom Section (\d+)/
                  );
                return match
                  ? parseInt(
                      match[1]
                    )
                  : 0;
              }
            )
            .filter(
              (
                num: number
              ) =>
                num >
                0
            );

        if (
          existingNumbers.length ===
          0
        )
          return 1;

        const maxNumber =
          Math.max(
            ...existingNumbers
          );
        return (
          maxNumber +
          1
        );
      };

    const updateSectionOrder =
      () => {
        const customSections =
          methods?.watch(
            "customSections"
          ) ||
          [];
        const existingSectionOrder =
          methods
            ?.watch()
            ?.sectionOrder?.filter(
              (
                section
              ) =>
                section.type !==
                "CustomSection"
            ) ||
          [];

        const customSectionOrder: ProfileType["sectionOrder"] =
          customSections.map(
            (
              section: ProfileType["customSections"][number]
            ) => ({
              id: section?.sectionID,
              type: "CustomSection",
              value:
                section?.sectionName,
            })
          );

        methods?.setValue(
          "sectionOrder",
          [
            ...existingSectionOrder,
            ...customSectionOrder,
          ]
        );
      };

    const handleEditSection =
      (
        index: number
      ) => {
        setTimeout(
          () => {
            const element =
              document.getElementById(
                `section-name-${index}`
              );
            element?.focus();
          },
          0
        );
      };

    const handleSectionBlur =
      () => {
        // Update sectionOrder when section name changes (after blur)
        updateSectionOrder();
      };

    const handleFileUpload =
      async (
        file: File
      ) => {
        // Validate first, before setting processing state
        if (
          !file
        ) {
          toast.error(
            "No file provided"
          );
          return;
        }

        if (
          file.type !==
          "application/pdf"
        ) {
          toast.error(
            "Please upload a PDF file"
          );
          return;
        }

        if (
          file.size >
          10 *
            1024 *
            1024
        ) {
          toast.error(
            "File size must be less than 10MB"
          );
          return;
        }
        let id;
        setIsProcessing(
          true
        );
        try {
          // Create job record
          const {
            data,
            errors,
          } =
            await client.models.FeedbackPolling.create(
              {
                status:
                  "pending",
              },
              {
                authMode:
                  "apiKey",
              }
            );
          id =
            data?.id;
          if (
            errors ||
            !data?.id
          ) {
            toast.error(
              "Error creating job"
            );
            throw new Error(
              "Error creating job"
            );
          }

          // Upload PDF
          await uploadData(
            {
              data: file,
              path: `pdf/${data.id}.pdf`,
              options:
                {
                  contentType:
                    "application/pdf",
                },
            }
          )
            .result; // Wait for upload to complete

          // Subscribe to updates
          const response =
            await axios.get(
              `/api/extractPDF?id=${data.id}`
            );

          methods?.reset(
            response.data
          );
        } catch (error) {
          console.error(
            error
          );
          toast.error(
            error instanceof
              Error
              ? error.message
              : "Error extracting information from PDF"
          );
        } finally {
          // Clean up subscription
          removeStorage(
            {
              path: `pdf/${id}.pdf`,
            }
          );
          setUploadMethod(
            "manual"
          );
          setCurrentStep(
            currentStep +
              1
          );
          setIsProcessing(
            false
          );
        }
      };
    const sensors =
      useSensors(
        useSensor(
          PointerSensor,
          {
            activationConstraint:
              {
                distance: 8,
              },
          }
        )
      );
    const router =
      useRouter();
    const baseDragHandler =
      DragReorderHandler(
        fields,
        move
      );

    const handleDragDrop =
      async (
        e: DragEndEvent
      ) => {
        await baseDragHandler(
          e
        );
        // Update sectionOrder after drag and drop reordering
        setTimeout(
          () => {
            updateSectionOrder();
          },
          0
        );
      };

    const renderStepContent =
      () => {
        switch (
          currentStep
        ) {
          case 0:
            return (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2>
                    How
                    would
                    you
                    like
                    to
                    create
                    your
                    profile?
                  </h2>
                  <p className="text-muted-foreground">
                    Choose
                    the
                    method
                    that
                    works
                    best
                    for
                    you.
                    You
                    can
                    always
                    edit
                    your
                    information
                    later.
                  </p>
                </div>

                <div className="grid gap-4">
                  <Card
                    className={`${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer transition-all hover:border-primary"} ${
                      uploadMethod ===
                      "upload"
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() =>
                      !isProcessing &&
                      setUploadMethod(
                        "upload"
                      )
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3>
                            Upload
                            PDF
                            Resume
                          </h3>
                          <p className="text-muted-foreground">
                            Upload
                            your
                            existing
                            resume
                            and
                            we&apos;ll
                            extract
                            the
                            information
                            automatically
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer transition-all hover:border-primary"} ${
                      uploadMethod ===
                      "manual"
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() =>
                      !isProcessing &&
                      setUploadMethod(
                        "manual"
                      )
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Edit3 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3>
                            Fill
                            Out
                            Manually
                          </h3>
                          <p className="text-muted-foreground">
                            Enter
                            your
                            information
                            step
                            by
                            step
                            using
                            our
                            guided
                            form
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {uploadMethod ===
                  "upload" && (
                  <Card>
                    <CardContent className="p-6">
                      {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-muted-foreground">
                            Extracting
                            information
                            from
                            your
                            resume...
                          </p>
                        </div>
                      ) : (
                        <UploadZone
                          onFileUpload={
                            handleFileUpload
                          }
                          acceptedTypes=".pdf"
                          maxSize={
                            10
                          }
                          placeholder="Drop your resume PDF here or click to upload"
                          disabled={
                            isProcessing
                          }
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );

          case 1:
            return (
              <div className="space-y-6">
                <div>
                  <h2>
                    Personal
                    Information
                  </h2>
                  <p className="text-muted-foreground">
                    Let&apos;s
                    start
                    with
                    your
                    basic
                    contact
                    information
                  </p>
                </div>
                <PersonalDetails />
              </div>
            );
          case 2:
            return (
              <div className="space-y-6">
                <div>
                  <h2>
                    Professional
                    Profile
                  </h2>
                  <p className="text-muted-foreground">
                    Add
                    your
                    professional
                    summary
                    and
                    links
                  </p>
                </div>
                <RoleDetails />
              </div>
            );
          case 3:
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2>
                      Education
                    </h2>
                    <p className="text-muted-foreground">
                      Add
                      your
                      educational
                      background
                    </p>
                  </div>
                </div>
                <EducationDetails />
              </div>
            );
          case 4:
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2>
                      Work
                      Experience
                    </h2>
                    <p className="text-muted-foreground">
                      Add
                      your
                      Experience
                      background
                    </p>
                  </div>
                </div>
                <WorkExperience />
              </div>
            );
          case 5:
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2>
                      Skills
                      &
                      Additional
                      Sections
                    </h2>
                    <p className="text-muted-foreground">
                      Add
                      your
                      skills
                      and
                      any
                      custom
                      sections
                      you&apos;d
                      like
                      to
                      include
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const nextNumber =
                        getNextSectionNumber();
                      append(
                        {
                          sectionID:
                            nanoid(),
                          sectionName: `Custom Section ${nextNumber}`,
                          lineItems:
                            [
                              {
                                header:
                                  "",
                                subHeader:
                                  "",
                                description:
                                  "",
                              },
                            ],
                        }
                      );
                      // Update sectionOrder after adding new section
                      setTimeout(
                        () => {
                          updateSectionOrder();
                        },
                        0
                      );
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                    Section
                  </Button>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="space-y-4">
                      <Skills />
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4">
                  <DndContext
                    collisionDetection={
                      closestCenter
                    }
                    onDragEnd={
                      handleDragDrop
                    }
                    sensors={
                      sensors
                    }
                  >
                    <SortableContext
                      items={
                        fields
                      }
                      strategy={
                        verticalListSortingStrategy
                      }
                    >
                      {fields?.map(
                        (
                          lineItem,
                          idx
                        ) => {
                          const sectionNames =
                            methods
                              ?.watch(
                                "customSections"
                              )
                              ?.map(
                                (
                                  s: ProfileType["customSections"][number]
                                ) =>
                                  s.sectionName
                              ) ||
                            [];
                          const currentSectionName =
                            methods?.watch(
                              `customSections.${idx}.sectionName`
                            ) ||
                            sectionNames[
                              idx
                            ];
                          const isDuplicate =
                            sectionNames.filter(
                              (
                                name: string
                              ) =>
                                name ===
                                currentSectionName
                            )
                              .length >
                            1;
                          return (
                            <div
                              key={
                                lineItem?.id
                              }
                              className="space-y-4"
                            >
                              <DraggableItem
                                id={
                                  lineItem?.id
                                }
                              >
                                <Card className="w-full">
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
                                          onBlur={
                                            handleSectionBlur
                                          }
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleEditSection(
                                              idx
                                            )
                                          }
                                          className="text-blue-600 hover:text-blue-700 p-2"
                                          title="Focus to Edit Section Name"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                      </div>
                                      {isDuplicate && (
                                        <span className="text-red-500 text-xs text-nowrap mr-4">
                                          Duplicate
                                          section
                                          name
                                        </span>
                                      )}
                                      {get(
                                        methods
                                          ?.formState
                                          ?.errors,
                                        `customSections.${idx}.sectionName.message`
                                      ) && (
                                        <span className="text-red-500 text-xs text-nowrap">
                                          {get(
                                            methods
                                              ?.formState
                                              ?.errors,
                                            `customSections.${idx}.sectionName.message`
                                          )}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          remove(
                                            idx
                                          );
                                          // Update sectionOrder after removing section
                                          setTimeout(
                                            () => {
                                              updateSectionOrder();
                                            },
                                            0
                                          );
                                        }}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Remove Section"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <CustomSection
                                      index={
                                        idx
                                      }
                                    />
                                  </CardContent>
                                </Card>
                              </DraggableItem>
                            </div>
                          );
                        }
                      )}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            );
        }
      };
    const handleNext =
      async () => {
        const {
          trigger,
        } =
          methods;
        let isValid = false;
        switch (
          currentStep
        ) {
          case 0: {
            isValid =
              uploadMethod !==
              null;
            break;
          }
          case 1: {
            isValid =
              await trigger(
                [
                  "personalDetails",
                ]
              );
            break;
          }
          case 2: {
            isValid =
              await trigger(
                [
                  "roleDetails",
                ]
              );
            break;
          }
          case 3: {
            isValid =
              await trigger(
                [
                  "education",
                ]
              );
            break;
          }
          case 4: {
            isValid =
              await trigger(
                [
                  "workExperience",
                ]
              );
            break;
          }
          case 5: {
            isValid =
              await trigger(
                [
                  "skills",
                  "customSections",
                ]
              );
            if (
              isValid
            ) {
              // Ensure sectionOrder is up to date before submission
              setIsProcessing(
                true
              );
              updateSectionOrder();
              const payload =
                {
                  personalDetails:
                    methods?.watch()
                      ?.personalDetails,
                  roleDetails:
                    {
                      ...methods?.watch()
                        ?.roleDetails,
                      linkedInURL:
                        methods?.watch()
                          ?.roleDetails
                          ?.linkedInURL ||
                        undefined,
                    },
                  education:
                    {
                      fieldName:
                        methods?.watch()
                          ?.education
                          ?.fieldName,
                      lineItem:
                        methods
                          ?.watch()
                          ?.education?.lineItem?.map(
                            (
                              items
                            ) => ({
                              ...items,
                              startDate:
                                items?.startDate
                                  ? new Date(
                                      items.startDate
                                    ).toISOString()
                                  : "",
                              endDate:
                                items?.endDate
                                  ? new Date(
                                      items.endDate
                                    ).toISOString()
                                  : undefined,
                            })
                          ) ??
                        [],
                    },

                  skills:
                    {
                      ...methods?.watch()
                        ?.skills,
                      fieldName:
                        "Skills",
                    },
                  workExperience:
                    {
                      fieldName:
                        "Work Experience",
                      lineItem:
                        methods
                          ?.watch()
                          ?.workExperience?.lineItem?.map(
                            (
                              items
                            ) => ({
                              ...items,
                              startDate:
                                items?.startDate
                                  ? new Date(
                                      items.startDate
                                    ).toISOString()
                                  : "",
                              endDate:
                                items?.endDate
                                  ? new Date(
                                      items.endDate
                                    ).toISOString()
                                  : undefined,
                            })
                          ) ??
                        [],
                    },
                  sectionOrder:
                    methods?.watch()
                      ?.sectionOrder,
                  customSections:
                    methods?.watch()
                      ?.customSections,
                  template:
                    methods?.watch()
                      ?.template as
                      | "Classic"
                      | "Modern",
                };
              try {
                const response =
                  await axios.post(
                    "/api/profile",
                    payload
                  );
                if (
                  response.status !==
                  201
                ) {
                  throw new Error(
                    response.data.message
                  );
                }
                const profileData =
                  response
                    .data
                    .data;
                useProfileStore.setState(
                  {
                    profile:
                      methods?.watch(),
                    optimizationLimit:
                      profileData?.optimizationLimit,
                    profileID:
                      profileData?.id,
                  }
                );
                await updateUserAttributes(
                  {
                    userAttributes:
                      {
                        "custom:isOnboarded":
                          "true",
                      },
                  }
                );
                toast.success(
                  "Profile created successfully"
                );
                router.push(
                  "/dashboard"
                );
              } catch (error) {
                console.error(
                  error
                );
                toast.error(
                  "Error creating profile"
                );
                setIsProcessing(
                  false
                );
              }
            }
            break;
          }
          default: {
            isValid = true;
          }
        }
        if (
          currentStep <
            steps.length -
              1 &&
          isValid
        ) {
          setCurrentStep(
            currentStep +
              1
          );
        }
      };

    const handlePrevious =
      () => {
        if (
          currentStep >
          0
        ) {
          setCurrentStep(
            currentStep -
              1
          );
        }
      };
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1>
                Profile
                Setup
              </h1>
              <p className="text-muted-foreground">
                Complete
                your
                profile
                to
                get
                started
                with
                Excelify
              </p>
            </div>
            <Badge variant="outline">
              {currentStep +
                1}{" "}
              of{" "}
              {
                steps.length
              }
            </Badge>
          </div>

          <div className="space-y-4">
            <Progress
              value={
                progress
              }
              className="w-full"
            />

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <currentStepData.icon className="w-4 h-4" />
                <span>
                  {
                    currentStepData.title
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <FormProvider
              {...methods}
            >
              {renderStepContent()}
            </FormProvider>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={
              handlePrevious
            }
            disabled={
              currentStep ===
                0 ||
              isProcessing
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep ===
            0
              ? "Cancel"
              : "Previous"}
          </Button>

          <Button
            onClick={
              handleNext
            }
            disabled={
              uploadMethod ===
                null ||
              uploadMethod ===
                "upload" ||
              isProcessing
            }
          >
            {currentStep ===
            steps.length -
              1 ? (
              isProcessing ? (
                <>
                  <div className="w-4 h-4 flex items-center gap-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  <p className="text-sm text-muted-foreground">
                    Creating
                    Profile...
                  </p>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Complete
                  Setup
                </>
              )
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

export default Onboarding;
