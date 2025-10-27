"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ProfileType } from "@/lib/schemas/ProfileSchema";
import Editor from "../ui/rich-text/editor";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableItem from "./draggableItem";
import { DragReorderHandler } from "../dragToReorder";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Trash2 } from "lucide-react";

const EducationDetails = () => {
  const methods = useFormContext<ProfileType>();
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = methods;
  const { append, remove, fields, move } = useFieldArray({
    control: control,
    name: "education.lineItem",
  });

  const watchedEducation = watch("education");
  
  const handleDragDrop = DragReorderHandler(fields, move);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  return (
    <div className="space-y-6 text-xs">
      <div id="education-entries" className="space-y-4">
        <Accordion
          type="single"
          collapsible
          className="w-full text-xs space-y-4"
        >
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragDrop}
            sensors={sensors}
          >
            <SortableContext
              items={fields}
              strategy={verticalListSortingStrategy}
            >
              {fields?.map((lineItem, idx) => {
                return (
                  <DraggableItem key={lineItem?.id} id={lineItem?.id}>
                    <AccordionItem
                      value={`${lineItem}.${idx}`}
                      className={` ${
                        errors?.education?.lineItem?.[idx]?.institute ||
                        errors?.education?.lineItem?.[idx]?.degree ||
                        errors?.education?.lineItem?.[idx]?.location ||
                        errors?.education?.lineItem?.[idx]?.endDate ||
                        errors?.education?.lineItem?.[idx]?.startDate
                          ? "border-red-300 "
                          : "border-gray-200 "
                      } border w-full rounded-xl overflow-hidden text-xs`}
                    >
                      <AccordionTrigger className="text-xs  p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">
                            {watchedEducation?.lineItem?.[idx]?.institute
                              ? watchedEducation?.lineItem?.[idx]?.institute
                              : `Education ${idx + 1}`}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="p-6 text-xs border-t">
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <div  className="flex items-center justify-between">
                            <Label>Institution *</Label>
                            {errors
                                  ?.education
                                  ?.lineItem?.[
                                  idx
                                ]
                                  ?.institute
                                  ?.message && (
                                  <span className="text-red-500 text-xs">
                                    {
                                      errors
                                        ?.education
                                        ?.lineItem?.[
                                        idx
                                      ]
                                        ?.institute
                                        ?.message
                                    }
                                  </span>
                                )}</div>
                            <Input
                              placeholder="University of California, Berkeley"
                              {...register(
                                `education.lineItem.${idx}.institute`
                              )}
                            />
                          </div>

                          <div className="grid gap-2">
                          <div  className="flex items-center justify-between">
                            <Label>Degree *</Label>
                            {errors
                                  ?.education
                                  ?.lineItem?.[
                                  idx
                                ]
                                  ?.degree
                                  ?.message && (
                                  <span className="text-red-500 text-xs">
                                    {
                                      errors
                                        ?.education
                                        ?.lineItem?.[
                                        idx
                                      ]
                                        ?.degree
                                        ?.message
                                    }
                                  </span>
                                )}
                            </div>
                            <Input
                              placeholder="Bachelor of Science in Computer Science"
                              {...register(`education.lineItem.${idx}.degree`)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                            <Label>Location *</Label>
                            {errors
                                ?.education
                                ?.lineItem?.[
                                idx
                              ]
                                ?.location
                                ?.message && (
                                <span className="text-red-500 text-xs">
                                  {
                                    errors
                                      ?.education
                                      ?.lineItem?.[
                                      idx
                                    ]
                                      ?.location
                                      ?.message
                                  }
                                </span>
                              )}
                            </div>
                            <Input
                              {...register(
                                `education.lineItem.${idx}.location`
                              )}
                              placeholder="Berkeley, CA"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between">
                              <Label>Start Date *</Label>
                              {errors
                                  ?.education
                                  ?.lineItem?.[
                                  idx
                                ]
                                  ?.startDate
                                  ?.message && (
                                  <span className="text-red-500 text-xs">
                                    {
                                      errors
                                        ?.education
                                        ?.lineItem?.[
                                        idx
                                      ]
                                        ?.startDate
                                        ?.message
                                    }
                                  </span>
                                )}
                                </div>
                                <Controller
                                control={
                                  control
                                }
                                name={`education.lineItem.${idx}.startDate`}
                                render={({
                                  field,
                                }) => (
                                  <input
                                    type="date"
                                    {...field}
                                    value={
                                      field?.value
                                        ? new Date(
                                            field?.value
                                          )
                                            ?.toISOString()
                                            ?.split(
                                              "T"
                                            )[0]
                                        : ""
                                    }
                                    onChange={(e) => {
                                      field.onChange(e); // update value
                                      methods?.trigger(`education.lineItem.${idx}.startDate`); // re-validate dependent field
                                      methods?.trigger(`education.lineItem.${idx}.endDate`);
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary  focus:ring-2 focus:ring-primary/20 outline-none transition"
                                  />
                                )}
                              />
                            </div>
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between">
                              <Label>End Date</Label>
                              {errors
                                  ?.education
                                  ?.lineItem?.[
                                  idx
                                ]
                                  ?.endDate
                                  ?.message && (
                                  <span className="text-red-500 text-xs">
                                    {
                                      errors
                                        ?.education
                                        ?.lineItem?.[
                                        idx
                                      ]
                                        ?.endDate
                                        ?.message
                                    }
                                  </span>
                                )}
                              </div>
                              <Controller
                                control={
                                  control
                                }
                                name={`education.lineItem.${idx}.endDate`}
                                render={({
                                  field,
                                }) => (
                                  <input
                                    type="date"
                                    {...field}
                                    value={
                                      field?.value
                                        ? new Date(
                                            field?.value
                                          )
                                            ?.toISOString()
                                            ?.split(
                                              "T"
                                            )[0]
                                        : ""
                                    }
                                    onChange={(e) => {
                                      field.onChange(e); // update value
                                      methods?.trigger(`education.lineItem.${idx}.startDate`); // re-validate dependent field
                                      methods?.trigger(`education.lineItem.${idx}.endDate`);
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                                  />
                                )}
                              />
                              
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label>Description</Label>
                            <div>
                              <Editor
                                placeholder="Write your summary here..."
                                content={
                                  watchedEducation?.lineItem?.[idx]
                                    ?.description
                                }
                                onChange={(value: string) => {
                                  setValue(
                                    `education.lineItem.${idx}.description`,
                                    value
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      disabled={watchedEducation?.lineItem?.length == 1}
                      className={` ${
                        watchedEducation?.lineItem?.length == 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700"
                      }  p-2 mt-2 `}
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </DraggableItem>
                );
              })}
            </SortableContext>
          </DndContext>
        </Accordion>
      </div>

      <button
        type="button"
        id="add-education"
        onClick={() =>
          append({
            institute: "",
            degree: "",
            location: "",
            startDate: null,
            endDate: null,
            description: "",
          })
        }
        className="flex items-center text-primary hover:text-primary/80 transition"
      >
        Add Another Education
      </button>
    </div>
  );
};

export default React.memo(EducationDetails);
