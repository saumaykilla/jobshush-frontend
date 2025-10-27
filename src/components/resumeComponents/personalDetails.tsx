import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useFormContext } from "react-hook-form";
import { ProfileType } from "@/lib/schemas/ProfileSchema";

const PersonalDetails = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileType>();
  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
        <div className="flex items-center justify-between">

          <Label htmlFor="fullName">Full Name *</Label>
          {errors?.personalDetails?.fullName?.message
             && (
            <span className="text-red-500 text-xs">
              {
                errors
                  .personalDetails
                  .fullName
                  .message
              }
            </span>

          )}
          </div>
          <Input
            id="fullName"
            {...register("personalDetails.fullName")}
            placeholder="John Smith"
          />
        </div>

        <div className="grid gap-2">
        <div className="flex items-center justify-between">

          <Label htmlFor="email">Email Address *</Label>
          {errors
            ?.personalDetails
            ?.email && (
            <span className="text-red-500 text-xs">
              {
                errors
                  ?.personalDetails
                  ?.email
                  ?.message
              }
            </span>
          )}
          </div>
          <Input
            id="email"
            type="email"
            {...register("personalDetails.email")}
            placeholder="john.smith@email.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register("personalDetails.country")}
              placeholder="United States"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("personalDetails.city")}
              placeholder="San Francisco"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contactNumber">Phone Number</Label>
          <Input
            id="contactNumber"
            type="tel"
            {...register("personalDetails.contactNumber")}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </>
  );
};

export default PersonalDetails;
