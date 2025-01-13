import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

type RatingStyle = "stars" | "emojis" | "hearts" | "numbers";
type QuestionType = "rating" | "text" | "multipleChoice" | "checkbox";

interface LogicRule {
  condition: "equals" | "lessThan" | "greaterThan";
  value: number;
  questions: Question[];
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[];
  logic?: LogicRule[];
}

interface ResponseDriver {
  id: string;
  text: string;
  category: string;
}

export default function CreateSurvey() {
  const [surveyName, setSurveyName] = useState("");
  const [description, setDescription] = useState("");
  const [ratingStyle, setRatingStyle] = useState<RatingStyle>("emojis");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responseDrivers, setResponseDrivers] = useState<ResponseDriver[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Mock data for dropdowns
  const groups = ["Sales Team", "Customer Support", "Management"];
  const locations = ["New York Office", "San Francisco HQ", "London Office"];

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: "",
      required: true,
      options: type === "multipleChoice" || type === "checkbox" ? [""] : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addResponseDriver = () => {
    const newDriver: ResponseDriver = {
      id: Math.random().toString(36).substr(2, 9),
      text: "",
      category: "",
    };
    setResponseDrivers([...responseDrivers, newDriver]);
  };

  const updateResponseDriver = (id: string, updates: Partial<ResponseDriver>) => {
    setResponseDrivers(
      responseDrivers.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const removeResponseDriver = (id: string) => {
    setResponseDrivers(responseDrivers.filter((d) => d.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Create Survey</h2>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="surveyName" className="block text-sm font-medium text-gray-700">
                  Survey Name
                </label>
                <input
                  type="text"
                  id="surveyName"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rating Style */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Rating Style</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                {(["emojis", "stars", "hearts", "numbers"] as RatingStyle[]).map((style) => (
                  <label key={style} className="flex items-center">
                    <input
                      type="radio"
                      checked={ratingStyle === style}
                      onChange={() => setRatingStyle(style)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 capitalize">{style}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Assign To</h3>
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="groups" className="block text-sm font-medium text-gray-700">
                  Groups
                </label>
                <select
                  id="groups"
                  multiple
                  value={selectedGroups}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, (option) => option.value);
                    setSelectedGroups(values);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="locations" className="block text-sm font-medium text-gray-700">
                  Locations
                </label>
                <select
                  id="locations"
                  multiple
                  value={selectedLocations}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, (option) => option.value);
                    setSelectedLocations(values);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Follow-up Questions */}
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Follow-up Questions</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => addQuestion("text")}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-4">
                        <select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(question.id, { type: e.target.value as QuestionType })
                          }
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="multipleChoice">Multiple Choice</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) =>
                              updateQuestion(question.id, { required: e.target.checked })
                            }
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-600">Required</span>
                        </label>
                      </div>

                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        placeholder="Question text"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />

                      {(question.type === "multipleChoice" || question.type === "checkbox") && (
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(question.id, { options: newOptions });
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = question.options?.filter(
                                    (_, i) => i !== optionIndex
                                  );
                                  updateQuestion(question.id, { options: newOptions });
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = [...(question.options || []), ""];
                              updateQuestion(question.id, { options: newOptions });
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Drivers */}
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Response Drivers</h3>
              <button
                type="button"
                onClick={addResponseDriver}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Driver
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {responseDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={driver.text}
                    onChange={(e) =>
                      updateResponseDriver(driver.id, { text: e.target.value })
                    }
                    placeholder="Driver text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    value={driver.category}
                    onChange={(e) =>
                      updateResponseDriver(driver.id, { category: e.target.value })
                    }
                    placeholder="Category"
                    className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={() => removeResponseDriver(driver.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              {showAdvancedSettings ? (
                <ChevronUpIcon className="h-5 w-5 mr-2" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 mr-2" />
              )}
              Advanced Settings
            </button>

            {showAdvancedSettings && (
              <div className="mt-4 space-y-4">
                {/* Add advanced settings here */}
              </div>
            )}
          </div>

          {/* Save Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Survey
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
