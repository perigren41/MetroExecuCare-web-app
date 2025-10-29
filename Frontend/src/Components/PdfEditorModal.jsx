import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Upload, CheckCircle, AlertCircle, Type, Edit3, Trash2, Image } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

// Set up PDF.js worker - use unpkg with .mjs extension for ES modules
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

export default function PdfEditorModal({
  isOpen,
  onClose,
  pdfUrl,
  onSave,
  templateName = "template.pdf",
  user = null // User data for auto-fill
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
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
  const [draggedAnnotation, setDraggedAnnotation] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [showAutoFillPanel, setShowAutoFillPanel] = useState(false);
  const [showSignatureUploadPanel, setShowSignatureUploadPanel] = useState(false);
  const [uploadedSignature, setUploadedSignature] = useState(null);
  const signatureUploadRef = useRef(null);
  const [formFields, setFormFields] = useState([]);
  const [hasFormFields, setHasFormFields] = useState(false);
  const [clickToPlaceMode, setClickToPlaceMode] = useState(false); // New: Click-to-place text mode
  const [pendingText, setPendingText] = useState(''); // Text waiting to be placed
  const [showFieldDropdown, setShowFieldDropdown] = useState(null); // Which field dropdown is open (TODO: Future feature)
  const [savedSignatures, setSavedSignatures] = useState([]); // Saved signatures from localStorage
  const fileInputRef = useRef(null); // For file upload input
  const [resizingAnnotation, setResizingAnnotation] = useState(null); // Currently resizing annotation
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 }); // Initial resize state

  // Load PDF when modal opens
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Loading PDF from URL:', pdfUrl);

        // First, fetch the PDF to get the bytes (this handles CORS better)
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        const pdfBytes = await response.arrayBuffer();
        console.log('PDF fetched successfully, size:', pdfBytes.byteLength, 'bytes');

        // Clone the ArrayBuffer for pdf-lib to prevent "detached ArrayBuffer" error
        // This happens because PDF.js may transfer ownership of the buffer
        const pdfBytesForPdfLib = pdfBytes.slice(0);
        console.log('Cloned ArrayBuffer for pdf-lib');

        // Load PDF for viewing (PDF.js) - use the original bytes
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        console.log('PDF.js loaded successfully, pages:', pdf.numPages);

        // Load PDF for editing (pdf-lib) - use the cloned bytes
        const pdfLibDocument = await PDFDocument.load(pdfBytesForPdfLib);
        setPdfLibDoc(pdfLibDocument);
        console.log('pdf-lib loaded successfully');

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        console.error('PDF URL:', pdfUrl);
        console.error('Error details:', err.message, err.stack);
        setError(`Failed to load PDF: ${err.message}. Please check the console for details.`);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [isOpen, pdfUrl]);

  // Detect form fields in PDF (for smart auto-fill)
  useEffect(() => {
    if (!pdfLibDoc) return;

    const detectFormFields = async () => {
      try {
        const form = pdfLibDoc.getForm();
        const fields = form.getFields();

        console.log('📋 PDF Form Fields Detected:', fields.length);

        if (fields.length > 0) {
          setHasFormFields(true);

          // Get all field names and types
          const fieldInfo = fields.map(field => ({
            name: field.getName(),
            type: field.constructor.name,
            field: field
          }));

          setFormFields(fieldInfo);
          console.log('✅ Form Fields:', fieldInfo);
        } else {
          console.log('⚠️ This PDF has no interactive form fields');
          setHasFormFields(false);
        }
      } catch (error) {
        console.log('ℹ️ No form fields in this PDF');
        setHasFormFields(false);
      }
    };

    detectFormFields();
  }, [pdfLibDoc]);

  // Enhanced: Map user data to form field names with intelligent label detection
  const mapUserDataToFormFields = (fieldName, userData) => {
    if (!userData) return null;

    // Normalize field name for matching
    const name = fieldName.toLowerCase().replace(/[_\-\s:]/g, '');

    // Calculate age from birth_date if available
    const calculateAge = () => {
      if (!userData.birth_date) return '';
      const birthDate = new Date(userData.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString();
    };

    // Comprehensive field mappings for HR templates
    const mappings = {
      // Name fields (multiple formats)
      name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      fullname: `${userData.first_name || ''} ${userData.middle_name || ''} ${userData.last_name || ''}`.trim(),
      completename: `${userData.first_name || ''} ${userData.middle_name || ''} ${userData.last_name || ''}`.trim(),
      applicantname: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      employeename: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      patientname: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      firstname: userData.first_name || '',
      lastname: userData.last_name || '',
      middlename: userData.middle_name || '',
      givenname: userData.first_name || '',
      surname: userData.last_name || '',

      // ID/Number fields
      id: userData.employee_id || '',
      idnumber: userData.employee_id || '',
      employeeid: userData.employee_id || '',
      empid: userData.employee_id || '',
      staffid: userData.employee_id || '',
      personnelid: userData.employee_id || '',

      // Department/Division
      department: userData.department || '',
      dept: userData.department || '',
      division: userData.department || '',
      section: userData.department || '',
      unit: userData.department || '',

      // Position/Job Title
      position: userData.position || '',
      title: userData.position || '',
      jobtitle: userData.position || '',
      role: userData.position || '',
      designation: userData.position || '',
      rank: userData.position || '',

      // Contact Information
      email: userData.email || '',
      emailaddress: userData.email || '',
      contact: userData.contact_number || '',
      contactnumber: userData.contact_number || '',
      phone: userData.contact_number || '',
      phonenumber: userData.contact_number || '',
      mobile: userData.contact_number || '',
      mobilenumber: userData.contact_number || '',
      telephone: userData.contact_number || '',

      // Branch/Office/Location
      branch: userData.branch || '',
      office: userData.branch || '',
      location: userData.branch || '',
      workplace: userData.branch || '',
      officeaddress: userData.branch || '',

      // Age and Sex
      age: calculateAge(),
      agesex: `${calculateAge()}/${userData.gender || 'N/A'}`,
      ageandsex: `${calculateAge()}/${userData.gender || 'N/A'}`,
      sex: userData.gender || '',
      gender: userData.gender || '',

      // Date fields
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      datetoday: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      today: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      currentdate: new Date().toLocaleDateString(),
      applicationdate: new Date().toLocaleDateString(),
      dateandtime: new Date().toLocaleString('en-US'),
      datetime: new Date().toLocaleString('en-US'),
      dateofapplication: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),

      // Hospital/Medical fields (leave blank for user to fill)
      hospital: '',
      hospitalname: '',
      clinic: '',
      clinicname: '',
      doctor: '',
      physician: '',

      // Address (if available in user data)
      address: userData.address || '',
      homeaddress: userData.address || '',
      residentialaddress: userData.address || '',
    };

    // Exact match
    if (mappings[name]) return mappings[name];

    // Partial match with priority scoring
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, value] of Object.entries(mappings)) {
      // Calculate match score based on substring matching
      if (name.includes(key)) {
        const score = key.length / name.length; // Longer matches score higher
        if (score > bestScore) {
          bestScore = score;
          bestMatch = value;
        }
      } else if (key.includes(name)) {
        const score = name.length / key.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = value;
        }
      }
    }

    return bestMatch;
  };

  // Smart auto-fill for PDFs with interactive form fields (WPS-style)
  const handleAutoFillFormFields = async () => {
    if (!pdfLibDoc || !user || !hasFormFields) {
      alert('This PDF does not have fillable form fields.');
      return;
    }

    try {
      const form = pdfLibDoc.getForm();
      let filledCount = 0;
      const skippedFields = [];
      const blankFields = []; // Fields intentionally left blank (hospital, doctor, etc.)
      const filledDetails = [];

      for (const fieldInfo of formFields) {
        const field = fieldInfo.field;
        const fieldName = fieldInfo.name;
        const value = mapUserDataToFormFields(fieldName, user);

        if (value) {
          try {
            if (fieldInfo.type === 'PDFTextField') {
              field.setText(String(value));
              filledCount++;
              filledDetails.push(`✓ ${fieldName}: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
              console.log(`✅ Filled "${fieldName}": ${value}`);
            } else if (fieldInfo.type === 'PDFDropdown') {
              field.select(String(value));
              filledCount++;
              filledDetails.push(`✓ ${fieldName}: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
            } else if (fieldInfo.type === 'PDFCheckBox') {
              if (value === true || value === 'true' || value === 'yes') {
                field.check();
                filledCount++;
                filledDetails.push(`✓ ${fieldName}: Checked`);
              }
            }
          } catch (err) {
            console.warn(`⚠️ Could not fill "${fieldName}":`, err.message);
            skippedFields.push(fieldName);
          }
        } else {
          // Check if this is a field that should be left blank (hospital, doctor, approval code, etc.)
          const normalizedName = fieldName.toLowerCase();
          if (normalizedName.includes('hospital') ||
              normalizedName.includes('clinic') ||
              normalizedName.includes('doctor') ||
              normalizedName.includes('physician') ||
              normalizedName.includes('approval') ||
              normalizedName.includes('expiration')) {
            blankFields.push(fieldName);
          } else {
            skippedFields.push(fieldName);
          }
        }
      }

      // Reload PDF to show filled fields
      const updatedBytes = await pdfLibDoc.save();
      const updatedPdfLibDoc = await PDFDocument.load(updatedBytes);
      setPdfLibDoc(updatedPdfLibDoc);

      // Trigger re-render
      setCurrentPage(currentPage);

      // Build detailed message
      let message = `🎉 Successfully auto-filled ${filledCount} field(s) with your information!\n\n`;

      if (filledDetails.length > 0 && filledDetails.length <= 10) {
        message += 'Filled fields:\n' + filledDetails.join('\n') + '\n\n';
      }

      if (blankFields.length > 0) {
        message += `📝 ${blankFields.length} field(s) left blank for manual entry:\n`;
        message += blankFields.slice(0, 5).map(f => `  • ${f}`).join('\n');
        if (blankFields.length > 5) message += `\n  • ... and ${blankFields.length - 5} more`;
        message += '\n\n';
      }

      if (skippedFields.length > 0) {
        message += `⚠️ ${skippedFields.length} field(s) could not be matched:\n`;
        message += skippedFields.slice(0, 3).map(f => `  • ${f}`).join('\n');
        if (skippedFields.length > 3) message += `\n  • ... and ${skippedFields.length - 3} more`;
      }

      alert(message);
    } catch (error) {
      console.error('Error auto-filling form fields:', error);
      alert('Failed to auto-fill form fields. Please try again.');
    }
  };

  // Fallback auto-fill: Create draggable text annotations with improved positioning
  const handleAutoFillAnnotations = () => {
    if (!user) {
      alert('User information not available for auto-fill.');
      return;
    }

    // Calculate age if birth_date available
    const calculateAge = () => {
      if (!user.birth_date) return '';
      const birthDate = new Date(user.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString();
    };

    const age = calculateAge();
    const ageSex = age && user.gender ? `${age}/${user.gender}` : (age || user.gender || '');
    const fullName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
    const positionDepartment = `${user.position || ''} / ${user.department || ''}`.replace(' / ', ' / ').trim();

    // Improved positioning based on typical HR approval form layout
    // Coordinates estimated for standard letter-size PDF at 1.5x scale
    const fields = [
      // Top left section
      { label: 'Patient Name', value: fullName, x: 540, y: 240, fontSize: 10 },
      { label: 'ID Number', value: user.employee_id || '', x: 540, y: 300, fontSize: 10 },
      { label: 'Date and Time', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), x: 540, y: 328, fontSize: 10 },

      // Top right section
      { label: 'Age/Sex', value: ageSex, x: 830, y: 268, fontSize: 10 },

      // Middle section - "To:" area
      { label: 'To - Employee Name', value: fullName, x: 490, y: 383, fontSize: 10 },
      { label: 'Position/Department', value: positionDepartment, x: 490, y: 423, fontSize: 10 },

      // "Dear" section
      { label: 'Dear Name', value: fullName, x: 485, y: 465, fontSize: 10 },
    ];

    const newAnnotations = fields
      .filter(f => f.value)
      .map((field, index) => ({
        type: 'text',
        text: field.value,
        page: currentPage,
        x: field.x,
        y: field.y,
        fontSize: field.fontSize,
        id: Date.now() + index,
        isAutoFilled: true,
        fieldLabel: field.label
      }));

    setAnnotations([...annotations, ...newAnnotations]);

    alert(
      `✅ Added ${newAnnotations.length} text fields with smart positioning!\n\n` +
      '📌 Fields are positioned near their labels:\n' +
      '  • Patient name\n' +
      '  • ID number\n' +
      '  • Age/Sex\n' +
      '  • Date and Time\n' +
      '  • To: [Employee Name]\n' +
      '  • Position/Department\n' +
      '  • Dear [Name]\n\n' +
      '🎯 Drag fields if you need to adjust positioning.\n' +
      '💡 Hospital Name, Approval Code, and signature fields are left blank for manual entry.'
    );
  };

  // Hybrid auto-fill: Use form fields if available, otherwise use annotations
  const handleSmartAutoFill = () => {
    if (!user) {
      alert('Please log in to use auto-fill.');
      return;
    }

    if (hasFormFields) {
      // Use WPS-style smart auto-fill
      handleAutoFillFormFields();
    } else {
      // Use draggable annotations
      handleAutoFillAnnotations();
    }
  };

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) {
      console.log('⏭️ Skipping render - pdfDoc:', !!pdfDoc, 'canvasRef:', !!canvasRef.current);
      return;
    }

    const renderPage = async () => {
      console.log('🎨 [PdfEditorModal] Starting renderPage - Page:', currentPage, 'Scale:', scale);

      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      console.log('📐 [PdfEditorModal] Viewport calculated:', {
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale
      });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Update state BEFORE setting canvas size to ensure container is ready
      console.log('📦 [PdfEditorModal] Setting canvasSize state:', {
        width: viewport.width,
        height: viewport.height
      });
      setCanvasSize({ width: viewport.width, height: viewport.height });

      // Set canvas size after state update
      console.log('🖼️ [PdfEditorModal] Setting canvas dimensions');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      console.log('🎯 [PdfEditorModal] Starting canvas render...');
      await page.render(renderContext).promise;
      console.log('✅ [PdfEditorModal] Canvas render complete!');
    };

    renderPage().catch(err => {
      console.error('❌ [PdfEditorModal] Render error:', err);
    });
  }, [pdfDoc, currentPage, scale, isLoading]);

  // Add text annotation - NEW: Click-to-place mode
  const handleAddText = () => {
    if (!textInput.trim()) return;

    // Enable click-to-place mode instead of adding at fixed position
    setPendingText(textInput);
    setClickToPlaceMode(true);
    setTextInput('');
    // Keep panel open to show instruction
  };

  // Handle PDF canvas click for placing text
  const handleCanvasClick = (e) => {
    if (!clickToPlaceMode || !pendingText) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add annotation at clicked position
    setAnnotations([...annotations, {
      type: 'text',
      text: pendingText,
      page: currentPage,
      x: x,
      y: y,
      fontSize: 14,
      id: Date.now(),
      isAutoFilled: false
    }]);

    // Reset click-to-place mode
    setPendingText('');
    setClickToPlaceMode(false);
    setShowTextPanel(false);
    setSelectedTool(null);
  };

  // Load saved signatures from localStorage
  useEffect(() => {
    const loadSavedSignatures = () => {
      try {
        const saved = localStorage.getItem('metroexecucare_signatures');
        if (saved) {
          setSavedSignatures(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading saved signatures:', error);
      }
    };
    loadSavedSignatures();
  }, []);

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

  // Save signature to localStorage for reuse
  const handleSaveSignature = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert('Please draw your signature first');
      return;
    }

    const signatureDataUrl = signaturePadRef.current.toDataURL();
    const signatureName = prompt('Enter a name for this signature (e.g., "My Signature", "John Doe"):');

    if (!signatureName || signatureName.trim() === '') {
      return;
    }

    const newSignature = {
      id: Date.now(),
      name: signatureName.trim(),
      dataUrl: signatureDataUrl,
      createdAt: new Date().toISOString()
    };

    const updatedSignatures = [...savedSignatures, newSignature];
    setSavedSignatures(updatedSignatures);
    localStorage.setItem('metroexecucare_signatures', JSON.stringify(updatedSignatures));

    signaturePadRef.current.clear();
    alert(`✅ Signature "${signatureName}" saved successfully! You can now reuse it in any document.`);
  };

  // Delete saved signature
  const handleDeleteSavedSignature = (signatureId) => {
    if (!confirm('Are you sure you want to delete this saved signature?')) {
      return;
    }

    const updatedSignatures = savedSignatures.filter(sig => sig.id !== signatureId);
    setSavedSignatures(updatedSignatures);
    localStorage.setItem('metroexecucare_signatures', JSON.stringify(updatedSignatures));
  };

  // Use saved signature (add to PDF)
  const handleUseSavedSignature = (signatureDataUrl) => {
    // Load image to get actual dimensions
    const img = new Image();
    img.onload = () => {
      // Calculate appropriate size (max 300px wide, maintain aspect ratio)
      const maxWidth = 300;
      const aspectRatio = img.height / img.width;
      const width = Math.min(img.width, maxWidth);
      const height = width * aspectRatio;

      setAnnotations([...annotations, {
        type: 'signature',
        dataUrl: signatureDataUrl,
        page: currentPage,
        x: 100,
        y: 200,
        width: width,
        height: height,
        id: Date.now()
      }]);
    };
    img.src = signatureDataUrl;
  };

  // Handle signature image upload
  const handleSignatureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;

      // Load image to get actual dimensions
      const img = new Image();
      img.onload = () => {
        // Calculate appropriate size (max 300px wide, maintain aspect ratio)
        const maxWidth = 300;
        const aspectRatio = img.height / img.width;
        const width = Math.min(img.width, maxWidth);
        const height = width * aspectRatio;

        // Add uploaded signature to PDF
        setAnnotations([...annotations, {
          type: 'signature',
          dataUrl: dataUrl,
          page: currentPage,
          x: 100,
          y: 200,
          width: width,
          height: height,
          id: Date.now()
        }]);
      };
      img.src = dataUrl;

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  // Save uploaded signature for future use
  const handleSaveUploadedSignature = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const signatureName = prompt('Enter a name for this signature (e.g., "My Signature", "John Doe"):');

      if (!signatureName || signatureName.trim() === '') {
        return;
      }

      const newSignature = {
        id: Date.now(),
        name: signatureName.trim(),
        dataUrl: dataUrl,
        createdAt: new Date().toISOString()
      };

      const updatedSignatures = [...savedSignatures, newSignature];
      setSavedSignatures(updatedSignatures);
      localStorage.setItem('metroexecucare_signatures', JSON.stringify(updatedSignatures));

      alert(`✅ Signature "${signatureName}" saved successfully! You can now reuse it in any document.`);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  // Remove annotation
  const handleRemoveAnnotation = (id) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
  };

  // Mouse/Touch drag handlers
  const handlePointerDown = (e, annotation) => {
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate offset between pointer and annotation top-left corner
    const offsetX = clientX - rect.left - annotation.x;
    const offsetY = clientY - rect.top - annotation.y;

    setDraggedAnnotation(annotation);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handlePointerMove = (e) => {
    if (!draggedAnnotation || !containerRef.current) return;

    e.preventDefault();
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate new position with offset
    let x = clientX - rect.left - dragOffset.x;
    let y = clientY - rect.top - dragOffset.y;

    // Constrain within canvas bounds
    x = Math.max(0, Math.min(x, canvasSize.width - 100));
    y = Math.max(0, Math.min(y, canvasSize.height - 50));

    // Update annotation position
    setAnnotations(annotations.map(ann =>
      ann.id === draggedAnnotation.id
        ? { ...ann, x, y }
        : ann
    ));
  };

  const handlePointerUp = () => {
    setDraggedAnnotation(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Add global listeners for mouse/touch move and up
  useEffect(() => {
    if (!draggedAnnotation) return;

    const handleMove = (e) => handlePointerMove(e);
    const handleUp = () => handlePointerUp();

    // Add both mouse and touch listeners
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [draggedAnnotation, dragOffset, annotations, canvasSize]);

  // Resize handlers for signatures
  const handleResizeStart = (e, annotation) => {
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setResizingAnnotation(annotation);
    setResizeStart({
      x: clientX,
      y: clientY,
      width: annotation.width,
      height: annotation.height
    });
  };

  const handleResizeMove = (e) => {
    if (!resizingAnnotation || !containerRef.current) return;

    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate delta from start
    const deltaX = clientX - resizeStart.x;
    const deltaY = clientY - resizeStart.y;

    // Calculate new dimensions maintaining aspect ratio
    const aspectRatio = resizeStart.height / resizeStart.width;
    let newWidth = Math.max(50, resizeStart.width + deltaX);
    let newHeight = newWidth * aspectRatio;

    // Constrain maximum size
    newWidth = Math.min(newWidth, canvasSize.width - resizingAnnotation.x);
    newHeight = Math.min(newHeight, canvasSize.height - resizingAnnotation.y);

    // Update annotation size
    setAnnotations(annotations.map(ann =>
      ann.id === resizingAnnotation.id
        ? { ...ann, width: newWidth, height: newHeight }
        : ann
    ));
  };

  const handleResizeEnd = () => {
    setResizingAnnotation(null);
    setResizeStart({ x: 0, y: 0, width: 0, height: 0 });
  };

  // Add global listeners for resize
  useEffect(() => {
    if (!resizingAnnotation) return;

    const handleMove = (e) => handleResizeMove(e);
    const handleUp = () => handleResizeEnd();

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [resizingAnnotation, resizeStart, annotations, canvasSize]);

  // Upload PDF with annotations (no download)
  const handleUploadOnly = async () => {
    if (!pdfLibDoc) return;

    try {
      setIsSaving(true);

      // Create a copy of the PDF
      const pdfDocCopy = await PDFDocument.load(await pdfLibDoc.save());
      const pages = pdfDocCopy.getPages();

      // Add annotations to the PDF
      for (const annotation of annotations) {
        const page = pages[annotation.page - 1];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Calculate the scale factor between canvas and PDF
        // Canvas dimensions are scaled, PDF dimensions are actual
        const scaleX = pageWidth / canvasSize.width;
        const scaleY = pageHeight / canvasSize.height;

        if (annotation.type === 'text') {
          // Convert canvas coordinates to PDF coordinates
          const pdfX = annotation.x * scaleX;
          const pdfY = pageHeight - (annotation.y * scaleY) - (annotation.fontSize * scaleY);

          page.drawText(annotation.text, {
            x: pdfX,
            y: pdfY,
            size: annotation.fontSize * scaleY,
            color: rgb(0, 0, 0),
          });
        } else if (annotation.type === 'signature') {
          // Convert base64 signature to image
          const signatureImageBytes = await fetch(annotation.dataUrl).then(res => res.arrayBuffer());
          const signatureImage = await pdfDocCopy.embedPng(signatureImageBytes);

          // Convert canvas coordinates to PDF coordinates
          const pdfX = annotation.x * scaleX;
          const pdfY = pageHeight - (annotation.y * scaleY) - (annotation.height * scaleY);
          const pdfWidth = annotation.width * scaleX;
          const pdfHeight = annotation.height * scaleY;

          page.drawImage(signatureImage, {
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight,
          });
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDocCopy.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Create a File object from the blob for upload
      const fileName = templateName.replace('.pdf', '_filled.pdf');
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
      console.error('Error uploading PDF:', err);
      setError('Failed to upload PDF. Please try again.');
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
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Calculate the scale factor between canvas and PDF
        // Canvas dimensions are scaled, PDF dimensions are actual
        const scaleX = pageWidth / canvasSize.width;
        const scaleY = pageHeight / canvasSize.height;

        if (annotation.type === 'text') {
          // Convert canvas coordinates to PDF coordinates
          const pdfX = annotation.x * scaleX;
          const pdfY = pageHeight - (annotation.y * scaleY) - (annotation.fontSize * scaleY);

          page.drawText(annotation.text, {
            x: pdfX,
            y: pdfY,
            size: annotation.fontSize * scaleY,
            color: rgb(0, 0, 0),
          });
        } else if (annotation.type === 'signature') {
          // Convert base64 signature to image
          const signatureImageBytes = await fetch(annotation.dataUrl).then(res => res.arrayBuffer());
          const signatureImage = await pdfDocCopy.embedPng(signatureImageBytes);

          // Convert canvas coordinates to PDF coordinates
          const pdfX = annotation.x * scaleX;
          const pdfY = pageHeight - (annotation.y * scaleY) - (annotation.height * scaleY);
          const pdfWidth = annotation.width * scaleX;
          const pdfHeight = annotation.height * scaleY;

          page.drawImage(signatureImage, {
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight,
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

            {/* Smart Auto-Fill Button */}
            {user && (
              <button
                onClick={handleSmartAutoFill}
                className="cursor-pointer px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
                title={hasFormFields ? 'Smart auto-fill with your information' : 'Add draggable fields with your information'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {hasFormFields ? `Auto-Fill (${formFields.length} fields)` : 'Auto-Fill My Info'}
              </button>
            )}

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
                <div className="bg-white shadow-lg mx-auto" style={{ width: 'fit-content', minHeight: '400px' }}>
                  {/* PDF Canvas with annotation overlay */}
                  <div
                    ref={containerRef}
                    className="relative select-none"
                    style={{
                      width: canvasSize.width > 0 ? `${canvasSize.width}px` : 'auto',
                      height: canvasSize.height > 0 ? `${canvasSize.height}px` : 'auto',
                      minHeight: '400px',
                      cursor: clickToPlaceMode ? 'crosshair' : 'default'
                    }}
                    onClick={handleCanvasClick}
                  >
                    <canvas
                      ref={canvasRef}
                      className="max-w-full block"
                      style={{ display: 'block' }}
                    />

                    {/* Click-to-place mode indicator */}
                    {clickToPlaceMode && pendingText && (
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-20 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        <span className="font-medium">Click anywhere on the PDF to place: "{pendingText}"</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setClickToPlaceMode(false);
                            setPendingText('');
                            setTextInput(pendingText);
                          }}
                          className="ml-2 text-white hover:text-red-200"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Render annotations as draggable overlays */}
                    {annotations
                      .filter(ann => ann.page === currentPage)
                      .map(annotation => (
                        <div
                          key={annotation.id}
                          onMouseDown={(e) => handlePointerDown(e, annotation)}
                          onTouchStart={(e) => handlePointerDown(e, annotation)}
                          style={{
                            position: 'absolute',
                            left: annotation.x,
                            top: annotation.y,
                            cursor: draggedAnnotation?.id === annotation.id ? 'grabbing' : 'grab',
                            zIndex: annotation.type === 'signature' ? 5 : 10,
                            touchAction: 'none',
                            userSelect: 'none'
                          }}
                          className="group"
                        >
                          {annotation.type === 'text' ? (
                            <div
                              className={`px-2 py-1 rounded transition-shadow ${
                                annotation.isAutoFilled
                                  ? 'border border-gray-300 shadow-sm hover:shadow-md bg-white'
                                  : 'border-2 border-yellow-400 shadow-lg hover:shadow-xl'
                              }`}
                              style={{
                                background: annotation.isAutoFilled
                                  ? 'rgba(255, 255, 255, 0.95)'
                                  : 'rgba(254, 249, 195, 0.5)'
                              }}
                            >
                              <span style={{ fontSize: annotation.fontSize, color: '#000', fontWeight: annotation.isAutoFilled ? '500' : 'normal' }}>{annotation.text}</span>
                              <button
                                onClick={() => handleRemoveAnnotation(annotation.id)}
                                className="ml-2 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove this field"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="relative border-2 border-blue-400 rounded shadow-lg hover:shadow-xl transition-shadow" style={{ background: 'rgba(255, 255, 255, 0.3)' }}>
                              <img
                                src={annotation.dataUrl}
                                alt="Signature"
                                style={{
                                  width: annotation.width,
                                  height: annotation.height,
                                  display: 'block',
                                  pointerEvents: 'none'
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAnnotation(annotation.id);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                                title="Remove signature"
                              >
                                ×
                              </button>
                              {/* Resize handle - bottom right corner */}
                              <div
                                onMouseDown={(e) => handleResizeStart(e, annotation)}
                                onTouchStart={(e) => handleResizeStart(e, annotation)}
                                className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-600 border-2 border-white rounded-full hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-nwse-resize flex items-center justify-center z-10"
                                title="Drag to resize"
                                style={{ touchAction: 'none' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                                  <path d="M11 1L1 11M11 5L5 11M11 9L9 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

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

                {/* Instruction for click-to-place mode */}
                {clickToPlaceMode && pendingText ? (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      📍 Click-to-Place Mode Active
                    </p>
                    <p className="text-xs text-blue-600">
                      Click anywhere on the PDF where you want to place: <strong>"{pendingText}"</strong>
                    </p>
                    <button
                      onClick={() => {
                        setClickToPlaceMode(false);
                        setPendingText('');
                        setTextInput(pendingText);
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Cancel and edit text
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                      💡 <strong>Tip:</strong> Type your text below, then click "Add Text". You'll be able to click anywhere on the PDF to place it!
                    </div>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter text to add to PDF..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                      rows={4}
                    />
                    <button
                      onClick={handleAddText}
                      disabled={!textInput.trim()}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Text to PDF
                    </button>
                  </>
                )}

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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Signature</h3>

                {/* Draw Signature Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Draw Signature</h4>
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <SignatureCanvas
                      ref={signaturePadRef}
                      canvasProps={{
                        className: 'w-full h-40 bg-white'
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <button
                      onClick={() => signaturePadRef.current?.clear()}
                      className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveSignature}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                      title="Save this signature for reuse"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleAddSignature}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Upload Signature Section */}
                <div className="mb-6 pb-6 border-b">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Upload Signature</h4>
                  <p className="text-xs text-gray-500 mb-3">Upload an image of your signature (PNG, JPG)</p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                    id="signature-upload"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <label
                      htmlFor="signature-upload"
                      className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm text-center flex items-center justify-center gap-2"
                    >
                      <Upload size={16} />
                      Add to PDF
                    </label>

                    <label
                      className="cursor-pointer px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm text-center flex items-center justify-center gap-2"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = handleSaveUploadedSignature;
                        input.click();
                      }}
                    >
                      <Upload size={16} />
                      Save
                    </label>
                  </div>
                </div>

                {/* Saved Signatures Gallery */}
                {savedSignatures.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">My Saved Signatures</h4>
                    <div className="space-y-2">
                      {savedSignatures.map(signature => (
                        <div key={signature.id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">{signature.name}</span>
                            <button
                              onClick={() => handleDeleteSavedSignature(signature.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete this signature"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <img
                            src={signature.dataUrl}
                            alt={signature.name}
                            className="w-full h-16 object-contain border border-gray-200 bg-white rounded cursor-pointer hover:border-blue-500"
                            onClick={() => handleUseSavedSignature(signature.dataUrl)}
                            title="Click to add to PDF"
                          />
                          <button
                            onClick={() => handleUseSavedSignature(signature.dataUrl)}
                            className="w-full mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Add to PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures on Current Page */}
                {annotations.filter(a => a.type === 'signature' && a.page === currentPage).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Signatures on This Page:</h4>
                    <div className="space-y-2">
                      {annotations
                        .filter(a => a.type === 'signature' && a.page === currentPage)
                        .map(annotation => (
                          <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                            <img src={annotation.dataUrl} alt="Signature" className="h-10 border border-gray-200 bg-white" />
                            <button
                              onClick={() => handleRemoveAnnotation(annotation.id)}
                              className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Remove from PDF"
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
              onClick={handleUploadOnly}
              disabled={isSaving || isLoading || annotations.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload
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
              Your PDF has been processed successfully.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
