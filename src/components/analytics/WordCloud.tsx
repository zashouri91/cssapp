import React from 'react';
import ReactWordcloud from 'react-wordcloud';

interface WordCloudProps {
  words: {
    text: string;
    value: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }[];
}

export function WordCloud({ words }: WordCloudProps) {
  const options = {
    colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
    enableTooltip: true,
    deterministic: true,
    fontFamily: 'impact',
    fontSizes: [12, 60],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000,
  };

  // Transform words to include color based on sentiment
  const coloredWords = words.map(word => ({
    ...word,
    color: word.sentiment === 'positive' ? '#10B981' : 
           word.sentiment === 'negative' ? '#EF4444' : 
           '#6B7280',
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Common Feedback Terms</h3>
      <div style={{ height: '400px' }}>
        <ReactWordcloud words={coloredWords} options={options} />
      </div>
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
          <span className="text-sm text-gray-600">Positive</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-500 mr-2" />
          <span className="text-sm text-gray-600">Neutral</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <span className="text-sm text-gray-600">Negative</span>
        </div>
      </div>
    </div>
  );
}
