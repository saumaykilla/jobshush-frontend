# JobsHush Frontend 💼📝

**AI-Powered Job Application Platform Frontend**

A modern, responsive frontend for JobsHush - the intelligent job application platform that tailors your resume and cover letters to job descriptions using AI.

---

## 🌟 Features

- 📄 **AI Resume Tailoring** - Automatically customize your resume for each job
- ✍️ **Smart Cover Letters** - Generate personalized cover letters using AI
- 👁️ **Live Preview** - Real-time PDF preview of your documents
- 🎯 **Job Matching** - Match your skills to job requirements
- 🔐 **Secure Storage** - Cloud-based document management
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized for speed

---

## 🛠️ Tech Stack

**Frontend:**
- React with TypeScript
- Next.js (if applicable)
- Tailwind CSS for styling
- React Hook Form for forms
- Zustand for state management
- Shadcn UI components

**Integration:**
- Connected to JobsHush backend API
- PDF generation and preview
- Cloud storage integration

---

## 📊 Language Composition

```
TypeScript: 98.9%
Other: 1.1%
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/saumaykilla/jobshush-frontend.git
cd jobshush-frontend

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.jobshush.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Run Locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📁 Project Structure

```
jobshush-frontend/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── lib/             # Utilities
│   ├── hooks/           # Custom hooks
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├���─ public/              # Static assets
├── package.json
└── tsconfig.json
```

---

## 🎯 Key Features

### Resume Customization
- Upload existing resume
- AI analysis of job description
- Automatic tailoring of content
- Skill highlighting and matching
- Format preservation

### Cover Letter Generation
- Template-based generation
- AI personalization
- Company research integration
- Tone customization
- Multiple version options

### Document Preview
- Real-time PDF preview
- Inline editing capabilities
- Download and share options
- Version history tracking

---

## 🔗 API Integration

Communicates with JobsHush backend for:
- Resume processing
- Cover letter generation
- Job description analysis
- Document storage
- User authentication

---

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop enhancements
- Touch-friendly interface
- Progressive enhancement

---

## 🚀 Build & Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Deploy to Vercel

```bash
vercel deploy --prod
```

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Email: [saumay.killa@gmail.com](mailto:saumay.killa@gmail.com)

---

## 🔗 Links

- **Production**: [https://www.jobshush.com](https://www.jobshush.com)
- **GitHub**: [https://github.com/saumaykilla/jobshush-frontend](https://github.com/saumaykilla/jobshush-frontend)

---

<div align="center">

**Making Job Hunting Smarter with AI**

Made with ❤️ by Saumay Killa

[⬆ back to top](#jobshush-frontend-)

</div>
