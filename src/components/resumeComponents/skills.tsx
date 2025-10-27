import React from "react";
import Editor from "../ui/rich-text/editor";
import { useFormContext } from "react-hook-form";
import { ProfileType } from "@/lib/schemas/ProfileSchema";
import { Label } from "../ui/label";

const Skills = () => {
  const methods = useFormContext<
    ProfileType
  >();
  const {
    setValue,
    watch,
  } = methods;

  const skillsData = watch("skills.data");

  return (
    <div className="grid gap-2">
    <Label>Skills </Label>
        <div>
          <Editor
            placeholder="Write your summary here..."
            
            content={skillsData}
            onChange={(
              value: string
            ) => {
              setValue(
                "skills.data",
                value
              );
            }}
          />
   
      </div>
    </div>
  );
};

export default Skills;
