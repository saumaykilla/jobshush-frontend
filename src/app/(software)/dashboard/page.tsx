"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar, Eye, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { useProfileStore } from "@/store/profileStore";
import { signOut } from "aws-amplify/auth";
import {
  applicationSchema,
  ApplicationType,
} from "@/lib/schemas/ApplicationSchema";
import Loading from "@/components/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";

type DashboardApplicationType = {
  id: string;
  resumeName: string;
  createdAt: string;
  status: "Applied" | "Interview" | "Rejected";
  jobDescription: string;
};

const Dashboard = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<DashboardApplicationType[]>(
    []
  );
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const { profile } = useProfileStore();
  const resolver = yupResolver(
    applicationSchema
  ) as unknown as Resolver<ApplicationType>;

  const {
    register,
    trigger,
    formState: { errors },
    watch,
  } = useForm<ApplicationType>({
    resolver: resolver,
    defaultValues: {
      jobDescription: "",
    },
  });

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
  const isMobile = useIsMobile();

  const createApplication = async (data: ApplicationType) => {
    setLoading(true);

    try {
      if (!profile) {
        toast.error("Profile is missing");
        await signOut();
        return;
      }

      const optimizationLimit = useProfileStore.getState().optimizationLimit;
      if (optimizationLimit <= 0) {
        toast.error("Optimization limit reached");
        return;
      }

      const payload = {
        resume: profile,
        jobDescription: data?.jobDescription,
      };

      // First, create the application
      const response = await axios.post(`/api/application`, payload);
      const ApplicationresponseData = await response.data.data;

      // Only after successful application creation, update the profile
      try {
        const profileResponse = await axios.put(`/api/profile`, {
          id: useProfileStore.getState().profileID,
          optimizationLimit: optimizationLimit - 1,
          resume: profile,
        });

        if (profileResponse.status !== 201) {
          throw new Error("Failed to update optimization limit");
        }

        // Update store only after successful API call
        useProfileStore.setState({
          profileID: profileResponse.data.data.profileID,
          profile: profileResponse.data.data.resume,
          optimizationLimit: profileResponse.data.data.optimizationLimit,
        });
      } catch (profileError) {
        console.error("Profile update error:", profileError);
        toast.error(
          "Application created but failed to update optimization limit"
        );
        // Don't update the store if the profile update failed
      }

      toast.success("Application created !!!");
      router.push(`${ApplicationresponseData?.application}`);
    } catch (error) {
      toast.error("Something went wrong, Please try Again !!!");
      console.log("Error", error);
      setLoading(false);
    } 
  };
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(
    null
  );

  const handleDeleteClick = (applicationId: string) => {
    setApplicationToDelete(applicationId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`/api/application?id=${applicationToDelete}`);
      if (applicationToDelete) {
        setApplications((prev) =>
          prev.filter((app) => app.id !== applicationToDelete)
        );
        setApplicationToDelete(null);
        setShowDeleteDialog(false);
      }
      toast.success("Deleted Application Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to Delete Application");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusDropdownClasses = (status: DashboardApplicationType['status']) => {
    switch (status) {
      case 'Applied':
        return "!bg-green-500 hover:!bg-green-600 !text-white !border-green-500 focus:!ring-green-500 focus:!border-green-500";
      case 'Interview':
        return "!bg-blue-500 hover:!bg-blue-600 !text-white !border-blue-500 focus:!ring-blue-500 focus:!border-blue-500";
      case 'Rejected':
        return "!bg-red-500 hover:!bg-red-600 !text-white !border-red-500 focus:!ring-red-500 focus:!border-red-500";
      default:
        return "";
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: DashboardApplicationType['status']) => {
    // Disable the dropdown while updating
    setUpdatingStatus(prev => new Set(prev).add(applicationId));
    
    try {
      // Make API call to update status
      const response = await axios.put('/api/application', {
        id: applicationId,
        status: newStatus,
      });

      if (response.status === 201) {
        // Update local state only if API call succeeds
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
        toast.success("Status updated successfully");
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      // Re-enable the dropdown
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter(
      (app) => app.status !== "Rejected"
    ).length;
    const interview = applications.filter(
      (app) => app.status === "Interview"
    ).length;

    return { total, active, interview };
  }, [applications]);
  return (
    <>
      {loading ? (
        <div className="absolute  top-0 left-0 z-100 h-full w-full flex items-center justify-center">
          <Loading
            message={
              watch()?.jobDescription
                ? "Generating your Resume and Cover Letter..."
                : "Loading your applications..."
            }
          />
        </div>
      ) : (
        <div className="flex flex-col h-full w-full gap-6 no-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h2>My Applications</h2>
              <p className="text-muted-foreground mt-1">
                Manage your job applications
              </p>
            </div>

            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tailor Resume for New Application</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className=" flex-1 flex flex-col justify-between rounded-2xl p-8 shadow-sm border">
                    <form>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 justify-between">
                          <label className="block font-medium">
                            Job Description
                          </label>
                          {errors?.jobDescription?.message && (
                            <span className="text-red-500 text-xs">
                              {errors?.jobDescription?.message}
                            </span>
                          )}
                        </div>

                        <textarea
                          id="job-description-input"
                          rows={15}
                          {...register("jobDescription")}
                          className="w-full overflow-scroll text-sm placeholder:text-sm rounded-xl border p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                          placeholder="Paste the complete job description here..."
                        />

                        <Button
                          onClick={async (e) => {
                            e.preventDefault();
                            const isValid = await trigger();
                            if (isValid) {
                              createApplication({
                                jobDescription: watch()?.jobDescription,
                              });
                            }
                          }}
                          className="w-full"
                        >
                          Generate Resume
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">
                      Total Applications
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.active}</div>
                    <div className="text-xs text-muted-foreground">
                      Active Offers
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold">{stats.interview}</div>
                    <div className="text-xs text-muted-foreground">
                      Interviews Scheduled
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {isMobile ? (
            <div className="space-y-3">
              {applications.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header with position and company */}
                      <div>
                        <h4 className="font-medium">
                          {application.resumeName}
                        </h4>
                      </div>

                      {/*Date Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Status
                        </label>
                        <Select
                          value={application.status}
                          disabled={updatingStatus.has(application.id)}
                          onValueChange={(
                            value: DashboardApplicationType["status"]
                          ) => handleStatusChange(application.id, value)}
                        >
                          <SelectTrigger className={`w-full ${getStatusDropdownClasses(application.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem className="text-center" value="Applied">Applied</SelectItem>
                            <SelectItem className="text-center" value="Interview">
                              Interview
                            </SelectItem>
                            <SelectItem className="text-center" value="Rejected">
                              Rejected
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/${application.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteLoading}
                          onClick={() => handleDeleteClick(application.id)}
                          className="flex-1 text-red-400 hover:text-red-300 border-red-600/30 hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {applications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No applications yet. Click &quot;Add Application&quot; to
                    get started.
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Desktop Table View */
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead align="center" className="text-center">
                          Name
                        </TableHead>
                        <TableHead align="center" className="text-center">
                          Status
                        </TableHead>
                        <TableHead align="center" className="text-center">
                          Created Date
                        </TableHead>
                        <TableHead align="center" className="text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell align="center" className="text-center">
                            <div>
                              <div className="font-medium">
                                {application.resumeName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="flex justify-center">
                            <Select
                        
                              value={application.status}
                              disabled={updatingStatus.has(application.id)}
                              onValueChange={(
                                value: DashboardApplicationType["status"]
                              ) => handleStatusChange(application.id, value)}
                            >
                              <SelectTrigger className={` ${getStatusDropdownClasses(application.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="text-sm text-center">
                                <SelectItem className="text-center" value="Applied">Applied</SelectItem>
                                <SelectItem className="text-center" value="Interview">
                                  Interview
                                </SelectItem>
                                <SelectItem className="text-center" value="Rejected">
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell align="center" className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell align="center" className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/${application.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deleteLoading}
                                onClick={() =>
                                  handleDeleteClick(application.id)
                                }
                                className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {applications.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No applications yet. Click &quot;Add
                            Application&quot; to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Application</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this application? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default Dashboard;
