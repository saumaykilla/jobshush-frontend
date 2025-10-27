import { ProfileType } from "@/lib/schemas/ProfileSchema";
import React from "react";
import {
  get,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

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
import Editor from "../ui/rich-text/editor";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const CustomSection = ({
  index,
}: {
  index: number;
}) => {
  const {
    control,
    watch,
    register,
    setValue,
    formState: {
      errors,
    },
  } = useFormContext<
    ProfileType
  >();

  const {
    append,
    fields,
    remove,
    move,
  } = useFieldArray(
    {
      control: control,
      name: `customSections.${index}.lineItems`,
    }
  );
  const sensors = useSensors(
    useSensor(
      PointerSensor,
      {
        activationConstraint: {
          distance: 8,
        },
      }
    )
  );
  const handleDragDrop = DragReorderHandler(
    fields,
    move
  );
  return (
    <div className="text-xs">
      <Accordion
        type="single"
        collapsible
        className="w-full text-xs space-y-4 "
      >
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
                return (
                  <DraggableItem
                    key={
                      lineItem?.id
                    }
                    id={
                      lineItem?.id
                    }
                  >
                    <AccordionItem
                      value={`${lineItem?.id}.${idx}`}
                      className={` ${
                    get(errors,`customSections.${index}.lineItems.${idx}`)
                          ? "border-red-300 "
                          : "border-gray-200 "
                      }  border w-full rounded-xl  overflow-hidden text-xs`}
                    >
                      <AccordionTrigger className="text-xs p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium ">
                            {watch()
                              ?.customSections?.[
                              index
                            ]
                              ?.lineItems?.[
                              idx
                            ]
                              ?.header
                              ? watch()
                                  ?.customSections?.[
                                  index
                                ]
                                  ?.lineItems?.[
                                  idx
                                ]
                                  ?.header
                              : `${
                                  watch()
                                    ?.customSections?.[
                                    index
                                  ]
                                    ?.sectionName
                                } ${idx +
                                  1}`}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="p-6 text-xs border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>
                                Header
                              </Label>
                              {get(errors, `customSections.${index}.lineItems.${idx}.header.message`) && (
                                <span className="text-red-500 text-xs">
                                  {
                                    get(errors, `customSections.${index}.lineItems.${idx}.header.message`)
                                  }
                                </span>
                              )}
                            </div>

                            <Input
                              type="text"
                              {...register(
                                `customSections.${index}.lineItems.${idx}.header`
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>
                                Sub
                                Header
                              </Label>
                              {get(errors, `customSections.${index}.lineItems.${idx}.subHeader.message`) && (
                                <span className="text-red-500 text-xs">
                                  {
                                    get(errors, `customSections.${index}.lineItems.${idx}.subHeader.message`)
                                  }
                                </span>
                              )}
                            </div>
                            <Input
                              {...register(
                                `customSections.${index}.lineItems.${idx}.subHeader`
                              )}
                              type="text"
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>
                              Description
                            </Label>
                          </div>
                          <div>
                            <Editor
                              placeholder="Write your summary here..."
                              content={
                                watch()
                                  ?.customSections?.[
                                  index
                                ]
                                  ?.lineItems?.[
                                  idx
                                ]
                                  ?.description
                              }
                              onChange={(
                                value: string
                              ) => {
                                setValue(
                                  `customSections.${index}.lineItems.${idx}.description`,
                                  value
                                );
                              }}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <button
                      type="button"
                      disabled={
                        watch()
                          ?.customSections?.[
                          index
                        ]
                          ?.lineItems
                          ?.length ==
                        1
                      }
                      onClick={() =>
                        remove(
                          idx
                        )
                      }
                      className={` ${
                        watch()
                          ?.customSections?.[
                          index
                        ]
                          ?.lineItems
                          ?.length ==
                        1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700"
                      }  p-2 mt-2 `}
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </DraggableItem>
                );
              }
            )}
          </SortableContext>
        </DndContext>
      </Accordion>
      <button
        type="button"
        id="add-customSection"
        onClick={() =>
          append(
            {
              header:
                "",
              subHeader:
                "",
              description:
                "",
            }
          )
        }
        className="flex items-center text-primary hover:text-primary/80 transition"
      >
       <Plus className="w-4 h-4"/>
        {`Add Item`}
      </button>
    </div>
  );
};

export default CustomSection;
