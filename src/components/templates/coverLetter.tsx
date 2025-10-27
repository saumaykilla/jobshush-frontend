import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { htmlToReactPdf } from "../htmlToPDFParser";
import { ProfileType } from "@/lib/schemas/ProfileSchema";

export interface CoverLetterTemplateProps {
  personalDetails: ProfileType['personalDetails'];
  roleDetails: ProfileType['roleDetails'];
  coverLetter: string;
}

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
    date: {
      paddingTop: 10,
      fontSize: 10,
      fontWeight: 600,
      marginBottom: 10,
    },
    description: {
      fontSize: 12,
      paddingTop: 2,
      flexWrap:
        "wrap",
    },
  }
);

const CoverLetterTemplate = ({
  coverLetter,
}: {
  coverLetter: CoverLetterTemplateProps;
}) => {
  const {
    fullName,
    email,
    country,
    contactNumber,
    city,
  } =
    coverLetter?.personalDetails ||
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

  const linkedInURL = coverLetter?.roleDetails?.linkedInURL?.trim();
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
    coverLetter
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
  const currentDate = new Date(
    Date.now()
  ).toLocaleDateString(
    "en-US",
    {
      month:
        "long",
      day:
        "numeric",
      year:
        "numeric",
    }
  );
  return (
    <Document>
      <Page
        size="A4"
        style={
          styles.page
        }
      >
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
            }}
          >
            {
              interleavedItems
            }
          </View>
        </View>
        <Text
          style={
            styles.date
          }
        >
          {
            currentDate
          }
        </Text>
        <View
          style={
            styles.description
          }
        >
          {htmlToReactPdf(
            coverLetter?.coverLetter
          )}
        </View>
      </Page>
    </Document>
  );
};

export default CoverLetterTemplate;
