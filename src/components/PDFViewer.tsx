// ===== src/components/PDFViewer.tsx =====
"use client";

import { useState, useEffect } from "react";
import {
  DownloadIcon,
} from "lucide-react";
import { Button } from "./ui/button";

interface PDFViewerProps {
  file: string | null;
  showDownload?: boolean;
  fileName?: string;
}

export default function PDFViewer({
  file,
  showDownload = true,
  fileName = "Resume",
}: PDFViewerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);



  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading PDF viewer...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">No PDF to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col ">
      {/* PDF Viewer using iframe */}
      <div className="flex-1 overflow-hidden relative">
        <iframe
          src={`${file}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitV`}
          className="w-full h-full border-0 no-scrollbar"
          title="PDF Viewer"
        />
        {showDownload && <div className="absolute w-full top-0 right-10 flex justify-end items-center p-2 pointer-events-none z-10">
          <a
            href={file}
            download={`${fileName}.pdf`}
            className="pointer-events-auto"
            title="Download PDF"
          >
            <Button variant="outline" size={'icon-lg'}>
              <DownloadIcon className="size-4" />
              <span className="sr-only">Download PDF</span>
            </Button>
          </a>
        </div>}
      </div>
    </div>
  );
}
