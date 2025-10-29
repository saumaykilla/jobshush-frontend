import { type ClientSchema, a, defineData } from '@aws-amplify/backend';


const schema = a.schema({
  PersonalDetails: a.customType({
    fullName: a.string().required(),
    email: a.email().required(),
    contactNumber: a.string(),
    country: a.string(),
    city: a.string(),
  }),
  links: a.customType({
    label: a.string(),
    url: a.string(),
  }),
  RoleDetails: a.customType({
    summary: a.string(),
    linkedInURL: a.url(),
    additionalLinks: a.ref('links').array(),
  }),

  EducationLineItems: a.customType({
    institute: a.string().required(),
    degree: a.string().required(),
    startDate: a.datetime().required(),
    endDate: a.datetime(),
    location: a.string().required(),
    description: a.string(),
  }),

  WorkExperienceLineItems: a.customType({
    company: a.string().required(),
    role: a.string().required(),
    startDate: a.datetime().required(),
    endDate: a.datetime(),
    location: a.string().required(),
    description: a.string(),
  }),

  CustomSectionLineItems: a.customType({
    header: a.string().required(),
    subHeader: a.string(),
    description: a.string(),
  }),

  Education: a.customType({
    fieldName: a.string().required(),
    lineItem: a.ref("EducationLineItems").array().required(),
  }),

  WorkExperience: a.customType({
    fieldName: a.string().required(),
    lineItem: a.ref("WorkExperienceLineItems").array(),
  }),

  CustomSections: a.customType({
    sectionID: a.string().required(),
    sectionName: a.string().required(),
    lineItems: a.ref("CustomSectionLineItems").array(),
  }),
  SectionOrderType: a.customType({
    id: a.string().required(),
    type: a.string().required(),
    value: a.string().required()
  }),
  Resume: a.customType({
    personalDetails: a.ref("PersonalDetails").required(),
    roleDetails: a.ref("RoleDetails").required(),
    education: a.ref("Education").required(),
    workExperience: a.ref("WorkExperience"),
    skills: a.customType({ fieldName: a.string(), data: a.string() }),
    sectionOrder: a.ref("SectionOrderType").array().required(),
    customSections: a.ref("CustomSections").array(),
    template: a.enum(
      [
        "Classic",
        "Modern",
      ]
    ),
  }),

  Profile: a.model({
    resume: a.ref("Resume").required(),
    optimizationLimit: a.integer().required(),
    resetTime: a.datetime().required(),
  }).authorization((allow) => [allow.owner()]),

  MockInterviewFeedback: a.model({
    recording:a.string(),
    companyName:a.string().required(),
    status:a.enum(['pending','completed','failed']),
    feedback : a.customType({
      imporvement:a.string().array(),
      strengths:a.string().array(),
      starAnalysis:a.string().array(),
      overallScore:a.integer(),
      confidenceScore:a.integer(),
      duration:a.integer(),
    })
  }).authorization((allow) => [allow.owner()]),

  Application: a.model({
    status:a.enum(['Applied','Interview','Rejected']),
    jobDescription: a.string().required(),
    resumeName: a.string().required(),
    resume: a.ref("Resume").required(),
    oldMetric: a.integer().required(),
    newMetric: a.integer().required(),
    coverLetter: a.string().required(),
  }).authorization((allow) => [allow.owner()]),
});


export type Schema =
  ClientSchema<
    typeof schema
  >;

export const data =
  defineData(
    {
      schema,
      authorizationModes:
      {
        defaultAuthorizationMode:
          "userPool",
      },
    }
  );