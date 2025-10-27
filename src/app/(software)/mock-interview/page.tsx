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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useProfileStore } from "@/store/profileStore";
import axios from "axios";
import { Briefcase, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type MockInterviewApplicationType = {
  id: string;
  resumeName: string;
  createdAt: string;
  status: "Applied" | "Interview" | "Rejected";
  jobDescription: string;
};

const MockInterviewSetup = () => {
  const { profile } = useProfileStore();
  const [activeTab, setActiveTab] = useState("new-session");
  const [customJobDescription, setCustomJobDescription] = useState("");

  const [jobSourceType, setJobSourceType] = useState("application");
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [applications, setApplications] = useState<
    MockInterviewApplicationType[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [startPracticeLoading, setStartPracticeLoading] = useState(false);
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`/api/application`);
        const responseData = await response.data.data;
        setApplications(responseData);
      } catch (error) {
        toast.error("Error fetching applications");
        console.log("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);
  const router = useRouter();
  const handleStartPractice = async () => {
    setStartPracticeLoading(true);
    const jobDescription =
      jobSourceType === "application"
        ? applications.find((app) => app.id === selectedApplication)
            ?.jobDescription
        : customJobDescription;
    const payload = {
      job: jobDescription,
      candidate: profile?.personalDetails?.fullName,
      resume: profile,
    };
    try {
      const response = await axios.post(`/api/mock-interview`, payload);
      const data = await response.data;
      router.push(`/mock-interview/${data.room_name}?token=${data.token}`);
    } catch (error) {
      console.log("Error", error);
      toast.error("Error starting mock interview session");
      setStartPracticeLoading(false);
    }
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
            <h2>AI Mock Interview</h2>
            <p className="text-muted-foreground mt-1">
              Practice with AI Voice Agent, get feedback and improve your
              interview skills
            </p>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new-session">New Session</TabsTrigger>
              <TabsTrigger value="previous-feedback">
                Previous Feedback
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="new-session" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Setup Interview Session
                    </CardTitle>
                    <CardDescription>
                      Choose your interview type and job details for
                      personalized questions and feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Job Source Selection */}
                    <div>
                      <label className="text-sm mb-3 block">
                        Job Information Source
                      </label>
                      <RadioGroup
                        value={jobSourceType}
                        onValueChange={setJobSourceType}
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
                            Select from my applications
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom" className="cursor-pointer">
                            Provide new job description
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Application Selection */}
                    {jobSourceType === "application" && (
                      <div>
                        <label
                          htmlFor="application-select"
                          className="text-sm mb-2 block"
                        >
                          Select Application
                        </label>
                        <Select
                          value={selectedApplication}
                          onValueChange={setSelectedApplication}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an application" />
                          </SelectTrigger>
                          <SelectContent>
                            {applications.map((app) => (
                              <SelectItem key={app.id} value={app.id}>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-3 h-3" />
                                  <span>{app.resumeName}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Custom Job Description */}
                    {jobSourceType === "custom" && (
                      <div>
                        <label
                          htmlFor="job-description"
                          className="text-sm mb-2 block"
                        >
                          Job Description
                        </label>
                        <Textarea
                          id="job-description"
                          value={customJobDescription}
                          onChange={(e) =>
                            setCustomJobDescription(e.target.value)
                          }
                          placeholder="Paste the job description here including responsibilities, requirements, and qualifications..."
                          className="min-h-[120px]"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          The AI will generate relevant interview questions
                          based on this description
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleStartPractice}
                      disabled={
                        startPracticeLoading ||
                        (jobSourceType === "application" &&
                          !selectedApplication) ||
                        (jobSourceType === "custom" &&
                          !customJobDescription.trim())
                      }
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Interview Session
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="previous-feedback"
                className="mt-0 space-y-4"
              ></TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default MockInterviewSetup;
