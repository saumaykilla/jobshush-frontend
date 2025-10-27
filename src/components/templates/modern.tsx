import { ProfileType } from "@/lib/schemas/ProfileSchema";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { Fragment } from "react";
import { htmlToReactPdf } from "../htmlToPDFParser";

const styles = StyleSheet.create(
  {
    page: {
      fontFamily:
        "Helvetica",
      fontSize: 11,
      lineHeight: 1.15,
      padding: 40, // 1 inch margins
      backgroundColor:
        "white",
    },
    sectionHeader: {
      fontSize: 10,
      fontWeight: 600,
      textTransform:
        "uppercase",
      paddingBottom: 4,
      width: 100,
      flexWrap:
        "wrap",
      whiteSpace:
        "nowrap",
    },
    name: {
      fontSize: 14,
      textAlign:
        "center",
      fontWeight: 600,
      textTransform:
        "uppercase",
    },
    contactLine: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      justifyContent:
        "center",
      fontSize: 9,
    },
    row: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
    },
    leftCell: {
      display:
        "flex",
      flexDirection:
        "column",
      fontSize: 9,
      textAlign:
        "left",
      flexWrap:
        "wrap",
    },
    rightCell: {
      display:
        "flex",
      flexDirection:
        "column",
      fontSize: 9,
      textAlign:
        "right",
      whiteSpace:
        "nowrap",
    },
    degreeRow: {
      fontSize: 9,
      fontStyle:
        "italic",
    },
    description: {
      fontSize: 9,
      paddingTop: 2,
      flexWrap:
        "wrap",
    },
  }
);

const formatDate = (
  date: Date | null
) =>
  date
    ? new Date(
        date
      ).toLocaleDateString(
        "en-US",
        {
          year:
            "numeric",
          month:
            "short",
        }
      )
    : null;

const Modern = ({
  resume,
}: {
  resume: ProfileType;
}) => {
  const SectionDecider = (
    section: ProfileType["sectionOrder"][0]
  ) => {
    switch (
      section?.type
    ) {
      case "PersonalDetails": {
        const {
          fullName,
          email,
          country,
          contactNumber,
          city,
        } =
          resume?.personalDetails ||
          {};

        const personalInfoItems = [
          contactNumber,
          email,
          city,
          country,
        ]
          .filter(
            (
              val
            ) =>
              typeof val ===
                "string" &&
              val.trim() !==
                ""
          )
          .map(
            (
              info,
              idx
            ) => (
              <Text
                key={`info-${idx}`}
              >
                {
                  info
                }
              </Text>
            )
          );

        const linkedInURL = resume?.roleDetails?.linkedInURL?.trim();
        const linkedInItem =
          linkedInURL &&
          /^https?:\/\//.test(
            linkedInURL
          ) ? (
            <Link
              key="linkedin"
              style={{
                textDecoration:
                  "none",
              }}
              href={
                linkedInURL
              }
            >
              LinkedIn
            </Link>
          ) : null;

        const additionalLinks = (
          resume
            ?.roleDetails
            ?.additionalLinks ||
          []
        )
          .filter(
            (
              link: { url: string; label: string }
            ) =>
              typeof link?.url ===
                "string" &&
              link.url.trim() !==
                "" &&
              /^https?:\/\//.test(
                link.url.trim()
              )
          )
          .map(
            (
              link: { url: string; label: string },
              idx: number
            ) =>
              link?.url && (
                <Link
                  key={`additional-${idx}`}
                  style={{
                    textDecoration:
                      "none",
                  }}
                  href={link?.url?.trim()}
                >
                  {link?.label?.trim() ||
                    link?.url?.trim()}
                </Link>
              )
          );

        const allItems = [
          ...personalInfoItems,
          linkedInItem,
          ...additionalLinks,
        ].filter(
          Boolean
        );

        const interleavedItems = allItems.flatMap(
          (
            item,
            idx
          ) => [
            <View
              key={`item-wrapper-${idx}`}
              style={{
                flexDirection:
                  "row",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: 1, // space between bullet and text
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                }}
              >
                •
              </Text>
              {
                item
              }
            </View>,
          ]
        );

        return (
          <View
            style={{
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                textAlign:
                  "center",
                fontWeight: 600,
                textTransform:
                  "uppercase",
                paddingBottom: 10,
              }}
            >
              {
                fullName
              }
            </Text>
            <View
              style={{
                flexDirection:
                  "row",
                flexWrap:
                  "wrap",
                justifyContent:
                  "center",
                fontSize: 10,
                gap: 4,
              }}
            >
              {
                interleavedItems
              }
            </View>
          </View>
        );
      }

      case "RoleDetails":
        return resume?.roleDetails?.summary
          ?.replace(
            /(<([^>]+)>)/gi,
            ""
          )
          .trim() ? (
          <View
            style={{
              display:
                "flex",
              flexDirection:
                "row",
              alignItems:
                "flex-start",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                ...styles.sectionHeader,
                height:
                  "100%",
              }}
            >
              <Text>
                Summary
              </Text>
            </View>

            {resume?.skills?.data
              ?.replace(
                /(<([^>]+)>)/gi,
                ""
              )
              ?.trim() && (
              <View
                style={{
                  flex: 1,
                  ...styles.description,
                }}
              >
                {htmlToReactPdf(
                  resume
                    ?.roleDetails
                    ?.summary
                )}
              </View>
            )}
          </View>
        ) : null;

      case "EducationDetails": {
        if (
          !resume
            ?.education
            ?.lineItem
            ?.length
        )
          return null;

        return (
          <View
            style={{
              display:
                "flex",
              flexDirection:
                "row",
              alignItems:
                "flex-start",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                ...styles.sectionHeader,
                height:
                  "100%",
              }}
            >
              <Text>
                {
                  section?.value
                }
              </Text>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              {resume.education.lineItem.map(
                (
                  lineItem,
                  index
                ) => (
                  <View
                    key={`edu-${index}`}
                  >
                    <View
                      style={
                        styles.row
                      }
                    >
                      <View
                        style={
                          styles.leftCell
                        }
                      >
                        {lineItem?.institute && (
                          <Text
                            key="inst"
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            {
                              lineItem.institute
                            }
                          </Text>
                        )}
                        {lineItem?.degree && (
                          <Text
                            style={
                              styles.degreeRow
                            }
                          >
                            {
                              lineItem?.degree
                            }
                          </Text>
                        )}
                      </View>
                      <View
                        style={
                          styles.rightCell
                        }
                      >
                        {lineItem?.location && (
                          <Text>
                            {
                              lineItem?.location
                            }
                          </Text>
                        )}
                        {(lineItem?.startDate ||
                          lineItem?.endDate) && (
                          <Text>
                            {[
                              lineItem?.startDate
                                ? formatDate(
                                    lineItem.startDate
                                  )
                                : null,
                              lineItem?.startDate
                                ? lineItem?.endDate
                                  ? formatDate(
                                      lineItem.endDate
                                    )
                                  : "Present"
                                : null,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                " – "
                              )}
                          </Text>
                        )}
                      </View>
                    </View>

                    {lineItem?.description
                      ?.replace(
                        /(<([^>]+)>)/gi,
                        ""
                      )
                      ?.trim() && (
                      <View
                        style={
                          styles.description
                        }
                      >
                        {htmlToReactPdf(
                          lineItem.description
                        )}
                      </View>
                    )}
                  </View>
                )
              )}
            </View>
          </View>
        );
      }

      case "WorkExperience": {
        if (
          !resume
            ?.workExperience
            ?.lineItem
            ?.length
        )
          return null;

        return (
          <View
            style={{
              display:
                "flex",
              flexDirection:
                "row",
              alignItems:
                "flex-start",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                ...styles.sectionHeader,
                height:
                  "100%",
              }}
            >
              <Text>
                {
                  section?.value
                }
              </Text>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              {resume.workExperience.lineItem.map(
                (
                  lineItem,
                  index
                ) => (
                  <View
                    key={`work-${index}`}
                  >
                    <View
                      style={
                        styles.row
                      }
                    >
                      <View
                        style={
                          styles.leftCell
                        }
                      >
                        {lineItem?.company && (
                          <Text
                            key="inst"
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            {
                              lineItem.company
                            }
                          </Text>
                        )}
                        {lineItem?.role && (
                          <Text
                            style={
                              styles.degreeRow
                            }
                          >
                            {
                              lineItem?.role
                            }
                          </Text>
                        )}
                      </View>
                      <View
                        style={
                          styles.rightCell
                        }
                      >
                        {lineItem?.location && (
                          <Text>
                            {
                              lineItem?.location
                            }
                          </Text>
                        )}
                        {(lineItem?.startDate ||
                          lineItem?.endDate) && (
                          <Text>
                            {[
                              lineItem?.startDate
                                ? formatDate(
                                    lineItem.startDate
                                  )
                                : null,
                              lineItem?.startDate
                                ? lineItem?.endDate
                                  ? formatDate(
                                      lineItem.endDate
                                    )
                                  : "Present"
                                : null,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                " – "
                              )}
                          </Text>
                        )}
                      </View>
                    </View>
                    {lineItem?.description
                      ?.replace(
                        /(<([^>]+)>)/gi,
                        ""
                      )
                      ?.trim() && (
                      <View
                        style={
                          styles.description
                        }
                      >
                        {htmlToReactPdf(
                          lineItem.description
                        )}
                      </View>
                    )}
                  </View>
                )
              )}
            </View>
          </View>
        );
      }
      case "Skills": {
        if (
          !resume?.skills?.data
            ?.replace(
              /(<([^>]+)>)/gi,
              ""
            )
            ?.trim()
        )
          return null;

        return (
          <View
            style={{
              display:
                "flex",
              flexDirection:
                "row",
              alignItems:
                "flex-start",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                ...styles.sectionHeader,
                height:
                  "100%",
              }}
            >
              <Text>
                {
                  section?.value
                }
              </Text>
            </View>
            {resume?.skills?.data
              ?.replace(
                /(<([^>]+)>)/gi,
                ""
              )
              ?.trim() && (
              <View
                style={{
                  flex: 1,
                  ...styles.description,
                }}
              >
                {htmlToReactPdf(
                  resume
                    ?.skills
                    ?.data
                )}
              </View>
            )}
          </View>
        );
      }

      case "CustomSection": {
        const customSections =
          resume?.customSections;
        const index =
          customSections?.findIndex(
            (
              field: ProfileType["customSections"][number]
            ) =>
              field?.sectionID ===
              section.id
          ) ??
          -1;
        const lineItems =
          index !==
          -1
            ? customSections?.[
                index
              ]
                ?.lineItems
            : [];
        return (
          <View
            key={`${section.id}-${section.value}`}
            style={{
              display:
                "flex",
              flexDirection:
                "row",
              alignItems:
                "flex-start",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                ...styles.sectionHeader,
                height:
                  "100%",
              }}
            >
              <Text>
                {
                  section?.value
                }
              </Text>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              {lineItems?.length &&
                lineItems?.map(
                  (
                    lineItem: ProfileType["customSections"][number]["lineItems"][number],
                    index: number
                  ) => (
                    <View
                      key={`custom-${index}`}
                    >
                      <View
                        style={
                          styles.row
                        }
                      >
                        <Text
                          style={
                            styles.leftCell
                          }
                        >
                          {[
                            lineItem?.header && (
                              <Text
                                key="header"
                                style={{
                                  fontStyle:
                                    "italic",
                                  fontWeight:
                                    "normal",
                                }}
                              >
                                {
                                  lineItem.header
                                }
                              </Text>
                            ),
                            lineItem?.subHeader && (
                              <Text
                                key="subHeader"
                                style={{
                                  fontWeight: 600,
                                }}
                              >
                                {
                                  lineItem.subHeader
                                }
                              </Text>
                            ),
                          ]
                            .filter(
                              Boolean
                            )
                            .map(
                              (
                                item,
                                i,
                                arr
                              ) =>
                                i ===
                                arr.length -
                                  1
                                  ? item
                                  : [
                                      item,
                                      <Text
                                        key={`comma-${i}`}
                                      >
                                        ,{" "}
                                      </Text>,
                                    ]
                            )
                            .flat()}
                        </Text>
                      </View>
                      {lineItem?.description
                        ?.replace(
                          /(<([^>]+)>)/gi,
                          ""
                        )
                        ?.trim() && (
                        <View
                          style={
                            styles.description
                          }
                        >
                          {htmlToReactPdf(
                            lineItem?.description
                          )}
                        </View>
                      )}
                    </View>
                  )
                )}
            </View>
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Document>
      <Page
        size="A4"
        style={
          styles.page
        }
      >
        {resume?.sectionOrder?.map(
          (
            section,
            index
          ) => (
            <Fragment
              key={`${section.id}-index-${index}`}
            >
              {SectionDecider(
                section
              )}
            </Fragment>
          )
        )}
      </Page>
    </Document>
  );
};

export default Modern;
