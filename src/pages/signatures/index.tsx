import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

// Mock data for assigned surveys
const mockAssignedSurveys = [
  {
    id: 1,
    name: "Customer Support Feedback",
    ratingStyle: "emojis" as const,
    active: true,
  },
  {
    id: 2,
    name: "Product Experience",
    ratingStyle: "stars" as const,
    active: false,
  },
];

interface SignaturePreviewProps {
  userName: string;
  userTitle: string;
  companyName: string;
  companyAddress: string;
  companyWebsite: string;
  selectedSurvey: typeof mockAssignedSurveys[0] | null;
}

function SignaturePreview({
  userName,
  userTitle,
  companyName,
  companyAddress,
  companyWebsite,
  selectedSurvey,
}: SignaturePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (previewRef.current) {
      try {
        await navigator.clipboard.writeText(previewRef.current.innerHTML);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy signature:", err);
      }
    }
  };

  const renderRatingIcons = () => {
    if (!selectedSurvey) return null;

    switch (selectedSurvey.ratingStyle) {
      case "emojis":
        return (
          <div className="flex space-x-2">
            <span role="img" aria-label="excellent" className="text-2xl cursor-pointer">😍</span>
            <span role="img" aria-label="good" className="text-2xl cursor-pointer">😊</span>
            <span role="img" aria-label="average" className="text-2xl cursor-pointer">😐</span>
            <span role="img" aria-label="poor" className="text-2xl cursor-pointer">😕</span>
            <span role="img" aria-label="bad" className="text-2xl cursor-pointer">😡</span>
          </div>
        );
      case "stars":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-yellow-400 cursor-pointer">★</span>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 relative">
      <div className="absolute top-2 right-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="h-4 w-4 mr-2" />
              Copy HTML
            </>
          )}
        </button>
      </div>

      <div
        ref={previewRef}
        className="border rounded-lg p-6 bg-white"
        style={{ minHeight: "200px" }}
      >
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: "1.6" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
              {userName}
            </div>
            <div style={{ color: "#666" }}>{userTitle}</div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <img
              src="/logo.png"
              alt={companyName}
              style={{ height: "40px", marginBottom: "8px" }}
            />
            <div style={{ color: "#333", fontWeight: "bold" }}>{companyName}</div>
            <div style={{ color: "#666" }}>{companyAddress}</div>
            <a
              href={companyWebsite}
              style={{ color: "#0066cc", textDecoration: "none" }}
            >
              {companyWebsite}
            </a>
          </div>

          {selectedSurvey && (
            <div style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
              <div style={{ marginBottom: "8px", color: "#666" }}>
                Please rate your experience:
              </div>
              {renderRatingIcons()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Signatures() {
  const { user } = useUser();
  const [selectedSurvey, setSelectedSurvey] = useState<typeof mockAssignedSurveys[0] | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    name: "Your Company",
    address: "123 Main St, City, State 12345",
    website: "www.yourcompany.com",
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Email Signature Generator</h1>
        <p className="mt-2 text-sm text-gray-700">
          Generate your email signature with integrated feedback collection.
        </p>

        <div className="mt-8 space-y-6">
          {/* Survey Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Feedback Survey
            </label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedSurvey?.id || ""}
              onChange={(e) => {
                const survey = mockAssignedSurveys.find(
                  (s) => s.id === Number(e.target.value)
                );
                setSelectedSurvey(survey || null);
              }}
            >
              <option value="">None</option>
              {mockAssignedSurveys
                .filter((survey) => survey.active)
                .map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, name: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={companyInfo.address}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, address: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="text"
                  value={companyInfo.website}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, website: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Signature Preview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Preview</h3>
            <SignaturePreview
              userName={user?.fullName || ""}
              userTitle="Customer Support"
              companyName={companyInfo.name}
              companyAddress={companyInfo.address}
              companyWebsite={companyInfo.website}
              selectedSurvey={selectedSurvey}
            />
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  To use this signature, copy the HTML and paste it into your email client's signature settings.
                  The rating buttons will be clickable in actual emails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
