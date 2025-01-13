import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Mock data - this would come from your API in production
const mockSurveyData = {
  id: '123',
  employeeName: 'John Doe',
  employeeTitle: 'Customer Support',
  companyName: 'Acme Inc',
  companyLogo: '/logo.png',
  initialRating: 4,
  questions: [
    {
      id: '1',
      type: 'text',
      text: 'What made your experience positive/negative?',
      required: true,
    },
    {
      id: '2',
      type: 'multipleChoice',
      text: 'Which aspects of our service stood out?',
      options: [
        'Response Time',
        'Knowledge',
        'Professionalism',
        'Solution Quality',
      ],
      required: false,
    },
  ],
  responseDrivers: [
    {
      id: '1',
      text: 'Quick Response',
      category: 'Speed',
    },
    {
      id: '2',
      text: 'Clear Communication',
      category: 'Communication',
    },
    {
      id: '3',
      text: 'Problem Resolution',
      category: 'Quality',
    },
    {
      id: '4',
      text: 'Friendly Service',
      category: 'Attitude',
    },
  ],
};

interface FeedbackFormState {
  rating: number;
  responses: Record<string, string | string[]>;
  selectedDrivers: string[];
}

export default function FeedbackPage() {
  const router = useRouter();
  const { id, rating: initialRating } = router.query;
  const [surveyData, setSurveyData] = useState(mockSurveyData);
  const [formState, setFormState] = useState<FeedbackFormState>({
    rating: Number(initialRating) || 0,
    responses: {},
    selectedDrivers: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // In production, fetch the survey data based on the ID
    // const fetchSurveyData = async () => {
    //   const response = await fetch(\`/api/surveys/\${id}\`);
    //   const data = await response.json();
    //   setSurveyData(data);
    // };
    // fetchSurveyData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In production, submit to your API
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     surveyId: id,
      //     ...formState,
      //   }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDriverToggle = (driverId: string) => {
    setFormState(prev => ({
      ...prev,
      selectedDrivers: prev.selectedDrivers.includes(driverId)
        ? prev.selectedDrivers.filter(id => id !== driverId)
        : [...prev.selectedDrivers, driverId],
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-gray-900">Thank you for your feedback!</h2>
              <p className="mt-2 text-sm text-gray-500">
                Your response helps us improve our service.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Provide Feedback - {surveyData.companyName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            {/* Header */}
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Rate your experience with {surveyData.employeeName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {surveyData.employeeTitle} at {surveyData.companyName}
                  </p>
                </div>
                <img
                  src={surveyData.companyLogo}
                  alt={surveyData.companyName}
                  className="h-12 w-auto"
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
              {/* Rating Display */}
              <div>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-2xl ${
                          star <= formState.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    You rated your experience {formState.rating} out of 5 stars
                  </p>
                </div>
              </div>

              {/* Response Drivers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What made your experience {formState.rating >= 4 ? 'great' : 'less than ideal'}?
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {surveyData.responseDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      type="button"
                      onClick={() => handleDriverToggle(driver.id)}
                      className={`relative rounded-lg border p-3 text-left focus:outline-none ${
                        formState.selectedDrivers.includes(driver.id)
                          ? 'border-indigo-500 ring-2 ring-indigo-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <span className="block text-sm font-medium text-gray-900">
                        {driver.text}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {driver.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up Questions */}
              <div className="space-y-6">
                {surveyData.questions.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {question.text}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {question.type === 'text' ? (
                      <textarea
                        required={question.required}
                        value={(formState.responses[question.id] as string) || ''}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            responses: {
                              ...prev.responses,
                              [question.id]: e.target.value,
                            },
                          }))
                        }
                        rows={4}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    ) : question.type === 'multipleChoice' ? (
                      <div className="space-y-2">
                        {question.options?.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                ((formState.responses[question.id] as string[]) || []).includes(option)
                              }
                              onChange={(e) => {
                                const currentResponses = (formState.responses[question.id] as string[]) || [];
                                const newResponses = e.target.checked
                                  ? [...currentResponses, option]
                                  : currentResponses.filter((r) => r !== option);
                                setFormState((prev) => ({
                                  ...prev,
                                  responses: {
                                    ...prev.responses,
                                    [question.id]: newResponses,
                                  },
                                }));
                              }}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
