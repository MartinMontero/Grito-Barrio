/**
 * PDF Export Utility
 * Protocolo CDMX
 * 
 * Handles PDF generation from form data with legal-grade documentation standards
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import type { FormData, FormTemplate } from '@/types/forms'

export interface PDFExportOptions {
  password?: string
  includeAttachments?: boolean
  pdfaCompliance?: boolean
  includeQRCode?: boolean
  watermark?: string
}

export interface PDFMetadata {
  title: string
  author: string
  subject: string
  keywords: string[]
  creator: string
  incidentId?: string
  formId: string
  hash: string
}

/**
 * Generate a PDF from form data
 */
export async function generateFormPDF(
  formData: FormData,
  template: FormTemplate,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  })

  // Set document metadata
  doc.setProperties({
    title: template.title,
    subject: `Formulario ${template.id} - Incidente ${formData.incidentId || 'N/A'}`,
    author: formData.createdBy,
    keywords: ['Protocolo CDMX', 'Incidente', template.type, 'Legal'].join(', '),
    creator: 'Protocolo CDMX App'
  })

  // Enable PDF/A compliance if requested
  if (options.pdfaCompliance) {
    // Add PDF/A metadata
    (doc as any).setCreationDate?.(new Date(formData.createdAt))
    ;(doc as any).setModificationDate?.(new Date(formData.updatedAt))
  }

  let currentY = 20

  // Header
  addHeader(doc, template, formData, currentY)
  currentY += 35

  // QR Code for digital verification
  if (options.includeQRCode !== false) {
    await addQRCode(doc, formData, currentY)
    currentY += 35
  }

  // Form sections
  template.sections.forEach((section, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    // Section title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${section.title}`, 20, currentY)
    currentY += 10

    // Section description
    if (section.description) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text(section.description, 20, currentY)
      currentY += 8
    }

    // Section fields
    const sectionData = section.fields.map(field => [
      field.label + (field.required ? ' *' : ''),
      formatFieldValue(formData.values[field.id])
    ])

    if (sectionData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Campo', 'Valor']],
        body: sectionData,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20 }
      })

      currentY = (doc as any).lastAutoTable.finalY + 10
    }
  })

  // Footer
  addFooter(doc, formData, template)

  // Add watermark if provided
  if (options.watermark) {
    addWatermark(doc, options.watermark)
  }

  // Apply password protection if requested
  if (options.password) {
    // Note: jsPDF doesn't natively support password protection
    // This would require additional libraries like pdf-lib
    console.warn('Password protection requires additional library (pdf-lib)')
  }

  return doc.output('blob')
}

/**
 * Add header to PDF
 */
function addHeader(doc: jsPDF, template: FormTemplate, formData: FormData, y: number) {
  // Logo placeholder
  doc.setFillColor(41, 128, 185)
  doc.rect(20, y - 15, 10, 10, 'F')
  
  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Protocolo CDMX', 35, y - 10)
  
  // Form title
  doc.setFontSize(16)
  doc.text(template.title, 20, y + 5)
  
  // Form metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Formulario ID: ${formData.id}`, 20, y + 15)
  doc.text(`Versión: ${template.version}`, 20, y + 20)
  doc.text(`Creado: ${new Date(formData.createdAt).toLocaleString('es-MX')}`, 20, y + 25)
  
  if (formData.incidentId) {
    doc.text(`Incidente: ${formData.incidentId}`, 120, y + 15)
  }
  
  // Status
  doc.setFont('helvetica', 'bold')
  const statusLabels: Record<string, string> = {
    draft: 'BORRADOR',
    completed: 'COMPLETADO',
    signed: 'FIRMADO',
    archived: 'ARCHIVADO'
  }
  doc.text(`Estado: ${statusLabels[formData.status] || formData.status}`, 120, y + 25)
  
  // Hash
  if (formData.hash) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Hash: ${formData.hash.substring(0, 32)}...`, 20, y + 30)
  }
}

/**
 * Add QR code for digital verification
 */
async function addQRCode(doc: jsPDF, formData: FormData, y: number) {
  try {
    const qrData = JSON.stringify({
      id: formData.id,
      hash: formData.hash,
      incidentId: formData.incidentId,
      timestamp: formData.createdAt
    })
    
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    
    doc.addImage(qrDataUrl, 'PNG', 150, y - 10, 30, 30)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Escanea para verificar', 150, y + 25)
    doc.text('autenticidad digital', 150, y + 29)
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}

/**
 * Add footer to PDF
 */
function addFooter(doc: jsPDF, formData: FormData, template: FormTemplate) {
  const pageCount = doc.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Footer line
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 280, 190, 280)
    
    // Footer text
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    
    doc.text(
      `Protocolo CDMX · ${template.title} · Página ${i} de ${pageCount}`,
      20,
      287
    )
    
    doc.text(
      'Documento confidencial · Protegido por leyes de protección de datos',
      20,
      292
    )
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
  }
}

/**
 * Add watermark to PDF
 */
function addWatermark(doc: jsPDF, watermark: string) {
  const pageCount = doc.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }))
    doc.setFontSize(60)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 200, 200)
    
    // Center watermark
    const textWidth = doc.getTextWidth(watermark)
    const x = (210 - textWidth) / 2
    const y = 150
    
    doc.text(watermark, x, y, { angle: 45 })
    doc.restoreGraphicsState()
    
    // Reset
    doc.setTextColor(0, 0, 0)
  }
}

/**
 * Format field value for PDF
 */
function formatFieldValue(value: any): string {
  if (value === undefined || value === null || value === '') {
    return '[No especificado]'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[Ninguno]'
    }
    return value.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : String(item)
    ).join(', ')
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  // Check if it's a date string
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('es-MX')
      }
    } catch {
      return value
    }
  }

  return String(value)
}

/**
 * Generate hash for form data integrity verification
 */
export async function generateFormHash(formData: FormData): Promise<string> {
  const data = JSON.stringify({
    id: formData.id,
    templateId: formData.templateId,
    incidentId: formData.incidentId,
    values: formData.values,
    createdAt: formData.createdAt,
    createdBy: formData.createdBy
  })

  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Download PDF file
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Print form directly
 */
export function printForm(formElement: HTMLElement) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('Could not open print window')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Imprimir Formulario</title>
        <link rel="stylesheet" href="/styles/print.css">
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${formElement.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `)
  
  printWindow.document.close()
}

/**
 * Generate incident report PDF
 */
export async function generateIncidentReportPDF(
  incidentData: any,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Reporte de Incidente', 20, 30)
  
  // Incident details
  doc.setFontSize(12)
  doc.text(`ID: ${incidentData.id}`, 20, 50)
  doc.text(`Fecha: ${new Date(incidentData.timestamp).toLocaleString('es-MX')}`, 20, 58)
  doc.text(`Ubicación: ${incidentData.location?.address || 'N/A'}`, 20, 66)
  doc.text(`Alcaldía: ${incidentData.location?.alcaldia || 'N/A'}`, 20, 74)
  
  // Team information
  if (incidentData.team && incidentData.team.length > 0) {
    doc.text('Equipo Asignado:', 20, 90)
    let y = 98
    incidentData.team.forEach((member: any, index: number) => {
      doc.text(`${index + 1}. ${member.pseudonym} (${member.role})`, 25, y)
      y += 8
    })
  }
  
  // Description
  if (incidentData.description) {
    doc.text('Descripción:', 20, 130)
    const splitDescription = doc.splitTextToSize(incidentData.description, 170)
    doc.text(splitDescription, 20, 138)
  }
  
  // Footer
  addFooter(doc, {
    id: incidentData.id,
    templateId: 'incident_report',
    status: 'completed',
    createdAt: incidentData.timestamp,
    updatedAt: new Date().toISOString(),
    createdBy: incidentData.reporterPseudonym || 'System',
    values: incidentData
  } as FormData, {
    id: 'incident_report',
    type: 'incident_report',
    title: 'Reporte de Incidente',
    description: '',
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    sections: []
  })
  
  return doc.output('blob')
}

export default {
  generateFormPDF,
  generateFormHash,
  downloadPDF,
  printForm,
  generateIncidentReportPDF
}