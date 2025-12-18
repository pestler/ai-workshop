import { Button, message } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import { useApp } from '../../context/AppContext';
import './ExportButton.css';

export function ExportButton() {
  const { state } = useApp();

  const handleExport = () => {
    if (state.unknownWordIds.length === 0) {
      message.info('No unknown words to export');
      return;
    }

    // Get unknown words
    const unknownWords = state.allWords.filter((w) =>
      state.unknownWordIds.includes(w.id)
    );

    // Create PDF
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Unknown Words - Oxford 3000', 20, 20);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total: ${unknownWords.length} words`, 20, 36);

    // Reset color
    doc.setTextColor(0);

    // Words list
    doc.setFontSize(12);
    let y = 50;
    const pageHeight = doc.internal.pageSize.height;

    // Group by level
    const levels = ['A1', 'A2', 'B1', 'B2'];

    levels.forEach((level) => {
      const wordsAtLevel = unknownWords.filter((w) => w.level === level);
      if (wordsAtLevel.length === 0) return;

      // Level header
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${level} (${wordsAtLevel.length} words)`, 20, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      wordsAtLevel.forEach((word) => {
        if (y > pageHeight - 10) {
          doc.addPage();
          y = 20;
        }

        doc.text(`• ${word.word} (${word.pos})`, 25, y);
        y += 6;
      });

      y += 8;
    });

    // Save
    doc.save('unknown-words.pdf');
    message.success('PDF exported successfully!');
  };

  return (
    <Button
      icon={<FilePdfOutlined />}
      onClick={handleExport}
      disabled={state.unknownWordIds.length === 0}
      className="export-button"
    >
      Export Unknown Words (PDF)
    </Button>
  );
}
