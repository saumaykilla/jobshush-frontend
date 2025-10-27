"use client";
import { ProfileType } from "@/lib/schemas/ProfileSchema";
import React, { useCallback } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import {
  Briefcase,
  Building,
  FileText,
  GraduationCap,
  Hash,
  Lock,
  Star,
  User,
} from "lucide-react";
import DraggableItem from "./draggableItem";

const SECTION_ICONS = {
  PersonalDetails: <User className="w-5 h-5" />,
  RoleDetails: <Briefcase className="w-5 h-5" />,
  EducationDetails: <GraduationCap className="w-5 h-5" />,
  Education: <GraduationCap className="w-5 h-5" />,
  WorkExperience: <Building className="w-5 h-5" />,
  Skills: <Star className="w-5 h-5" />,
  CustomSection: <Hash className="w-5 h-5" />,
} as const;

const SECTION_COLORS = {
  PersonalDetails: { icon: "bg-blue-500/10 text-blue-600" },
  RoleDetails: { icon: "bg-purple-500/10 text-purple-600" },
  EducationDetails: { icon: "bg-green-500/10 text-green-600" },
  Education: { icon: "bg-green-500/10 text-green-600" },
  WorkExperience: { icon: "bg-orange-500/10 text-orange-600" },
  Skills: { icon: "bg-yellow-500/10 text-yellow-600" },
  CustomSection: { icon: "bg-gray-500/10 text-gray-600" },
} as const;

const DEFAULT_ICON = <FileText className="w-5 h-5" />;
const DEFAULT_COLOR = { icon: "bg-slate-500/10 text-slate-600" };

const getSectionIcon = (sectionType: string) => {
  return (
    SECTION_ICONS[sectionType as keyof typeof SECTION_ICONS] || DEFAULT_ICON
  );
};

const getSectionColor = (sectionType: string) => {
  return (
    SECTION_COLORS[sectionType as keyof typeof SECTION_COLORS] || DEFAULT_COLOR
  );
};

const SectionReordering = () => {
  const methods = useFormContext<ProfileType>();
  const { control, watch } = methods;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  const watchedData = watch();

  const { fields: sectionOrderFields, move: moveSectionOrder } = useFieldArray({
    control: control,
    name: "sectionOrder",
  });
  const handleDragDrop = useCallback(
    async (e: DragEndEvent) => {
      if (!e.active?.id || !e.over?.id) return;

      const fromIndex = sectionOrderFields.findIndex(
        (item) => item.id === e.active?.id
      );
      const toIndex = sectionOrderFields.findIndex(
        (item) => item.id === e.over?.id
      );

      // Prevent any movement involving the first two items (locked positions)
      if (fromIndex < 2 || toIndex < 2) {
        return; // Don't allow the move
      }

      // Only proceed if both indices are valid and >= 2 (draggable area)
      if (
        fromIndex !== -1 &&
        toIndex !== -1 &&
        fromIndex >= 2 &&
        toIndex >= 2 &&
        fromIndex !== toIndex
      ) {
        // Move in the sectionOrder array - this will handle all section types correctly
        moveSectionOrder(fromIndex, toIndex);

        // Don't call updateSectionOrder() here as it would reset our drag operation
        // The moveSectionOrder function already maintains the correct order
      }
    },
    [sectionOrderFields, moveSectionOrder]
  );
  return (
    <>
      <div className="flex items-center gap-2">
        <Label>Resume Template</Label>
        <Select
          value={watchedData?.template}
          onValueChange={(value) =>
            methods.setValue("template", value as "Classic" | "Modern")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Classic">Classic</SelectItem>
            <SelectItem value="Modern">Modern</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragDrop}
        sensors={sensors}
      >
        <SortableContext
          items={sectionOrderFields?.slice(2).map((field) => field.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sectionOrderFields?.map((lineItem, index) => {
              const colors = getSectionColor(lineItem?.type);
              const isLocked = index < 2;

              const sectionItem = (
                <div
                  className={`flex items-center w-full p-4 rounded-lg border-2 transition-all duration-200 ${isLocked ? "border-solid bg-muted/30" : `border-dashed hover:shadow-md `} group-hover:border-solid`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${colors.icon}`}>
                      {getSectionIcon(lineItem?.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{lineItem?.value}</h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {lineItem?.type.replace(/([A-Z])/g, " $1").trim()}
                        {isLocked && " • Locked"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`transition-opacity p-2 rounded ${isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    {isLocked && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );

              return (
                <div key={lineItem?.id} className="group">
                  {isLocked ? (
                    sectionItem
                  ) : (
                    <DraggableItem id={lineItem?.id}>
                      {sectionItem}
                    </DraggableItem>
                  )}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      {sectionOrderFields?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No sections to display</p>
        </div>
      )}
    </>
  );
};

export default SectionReordering;
