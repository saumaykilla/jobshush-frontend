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
      lineHeight: 1.2,
      padding: 40, // 1 inch margins
      backgroundColor:
        "white",
    },
    sectionHeader: {
      fontSize: 10,
      fontWeight: 600,
      textTransform:
        "uppercase",
      borderBottom:
        "0.5px solid black",
      paddingBottom: 4,
    },
    name: {
      fontSize: 16,
      textAlign:
        "center",
      fontWeight: 600,
      textTransform:
        "uppercase",
      marginBottom: 8,
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
      paddingTop: 5,
    },
    leftCell: {
      fontSize: 9,
      textAlign:
        "left",
      flexWrap:
        "wrap",
      flex: 1,
    },
    rightCell: {
      fontSize: 9,
      textAlign:
        "right",
      whiteSpace:
        "nowrap",
    },
    degreeRow: {
      fontSize: 9,
      fontStyle: "italic",
      marginTop: 2,
    },
    description: {
      fontSize: 9,
      paddingTop: 4,
      flexWrap:
        "wrap",
      lineHeight: 1.15,
    },
    sectionContainer: {
      marginBottom: 0, // More space between major sections
    },
    workEntry: {
      marginBottom: 0, // More space between work entries
    },
    educationEntry: {
      marginBottom: 0, // More space between education entries
    },
    companyName: {
      fontSize: 9,
      fontWeight: 600,
      marginBottom: 2,
    },
    role: {
      fontSize: 9,
      fontStyle: "italic",
      marginBottom: 2,
    },
    location: {
      fontSize: 9,
      fontStyle: "normal",
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

const Classic = ({
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
          ) =>
            idx <
            allItems.length -
              1
              ? [
                  item,
                  <Text
                    key={`sep-${idx}`}
                  >
                    {" "}
                    |{" "}
                  </Text>,
                ]
              : [
                  item,
                ]
        );

        return (
          <View
            style={styles.sectionContainer}
          >
            <Text
              style={styles.name}
            >
              {
                fullName
              }
            </Text>
            <View
              style={styles.contactLine}
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
            style={styles.sectionContainer}
          >
            <Text
              style={
                styles.sectionHeader
              }
            >
              Summary
            </Text>
            <View
              style={{
                marginTop: 4,
              }}
            >
              {htmlToReactPdf(
                resume
                  .roleDetails
                  .summary
              )}
            </View>
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
            style={styles.sectionContainer}
          >
            <Text
              style={
                styles.sectionHeader
              }
            >
              {
                section?.value
              }
            </Text>
            {resume.education.lineItem.map(
              (
                lineItem,
                index
              ) => (
                <View
                  key={`edu-${index}`}
                  style={styles.educationEntry}
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
                        lineItem?.institute && (
                          <Text
                            key="inst"
                            style={styles.companyName}
                          >
                            {
                              lineItem.institute
                            }
                          </Text>
                        ),
                        lineItem?.location && (
                          <Text
                            key="loc"
                            style={styles.location}
                          >
                            {
                              lineItem.location
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
                    <Text
                      style={
                        styles.rightCell
                      }
                    >
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
                  </View>
                  <Text
                    style={
                      styles.degreeRow
                    }
                  >
                    {
                      lineItem?.degree
                    }
                  </Text>
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
            style={styles.sectionContainer}
          >
            <Text
              style={
                styles.sectionHeader
              }
            >
              {
                section?.value
              }
            </Text>
            {resume.workExperience.lineItem.map(
              (
                lineItem,
                index
              ) => (
                <View
                  key={`work-${index}`}
                  style={styles.workEntry}
                >
                  {/* Company name row with dates */}
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
                      {lineItem?.company && (
                        <Text
                          key="comp"
                          style={styles.companyName}
                        >
                          {
                            lineItem.company
                          }
                        </Text>
                      )}
                    </Text>
                    <Text
                      style={
                        styles.rightCell
                      }
                    >
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
                  </View>
                  
                  {/* Role and location row */}
                  <View
                    style={[
                      styles.row,
                      { paddingTop: 2 }
                    ]}
                  >
                    <Text
                      style={
                        styles.leftCell
                      }
                    >
                      {lineItem?.role && (
                        <Text
                          key="role"
                          style={styles.role}
                        >
                          {
                            lineItem.role
                          }
                        </Text>
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.rightCell,
                        styles.location
                      ]}
                    >
                      {lineItem?.location}
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
                        lineItem.description
                      )}
                    </View>
                  )}
                </View>
              )
            )}
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
            wrap
            style={styles.sectionContainer}
          >
            <Text
              style={
                styles.sectionHeader
              }
            >
              {
                section?.value
              }
            </Text>
            {resume?.skills?.data
              ?.replace(
                /(<([^>]+)>)/gi,
                ""
              )
              ?.trim() && (
              <View
                wrap
                style={
                  styles.description
                }
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
            style={styles.sectionContainer}
          >
            <Text
              style={
                styles.sectionHeader
              }
            >
              {
                section?.value
              }
            </Text>

            {lineItems?.map(
              (
                lineItem: ProfileType["customSections"][number]["lineItems"][number],
                index: number
              ) => (
                <View
                  key={`custom-${index}`}
                  style={styles.workEntry}
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
                        lineItem.description
                      )}
                    </View>
                  )}
                </View>
              )
            )}
          </View>
        );
      }
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
            
          ) => (
            <Fragment
              key={`${section.id}`}
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

export default Classic;
