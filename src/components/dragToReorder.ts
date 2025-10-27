import { DragEndEvent } from "@dnd-kit/core";
import {
  FieldArrayWithId,
  UseFieldArrayMove,
} from "react-hook-form";

export const DragReorderHandler = (
  fields: FieldArrayWithId[],
  move: UseFieldArrayMove
) => {
  return async (
    e: DragEndEvent
  ) => {
    if (
      e
        .active
        .id ===
      e
        .over
        ?.id
    )
      return;

    const fromIndex = fields.findIndex(
      (
        item
      ) =>
        item.id ===
        e
          .active
          .id
    );
    const toIndex = fields.findIndex(
      (
        item
      ) =>
        item.id ===
        e
          .over
          ?.id
    );

    if (
      fromIndex !==
        -1 &&
      toIndex !==
        -1
    ) {
      move(
        fromIndex,
        toIndex
      );
    }
  };
};
