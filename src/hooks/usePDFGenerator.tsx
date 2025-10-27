"use client";

import { useEffect, useState, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import Classic from "../components/templates/classic";
import Modern from "../components/templates/modern";
import CoverLetterTemplate, { CoverLetterTemplateProps } from "../components/templates/coverLetter";
import { ProfileType } from "@/lib/schemas/ProfileSchema";

interface PDFGeneratorProps {
  resume?: ProfileType;
  coverLetter?: CoverLetterTemplateProps;
  other?: string;
}

export function usePDFGenerator({ resume, coverLetter, other }: PDFGeneratorProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [, setIsGenerating] = useState(false);
  const previousBlobUrl = useRef<string | null>(null);
  
  // Create a stable string representation of the data to use as dependency
  const dataKey = JSON.stringify({
    template: resume?.template,
    personalDetails: resume?.personalDetails,
    roleDetails: resume?.roleDetails,
    education: resume?.education,
    skills: resume?.skills,
    workExperience: resume?.workExperience,
    customSections: resume?.customSections,
    sectionOrder: resume?.sectionOrder,
    coverLetter,
    other,
  });

  useEffect(() => {
    const generatePdf = async () => {
      // Clean up previous blob URL to prevent memory leaks
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = null;
      }

      // Don't generate if no data
      if (!resume && !coverLetter && !other) {
        setBlobUrl(null);
        return;
      }

      setIsGenerating(true);

      try {
        let blob: Blob | null = null;

        if (resume) {
          switch (resume.template) {
            case "Classic":
              blob = await pdf(<Classic resume={resume} />).toBlob();
              break;
            case "Modern":
              blob = await pdf(<Modern resume={resume} />).toBlob();
              break;
          }
        } else if (coverLetter) {
          blob = await pdf(<CoverLetterTemplate coverLetter={coverLetter} />).toBlob();
        } else if (other) {
          // Add other template here if needed
        }

        if (blob) {
          const url = URL.createObjectURL(blob);
          previousBlobUrl.current = url;
          setBlobUrl(url);
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        setBlobUrl(null);
      } finally {
        setIsGenerating(false);
      }
    };

    generatePdf();

    // Cleanup function to revoke object URL on unmount
    return () => {
      if (previousBlobUrl.current) {
        URL.revokeObjectURL(previousBlobUrl.current);
        previousBlobUrl.current = null;
      }
    };
  }, [dataKey]); // Use the stringified data as dependency

  return blobUrl;
}