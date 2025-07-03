import path from 'node:path'
import PDFDocument from 'pdfkit'

import { Inject, Injectable } from '@nestjs/common'

import {
  FATCAStatus,
  TrusteeCountry,
  EntityFATCAStatus,
  TaxTreatyBenefits,
  SponsoredFIICertify,
  FedTaxClassification,
  IdentificationStatus,
} from '../tax-info/tax-info.types'
import type { TaxInfo1099FormDto, TaxInfoW8BenEFormDto, TaxInfoW8BenFormDto, TaxInfoW9FormDto } from '../tax-info/tax-info.dto'

import type { Form1099Data } from './tax-form.types'
import { BASE_FORMS_PATH } from './base-forms-path.token'

export enum FormType1099 {
  COPY_A = 'copyA',
  COPY_1 = 'copy1',
  COPY_B = 'copyB',
  COPY_2 = 'copy2',
}

export enum TaxUserType {
  PAYER = 'payer',
  RECIPIENT = 'recipient',
}

const forms1099 = {
  [TaxUserType.PAYER]: [FormType1099.COPY_A, FormType1099.COPY_1],
  [TaxUserType.RECIPIENT]: [FormType1099.COPY_B, FormType1099.COPY_2],
}

@Injectable()
export class TaxFormGenerator {
  constructor(@Inject(BASE_FORMS_PATH) private readonly formsBasePath: string) {}

  formatDate = (dateNumber: number): string => {
    const date = new Date(dateNumber)
    return `${date.toTimeString().slice(0, 8)} ${date.getHours() >= 12 ? 'PM' : 'AM'} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  generate1099TaxFormPdf = async (
    formData: Form1099Data,
    userType: TaxUserType,
    securityCode: string,
    dateNumber: number
  ): Promise<Buffer> => {
    if (!userType) throw new Error(`User type is required`)
    const forms = forms1099[userType]

    const date = this.formatDate(dateNumber)

    return await new Promise((resolve) => {
      const payerData = formData.payerDetails
      const recipientData = formData.recipientDetails

      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        userPassword: securityCode,
        ownerPassword: securityCode,
      })

      for (const [index, form] of forms.entries()) {
        if (index !== 0) {
          doc.addPage()
        }

        // Fill out the form
        doc.image(path.join(this.formsBasePath, `tax-form-1099-${form}.template.png`), 0, 0, { width: 600 })
        doc.fontSize(8)
        doc.text(payerData.name, 52, 65)
        doc.text(payerData.address)
        doc.text(`${payerData.city}, ${payerData.state} ${payerData.zip}`)
        doc.text(payerData.country)
        if (payerData.ssn) doc.text(payerData.ssn, 60, 120)
        else if (payerData.ein) doc.text(payerData.ein, 60, 120)

        if (recipientData.ssn) doc.text(recipientData.ssn, 180, 120)
        else if (recipientData.ein) doc.text(recipientData.ein, 180, 120)
        doc.text(formData.compensation, 300, 120, { width: 180, align: 'right' })
        doc.text(recipientData.name, 52, 155)
        doc.text(recipientData.address, 52, 177)
        doc.text(`${recipientData.city}, ${recipientData.state} ${recipientData.zip} ${recipientData.country}`, 52, 200)
        doc.text(formData.year, 415, 95)

        doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })
      }

      doc.end()

      const buffer: Uint8Array[] = []
      doc.on('data', buffer.push.bind(buffer))
      doc.on('end', () => {
        const data = Buffer.concat(buffer)
        resolve(data)
      })
    })
  }

  generateW9TaxFormPdf = async (
    formData: TaxInfoW9FormDto,
    payerData: TaxInfo1099FormDto,
    securityCode: string,
    dateNumber: number
  ): Promise<Buffer> => {
    /**
     * W9 form is generated with Recipient data
     */
    const date = this.formatDate(dateNumber)

    return await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        userPassword: securityCode,
        ownerPassword: securityCode,
      })

      const leftMargin = 66

      doc.image(path.join(this.formsBasePath, 'tax-form-W9-1.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      // Fill out the form
      doc.text(formData.fullName, leftMargin, 95)
      if (formData.businessName && formData.businessName !== formData.fullName) {
        doc.text(formData.businessName, leftMargin, 118)
      }

      switch (formData.fedTaxClassification) {
        case FedTaxClassification.INDIVIDUAL: {
          doc.text('X', leftMargin, 157)
          break
        }
        case FedTaxClassification.C_CORPORATION: {
          doc.text('X', leftMargin + 112, 156)
          break
        }
        case FedTaxClassification.S_CORPORATION: {
          doc.text('X', leftMargin + 182, 156)
          break
        }
        case FedTaxClassification.PARTNERSHIP: {
          doc.text('X', leftMargin + 253, 156)
          break
        }
        case FedTaxClassification.TRUST_ESTATE: {
          doc.text('X', leftMargin + 323, 156)
          break
        }
        case FedTaxClassification.LLC: {
          doc.text('X', leftMargin, 181)
          if (formData.llcClassification) doc.text(formData.llcClassification, leftMargin + 350, 181)
          break
        }
        case FedTaxClassification.OTHER: {
          doc.text('X', leftMargin, 227)
          if (formData.otherClassification) doc.text(formData.otherClassification, leftMargin + 95, 227)
          break
        }
        default:
      }

      if (formData.payeeCode) doc.text(formData.payeeCode, leftMargin + 465, 169, { width: 50 })
      if (formData.exemptionCode) doc.text(formData.exemptionCode, leftMargin + 428, 205)

      doc.text(formData.address, leftMargin, 247)
      doc.text(`${formData.city}, ${formData.state} ${formData.zip}`, leftMargin, 272)

      doc.text(`${payerData.businessName}`, leftMargin + 325, 247)
      doc.text(`${payerData.address}`, leftMargin + 325, 257)
      doc.text(`${payerData.city}, ${payerData.state} ${payerData.zip}, ${payerData.country}`, leftMargin + 325, 267)

      // Render SSN, each digit in a separate box
      if (formData.ssn) {
        doc.fontSize(16)
        const formSSN = formData.ssn
        const formatedSSN = formSSN.includes('-') ? formSSN : `${formSSN.slice(0, 3)}-${formSSN.slice(3, 5)}-${formSSN.slice(5, 9)}`

        // eslint-disable-next-line unicorn/no-for-loop
        for (let index = 0; index < formatedSSN.length; index++) {
          if (formatedSSN[index] !== '-') {
            doc.text(formatedSSN[index], 413 + index * 14, 335)
          }
        }
      }

      // Render EIN, each digit in a separate box
      if (formData.ein) {
        const formEIN = formData.ein
        const formatedEIN = formEIN.includes('-') ? formEIN : `${formEIN.slice(0, 2)}-${formEIN.slice(2, 9)}`

        // eslint-disable-next-line unicorn/no-for-loop
        for (let index = 0; index < formatedEIN.length; index++) {
          if (formatedEIN[index] !== '-') {
            doc.text(formatedEIN[index], 413 + index * 14, 382)
          }
        }
      }

      doc.fontSize(8)
      if (formData.signature) doc.text(formData.signature, leftMargin + 60, 540)
      if (formData.date) doc.text(formData.date, leftMargin + 345, 540)

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W9-2.template.png'), 0, 0, { width: 600 })
      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W9-3.template.png'), 0, 0, { width: 600 })
      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W9-4.template.png'), 0, 0, { width: 600 })
      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W9-5.template.png'), 0, 0, { width: 600 })
      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W9-6.template.png'), 0, 0, { width: 600 })
      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.end()

      const buffer: Uint8Array[] = []
      doc.on('data', buffer.push.bind(buffer))
      doc.on('end', () => {
        const data = Buffer.concat(buffer)
        resolve(data)
      })
    })
  }

  generateW8BenTaxFormPdf = async (formData: TaxInfoW8BenFormDto, securityCode: string, dateNumber: number): Promise<Buffer> => {
    /**
     * W8-Ben form is generated
     */
    const date = this.formatDate(dateNumber)

    return await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        userPassword: securityCode,
        ownerPassword: securityCode,
      })
      const leftMargin = 63
      doc.image(path.join(this.formsBasePath, 'tax-form-W8Ben.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      doc.text(formData.ownerName, leftMargin, 235)
      doc.text(formData.citizenshipCountry, leftMargin + 323, 235)
      doc.text(formData.address, leftMargin, 259)
      doc.text(formData.city, leftMargin, 282)
      doc.text(formData.country, leftMargin + 374, 282)

      if (formData.mailingAddress) doc.text(formData.mailingAddress, leftMargin, 306)
      if (formData.mailingCity) doc.text(formData.mailingCity, leftMargin, 329)
      if (formData.mailingCountry) doc.text(formData.mailingCountry, leftMargin + 374, 329)
      if (formData.usTaxId) doc.text(formData.usTaxId, leftMargin, 353)
      if (formData.foreignTaxId) doc.text(formData.foreignTaxId, leftMargin, 377)
      if (formData.ftinNotRequired) doc.text('X', leftMargin + 491, 368)
      if (formData.referenceNumbers) doc.text(formData.referenceNumbers, leftMargin, 401)

      doc.text(formData.dateOfBirth, leftMargin + 242, 401)

      if (formData.countryOfTaxTreaty) doc.text(formData.countryOfTaxTreaty, leftMargin + 170, 427)
      if (formData.treatyArticle || formData.paragraph) {
        doc.text(`${formData.treatyArticle ?? ''} ${formData.paragraph ?? ''}`, leftMargin, 462)
      }
      if (formData.withholdingRate) doc.text(formData.withholdingRate, leftMargin + 284, 462)
      if (formData.typeOfIncome) doc.text(formData.typeOfIncome, leftMargin, 474)
      if (formData.additionalConditions) doc.text(formData.additionalConditions, leftMargin + 453, 486, { width: 180, align: 'left' })

      if (formData.certify) doc.text('X', leftMargin + 46, 674)
      doc.text(formData.signature, leftMargin + 46, 697)
      doc.text(formData.date, leftMargin + 410, 697)
      doc.text(formData.signerName, leftMargin + 46, 720)

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.end()

      const buffer: Uint8Array[] = []
      doc.on('data', buffer.push.bind(buffer))
      doc.on('end', () => {
        const data = Buffer.concat(buffer)
        resolve(data)
      })
    })
  }

  generateW8BenETaxFormPdf = async (formData: TaxInfoW8BenEFormDto, securityCode: string, dateNumber: number): Promise<Buffer> => {
    const date = this.formatDate(dateNumber)

    return await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        userPassword: securityCode,
        ownerPassword: securityCode,
      })

      const leftMargin = 63
      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-1.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      doc.text(formData.organizationName, leftMargin, 225)
      doc.text(formData.countryOfIncorporation, leftMargin + 322, 225)
      if (formData.disregardedEntityName) doc.text(formData.disregardedEntityName, leftMargin, 249)

      switch (formData.status) {
        case IdentificationStatus.CORPORATION: {
          doc.text('X', leftMargin + 222.5, 262)
          break
        }
        case IdentificationStatus.PARTNERSHIP: {
          doc.text('X', leftMargin + 349.5, 262)
          break
        }
        case IdentificationStatus.SIMPLE_TRUST: {
          doc.text('X', leftMargin + 3.5, 273.5)
          break
        }
        case IdentificationStatus.TAX_EXEMPT_ORGANIZATION: {
          doc.text('X', leftMargin + 109.5, 273.5)
          break
        }
        case IdentificationStatus.COMPLEX_TRUST: {
          doc.text('X', leftMargin + 222.5, 273.5)
          break
        }
        case IdentificationStatus.FOREIGN_GOVERNMENT_CONTROLLED_ENTITY: {
          doc.text('X', leftMargin + 349.5, 273.5)
          break
        }
        case IdentificationStatus.CENTRAL_BANK_OF_ISSUE: {
          doc.text('X', leftMargin + 3.5, 285.5)
          break
        }
        case IdentificationStatus.PRIVATE_FOUNDATION: {
          doc.text('X', leftMargin + 109.5, 285.5)
          break
        }
        case IdentificationStatus.ESTATE: {
          doc.text('X', leftMargin + 222.5, 285.5)
          break
        }
        case IdentificationStatus.FOREIGN_GOVERNMENT_INTEGRAL_PART: {
          doc.text('X', leftMargin + 349.5, 285.5)
          break
        }
        case IdentificationStatus.GRANTOR_TRUST: {
          doc.text('X', leftMargin + 3.5, 297)
          break
        }
        case IdentificationStatus.DISREGARDED_ENTITY: {
          doc.text('X', leftMargin + 109.5, 297)
          break
        }
        case IdentificationStatus.INTERNATIONAL_ORGANIZATION: {
          doc.text('X', leftMargin + 222.5, 297)
          break
        }
        default:
      }
      // eslint-disable-next-line no-undefined
      if (formData.isTreatyClaim !== undefined) {
        if (formData.isTreatyClaim) doc.text('X', leftMargin + 439.5, 309)
        if (!formData.isTreatyClaim) doc.text('X', leftMargin + 475, 309)
      }

      switch (formData.fatcaStatus) {
        case FATCAStatus._1: {
          doc.text('X', leftMargin + 3.5, 368)
          break
        }
        case FATCAStatus._2: {
          doc.text('X', leftMargin + 3.5, 379.5)
          break
        }
        case FATCAStatus._3: {
          doc.text('X', leftMargin + 3.5, 391)
          break
        }
        case FATCAStatus._4: {
          doc.text('X', leftMargin + 3.5, 438.5)
          break
        }
        case FATCAStatus._5: {
          doc.text('X', leftMargin + 3.5, 450)
          break
        }
        case FATCAStatus._6: {
          doc.text('X', leftMargin + 3.5, 473.5)
          break
        }
        case FATCAStatus._7: {
          doc.text('X', leftMargin + 3.5, 497)
          break
        }
        case FATCAStatus._8: {
          doc.text('X', leftMargin + 3.5, 520.5)
          break
        }
        case FATCAStatus._9: {
          doc.text('X', leftMargin + 3.5, 544)
          break
        }
        case FATCAStatus._10: {
          doc.text('X', leftMargin + 3.5, 568)
          break
        }
        case FATCAStatus._11: {
          doc.text('X', leftMargin + 3.5, 579.5)
          break
        }
        case FATCAStatus._12: {
          doc.text('X', leftMargin + 258, 332.5)
          break
        }
        case FATCAStatus._13: {
          doc.text('X', leftMargin + 258, 344)
          break
        }
        case FATCAStatus._14: {
          doc.text('X', leftMargin + 258, 368)
          break
        }
        case FATCAStatus._15: {
          doc.text('X', leftMargin + 258, 379.5)
          break
        }
        case FATCAStatus._16: {
          doc.text('X', leftMargin + 258, 391)
          break
        }
        case FATCAStatus._17: {
          doc.text('X', leftMargin + 258, 403)
          break
        }
        case FATCAStatus._18: {
          doc.text('X', leftMargin + 258, 415)
          break
        }
        case FATCAStatus._19: {
          doc.text('X', leftMargin + 258, 426.5)
          break
        }
        case FATCAStatus._20: {
          doc.text('X', leftMargin + 258, 438.5)
          break
        }
        case FATCAStatus._21: {
          doc.text('X', leftMargin + 258, 462)
          break
        }
        case FATCAStatus._22: {
          doc.text('X', leftMargin + 258, 473.5)
          break
        }
        case FATCAStatus._23: {
          doc.text('X', leftMargin + 258, 485)
          break
        }
        case FATCAStatus._24: {
          doc.text('X', leftMargin + 258, 509)
          break
        }
        case FATCAStatus._25: {
          doc.text('X', leftMargin + 258, 520.5)
          break
        }
        case FATCAStatus._26: {
          doc.text('X', leftMargin + 258, 532.5)
          break
        }
        case FATCAStatus._27: {
          doc.text('X', leftMargin + 258, 544)
          break
        }
        case FATCAStatus._28: {
          doc.text('X', leftMargin + 258, 556)
          break
        }
        case FATCAStatus._29: {
          doc.text('X', leftMargin + 258, 568)
          break
        }
        case FATCAStatus._30: {
          doc.text('X', leftMargin + 258, 579.5)
          break
        }
        case FATCAStatus._31: {
          doc.text('X', leftMargin + 3.5, 332.5)
          break
        }
        case FATCAStatus._32: {
          doc.text('X', leftMargin + 3.5, 403)
          break
        }
        default:
      }

      doc.text(formData.permanentResidenceAddress, leftMargin, 601)
      doc.text(formData.permanentResidenceCity, leftMargin, 624)
      doc.text(formData.permanentResidenceCountry, leftMargin + 374, 624)

      if (formData.mailingAddress) doc.text(formData.mailingAddress, leftMargin, 648)
      if (formData.mailingCity) doc.text(formData.mailingCity, leftMargin, 671)
      if (formData.mailingCountry) doc.text(formData.mailingCountry, leftMargin + 374, 671)

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-2.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      if (formData.usTaxId) doc.text(formData.usTaxId, leftMargin, 72)
      if (formData.giin) doc.text(formData.giin, leftMargin, 96)
      if (formData.foreignTaxId) doc.text(formData.foreignTaxId, leftMargin + 155, 96)
      if (formData.ftinNotRequired) doc.text('X', leftMargin + 487.5, 92)
      if (formData.referenceNumbers) doc.text(formData.referenceNumbers, leftMargin, 120)

      if (formData.entityFatcaStatus) {
        switch (formData.entityFatcaStatus) {
          case EntityFATCAStatus._1: {
            doc.text('X', leftMargin + 4, 191)
            break
          }
          case EntityFATCAStatus._2: {
            doc.text('X', leftMargin + 180, 191)
            break
          }
          case EntityFATCAStatus._3: {
            doc.text('X', leftMargin + 364, 191)
            break
          }
          case EntityFATCAStatus._4: {
            doc.text('X', leftMargin + 4, 203)
            break
          }
          case EntityFATCAStatus._5: {
            doc.text('X', leftMargin + 180, 203)
            break
          }
          default:
        }
      }
      if (formData.entityAddress) doc.text(formData.entityAddress, leftMargin, 236)
      if (formData.entityCity) doc.text(formData.entityCity, leftMargin, 260)
      if (formData.entityCountry) doc.text(formData.entityCountry, leftMargin, 283)
      if (formData.entityGiin) doc.text(formData.entityGiin, leftMargin + 50, 298)

      if (formData.certificateTaxTreatyA && formData.certificateTaxTreatyACountry) {
        doc.text('X', leftMargin + 4, 344)
        doc.text(formData.certificateTaxTreatyACountry, leftMargin + 150, 344)
      }
      if (formData.certificateTaxTreatyB) doc.text('X', leftMargin + 4, 368)
      if (formData.certificateTaxTreatyBBenefit) {
        switch (formData.certificateTaxTreatyBBenefit) {
          case TaxTreatyBenefits._1: {
            doc.text('X', leftMargin + 4, 403)
            break
          }
          case TaxTreatyBenefits._2: {
            doc.text('X', leftMargin + 4, 415)
            break
          }
          case TaxTreatyBenefits._3: {
            doc.text('X', leftMargin + 4, 427)
            break
          }
          case TaxTreatyBenefits._4: {
            doc.text('X', leftMargin + 4, 438)
            break
          }
          case TaxTreatyBenefits._5: {
            doc.text('X', leftMargin + 4, 450)
            break
          }
          case TaxTreatyBenefits._6: {
            doc.text('X', leftMargin + 180, 403)
            break
          }
          case TaxTreatyBenefits._7: {
            doc.text('X', leftMargin + 180, 415)
            break
          }
          case TaxTreatyBenefits._8: {
            doc.text('X', leftMargin + 180, 427)
            break
          }
          case TaxTreatyBenefits._9: {
            doc.text('X', leftMargin + 180, 438)
            break
          }
          case TaxTreatyBenefits._10: {
            doc.text('X', leftMargin + 180, 450)
            break
          }
          case TaxTreatyBenefits.OTHER: {
            doc.text('X', leftMargin + 180, 462)
            if (formData.certificateTaxTreatyBOther) doc.text(formData.certificateTaxTreatyBOther, leftMargin + 330, 462)
            break
          }
          default:
        }
      }
      if (formData.certificateTaxTreatyC) doc.text('X', leftMargin + 4, 474)
      if (formData.ratesTreatyArticle && formData.ratesParagraph) {
        doc.text(`${formData.ratesTreatyArticle} ${formData.ratesParagraph}`, leftMargin + 260, 509)
      }
      if (formData.ratesWithholdingRate) doc.text(formData.ratesWithholdingRate, leftMargin + 200, 519.5)
      if (formData.ratesTypeOfIncome) doc.text(formData.ratesTypeOfIncome, leftMargin + 428, 519.5, { width: 100 })
      if (formData.ratesAdditionalConditions) doc.text(formData.ratesAdditionalConditions, leftMargin + 4, 545, { width: 500 })

      if (formData.sponsoringEntityName) doc.text(formData.sponsoringEntityName, leftMargin + 100, 591)
      if (formData.sponsoringEntityCertify) {
        switch (formData.sponsoringEntityCertify) {
          case SponsoredFIICertify._1: {
            doc.text('X', leftMargin + 4, 615)
            break
          }
          case SponsoredFIICertify._2: {
            doc.text('X', leftMargin + 4, 662)
            break
          }
          default:
        }
      }

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-3.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      if (formData.certify18) doc.text('X', leftMargin + 4, 62)
      if (formData.certify19) doc.text('X', leftMargin + 4, 227)

      if (formData.sponsoringEntityNamePartVII) doc.text(formData.sponsoringEntityNamePartVII, leftMargin + 100, 332)
      if (formData.certify21) doc.text('X', leftMargin + 4, 344)
      if (formData.certify22) doc.text('X', leftMargin + 4, 450)
      if (formData.certify23) doc.text('X', leftMargin + 4, 521)
      if (formData.certify24A) doc.text('X', leftMargin + 4, 591)

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-4.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      if (formData.certify24B) doc.text('X', leftMargin + 4, 73)
      if (formData.certify24C) doc.text('X', leftMargin + 4, 215)
      if (formData.certify24D) doc.text('X', leftMargin + 4, 286)

      if (formData.certify25A) doc.text('X', leftMargin + 4, 321)
      if (formData.certify25B) doc.text('X', leftMargin + 4, 521)
      if (formData.certify25C) doc.text('X', leftMargin + 4, 556)

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-5.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      if (formData.certify26) doc.text('X', leftMargin + 4, 62)
      if (formData.country26) doc.text(formData.country26, leftMargin + 4, 85)
      if (formData.model1Iga26) doc.text('X', leftMargin + 350, 85)
      if (formData.model2Iga26) doc.text('X', leftMargin + 427, 85)
      if (formData.institutionType26) doc.text(formData.institutionType26, leftMargin + 60, 98)
      if (formData.trusteeName26) doc.text(formData.trusteeName26, leftMargin + 370, 120)
      if (formData.trusteeCountry26) {
        switch (formData.trusteeCountry26) {
          case TrusteeCountry.US: {
            doc.text('X', leftMargin + 53, 132.5)
            break
          }
          case TrusteeCountry.FOREIGN: {
            doc.text('X', leftMargin + 88, 132.5)
            break
          }
          default:
        }
      }

      if (formData.certify27) doc.text('X', leftMargin + 4, 167)
      if (formData.certify28A) doc.text('X', leftMargin + 4, 226.5)
      if (formData.certify28B) doc.text('X', leftMargin + 4, 238)
      if (formData.certify29A) doc.text('X', leftMargin + 4, 356)
      if (formData.certify29B) doc.text('X', leftMargin + 4, 415)
      if (formData.certify29C) doc.text('X', leftMargin + 4, 603)

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-6.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      if (formData.certify29D) doc.text('X', leftMargin + 4, 62)
      if (formData.certify29E) doc.text('X', leftMargin + 4, 85)
      if (formData.certify29F) doc.text('X', leftMargin + 4, 120.5)

      if (formData.certify30) doc.text('X', leftMargin + 4, 238)
      if (formData.certify31) doc.text('X', leftMargin + 4, 380)
      if (formData.certify32) doc.text('X', leftMargin + 4, 415)

      if (formData.certify33) doc.text('X', leftMargin + 4, 521)
      if (formData.date33) doc.text(formData.date33, leftMargin + 432, 533, { width: 50 })

      if (formData.certify34) doc.text('X', leftMargin + 4, 626.5)
      if (formData.date34) doc.text(formData.date34, leftMargin + 300, 638, { width: 50 })

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-7.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      if (formData.certify35) doc.text('X', leftMargin + 4, 62)
      if (formData.date35) doc.text(formData.date35, leftMargin + 35, 85, { width: 50 })

      if (formData.certify36) doc.text('X', leftMargin + 4, 144)

      if (formData.certify37A) doc.text('X', leftMargin + 4, 309)
      if (formData.exchange37A) doc.text(formData.exchange37A, leftMargin + 383, 332)
      if (formData.certify37B) doc.text('X', leftMargin + 4, 356)
      if (formData.name37B) doc.text(formData.name37B, leftMargin + 360, 402)
      if (formData.securities37B) doc.text(formData.securities37B, leftMargin + 270, 414)

      if (formData.certify38) doc.text('X', leftMargin + 4, 450)
      if (formData.certify39) doc.text('X', leftMargin + 4, 568)

      if (formData.certify40A) doc.text('X', leftMargin + 4, 650)
      if (formData.certify40B) doc.text('X', leftMargin + 4, 697)
      if (formData.certify40C) doc.text('X', leftMargin + 4, 709)

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.addPage()

      doc.image(path.join(this.formsBasePath, 'tax-form-W8BenE-8.template.png'), 0, 0, { width: 600 })
      doc.fontSize(8)

      if (formData.certify41) doc.text('X', leftMargin + 4, 62)

      if (formData.name42) doc.text(formData.name42, leftMargin + 100, 168)
      if (formData.certify43) doc.text('X', leftMargin + 4, 180)

      if (formData.name1Part44) doc.text(formData.name1Part44, leftMargin - 20, 270)
      if (formData.address1Part44) doc.text(formData.address1Part44, leftMargin + 130, 270)
      if (formData.tin1Part44) doc.text(formData.tin1Part44, leftMargin + 420, 270, { width: 50 })

      if (formData.name2Part44) doc.text(formData.name2Part44, leftMargin - 20, 292)
      if (formData.address2Part44) doc.text(formData.address2Part44, leftMargin + 130, 292)
      if (formData.tin2Part44) doc.text(formData.tin2Part44, leftMargin + 420, 292, { width: 50 })

      if (formData.name3Part44) doc.text(formData.name3Part44, leftMargin - 20, 314)
      if (formData.address3Part44) doc.text(formData.address3Part44, leftMargin + 130, 314)
      if (formData.tin3Part44) doc.text(formData.tin3Part44, leftMargin + 420, 314, { width: 50 })

      if (formData.name4Part44) doc.text(formData.name4Part44, leftMargin - 20, 338)
      if (formData.address4Part44) doc.text(formData.address4Part44, leftMargin + 130, 338)
      if (formData.tin4Part44) doc.text(formData.tin4Part44, leftMargin + 420, 338, { width: 50 })

      if (formData.name5Part44) doc.text(formData.name5Part44, leftMargin - 20, 364)
      if (formData.address5Part44) doc.text(formData.address5Part44, leftMargin + 130, 364)
      if (formData.tin5Part44) doc.text(formData.tin5Part44, leftMargin + 420, 364, { width: 50 })

      if (formData.name6Part44) doc.text(formData.name6Part44, leftMargin - 20, 387)
      if (formData.address6Part44) doc.text(formData.address6Part44, leftMargin + 130, 387)
      if (formData.tin6Part44) doc.text(formData.tin6Part44, leftMargin + 420, 387, { width: 50 })

      if (formData.name7Part44) doc.text(formData.name7Part44, leftMargin - 20, 410)
      if (formData.address7Part44) doc.text(formData.address7Part44, leftMargin + 130, 410)
      if (formData.tin7Part44) doc.text(formData.tin7Part44, leftMargin + 420, 410, { width: 50 })

      if (formData.name8Part44) doc.text(formData.name8Part44, leftMargin - 20, 436)
      if (formData.address8Part44) doc.text(formData.address8Part44, leftMargin + 130, 436)
      if (formData.tin8Part44) doc.text(formData.tin8Part44, leftMargin + 420, 436, { width: 50 })

      if (formData.name9Part44) doc.text(formData.name9Part44, leftMargin - 20, 460)
      if (formData.address9Part44) doc.text(formData.address9Part44, leftMargin + 130, 460)
      if (formData.tin9Part44) doc.text(formData.tin9Part44, leftMargin + 420, 460, { width: 50 })

      doc.text('X', leftMargin - 24, 638)
      doc.text(formData.signature, leftMargin + 40, 660)
      doc.text(formData.signerName, leftMargin + 315, 660)
      doc.text(formData.date, leftMargin + 445, 660, { width: 50 })

      doc.text(`${date}`, 435, 760, { width: 130, align: 'right' })

      doc.end()

      const buffer: Uint8Array[] = []
      doc.on('data', buffer.push.bind(buffer))
      doc.on('end', () => {
        const data = Buffer.concat(buffer)
        resolve(data)
      })
    })
  }
}
