import React from 'react';

interface FeedbackPreviewProps {
  ratingStyle: string;
  questions: any[];
  responseDrivers: any[];
}

export function FeedbackPreview({ ratingStyle, questions, responseDrivers }: FeedbackPreviewProps) {
  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Preview: Customer Feedback</h3>
            <p className="mt-1 text-sm text-gray-500">This is how your feedback form will appear</p>
          </div>
          <div className="text-sm text-gray-500">Preview Mode</div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Rating Display */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Your rating:</p>
          <div className="flex justify-center space-x-2">
            {ratingStyle === 'emojis' ? (
              <>
                <span role="img" aria-label="excellent" className="text-2xl">😍</span>
                <span role="img" aria-label="good" className="text-2xl">😊</span>
                <span role="img" aria-label="average" className="text-2xl">😐</span>
                <span role="img" aria-label="poor" className="text-2xl">😕</span>
                <span role="img" aria-label="bad" className="text-2xl">😡</span>
              </>
            ) : ratingStyle === 'stars' ? (
              <>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-2xl text-yellow-400">★</span>
                ))}
              </>
            ) : ratingStyle === 'hearts' ? (
              <>
                {[1, 2, 3, 4, 5].map((heart) => (
                  <span key={heart} className="text-2xl text-red-500">❤️</span>
                ))}
              </>
            ) : (
              <>
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num} className="text-xl font-medium text-gray-700">{num}</span>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Response Drivers */}
        {responseDrivers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What influenced your rating?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {responseDrivers.map((driver, index) => (
                <button
                  key={index}
                  type="button"
                  className="relative rounded-lg border border-gray-300 p-2 text-left hover:border-indigo-500 focus:outline-none"
                >
                  <span className="block text-sm font-medium text-gray-900">
                    {driver.text}
                  </span>
                  {driver.category && (
                    <span className="block text-xs text-gray-500">{driver.category}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {question.type === 'text' ? (
                  <textarea
                    disabled
                    placeholder="Customer's response will appear here"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={3}
                  />
                ) : question.type === 'multipleChoice' ? (
                  <div className="mt-2 space-y-2">
                    {question.options?.map((option: string, optIndex: number) => (
                      <label key={optIndex} className="flex items-center">
                        <input
                          type="checkbox"
                          disabled
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          disabled
          className="w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
