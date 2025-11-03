"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useProfileStore } from "@/store/profileStore";
import axios from "axios";
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Eye,
  MessageSquare,
  Play,
  Star,
  Trash2,
  TrendingUp,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { fetchAuthSession } from "aws-amplify/auth";

import { Schema } from "../../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MockInterviewApplicationType =
  {
    id: string;
    resumeName: string;
    createdAt: string;
    status:
      | "Applied"
      | "Interview"
      | "Rejected";
    jobDescription: string;
  };
const client =
  generateClient<Schema>(
    {
      apiKey:
        process
          .env
          .NEXT_PUBLIC_GRAPH_QL_API_KEY,
      authMode:
        "apiKey",
    }
  );
const MockInterviewSetup =
  () => {
    const {
      profile,
    } =
      useProfileStore();
    const [
      activeTab,
      setActiveTab,
    ] =
      useState(
        "new-session"
      );
    const [
      customJobDescription,
      setCustomJobDescription,
    ] =
      useState(
        ""
      );
    const [
      jobSourceType,
      setJobSourceType,
    ] =
      useState(
        "application"
      );
    const [
      selectedApplication,
      setSelectedApplication,
    ] =
      useState<string>(
        ""
      );
    const [
      applications,
      setApplications,
    ] =
      useState<
        MockInterviewApplicationType[]
      >(
        []
      );
    const [
      loading,
      setLoading,
    ] =
      useState(
        true
      );
    const [
      startPracticeLoading,
      setStartPracticeLoading,
    ] =
      useState(
        false
      );
    const [
      MockInterviewFeedback,
      setMockInterviewFeedback,
    ] =
      useState<
        Schema["MockInterviewFeedback"]["type"][]
      >();
    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let createSubcription: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updateSubscription: any;
      const fetchApplications =
        async () => {
          try {
            const session =
              await fetchAuthSession();
            const user =
              session?.userSub;

            if (
              !user
            ) {
              toast.error(
                "User not authenticated"
              );
              setLoading(
                false
              );
              return;
            }

            console.log(
              "User ID:",
              user
            );

            // Fetch applications
            const response =
              await axios.get(
                `/api/application`
              );
            const responseData =
              response
                .data
                .data;
            setApplications(
              responseData
            );
            const {
              data: intitalData,
            } =
              await client.models.MockInterviewFeedback.list(
                {
                  filter:
                    {
                      userId:
                        {
                          eq: user,
                        },
                    },
                }
              );
            setMockInterviewFeedback(
              intitalData
            );
            createSubcription =
              client.models.MockInterviewFeedback.onCreate(
                {
                  filter:
                    {
                      userId:
                        {
                          eq: user,
                        },
                    },
                  authMode:
                    "apiKey",
                }
              ).subscribe(
                {
                  next: async () => {
                    console.log(
                      "create triggered"
                    );
                    const {
                      data,
                    } =
                      await client.models.MockInterviewFeedback.list(
                        {
                          filter:
                            {
                              userId:
                                {
                                  eq: user,
                                },
                            },
                        }
                      );
                    setMockInterviewFeedback(
                      data
                    );
                    return; // guard against null payload
                  },
                  error:
                    (
                      error
                    ) => {
                      console.log(
                        error
                      );
                    },
                  complete:
                    () =>
                      console.log(
                        "Subscription complete"
                      ),
                }
              );

            updateSubscription =
              client.models.MockInterviewFeedback.onUpdate(
                {
                  authMode:
                    "apiKey",
                }
              ).subscribe(
                {
                  next: async () => {
                    console.log(
                      "update triggered"
                    );
                    const {
                      data,
                    } =
                      await client.models.MockInterviewFeedback.list(
                        {
                          filter:
                            {
                              userId:
                                {
                                  eq: user,
                                },
                            },
                        }
                      );
                    setMockInterviewFeedback(
                      data
                    );
                    return; // guard against null payload
                  },
                  error:
                    (
                      error
                    ) => {
                      console.log(
                        error
                      );
                    },
                  complete:
                    () =>
                      console.log(
                        "Subscription complete"
                      ),
                }
              );

            setLoading(
              false
            );
          } catch (error) {
            toast.error(
              "Error fetching applications"
            );
            console.error(
              "Error:",
              error
            );
            setLoading(
              false
            );
          }
        };

      fetchApplications();
      return () => {
        if (
          createSubcription
        ) {
          createSubcription.unsubscribe();
        }
        if (
          updateSubscription
        ) {
          updateSubscription.unsubscribe();
        }
      };
    }, []);

    const [
      feedbackModalOpen,
      setFeedbackModalOpen,
    ] =
      useState<boolean>(
        false
      );

    const router =
      useRouter();
    const handleStartPractice =
      async () => {
        setStartPracticeLoading(
          true
        );
        const jobDescription =
          jobSourceType ===
          "application"
            ? applications.find(
                (
                  app
                ) =>
                  app.id ===
                  selectedApplication
              )
                ?.jobDescription
            : customJobDescription;
        const payload =
          {
            job: jobDescription,
            candidate:
              profile
                ?.personalDetails
                ?.fullName,
            resume:
              profile,
          };
        try {
          const response =
            await axios.post(
              `/api/mock-interview`,
              payload
            );
          const data =
            await response.data;
          router.push(
            `/mock-interview/${data.room_name}?token=${data.token}`
          );
        } catch (error) {
          console.log(
            "Error",
            error
          );
          toast.error(
            "Error starting mock interview session"
          );
          setStartPracticeLoading(
            false
          );
        }
      };
    const [
      currentFeedbackData,
      setCurrentFeedbackData,
    ] =
      useState<
        Schema["MockInterviewFeedback"]["type"]
      >();
    const formatDuration =
      (
        seconds: number
      ) => {
        const mins =
          Math.floor(
            seconds /
              60
          );
        const secs =
          seconds %
          60;
        return `${mins}m ${secs}s`;
      };

    const getScoreColor =
      (
        score: number
      ) => {
        if (
          score >=
          80
        )
          return "text-green-400";
        if (
          score >=
          60
        )
          return "text-yellow-400";
        return "text-red-400";
      };

    const getScoreLabel =
      (
        score: number
      ) => {
        if (
          score >=
          80
        )
          return "Excellent";
        if (
          score >=
          60
        )
          return "Good";
        if (
          score >=
          40
        )
          return "Fair";
        return "Needs Work";
      };
    return (
      <>
        {loading ? (
          <div className="absolute  top-0 left-0 z-100 h-full w-full flex items-center justify-center">
            <Loading message="Preparing your interview session..." />
          </div>
        ) : (
          <div className="flex flex-col h-full w-full gap-6 no-scrollbar">
            <div>
              <h2>
                AI
                Mock
                Interview
              </h2>
              <p className="text-muted-foreground mt-1">
                Practice
                with
                AI
                Voice
                Agent,
                get
                feedback
                and
                improve
                your
                interview
                skills
              </p>
            </div>
            <Tabs
              value={
                activeTab
              }
              onValueChange={
                setActiveTab
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new-session">
                  New
                  Session
                </TabsTrigger>
                <TabsTrigger value="previous-feedback">
                  Previous
                  Feedback
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent
                  value="new-session"
                  className="mt-0 space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Setup
                        Interview
                        Session
                      </CardTitle>
                      <CardDescription>
                        Choose
                        your
                        interview
                        type
                        and
                        job
                        details
                        for
                        personalized
                        questions
                        and
                        feedback
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Job Source Selection */}
                      <div>
                        <label className="text-sm mb-3 block">
                          Job
                          Information
                          Source
                        </label>
                        <RadioGroup
                          value={
                            jobSourceType
                          }
                          onValueChange={
                            setJobSourceType
                          }
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem
                              value="application"
                              id="application"
                            />
                            <Label
                              htmlFor="application"
                              className="cursor-pointer"
                            >
                              Select
                              from
                              my
                              applications
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="custom"
                              id="custom"
                            />
                            <Label
                              htmlFor="custom"
                              className="cursor-pointer"
                            >
                              Provide
                              new
                              job
                              description
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Application Selection */}
                      {jobSourceType ===
                        "application" && (
                        <div>
                          <label
                            htmlFor="application-select"
                            className="text-sm mb-2 block"
                          >
                            Select
                            Application
                          </label>
                          <Select
                            value={
                              selectedApplication
                            }
                            onValueChange={
                              setSelectedApplication
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an application" />
                            </SelectTrigger>
                            <SelectContent className="no-scrollbar">
                              {applications?.length >
                              0 ? (
                                applications.map(
                                  (
                                    app
                                  ) => (
                                    <SelectItem
                                      key={
                                        app.id
                                      }
                                      value={
                                        app.id
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        <Briefcase className="w-3 h-3" />
                                        <span>
                                          {
                                            app.resumeName
                                          }
                                        </span>
                                      </div>
                                    </SelectItem>
                                  )
                                )
                              ) : (
                                <p className="text-xs p-2 font-extralight text-accent text-center">
                                  No
                                  Application
                                  Found
                                </p>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Custom Job Description */}
                      {jobSourceType ===
                        "custom" && (
                        <div>
                          <label
                            htmlFor="job-description"
                            className="text-sm mb-2 block"
                          >
                            Job
                            Description
                          </label>
                          <Textarea
                            id="job-description"
                            value={
                              customJobDescription
                            }
                            onChange={(
                              e
                            ) =>
                              setCustomJobDescription(
                                e
                                  .target
                                  .value
                              )
                            }
                            placeholder="Paste the job description here including responsibilities, requirements, and qualifications..."
                            className="min-h-[120px]"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            The
                            AI
                            will
                            generate
                            relevant
                            interview
                            questions
                            based
                            on
                            this
                            description
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={
                          handleStartPractice
                        }
                        disabled={
                          startPracticeLoading ||
                          (jobSourceType ===
                            "application" &&
                            !selectedApplication) ||
                          (jobSourceType ===
                            "custom" &&
                            !customJobDescription.trim())
                        }
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                        Interview
                        Session
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="previous-feedback"
                  className="mt-0 space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Interview
                        History
                      </CardTitle>
                      <CardDescription>
                        Review
                        your
                        past
                        interview
                        sessions
                        and
                        track
                        your
                        progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {MockInterviewFeedback?.length ===
                      0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>
                            No
                            previous
                            interview
                            sessions
                            yet.
                          </p>
                          <p className="text-sm mt-1">
                            Complete
                            your
                            first
                            mock
                            interview
                            to
                            see
                            feedback
                            here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {MockInterviewFeedback?.map(
                            (
                              session
                            ) => (
                              <Card
                                key={
                                  session.id
                                }
                                className="overflow-hidden"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                      <div>
                                        <h4 className="font-medium">
                                          {
                                            session?.companyName
                                          }
                                        </h4>
                                      </div>

                                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(
                                            session?.createdAt
                                          ).toLocaleDateString()}
                                        </div>

                                        {session
                                          ?.feedback
                                          ?.duration && (
                                          <div className="flex items-center gap-1">
                                            <Video className="w-3 h-3" />
                                            {
                                              session
                                                ?.feedback
                                                ?.duration
                                            }
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {session
                                          ?.feedback
                                          ?.overallScore && (
                                          <Badge
                                            className={
                                              session
                                                ?.feedback
                                                ?.overallScore >=
                                              80
                                                ? "bg-green-600 text-white"
                                                : session
                                                      ?.feedback
                                                      ?.overallScore >=
                                                    60
                                                  ? "bg-yellow-600 text-white"
                                                  : "bg-red-600 text-white"
                                            }
                                          >
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Score:
                                            {
                                              session
                                                ?.feedback
                                                ?.overallScore
                                            }

                                            %
                                          </Badge>
                                        )}
                                        {session?.status && (
                                          <Badge
                                            className={
                                              session?.status ===
                                              "completed"
                                                ? "bg-green-600 text-white"
                                                : session?.status ===
                                                    "pending"
                                                  ? "bg-yellow-600 text-white"
                                                  : "bg-red-600 text-white"
                                            }
                                          >
                                            {
                                              session.status
                                            }
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {
                                      <Button
                                        onClick={() => {
                                          setCurrentFeedbackData(
                                            session
                                          );
                                          setFeedbackModalOpen(
                                            true
                                          );
                                        }}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                        Feedback
                                      </Button>
                                    }

                                    {session?.status ===
                                      "failed" && (
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
            <Dialog
              open={
                feedbackModalOpen
              }
              onOpenChange={
                setFeedbackModalOpen
              }
            >
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Interview
                    Feedback
                    Report
                    {currentFeedbackData?.companyName && (
                      <span className="text-muted-foreground text-base">
                        -{" "}
                        {
                          currentFeedbackData.companyName
                        }
                      </span>
                    )}
                  </DialogTitle>
                  {currentFeedbackData?.status && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          currentFeedbackData.status ===
                          "completed"
                            ? "default"
                            : currentFeedbackData.status ===
                                "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          currentFeedbackData.status ===
                          "completed"
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {
                          currentFeedbackData.status
                        }
                      </Badge>
                      {currentFeedbackData.status ===
                        "failed" &&
                        currentFeedbackData.reasonForFailure && (
                          <span className="text-sm text-muted-foreground">
                            Reason:{" "}
                            {
                              currentFeedbackData.reasonForFailure
                            }
                          </span>
                        )}
                    </div>
                  )}
                </DialogHeader>

                {currentFeedbackData?.feedback && (
                  <div className="mt-4">
                    <div className="space-y-6">
                      <Card className="border-primary/30 bg-primary/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary" />
                            Interview
                            Performance
                            Report
                          </CardTitle>
                          <CardDescription>
                            AI-powered
                            analysis
                            of
                            your
                            interview
                            performance
                            using
                            the
                            STAR
                            method
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div
                                className={`text-2xl font-bold ${getScoreColor(currentFeedbackData?.feedback?.overallScore || 0)}`}
                              >
                                {currentFeedbackData
                                  ?.feedback
                                  ?.overallScore ||
                                  0}

                                %
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Overall
                                Score
                              </div>
                              <Badge
                                variant="outline"
                                className="mt-1 text-xs"
                              >
                                {getScoreLabel(
                                  currentFeedbackData
                                    ?.feedback
                                    ?.overallScore ||
                                    0
                                )}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div
                                className={`text-2xl font-bold ${getScoreColor(currentFeedbackData?.feedback?.confidenceScore || 0)}`}
                              >
                                {currentFeedbackData
                                  ?.feedback
                                  ?.confidenceScore ||
                                  0}

                                %
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Confidence
                              </div>
                              <Badge
                                variant="outline"
                                className="mt-1 text-xs"
                              >
                                {getScoreLabel(
                                  currentFeedbackData
                                    ?.feedback
                                    ?.confidenceScore ||
                                    0
                                )}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-foreground">
                                {formatDuration(
                                  currentFeedbackData
                                    ?.feedback
                                    ?.duration ||
                                    0
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Duration
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Tabs
                        defaultValue="star"
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="star">
                            STAR
                            Analysis
                          </TabsTrigger>
                          <TabsTrigger value="feedback">
                            Feedback
                          </TabsTrigger>
                          <TabsTrigger value="transcript">
                            Transcript
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="star"
                          className="space-y-4"
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                STAR
                                Method
                                Breakdown
                              </CardTitle>
                              <CardDescription>
                                Analysis
                                of
                                how
                                well
                                you
                                structured
                                your
                                responses
                                using
                                the
                                STAR
                                framework
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {currentFeedbackData
                                  ?.feedback
                                  ?.starAnalysis &&
                                currentFeedbackData
                                  ?.feedback
                                  ?.starAnalysis
                                  ?.length >
                                  0 ? (
                                  currentFeedbackData?.feedback?.starAnalysis.map(
                                    (
                                      analysis,
                                      index
                                    ) => (
                                      <div
                                        key={
                                          index
                                        }
                                        className="p-4 rounded-lg bg-muted/30 border border-border/50"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Star className="w-4 h-4 text-primary" />
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm leading-relaxed">
                                              {
                                                analysis
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>
                                      No
                                      STAR
                                      analysis
                                      available.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent
                          value="feedback"
                          className="space-y-4"
                        >
                          <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-green-400/30 bg-green-900/10">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  Strengths
                                </CardTitle>
                                <CardDescription>
                                  What
                                  you
                                  did
                                  well
                                  in
                                  this
                                  interview
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {currentFeedbackData
                                  ?.feedback
                                  ?.strengths &&
                                currentFeedbackData
                                  ?.feedback
                                  ?.strengths
                                  ?.length >
                                  0 ? (
                                  <ul className="space-y-3">
                                    {currentFeedbackData?.feedback?.strengths?.map(
                                      (
                                        strength,
                                        index
                                      ) => (
                                        <li
                                          key={
                                            index
                                          }
                                          className="flex items-start gap-3"
                                        >
                                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-sm leading-relaxed">
                                            {
                                              strength
                                            }
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No
                                    strengths
                                    recorded.
                                  </p>
                                )}
                              </CardContent>
                            </Card>

                            <Card className="border-yellow-400/30 bg-yellow-900/10">
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                                  Areas
                                  for
                                  Improvement
                                </CardTitle>
                                <CardDescription>
                                  Opportunities
                                  to
                                  enhance
                                  your
                                  interview
                                  skills
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {currentFeedbackData
                                  ?.feedback
                                  ?.improvement &&
                                currentFeedbackData
                                  ?.feedback
                                  ?.improvement
                                  ?.length >
                                  0 ? (
                                  <ul className="space-y-3">
                                    {currentFeedbackData?.feedback?.improvement?.map(
                                      (
                                        item,
                                        index
                                      ) => (
                                        <li
                                          key={
                                            index
                                          }
                                          className="flex items-start gap-3"
                                        >
                                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-sm leading-relaxed">
                                            {
                                              item
                                            }
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No
                                    improvements
                                    suggested.
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="transcript"
                          className="space-y-4"
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Interview
                                Transcript
                              </CardTitle>
                              <CardDescription>
                                Real-time
                                transcript
                                of
                                your
                                interview
                                responses
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto"></div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </>
    );
  };

export default MockInterviewSetup;
