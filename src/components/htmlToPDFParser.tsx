import React from "react";
import {
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { parseDocument } from "htmlparser2";
import {
  Node,
  Element,
  isText,
} from "domhandler";

const styles = StyleSheet.create(
  {
    block: {
      width:
        "100%",
      display:
        "flex",
      flexDirection:
        "column",
      breakInside:
        "auto",
    },
    paragraph: {
      fontSize: 9,
      marginBottom: 4,
    },
    strong: {
      fontWeight:
        "bold",
    },
    em: {
      fontStyle:
        "italic",
    },
    list: {
      breakInside:
        "auto",
    },
    listItemWrapper: {
      breakInside:
        "avoid",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginBottom: 2,
    },
    bulletText: {
      fontSize: 9,
      fontWeight:
        "bold",
      marginRight: 1,
      width: 10,
    },
    listItemText: {
      fontSize: 9,
      lineHeight: 1.3,
      flex: 1,
      flexWrap:
        "wrap",
    },
  }
);

const renderInlineNode = (
  node: Node,
  index: number,
  olCounterStack: number[]
): React.ReactNode => {
  if (
    isText(
      node
    )
  ) {
    return (
      <Text
        key={`text-${index}`}
      >
        {
          node.data
        }
      </Text>
    );
  }

  if (
    node.type ===
    "tag"
  ) {
    const element = node as Element;
    const tagName =
      element.name;
    const children = element.children?.map(
      (
        child,
        idx
      ) =>
        renderInlineNode(
          child,
          idx,
          olCounterStack
        )
    );

    switch (
      tagName
    ) {
      case "strong":
        return (
          <Text
            key={`strong-${index}`}
            style={
              styles.strong
            }
          >
            {
              children
            }
          </Text>
        );
      case "em":
        return (
          <Text
            key={`em-${index}`}
            style={
              styles.em
            }
          >
            {
              children
            }
          </Text>
        );
      default:
        return (
          <Text
            key={`inline-${index}`}
          >
            {
              children
            }
          </Text>
        );
    }
  }

  return null;
};

const renderNode = (
  node: Node,
  parentType: string = "",
  index: number = 0,
  olCounterStack: number[]
): React.ReactNode => {
  if (
    isText(
      node
    )
  ) {
    return (
      <View
        key={`text-${index}`}
        style={
          styles.block
        }
      >
        <Text
          style={
            styles.paragraph
          }
        >
          {
            node.data
          }
        </Text>
      </View>
    );
  }

  if (
    node.type ===
    "tag"
  ) {
    const element = node as Element;
    const tagName =
      element.name;
    const children = element.children?.map(
      (
        child,
        idx
      ) =>
        renderNode(
          child,
          tagName,
          idx,
          olCounterStack
        )
    );

    switch (
      tagName
    ) {
      case "p":
        return (
          <View
            key={`p-${index}`}
            style={
              styles.block
            }
          >
            <Text
              style={
                styles.paragraph
              }
            >
              {element.children?.map(
                (
                  child,
                  idx
                ) =>
                  renderInlineNode(
                    child,
                    idx,
                    olCounterStack
                  )
              )}
            </Text>
          </View>
        );

      case "ul":
        return (
          <View
            key={`ul-${index}`}
            style={
              styles.block
            }
          >
            <View
              style={
                styles.list
              }
              wrap
            >
              {
                children
              }
            </View>
          </View>
        );

      case "ol": {
        olCounterStack.push(
          1
        );
        const rendered = (
          <View
            key={`ol-${index}`}
            style={
              styles.block
            }
          >
            <View
              style={
                styles.list
              }
              wrap
            >
              {
                children
              }
            </View>
          </View>
        );
        olCounterStack.pop();
        return rendered;
      }

      case "li": {
        const isOrdered =
          parentType ===
          "ol";
        const counter =
          olCounterStack[
            olCounterStack.length -
              1
          ] ??
          1;
        const bullet = isOrdered
          ? `${counter}.`
          : "•";

        if (
          isOrdered
        ) {
          olCounterStack[
            olCounterStack.length -
              1
          ] =
            counter +
            1;
        }

        return (
          <View
            key={`li-${index}`}
            style={
              styles.listItemWrapper
            }
            wrap={
              false
            }
          >
            <Text
              style={
                styles.bulletText
              }
            >
              {
                bullet
              }
            </Text>
            <Text
              style={
                styles.listItemText
              }
            >
              {element.children?.map(
                (
                  child,
                  idx
                ) =>
                  renderInlineNode(
                    child,
                    idx,
                    olCounterStack
                  )
              )}
            </Text>
          </View>
        );
      }

      default:
        return (
          <View
            key={`default-${index}`}
            style={
              styles.block
            }
          >
            <Text>
              {element.children?.map(
                (
                  child,
                  idx
                ) =>
                  renderInlineNode(
                    child,
                    idx,
                    olCounterStack
                  )
              )}
            </Text>
          </View>
        );
    }
  }

  return null;
};

export const htmlToReactPdf = (
  html: string
) => {
  const root = parseDocument(
    html
  );
  const olCounterStack: number[] = [];
  return root.children.map(
    (
      child,
      index
    ) =>
      renderNode(
        child,
        "",
        index,
        olCounterStack
      )
  );
};
