"use client";
import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import { GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

const DraggableItem = ({
  id,
  children,
  className,
  iconSize,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  iconSize?:
    | string
    | number
    | undefined;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable(
    {
      id: id,
    }
  );

  const style = {
    transform: CSS.Transform.toString(
      transform
    ),
    transition,
  };
  return (
    <div
      ref={
        setNodeRef
      }
      style={
        style
      }
      {...attributes}
      className="flex w-full  items-start relative"
    >
      <GripVertical
        {...listeners}
        size={
          iconSize ||
          15
        }
        className={cn(
          "mt-4",
          className
        )}
      />
      {
        children
      }
    </div>
  );
};

export default DraggableItem;
