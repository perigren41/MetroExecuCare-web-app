import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Upload, CheckCircle, AlertCircle, Type, Edit3, Trash2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfEditorModal({
  isOpen,
  onClose,
  pdfUrl,
  onSave,
  templateName = "template.pdf"
}) {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfLibDoc, setPdfLibDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSignaturePanel, setShowSignaturePanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null); // 'text' or 'signature'

  // Load PDF when modal opens
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load PDF for viewing (PDF.js)
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);

        // Load PDF for editing (pdf-lib)
        const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
        const pdfLibDocument = await PDFDocument.load(pdfBytes);
        setPdfLibDoc(pdfLibDocument);

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF. Please try again.');
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [isOpen, pdfUrl]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, annotations]);

  // Add text annotation
  const handleAddText = () => {
    if (!textInput.trim()) return;

    setAnnotations([...annotations, {
      type: 'text',
      text: textInput,
      page: currentPage,
      x: 100, // Default position
      y: 100,
      fontSize: 14,
      id: Date.now()
    }]);

    setTextInput('');
    setShowTextPanel(false);
    setSelectedTool(null);
  };

  // Add signature annotation
  const handleAddSignature = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert('Please draw your signature first');
      return;
    }

    const signatureDataUrl = signaturePadRef.current.toDataURL();

    setAnnotations([...annotations, {
      type: 'signature',
      dataUrl: signatureDataUrl,
      page: currentPage,
      x: 100,
      y: 200,
      width: 200,
      height: 100,
      id: Date.now()
    }]);

    signaturePadRef.current.clear();
    setShowSignaturePanel(false);
    setSelectedTool(null);
  };

  // Remove annotation
  const handleRemoveAnnotation = (id) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
  };

  // Save and download PDF with annotations
  const handleSaveAndDownload = async () => {
    if (!pdfLibDoc) return;

    try {
      setIsSaving(true);

      // Create a copy of the PDF
      const pdfDocCopy = await PDFDocument.load(await pdfLibDoc.save());
      const pages = pdfDocCopy.getPages();

      // Add annotations to the PDF
      for (const annotation of annotations) {
        const page = pages[annotation.page - 1];
        const { height } = page.getSize();

        if (annotation.type === 'text') {
          page.drawText(annotation.text, {
            x: annotation.x,
            y: height - annotation.y - annotation.fontSize,
            size: annotation.fontSize,
            color: rgb(0, 0, 0),
          });
        } else if (annotation.type === 'signature') {
          // Convert base64 signature to image
          const signatureImageBytes = await fetch(annotation.dataUrl).then(res => res.arrayBuffer());
          const signatureImage = await pdfDocCopy.embedPng(signatureImageBytes);

          page.drawImage(signatureImage, {
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
          });
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDocCopy.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Download the filled PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = templateName.replace('.pdf', '_filled.pdf');
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Create a File object from the blob for upload
      const file = new File([blob], fileName, {
        type: 'application/pdf'
      });

      // Call the onSave callback with the file
      if (onSave) {
        await onSave(file);
      }

      setIsSaving(false);
      setShowSuccessModal(true);

      // Auto-close success modal after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error saving PDF:', err);
      setError('Failed to save PDF. Please try again.');
      setIsSaving(false);
    }
  };

  // Handle just download without upload
  const handleDownloadOnly = async () => {
    if (!pdfLibDoc) return;

    try {
      setIsSaving(true);

      // Create a copy of the PDF
      const pdfDocCopy = await PDFDocument.load(await pdfLibDoc.save());
      const pages = pdfDocCopy.getPages();

      // Add annotations to the PDF
      for (const annotation of annotations) {
        const page = pages[annotation.page - 1];
        const { height } = page.getSize();

        if (annotation.type === 'text') {
          page.drawText(annotation.text, {
            x: annotation.x,
            y: height - annotation.y - annotation.fontSize,
            size: annotation.fontSize,
            color: rgb(0, 0, 0),
          });
        } else if (annotation.type === 'signature') {
          const signatureImageBytes = await fetch(annotation.dataUrl).then(res => res.arrayBuffer());
          const signatureImage = await pdfDocCopy.embedPng(signatureImageBytes);

          page.drawImage(signatureImage, {
            x: annotation.x,
            y: height - annotation.y - annotation.height,
            width: annotation.width,
            height: annotation.height,
          });
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDocCopy.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Download the filled PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = templateName.replace('.pdf', '_filled.pdf');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setIsSaving(false);
      setShowSuccessModal(true);

      // Auto-close success modal after 1.5 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 1500);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main PDF Editor Modal */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center rounded-t-lg">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold">Fill & Sign Template</h2>
              <p className="text-sm text-white/80 mt-1">
                Add text or draw your signature on the PDF
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition ml-4"
              disabled={isSaving}
            >
              <X size={24} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-gray-50 border-b p-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedTool('text');
                setShowTextPanel(true);
                setShowSignaturePanel(false);
              }}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition ${
                selectedTool === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Type size={18} />
              Add Text
            </button>

            <button
              onClick={() => {
                setSelectedTool('signature');
                setShowSignaturePanel(true);
                setShowTextPanel(false);
              }}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition ${
                selectedTool === 'signature'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Edit3 size={18} />
              Add Signature
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
              >
                Zoom Out
              </button>
              <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(Math.min(3, scale + 0.25))}
                className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
              >
                Zoom In
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* PDF Viewer */}
            <div className="flex-1 bg-gray-100 overflow-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md p-6">
                    <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {!isLoading && !error && (
                <div className="bg-white shadow-lg mx-auto" style={{ width: 'fit-content' }}>
                  <canvas ref={canvasRef} className="max-w-full" />

                  {/* Page Navigation */}
                  {totalPages > 1 && (
                    <div className="bg-gray-50 border-t p-3 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Side Panel for Text Input */}
            {showTextPanel && (
              <div className="w-80 bg-white border-l p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Text</h3>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text to add to PDF..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                  rows={4}
                />
                <button
                  onClick={handleAddText}
                  className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Text to PDF
                </button>

                {/* Annotations List */}
                {annotations.filter(a => a.type === 'text' && a.page === currentPage).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Added Text on This Page:</h4>
                    <div className="space-y-2">
                      {annotations
                        .filter(a => a.type === 'text' && a.page === currentPage)
                        .map(annotation => (
                          <div key={annotation.id} className="flex items-start justify-between p-2 bg-gray-50 rounded text-sm">
                            <span className="flex-1 truncate">{annotation.text}</span>
                            <button
                              onClick={() => handleRemoveAnnotation(annotation.id)}
                              className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Side Panel for Signature */}
            {showSignaturePanel && (
              <div className="w-80 bg-white border-l p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Draw Signature</h3>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <SignatureCanvas
                    ref={signaturePadRef}
                    canvasProps={{
                      className: 'w-full h-40 bg-white'
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => signaturePadRef.current?.clear()}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleAddSignature}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add to PDF
                  </button>
                </div>

                {/* Signatures List */}
                {annotations.filter(a => a.type === 'signature' && a.page === currentPage).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Added Signatures on This Page:</h4>
                    <div className="space-y-2">
                      {annotations
                        .filter(a => a.type === 'signature' && a.page === currentPage)
                        .map(annotation => (
                          <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <img src={annotation.dataUrl} alt="Signature" className="h-10 border border-gray-200" />
                            <button
                              onClick={() => handleRemoveAnnotation(annotation.id)}
                              className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white border-t p-4 flex flex-col sm:flex-row gap-3 justify-end rounded-b-lg">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadOnly}
              disabled={isSaving || isLoading || annotations.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Download size={18} />
              Download Only
            </button>
            <button
              onClick={handleSaveAndDownload}
              disabled={isSaving || isLoading || annotations.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Save & Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600">
              Your PDF has been saved and downloaded successfully.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
