# Job Finder - AI-Powered Remote Job Aggregator

![Job Finder UI](https://via.placeholder.com/1200x600?text=Job+Finder+Dashboard)

Job Finder is a modern, full-stack web application designed to help remote workers find their next role efficiently. It aggregates job listings from multiple top remote job boards into a single, unified interface with advanced filtering and AI-powered resume customization.

## 🚀 Features

### 🔍 Smart Aggregation
- **Multi-Source Scraping**: Automatically fetches jobs from:
  - **We Work Remotely**
  - **RemoteOK**
  - **Remotive**
  - **Jobspresso**
  - **Working Nomads**
- **Unified Data Model**: Normalizes data from RSS feeds, APIs, and HTML scraping into a consistent format.
- **Automatic Expiration**: Jobs are automatically removed after 30 days to ensure freshness (via MongoDB TTL).

### ⚡ Powerful Filtering
- **Source Filtering**: Select specific job boards to view or scrape.
- **Global Search**: Instant search by title, company, or description.
- **Skills Filter**: Filter jobs by specific technologies (e.g., "React", "Python").
- **Worldwide Mode**: Toggle to see only 100% remote jobs available globally.

### 🎨 Modern UI/UX
- **Dark Mode Design**: Sleek "Midnight Pro" theme with glassmorphism effects.
- **Responsive Layout**: Fully responsive grid layout optimized for mobile, tablet, and desktop.
- **Global Navigation**: Intuitive sidebar navigation.
- **Client-Side Routing**: Seamless page transitions without reloads.

### 🤖 AI Resume Customization (Beta)
- **LaTeX Support**: Upload your existing LaTeX resume.
- **AI Tailoring**: (Mock) Service to customize your resume based on job descriptions.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
- **Scraping**: [Cheerio](https://cheerio.js.org/), `fetch` API
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sagar-subedi/jobfinder.git
   cd jobfinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/job-finder
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🕷️ Scraper Architecture

The project uses a modular scraper pattern. Each source has its own class implementing the `JobScraper` interface:

```typescript
interface JobScraper {
    name: string;
    scrape(): Promise<ScrapedJob[]>;
}
```

To add a new source:
1. Create a new class in `src/lib/scrapers/`.
2. Implement the `scrape()` method.
3. Register the scraper in `src/app/api/jobs/scrape/route.ts`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
