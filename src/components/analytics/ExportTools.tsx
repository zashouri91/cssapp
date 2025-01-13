import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportToolsProps {
  data: any[];
  reportName: string;
  onScheduleReport: (schedule: ReportSchedule) => void;
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'csv' | 'pdf';
  filters: any;
}

export function ExportTools({ data, reportName, onScheduleReport }: ExportToolsProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedule, setSchedule] = useState<ReportSchedule>({
    frequency: 'weekly',
    recipients: [],
    format: 'pdf',
    filters: {},
  });

  const exportToCSV = () => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    const excelBuffer = write(wb, { bookType: 'csv', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'text/csv;charset=utf-8' });
    saveAs(dataBlob, `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(reportName, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

    // Add table
    const headers = Object.keys(data[0]);
    const rows = data.map(item => Object.values(item));

    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${reportName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Export Options</h3>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Export PDF
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Schedule Report
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={schedule.frequency}
                  onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Recipients</label>
                <input
                  type="text"
                  placeholder="Enter email addresses (comma-separated)"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  onChange={(e) => setSchedule({
                    ...schedule,
                    recipients: e.target.value.split(',').map(email => email.trim()),
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <select
                  value={schedule.format}
                  onChange={(e) => setSchedule({ ...schedule, format: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onScheduleReport(schedule);
                  setShowScheduleModal(false);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
